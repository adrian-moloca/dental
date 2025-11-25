/**
 * Relationships Module
 * @module modules/relationships
 */

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RelationshipsController } from './relationships.controller';
import { RelationshipsService } from './relationships.service';
import { PatientRelationship, PatientRelationshipSchema } from './entities/relationship.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PatientRelationship.name, schema: PatientRelationshipSchema },
    ]),
  ],
  controllers: [RelationshipsController],
  providers: [RelationshipsService],
  exports: [RelationshipsService],
})
export class RelationshipsModule {}
