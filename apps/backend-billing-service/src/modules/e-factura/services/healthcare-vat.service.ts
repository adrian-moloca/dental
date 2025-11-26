import { Injectable, Logger } from '@nestjs/common';

import {
  TAX_CATEGORY_CODES,
  TAX_EXEMPTION_REASONS,
  TaxCategoryCode,
} from '../constants/ubl-codes.constant';

/**
 * VAT Treatment result for a dental procedure
 */
export interface VatTreatment {
  /** Tax rate (0 for exempt, 0.19 for standard, 0.09 for reduced) */
  taxRate: number;
  /** UBL Tax Category Code (E=Exempt, S=Standard, etc.) */
  taxCategoryCode: TaxCategoryCode;
  /** VATEX exemption reason code (required when exempt) */
  exemptionReasonCode?: string;
  /** Human-readable exemption reason text */
  exemptionReasonText?: string;
  /** Whether this is a healthcare exempt service */
  isHealthcareExempt: boolean;
}

/**
 * Dental procedure category for VAT classification
 */
export enum DentalProcedureCategory {
  /** Medical/therapeutic dental procedures - VAT EXEMPT */
  MEDICAL = 'MEDICAL',
  /** Cosmetic/aesthetic procedures - STANDARD VAT 19% */
  COSMETIC = 'COSMETIC',
  /** Laboratory services - REDUCED VAT 9% */
  LABORATORY = 'LABORATORY',
  /** Products/materials sold separately - STANDARD VAT 19% */
  PRODUCT = 'PRODUCT',
  /** Uncategorized - default to MEDICAL for dental */
  UNKNOWN = 'UNKNOWN',
}

/**
 * CDT (Current Dental Terminology) code ranges for classification
 * Based on ADA CDT Code Structure
 */
const CDT_CODE_CATEGORIES: Record<string, DentalProcedureCategory> = {
  // D0100-D0999: Diagnostic - MEDICAL
  'D01': DentalProcedureCategory.MEDICAL,
  'D02': DentalProcedureCategory.MEDICAL,
  'D03': DentalProcedureCategory.MEDICAL,
  'D04': DentalProcedureCategory.MEDICAL,
  'D05': DentalProcedureCategory.MEDICAL,
  'D06': DentalProcedureCategory.MEDICAL,
  'D07': DentalProcedureCategory.MEDICAL,
  'D08': DentalProcedureCategory.MEDICAL,
  'D09': DentalProcedureCategory.MEDICAL,

  // D1000-D1999: Preventive - MEDICAL
  'D10': DentalProcedureCategory.MEDICAL,
  'D11': DentalProcedureCategory.MEDICAL,
  'D12': DentalProcedureCategory.MEDICAL,
  'D13': DentalProcedureCategory.MEDICAL,
  'D14': DentalProcedureCategory.MEDICAL,
  'D15': DentalProcedureCategory.MEDICAL,
  'D16': DentalProcedureCategory.MEDICAL,
  'D17': DentalProcedureCategory.MEDICAL,
  'D18': DentalProcedureCategory.MEDICAL,
  'D19': DentalProcedureCategory.MEDICAL,

  // D2000-D2999: Restorative - MEDICAL
  'D20': DentalProcedureCategory.MEDICAL,
  'D21': DentalProcedureCategory.MEDICAL,
  'D22': DentalProcedureCategory.MEDICAL,
  'D23': DentalProcedureCategory.MEDICAL,
  'D24': DentalProcedureCategory.MEDICAL,
  'D25': DentalProcedureCategory.MEDICAL,
  'D26': DentalProcedureCategory.MEDICAL,
  'D27': DentalProcedureCategory.MEDICAL,
  'D28': DentalProcedureCategory.MEDICAL,
  'D29': DentalProcedureCategory.MEDICAL,

  // D3000-D3999: Endodontics - MEDICAL
  'D30': DentalProcedureCategory.MEDICAL,
  'D31': DentalProcedureCategory.MEDICAL,
  'D32': DentalProcedureCategory.MEDICAL,
  'D33': DentalProcedureCategory.MEDICAL,
  'D34': DentalProcedureCategory.MEDICAL,
  'D35': DentalProcedureCategory.MEDICAL,
  'D36': DentalProcedureCategory.MEDICAL,
  'D37': DentalProcedureCategory.MEDICAL,
  'D38': DentalProcedureCategory.MEDICAL,
  'D39': DentalProcedureCategory.MEDICAL,

  // D4000-D4999: Periodontics - MEDICAL
  'D40': DentalProcedureCategory.MEDICAL,
  'D41': DentalProcedureCategory.MEDICAL,
  'D42': DentalProcedureCategory.MEDICAL,
  'D43': DentalProcedureCategory.MEDICAL,
  'D44': DentalProcedureCategory.MEDICAL,
  'D45': DentalProcedureCategory.MEDICAL,
  'D46': DentalProcedureCategory.MEDICAL,
  'D47': DentalProcedureCategory.MEDICAL,
  'D48': DentalProcedureCategory.MEDICAL,
  'D49': DentalProcedureCategory.MEDICAL,

  // D5000-D5999: Prosthodontics, removable - MEDICAL
  'D50': DentalProcedureCategory.MEDICAL,
  'D51': DentalProcedureCategory.MEDICAL,
  'D52': DentalProcedureCategory.MEDICAL,
  'D53': DentalProcedureCategory.MEDICAL,
  'D54': DentalProcedureCategory.MEDICAL,
  'D55': DentalProcedureCategory.MEDICAL,
  'D56': DentalProcedureCategory.MEDICAL,
  'D57': DentalProcedureCategory.MEDICAL,
  'D58': DentalProcedureCategory.MEDICAL,
  'D59': DentalProcedureCategory.MEDICAL,

  // D6000-D6999: Implant Services - MEDICAL
  'D60': DentalProcedureCategory.MEDICAL,
  'D61': DentalProcedureCategory.MEDICAL,
  'D62': DentalProcedureCategory.MEDICAL,
  'D63': DentalProcedureCategory.MEDICAL,
  'D64': DentalProcedureCategory.MEDICAL,
  'D65': DentalProcedureCategory.MEDICAL,
  'D66': DentalProcedureCategory.MEDICAL,
  'D67': DentalProcedureCategory.MEDICAL,
  'D68': DentalProcedureCategory.MEDICAL,
  'D69': DentalProcedureCategory.MEDICAL,

  // D7000-D7999: Oral & Maxillofacial Surgery - MEDICAL
  'D70': DentalProcedureCategory.MEDICAL,
  'D71': DentalProcedureCategory.MEDICAL,
  'D72': DentalProcedureCategory.MEDICAL,
  'D73': DentalProcedureCategory.MEDICAL,
  'D74': DentalProcedureCategory.MEDICAL,
  'D75': DentalProcedureCategory.MEDICAL,
  'D76': DentalProcedureCategory.MEDICAL,
  'D77': DentalProcedureCategory.MEDICAL,
  'D78': DentalProcedureCategory.MEDICAL,
  'D79': DentalProcedureCategory.MEDICAL,

  // D8000-D8999: Orthodontics - MIXED (medical if functional, cosmetic if aesthetic-only)
  // Default to MEDICAL as most orthodontic work has functional benefits
  'D80': DentalProcedureCategory.MEDICAL,
  'D81': DentalProcedureCategory.MEDICAL,
  'D82': DentalProcedureCategory.MEDICAL,
  'D83': DentalProcedureCategory.MEDICAL,
  'D84': DentalProcedureCategory.MEDICAL,
  'D85': DentalProcedureCategory.MEDICAL,
  'D86': DentalProcedureCategory.MEDICAL,
  'D87': DentalProcedureCategory.MEDICAL,
  'D88': DentalProcedureCategory.MEDICAL,
  'D89': DentalProcedureCategory.MEDICAL,

  // D9000-D9999: Adjunctive General Services - MEDICAL
  'D90': DentalProcedureCategory.MEDICAL,
  'D91': DentalProcedureCategory.MEDICAL,
  'D92': DentalProcedureCategory.MEDICAL,
  'D93': DentalProcedureCategory.MEDICAL,
  'D94': DentalProcedureCategory.MEDICAL,
  'D95': DentalProcedureCategory.MEDICAL,
  'D96': DentalProcedureCategory.MEDICAL,
  'D97': DentalProcedureCategory.MEDICAL,
  'D98': DentalProcedureCategory.MEDICAL,
  'D99': DentalProcedureCategory.MEDICAL,
};

/**
 * Specific procedure codes that are ALWAYS cosmetic (VAT taxable)
 */
const COSMETIC_PROCEDURE_CODES = new Set([
  // Teeth whitening codes
  'D9972', // External bleaching - per arch
  'D9973', // External bleaching - per tooth
  'D9974', // Internal bleaching - per tooth
  'D9975', // External bleaching for home application, per arch
  // Veneers when purely cosmetic (context-dependent)
  // Note: Many veneer procedures (D2960-D2963) can be medical if restoring function
]);

/**
 * Specific procedure codes for laboratory services (reduced VAT)
 */
const LABORATORY_PROCEDURE_CODES = new Set([
  // Lab fees
  'D9110', // Palliative treatment
  // Note: Most lab work is included in prosthetic procedure codes
]);

/**
 * Healthcare VAT Service
 *
 * Determines VAT treatment for dental procedures according to Romanian tax law
 * and EU Directive 2006/112/EC Article 132.
 *
 * Key Romanian VAT rules for dental services:
 * - Medical/therapeutic dental services are VAT EXEMPT (Codul Fiscal Art. 292)
 * - Cosmetic/aesthetic procedures are subject to 19% VAT
 * - Laboratory services may qualify for 9% reduced rate
 * - Products sold separately are subject to 19% VAT
 *
 * EU Directive 2006/112/EC Article 132(1)(c):
 * "Medical care in the exercise of the medical and paramedical professions
 *  as defined by the Member State concerned" is exempt from VAT.
 *
 * Romania implements this for dental services that are therapeutic in nature.
 */
@Injectable()
export class HealthcareVatService {
  private readonly logger = new Logger(HealthcareVatService.name);

  /**
   * Default VAT treatment for dental procedures when no code is provided
   * Dental clinics primarily provide medical services, so default to exempt
   */
  private readonly defaultMedicalTreatment: VatTreatment = {
    taxRate: 0,
    taxCategoryCode: TAX_CATEGORY_CODES.EXEMPT,
    exemptionReasonCode: TAX_EXEMPTION_REASONS.EXEMPT_HEALTHCARE,
    exemptionReasonText:
      'Servicii medicale stomatologice scutite conform Art. 292 Cod Fiscal / ' +
      'Dental medical services exempt under Art. 292 Tax Code',
    isHealthcareExempt: true,
  };

  /**
   * Get VAT treatment for a dental procedure
   *
   * @param procedureCode - CDT procedure code (e.g., "D0120", "D2330")
   * @param itemType - Type of item (PROCEDURE, PRODUCT, etc.)
   * @param isCosmetic - Override flag for cosmetic procedures
   * @returns VAT treatment details including rate, category, and exemption info
   */
  getVatTreatment(
    procedureCode?: string,
    itemType?: string,
    isCosmetic?: boolean,
  ): VatTreatment {
    // Explicit cosmetic flag overrides everything
    if (isCosmetic === true) {
      return this.getCosmeticTreatment();
    }

    // Products sold separately are always taxable
    if (itemType === 'PRODUCT') {
      return this.getProductTreatment();
    }

    // If no procedure code, use default medical treatment
    if (!procedureCode) {
      this.logger.debug(
        'No procedure code provided, using default medical VAT treatment',
      );
      return this.defaultMedicalTreatment;
    }

    // Normalize procedure code
    const normalizedCode = this.normalizeProcedureCode(procedureCode);

    // Check if explicitly cosmetic procedure
    if (COSMETIC_PROCEDURE_CODES.has(normalizedCode)) {
      return this.getCosmeticTreatment();
    }

    // Check if laboratory service
    if (LABORATORY_PROCEDURE_CODES.has(normalizedCode)) {
      return this.getLaboratoryTreatment();
    }

    // Determine category from code prefix
    const category = this.getCategoryFromCode(normalizedCode);

    switch (category) {
      case DentalProcedureCategory.COSMETIC:
        return this.getCosmeticTreatment();
      case DentalProcedureCategory.LABORATORY:
        return this.getLaboratoryTreatment();
      case DentalProcedureCategory.PRODUCT:
        return this.getProductTreatment();
      case DentalProcedureCategory.MEDICAL:
      case DentalProcedureCategory.UNKNOWN:
      default:
        // Default to medical/exempt for dental services
        return this.defaultMedicalTreatment;
    }
  }

  /**
   * Batch process VAT treatment for multiple items
   *
   * @param items - Array of items with procedure codes
   * @returns Map of item ID to VAT treatment
   */
  batchGetVatTreatment(
    items: Array<{
      id: string;
      procedureCode?: string;
      itemType?: string;
      isCosmetic?: boolean;
    }>,
  ): Map<string, VatTreatment> {
    const results = new Map<string, VatTreatment>();

    for (const item of items) {
      results.set(
        item.id,
        this.getVatTreatment(item.procedureCode, item.itemType, item.isCosmetic),
      );
    }

    return results;
  }

  /**
   * Check if a procedure qualifies for healthcare VAT exemption
   *
   * @param procedureCode - CDT procedure code
   * @returns true if the procedure is VAT exempt
   */
  isHealthcareExempt(procedureCode?: string, itemType?: string): boolean {
    const treatment = this.getVatTreatment(procedureCode, itemType);
    return treatment.isHealthcareExempt;
  }

  /**
   * Get procedure category from CDT code
   *
   * @param procedureCode - Normalized CDT code
   * @returns Dental procedure category
   */
  private getCategoryFromCode(procedureCode: string): DentalProcedureCategory {
    // Get first 3 characters for category lookup (e.g., "D01" from "D0120")
    const prefix = procedureCode.substring(0, 3);

    if (CDT_CODE_CATEGORIES[prefix]) {
      return CDT_CODE_CATEGORIES[prefix];
    }

    // If no match, default to UNKNOWN (which defaults to MEDICAL)
    this.logger.debug(
      `Unknown procedure code prefix: ${prefix}, defaulting to MEDICAL`,
    );
    return DentalProcedureCategory.UNKNOWN;
  }

  /**
   * Normalize procedure code for comparison
   */
  private normalizeProcedureCode(code: string): string {
    // Remove spaces and convert to uppercase
    return code.trim().toUpperCase();
  }

  /**
   * Get VAT treatment for cosmetic procedures
   * Standard 19% VAT rate
   */
  private getCosmeticTreatment(): VatTreatment {
    return {
      taxRate: 0.19,
      taxCategoryCode: TAX_CATEGORY_CODES.STANDARD,
      isHealthcareExempt: false,
    };
  }

  /**
   * Get VAT treatment for laboratory services
   * Reduced 9% VAT rate in Romania
   */
  private getLaboratoryTreatment(): VatTreatment {
    return {
      taxRate: 0.09,
      taxCategoryCode: TAX_CATEGORY_CODES.STANDARD,
      isHealthcareExempt: false,
    };
  }

  /**
   * Get VAT treatment for products
   * Standard 19% VAT rate
   */
  private getProductTreatment(): VatTreatment {
    return {
      taxRate: 0.19,
      taxCategoryCode: TAX_CATEGORY_CODES.STANDARD,
      isHealthcareExempt: false,
    };
  }

  /**
   * Validate that an invoice's VAT treatment is consistent
   * Useful for audit and compliance checks
   *
   * @param items - Invoice line items with VAT info
   * @returns Validation result with any inconsistencies found
   */
  validateInvoiceVat(
    items: Array<{
      procedureCode?: string;
      itemType?: string;
      taxRate?: number;
      isCosmetic?: boolean;
    }>,
  ): {
    isValid: boolean;
    issues: string[];
    summary: {
      exemptCount: number;
      standardCount: number;
      reducedCount: number;
    };
  } {
    const issues: string[] = [];
    let exemptCount = 0;
    let standardCount = 0;
    let reducedCount = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const expectedTreatment = this.getVatTreatment(
        item.procedureCode,
        item.itemType,
        item.isCosmetic,
      );

      // Count by category
      if (expectedTreatment.taxRate === 0) {
        exemptCount++;
      } else if (expectedTreatment.taxRate === 0.09) {
        reducedCount++;
      } else {
        standardCount++;
      }

      // Check if actual rate matches expected
      if (
        item.taxRate !== undefined &&
        Math.abs(item.taxRate - expectedTreatment.taxRate) > 0.001
      ) {
        issues.push(
          `Line ${i + 1}: Expected VAT rate ${expectedTreatment.taxRate * 100}% for ${item.procedureCode || 'unknown procedure'}, but found ${item.taxRate * 100}%`,
        );
      }
    }

    return {
      isValid: issues.length === 0,
      issues,
      summary: {
        exemptCount,
        standardCount,
        reducedCount,
      },
    };
  }
}
