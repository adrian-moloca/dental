import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssignmentsController } from './assignments.controller';
import { AssignmentsService } from './assignments.service';
import {
  ProviderClinicAssignmentDocument,
  ProviderClinicAssignmentSchema,
} from '../../schemas/provider-clinic-assignment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProviderClinicAssignmentDocument.name, schema: ProviderClinicAssignmentSchema },
    ]),
  ],
  controllers: [AssignmentsController],
  providers: [AssignmentsService],
  exports: [AssignmentsService],
})
export class AssignmentsModule {}
