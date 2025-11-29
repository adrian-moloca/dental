/**
 * Clinical Interventions Module
 *
 * NestJS module for clinical intervention functionality.
 * Implements quick clinical actions that don't require full SOAP notes.
 *
 * Features:
 * - Quick procedure documentation
 * - Emergency action recording
 * - Follow-up observation tracking
 * - Integration with odontogram
 * - Billing integration support
 * - Full audit trail for HIPAA compliance
 *
 * @module interventions
 */

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PatientInterventionsController,
  InterventionsController,
  AppointmentInterventionsController,
  ToothInterventionsController,
} from './interventions.controller';
import { InterventionsService } from './interventions.service';
import { InterventionsRepository } from './interventions.repository';
import {
  ClinicalIntervention,
  ClinicalInterventionSchema,
  ClinicalInterventionHistory,
  ClinicalInterventionHistorySchema,
} from './entities/intervention.schema';
import { AuthModule } from '../auth/auth.module';
import { OdontogramModule } from '../odontogram/odontogram.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ClinicalIntervention.name, schema: ClinicalInterventionSchema },
      { name: ClinicalInterventionHistory.name, schema: ClinicalInterventionHistorySchema },
    ]),
    AuthModule,
    OdontogramModule, // Required for tooth history integration
  ],
  controllers: [
    PatientInterventionsController,
    InterventionsController,
    AppointmentInterventionsController,
    ToothInterventionsController,
  ],
  providers: [InterventionsService, InterventionsRepository],
  exports: [InterventionsService],
})
export class InterventionsModule {}
