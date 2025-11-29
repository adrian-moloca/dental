/**
 * Procedure Catalog Service
 *
 * Business logic layer for procedure catalog management.
 * Handles CRUD operations and business rules for dental procedure definitions.
 *
 * CLINICAL SAFETY: This catalog drives treatment plan pricing and
 * procedure configurations. Changes affect all future treatment plans.
 *
 * @module procedure-catalog/service
 */

import { Injectable, Logger } from '@nestjs/common';
import {
  ProcedureCatalogRepository,
  TenantContext,
  AuditContext,
  PaginatedResult,
  BulkImportResult,
} from './procedure-catalog.repository';
import { ProcedureCatalogDocument, ProcedureCategory } from './entities/procedure-catalog.schema';
import {
  CreateProcedureCatalogDto,
  UpdateProcedureCatalogDto,
  ProcedureCatalogQueryDto,
} from './dto/procedure-catalog.dto';

/**
 * Pricing calculation result
 */
export interface PricingCalculation {
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  taxRate: number;
}

@Injectable()
export class ProcedureCatalogService {
  private readonly logger = new Logger(ProcedureCatalogService.name);

  constructor(private readonly repository: ProcedureCatalogRepository) {}

  // ============================================================================
  // QUERY METHODS
  // ============================================================================

  /**
   * Get a procedure by ID
   */
  async getById(id: string, context: TenantContext): Promise<ProcedureCatalogDocument> {
    return this.repository.findByIdOrFail(id, context);
  }

  /**
   * Get a procedure by code
   */
  async getByCode(
    code: string,
    context: TenantContext,
    clinicId?: string,
  ): Promise<ProcedureCatalogDocument> {
    return this.repository.findByCodeOrFail(code, context, clinicId);
  }

  /**
   * Search and list procedures with pagination
   */
  async find(
    context: TenantContext,
    query: ProcedureCatalogQueryDto,
  ): Promise<PaginatedResult<ProcedureCatalogDocument>> {
    return this.repository.find(context, query);
  }

  /**
   * Get all procedures by category
   */
  async getByCategory(
    category: ProcedureCategory,
    context: TenantContext,
  ): Promise<ProcedureCatalogDocument[]> {
    return this.repository.findByCategory(category, context);
  }

  /**
   * Get procedure counts by category for dashboard
   */
  async getCategoryCounts(context: TenantContext): Promise<Record<string, number>> {
    return this.repository.countByCategory(context);
  }

  /**
   * Get multiple procedures by codes
   */
  async getByCodes(
    codes: string[],
    context: TenantContext,
    clinicId?: string,
  ): Promise<ProcedureCatalogDocument[]> {
    return this.repository.findByCodes(codes, context, clinicId);
  }

  // ============================================================================
  // MUTATION METHODS
  // ============================================================================

  /**
   * Create a new procedure catalog entry
   */
  async create(
    dto: CreateProcedureCatalogDto,
    auditContext: AuditContext,
  ): Promise<ProcedureCatalogDocument> {
    this.logger.log(`Creating procedure catalog entry: ${dto.code}`);
    return this.repository.create(dto, auditContext);
  }

  /**
   * Update a procedure catalog entry
   */
  async update(
    id: string,
    dto: UpdateProcedureCatalogDto,
    expectedVersion: number,
    auditContext: AuditContext,
  ): Promise<ProcedureCatalogDocument> {
    this.logger.log(`Updating procedure catalog entry: ${id}`);
    return this.repository.update(id, dto, expectedVersion, auditContext);
  }

  /**
   * Delete a procedure catalog entry (soft delete)
   */
  async delete(id: string, auditContext: AuditContext): Promise<ProcedureCatalogDocument> {
    this.logger.log(`Deleting procedure catalog entry: ${id}`);
    return this.repository.softDelete(id, auditContext);
  }

  /**
   * Bulk import procedures
   */
  async bulkImport(
    procedures: CreateProcedureCatalogDto[],
    updateExisting: boolean,
    auditContext: AuditContext,
  ): Promise<BulkImportResult> {
    this.logger.log(`Bulk importing ${procedures.length} procedures`);
    return this.repository.bulkImport(procedures, updateExisting, auditContext);
  }

  // ============================================================================
  // PRICING CALCULATION METHODS
  // ============================================================================

  /**
   * Calculate pricing for a procedure including tax
   *
   * CLINICAL NOTE: In Romania, dental services are subject to 19% VAT.
   * Some procedures may have different tax rates or be tax-exempt.
   *
   * @param procedure The procedure catalog entry
   * @param quantity Number of units (default 1)
   * @param discountPercent Optional discount percentage (0-100)
   * @param discountCents Optional fixed discount in cents
   * @returns Pricing calculation with subtotal, tax, and total
   */
  calculatePricing(
    procedure: ProcedureCatalogDocument,
    quantity: number = 1,
    discountPercent: number = 0,
    discountCents: number = 0,
  ): PricingCalculation {
    // Calculate subtotal (before tax)
    const baseAmount = procedure.defaultPriceCents * quantity;

    // Apply percentage discount first, then fixed discount
    const percentDiscount = Math.round(baseAmount * (discountPercent / 100));
    const subtotalCents = Math.max(0, baseAmount - percentDiscount - discountCents);

    // Calculate tax on the discounted subtotal
    const taxCents = Math.round(subtotalCents * procedure.taxRate);
    const totalCents = subtotalCents + taxCents;

    return {
      subtotalCents,
      taxCents,
      totalCents,
      taxRate: procedure.taxRate,
    };
  }

  /**
   * Calculate pricing for multiple procedures
   *
   * @param items Array of procedure items with quantity and discount
   * @param context Tenant context for looking up procedures
   * @returns Combined pricing calculation
   */
  async calculateMultiplePricing(
    items: Array<{
      procedureCode: string;
      quantity: number;
      discountPercent?: number;
      discountCents?: number;
    }>,
    context: TenantContext,
  ): Promise<{
    itemPricing: Array<PricingCalculation & { procedureCode: string }>;
    summary: PricingCalculation;
  }> {
    const codes = items.map((item) => item.procedureCode);
    const procedures = await this.repository.findByCodes(codes, context);

    const procedureMap = new Map(procedures.map((p) => [p.code, p]));

    let totalSubtotal = 0;
    let totalTax = 0;

    const itemPricing = items.map((item) => {
      const procedure = procedureMap.get(item.procedureCode);
      if (!procedure) {
        throw new Error(`Procedure ${item.procedureCode} not found`);
      }

      const pricing = this.calculatePricing(
        procedure,
        item.quantity,
        item.discountPercent || 0,
        item.discountCents || 0,
      );

      totalSubtotal += pricing.subtotalCents;
      totalTax += pricing.taxCents;

      return {
        procedureCode: item.procedureCode,
        ...pricing,
      };
    });

    return {
      itemPricing,
      summary: {
        subtotalCents: totalSubtotal,
        taxCents: totalTax,
        totalCents: totalSubtotal + totalTax,
        taxRate: 0.19, // Default Romanian VAT (actual rate may vary per item)
      },
    };
  }

  /**
   * Get price with tax for display purposes
   *
   * @param priceCents Price in cents
   * @param taxRate Tax rate as decimal (e.g., 0.19 for 19%)
   * @returns Price with tax in cents
   */
  getPriceWithTax(priceCents: number, taxRate: number = 0.19): number {
    return Math.round(priceCents * (1 + taxRate));
  }

  /**
   * Get price without tax (reverse calculation)
   *
   * @param priceWithTaxCents Price with tax in cents
   * @param taxRate Tax rate as decimal
   * @returns Price without tax in cents
   */
  getPriceWithoutTax(priceWithTaxCents: number, taxRate: number = 0.19): number {
    return Math.round(priceWithTaxCents / (1 + taxRate));
  }

  // ============================================================================
  // VALIDATION METHODS
  // ============================================================================

  /**
   * Validate that all procedure codes exist
   */
  async validateProcedureCodes(
    codes: string[],
    context: TenantContext,
  ): Promise<{ valid: boolean; missingCodes: string[] }> {
    const procedures = await this.repository.findByCodes(codes, context);
    const foundCodes = new Set(procedures.map((p) => p.code));
    const missingCodes = codes.filter((code) => !foundCodes.has(code));

    return {
      valid: missingCodes.length === 0,
      missingCodes,
    };
  }

  /**
   * Check for contraindicated procedure combinations
   */
  async checkContraindications(
    codes: string[],
    context: TenantContext,
  ): Promise<{
    hasContraindications: boolean;
    conflicts: Array<{ code1: string; code2: string }>;
  }> {
    const procedures = await this.repository.findByCodes(codes, context);
    const conflicts: Array<{ code1: string; code2: string }> = [];

    for (const procedure of procedures) {
      for (const contraCode of procedure.contraindicatedCodes) {
        if (codes.includes(contraCode)) {
          conflicts.push({
            code1: procedure.code,
            code2: contraCode,
          });
        }
      }
    }

    return {
      hasContraindications: conflicts.length > 0,
      conflicts,
    };
  }
}
