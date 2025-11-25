import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ClinicalNote, ClinicalNoteDocument } from './entities/clinical-note.schema';
import { CreateNoteDto } from './dto/create-note.dto';

@Injectable()
export class ClinicalNotesService {
  constructor(
    @InjectModel(ClinicalNote.name) private model: Model<ClinicalNoteDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(patientId: string, dto: CreateNoteDto, context: any, userId: string) {
    const note = new this.model({ patientId, ...dto, ...context, createdBy: userId });
    const saved = await note.save();
    this.eventEmitter.emit('clinical.note.created', {
      noteId: saved._id,
      patientId,
      noteType: dto.noteType,
      createdBy: userId,
      tenantId: context.tenantId,
    });
    return saved;
  }

  async findByPatient(patientId: string, context: any, filters: any) {
    const query: any = { patientId, tenantId: context.tenantId };
    if (filters.type) query.noteType = filters.type;
    return this.model
      .find(query)
      .sort({ createdAt: -1 })
      .limit(filters.limit || 50)
      .exec();
  }

  async findById(noteId: string, context: any) {
    return this.model.findOne({ _id: noteId, tenantId: context.tenantId }).exec();
  }
}
