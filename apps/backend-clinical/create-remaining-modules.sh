#!/bin/bash
BASE_DIR="/home/adrian/Desktop/SBD-Projects/personal/preclinic/dental/apps/backend-clinical/src/modules"

# Clinical Notes Module
cat > "$BASE_DIR/clinical-notes/entities/clinical-note.schema.ts" << 'EOF'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false })
export class SOAPNote {
  @Prop() subjective: string;
  @Prop() objective: string;
  @Prop() assessment: string;
  @Prop() plan: string;
}

@Schema({ timestamps: true, collection: 'clinical_notes' })
export class ClinicalNote {
  @Prop({ required: true }) patientId: string;
  @Prop({ required: true, index: true }) tenantId: string;
  @Prop({ required: true }) organizationId: string;
  @Prop({ required: true }) clinicId: string;
  @Prop() appointmentId?: string;
  @Prop({ required: true, enum: ['SOAP', 'PROGRESS', 'CONSULT', 'EMERGENCY'] }) noteType: string;
  @Prop({ type: SOAPNote }) soap?: SOAPNote;
  @Prop({ required: true }) content: string;
  @Prop() chiefComplaint?: string;
  @Prop({ type: [String] }) diagnosis?: string[];
  @Prop({ required: true }) createdBy: string;
}

export type ClinicalNoteDocument = ClinicalNote & Document;
export const ClinicalNoteSchema = SchemaFactory.createForClass(ClinicalNote);
ClinicalNoteSchema.index({ patientId: 1, tenantId: 1, createdAt: -1 });
EOF

cat > "$BASE_DIR/clinical-notes/dto/create-note.dto.ts" << 'EOF'
import { IsString, IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SOAPNoteDto {
  @ApiProperty() @IsString() subjective: string;
  @ApiProperty() @IsString() objective: string;
  @ApiProperty() @IsString() assessment: string;
  @ApiProperty() @IsString() plan: string;
}

export class CreateNoteDto {
  @ApiPropertyOptional() @IsOptional() @IsString() appointmentId?: string;
  @ApiProperty() @IsEnum(['SOAP', 'PROGRESS', 'CONSULT', 'EMERGENCY']) noteType: string;
  @ApiPropertyOptional() @IsOptional() @ValidateNested() @Type(() => SOAPNoteDto) soap?: SOAPNoteDto;
  @ApiProperty() @IsString() content: string;
  @ApiPropertyOptional() @IsOptional() @IsString() chiefComplaint?: string;
  @ApiPropertyOptional() @IsOptional() @IsString({ each: true }) diagnosis?: string[];
}
EOF

cat > "$BASE_DIR/clinical-notes/clinical-notes.service.ts" << 'EOF'
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ClinicalNote, ClinicalNoteDocument } from './entities/clinical-note.schema';
import { CreateNoteDto } from './dto/create-note.dto';

@Injectable()
export class ClinicalNotesService {
  constructor(
    @InjectModel(ClinicalNote.name) private model: Model<ClinicalNoteDocument>,
    private eventEmitter: EventEmitter2
  ) {}

  async create(patientId: string, dto: CreateNoteDto, context: any, userId: string) {
    const note = new this.model({ patientId, ...dto, ...context, createdBy: userId });
    const saved = await note.save();
    this.eventEmitter.emit('clinical.note.created', { noteId: saved._id, patientId, noteType: dto.noteType, createdBy: userId, tenantId: context.tenantId });
    return saved;
  }

  async findByPatient(patientId: string, context: any, filters: any) {
    const query: any = { patientId, tenantId: context.tenantId };
    if (filters.type) query.noteType = filters.type;
    return this.model.find(query).sort({ createdAt: -1 }).limit(filters.limit || 50).exec();
  }

  async findById(noteId: string, context: any) {
    return this.model.findOne({ _id: noteId, tenantId: context.tenantId }).exec();
  }
}
EOF

cat > "$BASE_DIR/clinical-notes/clinical-notes.controller.ts" << 'EOF'
import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ClinicalNotesService } from './clinical-notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { JwtAuthGuard, PermissionsGuard, TenantIsolationGuard } from '../auth/guards';
import { GetCurrentUser, RequirePermissions } from '../auth/decorators';
import { CurrentUser } from '@dentalos/shared-auth';

@ApiTags('Clinical - Notes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantIsolationGuard, PermissionsGuard)
export class ClinicalNotesController {
  constructor(private readonly service: ClinicalNotesService) {}

  @Post('api/v1/clinical/patients/:patientId/notes')
  @RequirePermissions('clinical:notes')
  create(@Param('patientId') pid: string, @Body() dto: CreateNoteDto, @GetCurrentUser() user: CurrentUser) {
    return this.service.create(pid, dto, { tenantId: user.tenantId, organizationId: user.organizationId, clinicId: user.clinicId }, user.userId);
  }

  @Get('api/v1/clinical/patients/:patientId/notes')
  @RequirePermissions('clinical:read')
  findAll(@Param('patientId') pid: string, @Query() query: any, @GetCurrentUser() user: CurrentUser) {
    return this.service.findByPatient(pid, { tenantId: user.tenantId }, query);
  }

  @Get('api/v1/clinical/notes/:noteId')
  @RequirePermissions('clinical:read')
  findOne(@Param('noteId') id: string, @GetCurrentUser() user: CurrentUser) {
    return this.service.findById(id, { tenantId: user.tenantId });
  }
}
EOF

cat > "$BASE_DIR/clinical-notes/clinical-notes.module.ts" << 'EOF'
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClinicalNotesController } from './clinical-notes.controller';
import { ClinicalNotesService } from './clinical-notes.service';
import { ClinicalNote, ClinicalNoteSchema } from './entities/clinical-note.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: ClinicalNote.name, schema: ClinicalNoteSchema }]), AuthModule],
  controllers: [ClinicalNotesController],
  providers: [ClinicalNotesService],
})
export class ClinicalNotesModule {}
EOF

echo "Clinical Notes module created successfully"
