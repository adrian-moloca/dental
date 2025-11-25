import { Module, Scope } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { REQUEST } from '@nestjs/core';
import { DataLoaderService, DATALOADERS } from './dataloader.service';
import { OrganizationDocument, OrganizationSchema } from '../../schemas/organization.schema';
import { ClinicDocument, ClinicSchema } from '../../schemas/clinic.schema';
import {
  ProviderClinicAssignmentDocument,
  ProviderClinicAssignmentSchema,
} from '../../schemas/provider-clinic-assignment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OrganizationDocument.name, schema: OrganizationSchema },
      { name: ClinicDocument.name, schema: ClinicSchema },
      { name: ProviderClinicAssignmentDocument.name, schema: ProviderClinicAssignmentSchema },
    ]),
  ],
  providers: [
    DataLoaderService,
    // Request-scoped DataLoaders provider
    {
      provide: DATALOADERS,
      scope: Scope.REQUEST,
      inject: [DataLoaderService, REQUEST],
      useFactory: (dataLoaderService: DataLoaderService) => {
        return dataLoaderService.createLoaders();
      },
    },
  ],
  exports: [DataLoaderService, DATALOADERS],
})
export class DataLoaderModule {}
