import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ClinicDocument, ClinicFiscalSettings } from '../../schemas/clinic.schema';
import { ClinicStatus } from '@dentalos/shared-domain';
import type {
  CreateClinicDto,
  UpdateClinicDto,
  UpdateClinicSettingsDto,
  CreateClinicLocationDto,
  ClinicFilterDto,
} from '@dentalos/shared-validation';
import { UpdateClinicFiscalSettingsDto, ClinicFiscalSettingsResponseDto } from '../../dto/clinics';

@Injectable()
export class ClinicsService {
  private readonly logger = new Logger(ClinicsService.name);

  constructor(
    @InjectModel(ClinicDocument.name) private clinicModel: Model<ClinicDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(organizationId: string, dto: CreateClinicDto, context: { userId: string }) {
    const clinic = new this.clinicModel({
      ...dto,
      organizationId,
      status: ClinicStatus.ACTIVE,
      createdBy: context.userId,
      updatedBy: context.userId,
    });

    await clinic.save();
    this.logger.log(`Created clinic ${clinic._id} for organization ${organizationId}`);

    this.eventEmitter.emit('enterprise.clinic.created', {
      clinicId: clinic._id.toString(),
      organizationId,
      name: clinic.name,
      code: clinic.code,
      status: clinic.status,
      address: clinic.address,
      phone: clinic.phone,
      email: clinic.email,
      timezone: clinic.timezone,
      managerUserId: clinic.managerUserId,
      managerName: clinic.managerName,
      createdAt: clinic.createdAt.toISOString(),
      createdBy: context.userId,
    });

    return clinic;
  }

  async findAll(filter: ClinicFilterDto) {
    const query: Record<string, unknown> = {};
    if (filter.organizationId) query.organizationId = filter.organizationId;
    if (filter.status) query.status = filter.status;

    const limit = filter.limit || 20;
    const offset = filter.offset || 0;

    const [results, total] = await Promise.all([
      this.clinicModel.find(query).limit(limit).skip(offset).sort({ createdAt: -1 }).exec(),
      this.clinicModel.countDocuments(query).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);
    const page = Math.floor(offset / limit) + 1;
    const hasNextPage = offset + limit < total;
    const hasPreviousPage = offset > 0;

    return {
      data: results,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    };
  }

  async findOne(clinicId: string) {
    const clinic = await this.clinicModel.findById(clinicId).exec();
    if (!clinic) {
      throw new NotFoundException(`Clinic ${clinicId} not found`);
    }
    return clinic;
  }

  async update(clinicId: string, dto: UpdateClinicDto, context: { userId: string }) {
    const clinic = await this.findOne(clinicId);

    Object.assign(clinic, dto);
    clinic.updatedBy = context.userId;

    await clinic.save();
    this.logger.log(`Updated clinic ${clinicId}`);

    return clinic;
  }

  async updateSettings(
    clinicId: string,
    dto: UpdateClinicSettingsDto,
    context: { userId: string },
  ) {
    const clinic = await this.findOne(clinicId);

    this.eventEmitter.emit('enterprise.settings.updated', {
      entityType: 'CLINIC',
      entityId: clinicId,
      organizationId: clinic.organizationId,
      clinicId,
      settingsChanged: Object.keys(dto),
      previousValues: {},
      newValues: dto,
      updatedAt: new Date().toISOString(),
      updatedBy: context.userId,
    });

    return { success: true, clinicId };
  }

  async getLocations(clinicId: string) {
    await this.findOne(clinicId);
    return [];
  }

  async createLocation(
    clinicId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _dto: CreateClinicLocationDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _context: { userId: string },
  ) {
    await this.findOne(clinicId);
    return { success: true, clinicId, locationId: 'location-1' };
  }

  /**
   * Get fiscal settings for a clinic
   * Required for E-Factura integration
   */
  async getFiscalSettings(clinicId: string): Promise<ClinicFiscalSettingsResponseDto> {
    const clinic = await this.findOne(clinicId);
    const fiscalSettings = clinic.fiscalSettings || {};

    // Determine what's missing for E-Factura compliance
    const missingFields: string[] = [];
    if (!fiscalSettings.cui) missingFields.push('cui');
    if (!fiscalSettings.legalName) missingFields.push('legalName');
    if (!fiscalSettings.fiscalAddress) {
      missingFields.push('fiscalAddress');
    } else {
      if (!fiscalSettings.fiscalAddress.streetName) missingFields.push('fiscalAddress.streetName');
      if (!fiscalSettings.fiscalAddress.city) missingFields.push('fiscalAddress.city');
      if (!fiscalSettings.fiscalAddress.countryCode)
        missingFields.push('fiscalAddress.countryCode');
    }

    const isConfiguredForEFactura = missingFields.length === 0;

    return {
      clinicId,
      cui: fiscalSettings.cui,
      legalName: fiscalSettings.legalName,
      tradeName: fiscalSettings.tradeName,
      regCom: fiscalSettings.regCom,
      isVatPayer: fiscalSettings.isVatPayer,
      defaultVatRate: fiscalSettings.defaultVatRate,
      iban: fiscalSettings.iban,
      bankName: fiscalSettings.bankName,
      invoiceSeries: fiscalSettings.invoiceSeries,
      invoiceStartNumber: fiscalSettings.invoiceStartNumber,
      eFacturaEnabled: fiscalSettings.eFacturaEnabled,
      fiscalAddress: fiscalSettings.fiscalAddress,
      fiscalContact: fiscalSettings.fiscalContact,
      isConfiguredForEFactura,
      missingFields: missingFields.length > 0 ? missingFields : undefined,
    };
  }

  /**
   * Update fiscal settings for a clinic
   * Used to configure E-Factura seller information
   */
  async updateFiscalSettings(
    clinicId: string,
    dto: UpdateClinicFiscalSettingsDto,
    context: { userId: string },
  ): Promise<ClinicFiscalSettingsResponseDto> {
    const clinic = await this.findOne(clinicId);

    // Merge with existing settings
    const updatedSettings: ClinicFiscalSettings = {
      ...clinic.fiscalSettings,
      ...dto,
    };

    // Handle nested objects
    if (dto.fiscalAddress) {
      updatedSettings.fiscalAddress = {
        ...clinic.fiscalSettings?.fiscalAddress,
        ...dto.fiscalAddress,
      };
    }
    if (dto.fiscalContact) {
      updatedSettings.fiscalContact = {
        ...clinic.fiscalSettings?.fiscalContact,
        ...dto.fiscalContact,
      };
    }

    clinic.fiscalSettings = updatedSettings;
    clinic.updatedBy = context.userId;

    await clinic.save();
    this.logger.log(`Updated fiscal settings for clinic ${clinicId}`);

    // Emit event for other services to react
    this.eventEmitter.emit('enterprise.clinic.fiscalSettingsUpdated', {
      clinicId,
      organizationId: clinic.organizationId,
      cui: updatedSettings.cui,
      legalName: updatedSettings.legalName,
      eFacturaEnabled: updatedSettings.eFacturaEnabled,
      updatedAt: new Date().toISOString(),
      updatedBy: context.userId,
    });

    return this.getFiscalSettings(clinicId);
  }

  /**
   * Get fiscal settings by CUI (for internal service lookups)
   * Used by billing service to fetch seller info for E-Factura
   */
  async findByCui(cui: string): Promise<ClinicDocument | null> {
    // Normalize CUI - remove RO prefix for comparison
    const normalizedCui = cui.replace(/^RO/i, '');

    return this.clinicModel
      .findOne({
        $or: [
          { 'fiscalSettings.cui': cui },
          { 'fiscalSettings.cui': `RO${normalizedCui}` },
          { 'fiscalSettings.cui': normalizedCui },
        ],
      })
      .exec();
  }

  /**
   * Get fiscal settings for E-Factura by clinic ID
   * Returns only the fields needed for UBL XML generation
   */
  async getSellerInfoForEFactura(clinicId: string): Promise<{
    cui: string;
    legalName: string;
    tradeName?: string;
    regCom?: string;
    iban?: string;
    bankName?: string;
    address: {
      streetName: string;
      additionalStreetName?: string;
      city: string;
      county?: string;
      postalCode?: string;
      countryCode: string;
    };
    contact?: {
      name?: string;
      phone?: string;
      email?: string;
    };
  }> {
    const clinic = await this.findOne(clinicId);
    const fiscal = clinic.fiscalSettings;

    if (!fiscal?.cui || !fiscal?.legalName) {
      throw new NotFoundException(
        `Clinic ${clinicId} fiscal settings are incomplete. Required: CUI and Legal Name`,
      );
    }

    // Use fiscal address if available, otherwise fall back to clinic address
    const address = fiscal.fiscalAddress || {
      streetName: clinic.address.street,
      city: clinic.address.city,
      county: clinic.address.state,
      postalCode: clinic.address.postalCode,
      countryCode: clinic.address.country || 'RO',
    };

    if (!address.streetName || !address.city) {
      throw new NotFoundException(
        `Clinic ${clinicId} fiscal address is incomplete. Required: Street and City`,
      );
    }

    return {
      cui: fiscal.cui,
      legalName: fiscal.legalName,
      tradeName: fiscal.tradeName,
      regCom: fiscal.regCom,
      iban: fiscal.iban,
      bankName: fiscal.bankName,
      address: {
        streetName: address.streetName,
        additionalStreetName: address.additionalStreetName,
        city: address.city,
        county: address.county,
        postalCode: address.postalCode,
        countryCode: address.countryCode || 'RO',
      },
      contact: fiscal.fiscalContact,
    };
  }
}
