/**
 * GDPR Module
 * @module modules/gdpr
 */

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GdprController } from './gdpr.controller';
import { GdprService } from './gdpr.service';
import { Patient, PatientSchema } from '../patients/entities/patient.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Patient.name, schema: PatientSchema }])],
  controllers: [GdprController],
  providers: [GdprService],
  exports: [GdprService],
})
export class GdprModule {}
