/**
 * GDPR Module
 *
 * Provides comprehensive GDPR compliance functionality including:
 * - Right to Access (data export)
 * - Right to Erasure (anonymization)
 * - Right to Portability (machine-readable export)
 * - Request tracking and audit logging
 *
 * @module modules/gdpr
 */

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GdprController } from './gdpr.controller';
import { GdprService } from './gdpr.service';
import { Patient, PatientSchema } from '../patients/entities/patient.schema';
import { GdprRequest, GdprRequestSchema } from './entities/gdpr-request.schema';
import { AuditLogService, AuditLog, AuditLogSchema } from '../../services/audit-log.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Patient.name, schema: PatientSchema },
      { name: GdprRequest.name, schema: GdprRequestSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
  ],
  controllers: [GdprController],
  providers: [GdprService, AuditLogService],
  exports: [GdprService],
})
export class GdprModule {}
