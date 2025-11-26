import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ClinicStatus } from '@dentalos/shared-domain';

/**
 * Romanian fiscal settings for E-Factura compliance
 * Required for electronic invoicing to ANAF
 */
export interface ClinicFiscalSettings {
  /** CUI (Cod Unic de Identificare) - Romanian tax ID with or without RO prefix */
  cui?: string;
  /** Company legal name as registered with ONRC */
  legalName?: string;
  /** Trade/commercial name (if different from legal name) */
  tradeName?: string;
  /** Nr. Registrul Comertului (e.g., J40/1234/2020) */
  regCom?: string;
  /** Whether the clinic is a VAT payer (platitor TVA) */
  isVatPayer?: boolean;
  /** Default VAT rate for services (0.19 = 19%, 0 = exempt) */
  defaultVatRate?: number;
  /** Bank account IBAN for invoice payments */
  iban?: string;
  /** Bank name */
  bankName?: string;
  /** Invoice series prefix (e.g., 'DEN', 'CLINIC1') */
  invoiceSeries?: string;
  /** Starting invoice number for the series */
  invoiceStartNumber?: number;
  /** Whether E-Factura is enabled for this clinic */
  eFacturaEnabled?: boolean;
  /** Registered address for fiscal documents (may differ from clinic address) */
  fiscalAddress?: {
    streetName: string;
    additionalStreetName?: string;
    city: string;
    county?: string;
    postalCode?: string;
    countryCode: string;
  };
  /** Contact for fiscal matters */
  fiscalContact?: {
    name?: string;
    phone?: string;
    email?: string;
  };
}

@Schema({ collection: 'clinics', timestamps: true })
export class ClinicDocument extends Document {
  @Prop({ required: true, index: true })
  organizationId!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, unique: true })
  code!: string;

  @Prop({ required: true, enum: Object.values(ClinicStatus), index: true })
  status!: ClinicStatus;

  @Prop({ type: Object, required: true })
  address!: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  /**
   * Romanian fiscal settings for E-Factura
   * Contains CUI, legal name, IBAN, and other fiscal data
   */
  @Prop({ type: Object })
  fiscalSettings?: ClinicFiscalSettings;

  @Prop({ required: true })
  phone!: string;

  @Prop({ required: true })
  email!: string;

  @Prop()
  website?: string;

  @Prop()
  managerUserId?: string;

  @Prop()
  managerName?: string;

  @Prop()
  managerEmail?: string;

  @Prop({ required: true })
  timezone!: string;

  @Prop({ required: true, default: 'en-US' })
  locale!: string;

  @Prop({ type: Object })
  operatingHours?: any;

  @Prop()
  licenseNumber?: string;

  @Prop()
  accreditationDetails?: string;

  @Prop({ required: true })
  createdBy!: string;

  @Prop({ required: true })
  updatedBy!: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const ClinicSchema = SchemaFactory.createForClass(ClinicDocument);

ClinicSchema.index({ organizationId: 1, status: 1 });
ClinicSchema.index({ organizationId: 1, createdAt: -1 });
ClinicSchema.index({ code: 1 }, { unique: true });
