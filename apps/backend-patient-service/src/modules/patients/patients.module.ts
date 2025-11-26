/**
 * Patients Module
 *
 * @module modules/patients
 */

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';
import { PatientsRepository } from './patients.repository';
import { Patient, PatientSchema } from './entities/patient.schema';
import { CnpEncryptionService } from '../../services';

@Module({
  imports: [MongooseModule.forFeature([{ name: Patient.name, schema: PatientSchema }])],
  controllers: [PatientsController],
  providers: [PatientsService, PatientsRepository, CnpEncryptionService],
  exports: [PatientsService, PatientsRepository, CnpEncryptionService],
})
export class PatientsModule {}
