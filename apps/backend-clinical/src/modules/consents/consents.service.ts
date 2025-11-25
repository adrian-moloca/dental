import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Consent, ConsentDocument } from './entities/consent.schema';
import { CreateConsentDto, SignConsentDto } from './dto/consent.dto';

@Injectable()
export class ConsentsService {
  constructor(
    @InjectModel(Consent.name) private model: Model<ConsentDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(patientId: string, dto: CreateConsentDto, context: any, userId: string) {
    const consent = new this.model({
      patientId,
      ...dto,
      ...context,
      status: 'PENDING',
      createdBy: userId,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
    });
    return consent.save();
  }

  async findByPatient(patientId: string, context: any) {
    return this.model
      .find({ patientId, tenantId: context.tenantId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async sign(consentId: string, dto: SignConsentDto, context: any, userId: string) {
    const consent = await this.model.findOne({ _id: consentId, tenantId: context.tenantId }).exec();
    if (!consent) throw new Error('Consent not found');

    consent.status = 'SIGNED';
    consent.signedBy = userId;
    consent.signatureData = dto.signatureData;
    consent.signedAt = new Date();

    const saved = await consent.save();
    this.eventEmitter.emit('consent.signed', {
      consentId: saved._id,
      patientId: saved.patientId,
      consentType: saved.consentType,
      signedBy: userId,
      signedAt: saved.signedAt,
      tenantId: context.tenantId,
    });

    return saved;
  }

  async generatePdf(consentId: string, _context: any) {
    // Placeholder - implement PDF generation with pdfkit
    return { message: 'PDF generation not yet implemented', consentId };
  }
}
