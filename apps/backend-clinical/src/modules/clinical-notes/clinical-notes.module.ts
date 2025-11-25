import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClinicalNotesController } from './clinical-notes.controller';
import { ClinicalNotesService } from './clinical-notes.service';
import { ClinicalNote, ClinicalNoteSchema } from './entities/clinical-note.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ClinicalNote.name, schema: ClinicalNoteSchema }]),
    AuthModule,
  ],
  controllers: [ClinicalNotesController],
  providers: [ClinicalNotesService],
})
export class ClinicalNotesModule {}
