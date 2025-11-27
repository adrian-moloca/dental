import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ProcedureTemplate, ProcedureTemplateDocument } from '../schemas/procedure-template.schema';
import { Product } from '../../products/schemas/product.schema';
import {
  CreateProcedureTemplateDto,
  UpdateProcedureTemplateDto,
  QueryProcedureTemplatesDto,
  ProcedureTemplateResponseDto,
  ProcedureMaterialsResponseDto,
  ProcedureCategory,
} from '../dto/procedure-template.dto';

/**
 * ProcedureTemplateService
 *
 * Manages procedure-to-material mappings for automatic stock deduction.
 * Supports tenant-level templates with clinic-specific overrides.
 *
 * Template Resolution Order:
 * 1. Clinic-specific template (if clinicId provided and template exists)
 * 2. Organization-level template (default)
 */
@Injectable()
export class ProcedureTemplateService {
  private readonly logger = new Logger(ProcedureTemplateService.name);

  constructor(
    @InjectModel(ProcedureTemplate.name)
    private procedureTemplateModel: Model<ProcedureTemplateDocument>,
    @InjectModel(Product.name)
    private productModel: Model<Product>,
  ) {}

  /**
   * Create a new procedure template
   */
  async create(
    dto: CreateProcedureTemplateDto,
    tenantId: string,
    organizationId: string,
    userId: string,
  ): Promise<ProcedureTemplateResponseDto> {
    this.logger.log(`Creating procedure template for ${dto.procedureCode}`);

    // Check for existing template with same code and clinic
    const existing = await this.procedureTemplateModel.findOne({
      tenantId,
      procedureCode: dto.procedureCode,
      clinicId: dto.clinicId || null,
      isActive: true,
    });

    if (existing) {
      throw new ConflictException(
        `Template for procedure ${dto.procedureCode} already exists` +
          (dto.clinicId ? ` for clinic ${dto.clinicId}` : ''),
      );
    }

    // Validate products exist
    const productIds = dto.materials.map((m) => m.productId);
    const products = await this.productModel.find({
      _id: { $in: productIds.map((id) => new Types.ObjectId(id)) },
      tenantId,
      isActive: true,
    });

    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    for (const material of dto.materials) {
      if (!productMap.has(material.productId)) {
        throw new NotFoundException(`Product ${material.productId} not found`);
      }
    }

    // Build materials with product names
    const materialsWithNames = dto.materials.map((m) => ({
      productId: new Types.ObjectId(m.productId),
      productName: productMap.get(m.productId)!.name,
      quantityPerUnit: m.quantityPerUnit,
      unitOfMeasure: m.unitOfMeasure || productMap.get(m.productId)!.unitOfMeasure,
      isOptional: m.isOptional || false,
      substitutes: m.substitutes?.map((s) => new Types.ObjectId(s)) || [],
      notes: m.notes,
    }));

    const template = new this.procedureTemplateModel({
      procedureCode: dto.procedureCode,
      procedureName: dto.procedureName,
      category: dto.category || ProcedureCategory.OTHER,
      materials: materialsWithNames,
      autoDeductOnComplete: dto.autoDeductOnComplete ?? true,
      estimatedDurationMinutes: dto.estimatedDurationMinutes,
      notes: dto.notes,
      isActive: true,
      tenantId,
      organizationId,
      clinicId: dto.clinicId || undefined,
      createdBy: userId,
    });

    const saved = await template.save();
    this.logger.log(`Created procedure template ${saved._id} for ${dto.procedureCode}`);

    return this.toResponseDto(saved);
  }

  /**
   * Update a procedure template
   */
  async update(
    id: string,
    dto: UpdateProcedureTemplateDto,
    tenantId: string,
    userId: string,
  ): Promise<ProcedureTemplateResponseDto> {
    const template = await this.procedureTemplateModel.findOne({
      _id: id,
      tenantId,
    });

    if (!template) {
      throw new NotFoundException(`Procedure template ${id} not found`);
    }

    // If updating materials, validate products
    if (dto.materials) {
      const productIds = dto.materials.map((m) => m.productId);
      const products = await this.productModel.find({
        _id: { $in: productIds.map((id) => new Types.ObjectId(id)) },
        tenantId,
        isActive: true,
      });

      const productMap = new Map(products.map((p) => [p._id.toString(), p]));

      for (const material of dto.materials) {
        if (!productMap.has(material.productId)) {
          throw new NotFoundException(`Product ${material.productId} not found`);
        }
      }

      template.materials = dto.materials.map((m) => ({
        productId: new Types.ObjectId(m.productId),
        productName: productMap.get(m.productId)!.name,
        quantityPerUnit: m.quantityPerUnit,
        unitOfMeasure: m.unitOfMeasure || productMap.get(m.productId)!.unitOfMeasure,
        isOptional: m.isOptional || false,
        substitutes: m.substitutes?.map((s) => new Types.ObjectId(s)) || [],
        notes: m.notes,
      }));
    }

    if (dto.procedureName !== undefined) template.procedureName = dto.procedureName;
    if (dto.category !== undefined) template.category = dto.category;
    if (dto.autoDeductOnComplete !== undefined)
      template.autoDeductOnComplete = dto.autoDeductOnComplete;
    if (dto.estimatedDurationMinutes !== undefined)
      template.estimatedDurationMinutes = dto.estimatedDurationMinutes;
    if (dto.isActive !== undefined) template.isActive = dto.isActive;
    if (dto.notes !== undefined) template.notes = dto.notes;
    template.updatedBy = userId;

    const saved = await template.save();
    this.logger.log(`Updated procedure template ${id}`);

    return this.toResponseDto(saved);
  }

  /**
   * Get a procedure template by ID
   */
  async findById(id: string, tenantId: string): Promise<ProcedureTemplateResponseDto> {
    const template = await this.procedureTemplateModel.findOne({
      _id: id,
      tenantId,
    });

    if (!template) {
      throw new NotFoundException(`Procedure template ${id} not found`);
    }

    return this.toResponseDto(template);
  }

  /**
   * List procedure templates with filters
   */
  async findAll(
    tenantId: string,
    query: QueryProcedureTemplatesDto,
  ): Promise<{ data: ProcedureTemplateResponseDto[]; total: number }> {
    const filter: any = { tenantId };

    if (query.procedureCode) {
      filter.procedureCode = { $regex: query.procedureCode, $options: 'i' };
    }

    if (query.category) {
      filter.category = query.category;
    }

    if (query.clinicId) {
      filter.clinicId = query.clinicId;
    }

    if (!query.includeInactive) {
      filter.isActive = true;
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [templates, total] = await Promise.all([
      this.procedureTemplateModel.find(filter).skip(skip).limit(limit).sort({ procedureCode: 1 }),
      this.procedureTemplateModel.countDocuments(filter),
    ]);

    return {
      data: templates.map((t) => this.toResponseDto(t)),
      total,
    };
  }

  /**
   * Get materials for a procedure code
   * Resolves clinic-specific template first, then falls back to organization-level
   */
  async getMaterialsForProcedure(
    procedureCode: string,
    tenantId: string,
    clinicId?: string,
    quantity: number = 1,
  ): Promise<ProcedureMaterialsResponseDto | null> {
    this.logger.debug(
      `Getting materials for procedure ${procedureCode}, clinic: ${clinicId || 'N/A'}`,
    );

    // Try clinic-specific template first
    let template: ProcedureTemplateDocument | null = null;

    if (clinicId) {
      template = await this.procedureTemplateModel.findOne({
        tenantId,
        procedureCode,
        clinicId,
        isActive: true,
      });
    }

    // Fall back to organization-level template
    if (!template) {
      template = await this.procedureTemplateModel.findOne({
        tenantId,
        procedureCode,
        clinicId: { $exists: false },
        isActive: true,
      });
    }

    if (!template) {
      this.logger.debug(`No template found for procedure ${procedureCode}`);
      return null;
    }

    return {
      procedureCode: template.procedureCode,
      procedureName: template.procedureName,
      materials: template.materials.map((m) => ({
        productId: m.productId.toString(),
        productName: m.productName,
        quantity: m.quantityPerUnit * quantity,
        unitOfMeasure: m.unitOfMeasure,
        isOptional: m.isOptional,
      })),
      autoDeductOnComplete: template.autoDeductOnComplete,
    };
  }

  /**
   * Soft delete a procedure template
   */
  async delete(id: string, tenantId: string, userId: string): Promise<void> {
    const result = await this.procedureTemplateModel.updateOne(
      { _id: id, tenantId },
      { isActive: false, updatedBy: userId },
    );

    if (result.matchedCount === 0) {
      throw new NotFoundException(`Procedure template ${id} not found`);
    }

    this.logger.log(`Deleted procedure template ${id}`);
  }

  /**
   * Bulk create/update procedure templates (for seeding common procedures)
   */
  async bulkUpsert(
    templates: CreateProcedureTemplateDto[],
    tenantId: string,
    organizationId: string,
    userId: string,
  ): Promise<{ created: number; updated: number }> {
    let created = 0;
    let updated = 0;

    for (const dto of templates) {
      try {
        const existing = await this.procedureTemplateModel.findOne({
          tenantId,
          procedureCode: dto.procedureCode,
          clinicId: dto.clinicId || null,
        });

        if (existing) {
          await this.update(existing._id.toString(), dto, tenantId, userId);
          updated++;
        } else {
          await this.create(dto, tenantId, organizationId, userId);
          created++;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.warn(`Failed to upsert template ${dto.procedureCode}: ${errorMessage}`);
      }
    }

    this.logger.log(`Bulk upsert complete: ${created} created, ${updated} updated`);
    return { created, updated };
  }

  /**
   * Convert document to response DTO
   */
  private toResponseDto(doc: ProcedureTemplateDocument): ProcedureTemplateResponseDto {
    // Access timestamps from Mongoose document (added by timestamps: true option)
    const docAny = doc as any;
    return {
      id: doc._id.toString(),
      procedureCode: doc.procedureCode,
      procedureName: doc.procedureName,
      category: doc.category as ProcedureCategory,
      materials: doc.materials.map((m) => ({
        productId: m.productId.toString(),
        productName: m.productName,
        quantityPerUnit: m.quantityPerUnit,
        unitOfMeasure: m.unitOfMeasure,
        isOptional: m.isOptional,
        substitutes: m.substitutes?.map((s) => s.toString()),
        notes: m.notes,
      })),
      autoDeductOnComplete: doc.autoDeductOnComplete,
      estimatedDurationMinutes: doc.estimatedDurationMinutes,
      isActive: doc.isActive,
      notes: doc.notes,
      clinicId: doc.clinicId,
      createdAt: docAny.createdAt,
      updatedAt: docAny.updatedAt,
    };
  }
}
