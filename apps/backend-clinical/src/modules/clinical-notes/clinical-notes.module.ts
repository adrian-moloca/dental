/**
 * Clinical Notes Module
 *
 * NestJS module for SOAP clinical notes management.
 * Provides comprehensive clinical documentation with:
 * - SOAP note format
 * - Digital signatures
 * - Amendment workflow
 * - Full audit trail
 *
 * @module clinical-notes
 */

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ClinicalNotesController } from './clinical-notes.controller';
import { ClinicalNotesService } from './clinical-notes.service';
import { ClinicalNotesRepository } from './clinical-notes.repository';
import {
  ClinicalNote,
  ClinicalNoteSchema,
  ClinicalNoteHistory,
  ClinicalNoteHistorySchema,
} from './entities/clinical-note.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    // MongoDB models for clinical notes and audit history
    MongooseModule.forFeature([
      { name: ClinicalNote.name, schema: ClinicalNoteSchema },
      { name: ClinicalNoteHistory.name, schema: ClinicalNoteHistorySchema },
    ]),

    // Event emitter for domain events
    EventEmitterModule,

    // Auth module for guards and decorators
    AuthModule,
  ],
  controllers: [ClinicalNotesController],
  providers: [ClinicalNotesService, ClinicalNotesRepository],
  exports: [ClinicalNotesService, ClinicalNotesRepository],
})
export class ClinicalNotesModule {}
