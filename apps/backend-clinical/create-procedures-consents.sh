#!/bin/bash
BASE_PROC="/home/adrian/Desktop/SBD-Projects/personal/preclinic/dental/apps/backend-clinical/src/modules/procedures"
BASE_CONS="/home/adrian/Desktop/SBD-Projects/personal/preclinic/dental/apps/backend-clinical/src/modules/consents"

# PROCEDURES MODULE
cat > "$BASE_PROC/entities/procedure.schema.ts" << 'PROC_SCHEMA'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false })
export class MaterialUsed {
  @Prop({ required: true }) itemId: string;
  @Prop({ required: true }) quantity: number;
}

@Schema({ timestamps: true, collection: 'procedures' })
export class Procedure {
  @Prop({ required: true }) patientId: string;
  @Prop({ required: true, index: true }) tenantId: string;
  @Prop({ required: true }) organizationId: string;
  @Prop({ required: true }) clinicId: string;
  @Prop() appointmentId?: string;
  @Prop() treatmentPlanId?: string;
  @Prop({ required: true }) procedureCode: string;
  @Prop({ required: true }) description: string;
  @Prop() toothNumber?: number;
  @Prop({ type: [String] }) surfaces?: string[];
  @Prop({ required: true, enum: ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'], default: 'PLANNED' }) status: string;
  @Prop() performedBy?: string;
  @Prop({ type: [String] }) assistedBy?: string[];
  @Prop({ type: [MaterialUsed] }) materials?: MaterialUsed[];
  @Prop() startedAt?: Date;
  @Prop() completedAt?: Date;
}

export type ProcedureDocument = Procedure & Document;
export const ProcedureSchema = SchemaFactory.createForClass(Procedure);
ProcedureSchema.index({ patientId: 1, tenantId: 1, status: 1 });
PROC_SCHEMA

cat > "$BASE_PROC/dto/procedure.dto.ts" << 'PROC_DTO'
import { IsString, IsEnum, IsOptional, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MaterialUsedDto {
  @ApiProperty() @IsString() itemId: string;
  @ApiProperty() @IsNumber() quantity: number;
}

export class CreateProcedureDto {
  @ApiPropertyOptional() @IsOptional() @IsString() appointmentId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() treatmentPlanId?: string;
  @ApiProperty() @IsString() procedureCode: string;
  @ApiProperty() @IsString() description: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() toothNumber?: number;
  @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) surfaces?: string[];
}

export class CompleteProcedureDto {
  @ApiPropertyOptional({ type: [MaterialUsedDto] }) @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => MaterialUsedDto) materials?: MaterialUsedDto[];
  @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) assistedBy?: string[];
}
PROC_DTO

cat > "$BASE_PROC/procedures.service.ts" << 'PROC_SERVICE'
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Procedure, ProcedureDocument } from './entities/procedure.schema';
import { CreateProcedureDto, CompleteProcedureDto } from './dto/procedure.dto';

@Injectable()
export class ProceduresService {
  constructor(
    @InjectModel(Procedure.name) private model: Model<ProcedureDocument>,
    private eventEmitter: EventEmitter2
  ) {}

  async create(patientId: string, dto: CreateProcedureDto, context: any, userId: string) {
    const procedure = new this.model({ patientId, ...dto, ...context, status: 'PLANNED' });
    return procedure.save();
  }

  async findByPatient(patientId: string, context: any, filters: any) {
    const query: any = { patientId, tenantId: context.tenantId };
    if (filters.status) query.status = filters.status;
    return this.model.find(query).sort({ createdAt: -1 }).exec();
  }

  async complete(procedureId: string, dto: CompleteProcedureDto, context: any, userId: string) {
    const procedure = await this.model.findOne({ _id: procedureId, tenantId: context.tenantId }).exec();
    if (!procedure) throw new Error('Procedure not found');
    if (procedure.status === 'COMPLETED') {
      return procedure; // Idempotent
    }

    procedure.status = 'COMPLETED';
    procedure.completedAt = new Date();
    procedure.performedBy = userId;
    procedure.materials = dto.materials || [];
    procedure.assistedBy = dto.assistedBy || [];

    const saved = await procedure.save();
    
    this.eventEmitter.emit('procedure.completed', {
      procedureId: saved._id,
      patientId: saved.patientId,
      procedureCode: saved.procedureCode,
      performedBy: userId,
      materials: saved.materials,
      completedAt: saved.completedAt,
      tenantId: context.tenantId
    });

    return saved;
  }
}
PROC_SERVICE

cat > "$BASE_PROC/procedures.controller.ts" << 'PROC_CTRL'
import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ProceduresService } from './procedures.service';
import { CreateProcedureDto, CompleteProcedureDto } from './dto/procedure.dto';
import { JwtAuthGuard, PermissionsGuard, TenantIsolationGuard } from '../auth/guards';
import { GetCurrentUser, RequirePermissions } from '../auth/decorators';
import { CurrentUser } from '@dentalos/shared-auth';

@ApiTags('Clinical - Procedures')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantIsolationGuard, PermissionsGuard)
export class ProceduresController {
  constructor(private readonly service: ProceduresService) {}

  @Post('api/v1/clinical/patients/:patientId/procedures')
  @RequirePermissions('clinical:procedures')
  create(@Param('patientId') pid: string, @Body() dto: CreateProcedureDto, @GetCurrentUser() user: CurrentUser) {
    return this.service.create(pid, dto, { tenantId: user.tenantId, organizationId: user.organizationId, clinicId: user.clinicId }, user.userId);
  }

  @Get('api/v1/clinical/patients/:patientId/procedures')
  @RequirePermissions('clinical:read')
  findAll(@Param('patientId') pid: string, @Query() query: any, @GetCurrentUser() user: CurrentUser) {
    return this.service.findByPatient(pid, { tenantId: user.tenantId }, query);
  }

  @Post('api/v1/clinical/procedures/:procedureId/complete')
  @RequirePermissions('clinical:procedures')
  complete(@Param('procedureId') id: string, @Body() dto: CompleteProcedureDto, @GetCurrentUser() user: CurrentUser) {
    return this.service.complete(id, dto, { tenantId: user.tenantId }, user.userId);
  }
}
PROC_CTRL

cat > "$BASE_PROC/procedures.module.ts" << 'PROC_MOD'
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProceduresController } from './procedures.controller';
import { ProceduresService } from './procedures.service';
import { Procedure, ProcedureSchema } from './entities/procedure.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Procedure.name, schema: ProcedureSchema }]), AuthModule],
  controllers: [ProceduresController],
  providers: [ProceduresService],
})
export class ProceduresModule {}
PROC_MOD

# CONSENTS MODULE
cat > "$BASE_CONS/entities/consent.schema.ts" << 'CONS_SCHEMA'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'consents' })
export class Consent {
  @Prop({ required: true }) patientId: string;
  @Prop({ required: true, index: true }) tenantId: string;
  @Prop({ required: true }) organizationId: string;
  @Prop({ required: true }) clinicId: string;
  @Prop({ required: true, enum: ['TREATMENT', 'ANESTHESIA', 'PHOTOGRAPHY', 'DATA_SHARING', 'CUSTOM'] }) consentType: string;
  @Prop({ required: true }) title: string;
  @Prop({ required: true }) content: string;
  @Prop() signedBy?: string;
  @Prop() signatureData?: string;
  @Prop() signedAt?: Date;
  @Prop() witnessedBy?: string;
  @Prop() witnessedAt?: Date;
  @Prop() expiresAt?: Date;
  @Prop({ required: true, enum: ['PENDING', 'SIGNED', 'DECLINED', 'EXPIRED'], default: 'PENDING' }) status: string;
  @Prop({ required: true }) createdBy: string;
}

export type ConsentDocument = Consent & Document;
export const ConsentSchema = SchemaFactory.createForClass(Consent);
ConsentSchema.index({ patientId: 1, tenantId: 1, status: 1 });
CONS_SCHEMA

cat > "$BASE_CONS/dto/consent.dto.ts" << 'CONS_DTO'
import { IsString, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateConsentDto {
  @ApiProperty() @IsEnum(['TREATMENT', 'ANESTHESIA', 'PHOTOGRAPHY', 'DATA_SHARING', 'CUSTOM']) consentType: string;
  @ApiProperty() @IsString() title: string;
  @ApiProperty() @IsString() content: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() expiresAt?: string;
}

export class SignConsentDto {
  @ApiProperty() @IsString() signatureData: string;
}
CONS_DTO

cat > "$BASE_CONS/consents.service.ts" << 'CONS_SERVICE'
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Consent, ConsentDocument } from './entities/consent.schema';
import { CreateConsentDto, SignConsentDto } from './dto/consent.dto';

@Injectable()
export class ConsentsService {
  constructor(
    @InjectModel(Consent.name) private model: Model<ConsentDocument>,
    private eventEmitter: EventEmitter2
  ) {}

  async create(patientId: string, dto: CreateConsentDto, context: any, userId: string) {
    const consent = new this.model({
      patientId, ...dto, ...context, status: 'PENDING', createdBy: userId,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined
    });
    return consent.save();
  }

  async findByPatient(patientId: string, context: any) {
    return this.model.find({ patientId, tenantId: context.tenantId }).sort({ createdAt: -1 }).exec();
  }

  async sign(consentId: string, dto: SignConsentDto, context: any, userId: string) {
    const consent = await this.model.findOne({ _id: consentId, tenantId: context.tenantId }).exec();
    if (!consent) throw new Error('Consent not found');

    consent.status = 'SIGNED';
    consent.signedBy = userId;
    consent.signatureData = dto.signatureData;
    consent.signedAt = new Date();

    const saved = await consent.save();
    this.eventEmitter.emit('consent.signed', {
      consentId: saved._id,
      patientId: saved.patientId,
      consentType: saved.consentType,
      signedBy: userId,
      signedAt: saved.signedAt,
      tenantId: context.tenantId
    });

    return saved;
  }

  async generatePdf(consentId: string, context: any) {
    // Placeholder - implement PDF generation with pdfkit
    return { message: 'PDF generation not yet implemented', consentId };
  }
}
CONS_SERVICE

cat > "$BASE_CONS/consents.controller.ts" << 'CONS_CTRL'
import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ConsentsService } from './consents.service';
import { CreateConsentDto, SignConsentDto } from './dto/consent.dto';
import { JwtAuthGuard, PermissionsGuard, TenantIsolationGuard } from '../auth/guards';
import { GetCurrentUser, RequirePermissions } from '../auth/decorators';
import { CurrentUser } from '@dentalos/shared-auth';

@ApiTags('Clinical - Consents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantIsolationGuard, PermissionsGuard)
export class ConsentsController {
  constructor(private readonly service: ConsentsService) {}

  @Post('api/v1/clinical/patients/:patientId/consents')
  @RequirePermissions('clinical:consents')
  create(@Param('patientId') pid: string, @Body() dto: CreateConsentDto, @GetCurrentUser() user: CurrentUser) {
    return this.service.create(pid, dto, { tenantId: user.tenantId, organizationId: user.organizationId, clinicId: user.clinicId }, user.userId);
  }

  @Get('api/v1/clinical/patients/:patientId/consents')
  @RequirePermissions('clinical:read')
  findAll(@Param('patientId') pid: string, @GetCurrentUser() user: CurrentUser) {
    return this.service.findByPatient(pid, { tenantId: user.tenantId });
  }

  @Post('api/v1/clinical/consents/:consentId/sign')
  @RequirePermissions('clinical:consents')
  sign(@Param('consentId') id: string, @Body() dto: SignConsentDto, @GetCurrentUser() user: CurrentUser) {
    return this.service.sign(id, dto, { tenantId: user.tenantId }, user.userId);
  }

  @Get('api/v1/clinical/consents/:consentId/pdf')
  @RequirePermissions('clinical:read')
  getPdf(@Param('consentId') id: string, @GetCurrentUser() user: CurrentUser) {
    return this.service.generatePdf(id, { tenantId: user.tenantId });
  }
}
CONS_CTRL

cat > "$BASE_CONS/consents.module.ts" << 'CONS_MOD'
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConsentsController } from './consents.controller';
import { ConsentsService } from './consents.service';
import { Consent, ConsentSchema } from './entities/consent.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Consent.name, schema: ConsentSchema }]), AuthModule],
  controllers: [ConsentsController],
  providers: [ConsentsService],
})
export class ConsentsModule {}
CONS_MOD

echo "Procedures and Consents modules created"
