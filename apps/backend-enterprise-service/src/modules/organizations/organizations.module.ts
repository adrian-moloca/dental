import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import { OrganizationDocument, OrganizationSchema } from '../../schemas/organization.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: OrganizationDocument.name, schema: OrganizationSchema }]),
  ],
  controllers: [OrganizationsController],
  providers: [OrganizationsService],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
