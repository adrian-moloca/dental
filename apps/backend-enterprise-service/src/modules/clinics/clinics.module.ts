import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClinicsController } from './clinics.controller';
import { ClinicsService } from './clinics.service';
import { ClinicDocument, ClinicSchema } from '../../schemas/clinic.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: ClinicDocument.name, schema: ClinicSchema }])],
  controllers: [ClinicsController],
  providers: [ClinicsService],
  exports: [ClinicsService],
})
export class ClinicsModule {}
