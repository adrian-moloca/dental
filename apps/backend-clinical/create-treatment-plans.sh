#!/bin/bash
BASE="/home/adrian/Desktop/SBD-Projects/personal/preclinic/dental/apps/backend-clinical/src/modules/treatment-plans"

cat > "$BASE/entities/treatment-plan.schema.ts" << 'SCHEMA'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false })
export class ProcedureItem {
  @Prop({ required: true }) procedureCode: string;
  @Prop() toothNumber?: number;
  @Prop({ required: true }) description: string;
  @Prop({ required: true }) estimatedCost: number;
  @Prop({ required: true, default: 1 }) phase: number;
}

@Schema({ _id: false })
export class TreatmentOption {
  @Prop({ required: true }) optionId: string;
  @Prop({ required: true }) optionName: string;
  @Prop({ required: true }) description: string;
  @Prop({ type: [ProcedureItem], required: true }) procedures: ProcedureItem[];
  @Prop({ required: true }) totalCost: number;
  @Prop({ default: false }) isAccepted: boolean;
}

@Schema({ timestamps: true, collection: 'treatment_plans' })
export class TreatmentPlan {
  @Prop({ required: true }) patientId: string;
  @Prop({ required: true, index: true }) tenantId: string;
  @Prop({ required: true }) organizationId: string;
  @Prop({ required: true }) clinicId: string;
  @Prop({ required: true, default: 1 }) version: number;
  @Prop({ required: true, enum: ['DRAFT', 'PRESENTED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] }) status: string;
  @Prop({ type: [TreatmentOption], required: true }) options: TreatmentOption[];
  @Prop() acceptedOptionId?: string;
  @Prop() acceptedAt?: Date;
  @Prop({ required: true }) createdBy: string;
  @Prop() presentedBy?: string;
}

export type TreatmentPlanDocument = TreatmentPlan & Document;
export const TreatmentPlanSchema = SchemaFactory.createForClass(TreatmentPlan);
TreatmentPlanSchema.index({ patientId: 1, tenantId: 1, createdAt: -1 });
SCHEMA

cat > "$BASE/dto/create-treatment-plan.dto.ts" << 'DTO'
import { IsString, IsNumber, IsArray, ValidateNested, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ProcedureItemDto {
  @ApiProperty() @IsString() procedureCode: string;
  @ApiProperty() @IsOptional() @IsNumber() toothNumber?: number;
  @ApiProperty() @IsString() description: string;
  @ApiProperty() @IsNumber() @Min(0) estimatedCost: number;
  @ApiProperty() @IsNumber() @Min(1) phase: number;
}

export class TreatmentOptionDto {
  @ApiProperty() @IsString() optionName: string;
  @ApiProperty() @IsString() description: string;
  @ApiProperty({ type: [ProcedureItemDto] }) @IsArray() @ValidateNested({ each: true }) @Type(() => ProcedureItemDto) procedures: ProcedureItemDto[];
}

export class CreateTreatmentPlanDto {
  @ApiProperty({ type: [TreatmentOptionDto] }) @IsArray() @ValidateNested({ each: true }) @Type(() => TreatmentOptionDto) options: TreatmentOptionDto[];
}
DTO

cat > "$BASE/treatment-plans.service.ts" << 'SERVICE'
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TreatmentPlan, TreatmentPlanDocument } from './entities/treatment-plan.schema';
import { CreateTreatmentPlanDto } from './dto/create-treatment-plan.dto';
import { v4 as uuid } from 'uuid';

@Injectable()
export class TreatmentPlansService {
  constructor(
    @InjectModel(TreatmentPlan.name) private model: Model<TreatmentPlanDocument>,
    private eventEmitter: EventEmitter2
  ) {}

  async create(patientId: string, dto: CreateTreatmentPlanDto, context: any, userId: string) {
    const options = dto.options.map(opt => ({
      optionId: uuid(),
      ...opt,
      totalCost: opt.procedures.reduce((sum, p) => sum + p.estimatedCost, 0),
      isAccepted: false
    }));

    const plan = new this.model({
      patientId, ...context, status: 'DRAFT', options, version: 1, createdBy: userId
    });

    const saved = await plan.save();
    this.eventEmitter.emit('treatment.plan.created', { planId: saved._id, patientId, optionsCount: options.length, tenantId: context.tenantId });
    return saved;
  }

  async findByPatient(patientId: string, context: any) {
    return this.model.find({ patientId, tenantId: context.tenantId }).sort({ createdAt: -1 }).exec();
  }

  async acceptOption(planId: string, optionId: string, context: any, userId: string) {
    const plan = await this.model.findOne({ _id: planId, tenantId: context.tenantId }).exec();
    if (!plan) throw new Error('Plan not found');
    
    plan.acceptedOptionId = optionId;
    plan.acceptedAt = new Date();
    plan.status = 'ACCEPTED';
    plan.options.forEach(opt => { opt.isAccepted = opt.optionId === optionId; });
    
    const saved = await plan.save();
    this.eventEmitter.emit('treatment.plan.accepted', { planId, optionId, acceptedBy: userId, tenantId: context.tenantId });
    return saved;
  }
}
SERVICE

cat > "$BASE/treatment-plans.controller.ts" << 'CONTROLLER'
import { Controller, Get, Post, Put, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TreatmentPlansService } from './treatment-plans.service';
import { CreateTreatmentPlanDto } from './dto/create-treatment-plan.dto';
import { JwtAuthGuard, PermissionsGuard, TenantIsolationGuard } from '../auth/guards';
import { GetCurrentUser, RequirePermissions } from '../auth/decorators';
import { CurrentUser } from '@dentalos/shared-auth';

@ApiTags('Clinical - Treatment Plans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantIsolationGuard, PermissionsGuard)
export class TreatmentPlansController {
  constructor(private readonly service: TreatmentPlansService) {}

  @Post('api/v1/clinical/patients/:patientId/treatment-plans')
  @RequirePermissions('clinical:write')
  create(@Param('patientId') pid: string, @Body() dto: CreateTreatmentPlanDto, @GetCurrentUser() user: CurrentUser) {
    return this.service.create(pid, dto, { tenantId: user.tenantId, organizationId: user.organizationId, clinicId: user.clinicId }, user.userId);
  }

  @Get('api/v1/clinical/patients/:patientId/treatment-plans')
  @RequirePermissions('clinical:read')
  findAll(@Param('patientId') pid: string, @GetCurrentUser() user: CurrentUser) {
    return this.service.findByPatient(pid, { tenantId: user.tenantId });
  }

  @Post('api/v1/clinical/treatment-plans/:planId/accept-option')
  @RequirePermissions('clinical:write')
  acceptOption(@Param('planId') planId: string, @Body() body: { optionId: string }, @GetCurrentUser() user: CurrentUser) {
    return this.service.acceptOption(planId, body.optionId, { tenantId: user.tenantId }, user.userId);
  }
}
CONTROLLER

cat > "$BASE/treatment-plans.module.ts" << 'MODULE'
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TreatmentPlansController } from './treatment-plans.controller';
import { TreatmentPlansService } from './treatment-plans.service';
import { TreatmentPlan, TreatmentPlanSchema } from './entities/treatment-plan.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: TreatmentPlan.name, schema: TreatmentPlanSchema }]), AuthModule],
  controllers: [TreatmentPlansController],
  providers: [TreatmentPlansService],
})
export class TreatmentPlansModule {}
MODULE

echo "Treatment Plans module created"
