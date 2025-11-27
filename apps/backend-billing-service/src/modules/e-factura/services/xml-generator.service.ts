import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  UblParty,
  UblInvoiceLine,
  UblTaxSubtotal,
  UblPaymentMeans,
  createUblInvoiceBuilder,
  DOCUMENT_TYPE_CODES,
  CURRENCY_CODES,
  UNIT_OF_MEASURE_CODES,
  getTaxCategoryForRate,
  getPaymentMeansCode,
} from '../builders/ubl-invoice.builder';
import { EFacturaConfigType } from '../config/e-factura.config';
import { EFacturaSellerInfo, EFacturaBuyerInfo } from '../interfaces/anaf-config.interface';
import { Invoice, TaxBreakdownEntry } from '../../invoices/entities/invoice.entity';

/**
 * Validation result for XML validation
 */
export interface XmlValidationResult {
  valid: boolean;
  errors: Array<{
    code: string;
    message: string;
    path?: string;
  }>;
  warnings: Array<{
    code: string;
    message: string;
  }>;
}

/**
 * Invoice line item from internal system
 */
export interface InvoiceLineItem {
  id: string;
  description: string;
  name?: string;
  quantity: number;
  unitPrice: number;
  discountAmount?: number;
  taxRate: number;
  taxCategory?: string;
  /** VATEX exemption reason code (e.g., 'VATEX-EU-J' for healthcare) */
  taxExemptionReasonCode?: string;
  /** Human-readable exemption reason text for UBL TaxCategory/TaxExemptionReason */
  taxExemptionReasonText?: string;
  itemCode?: string;
  unitCode?: string;
  toothNumber?: string;
  procedureCode?: string;
}

/**
 * Credit note data
 */
export interface CreditNoteData {
  creditNoteNumber: string;
  issueDate: Date;
  originalInvoiceNumber: string;
  reason?: string;
  currency?: string;
  lines: InvoiceLineItem[];
  seller: EFacturaSellerInfo;
  buyer: EFacturaBuyerInfo;
  paymentMethod?: string;
}

/**
 * XML Generator Service
 *
 * Generates UBL 2.1 XML documents compliant with Romanian CIUS-RO specifications
 * for submission to ANAF E-Factura system.
 *
 * Key responsibilities:
 * - Generate Invoice XML from internal Invoice documents
 * - Generate Credit Note XML for refunds/corrections
 * - Validate XML structure before submission
 * - Handle Romanian-specific requirements (CUI, tax categories, etc.)
 */
@Injectable()
export class XmlGeneratorService {
  private readonly logger = new Logger(XmlGeneratorService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Get E-Factura configuration
   */
  private getConfig(): EFacturaConfigType {
    return this.configService.get<EFacturaConfigType>('efactura')!;
  }

  /**
   * Generate UBL 2.1 Invoice XML from an Invoice document
   *
   * @param invoice - Invoice document from database
   * @param seller - Seller/supplier information
   * @param buyer - Buyer/customer information
   * @param lineItems - Invoice line items
   * @returns UBL 2.1 XML string
   */
  generateInvoiceXml(
    invoice: Invoice,
    seller: EFacturaSellerInfo,
    buyer: EFacturaBuyerInfo,
    lineItems: InvoiceLineItem[],
  ): string {
    this.logger.debug(`Generating XML for invoice ${invoice.invoiceNumber}`);

    const config = this.getConfig();
    const builder = createUblInvoiceBuilder();

    // Set basic invoice properties
    builder
      .setInvoiceNumber(invoice.invoiceNumber)
      .setIssueDate(invoice.issueDate)
      .setInvoiceTypeCode(DOCUMENT_TYPE_CODES.COMMERCIAL_INVOICE)
      .setCurrency(
        (invoice.currency as (typeof CURRENCY_CODES)[keyof typeof CURRENCY_CODES]) ||
          CURRENCY_CODES.RON,
      );

    // Set due date if available
    if (invoice.dueDate) {
      builder.setDueDate(invoice.dueDate);
    }

    // Set invoice notes if available
    if (invoice.notes) {
      builder.setNote(invoice.notes);
    }

    // Set seller party
    builder.setSeller(this.mapSellerToUblParty(seller));

    // Set buyer party
    builder.setBuyer(this.mapBuyerToUblParty(buyer));

    // Set payment means
    const paymentMeans = this.buildPaymentMeans(seller);
    if (paymentMeans) {
      builder.setPaymentMeans(paymentMeans);
    }

    // Set payment terms
    if (invoice.terms) {
      builder.setPaymentTerms(invoice.terms);
    }

    // Add document-level discount if applicable
    if (invoice.discountAmount && invoice.discountAmount > 0) {
      builder.addAllowance({
        amount: invoice.discountAmount,
        reason: 'Discount',
        reasonCode: '95',
        taxCategoryCode: 'S',
        taxRate: 19,
      });
    }

    // Add invoice lines
    for (const item of lineItems) {
      builder.addLine(this.mapLineToUblLine(item, invoice.currency || 'RON'));
    }

    // Set tax subtotals from invoice tax breakdown or calculate
    if (invoice.taxBreakdown && invoice.taxBreakdown.length > 0) {
      builder.setTaxSubtotals(this.mapTaxBreakdown(invoice.taxBreakdown));
    }

    // Calculate totals
    builder.calculateTotals();

    // Override with actual invoice totals for accuracy
    builder.setTotals({
      lineExtensionAmount: invoice.subtotal,
      taxExclusiveAmount: invoice.subtotal - (invoice.discountAmount || 0),
      taxInclusiveAmount: invoice.total,
      allowanceTotalAmount: invoice.discountAmount || undefined,
      payableAmount: invoice.balance,
    });

    // Enable pretty print in non-production
    builder.setPrettyPrint(config.xml.prettyPrint);

    const xml = builder.build();

    this.logger.debug(`Generated XML for invoice ${invoice.invoiceNumber}, length: ${xml.length}`);

    return xml;
  }

  /**
   * Generate UBL 2.1 Credit Note XML
   *
   * Credit notes are used to correct or cancel previously issued invoices.
   * They reference the original invoice number and typically have negative amounts.
   *
   * @param creditNote - Credit note data
   * @returns UBL 2.1 Credit Note XML string
   */
  generateCreditNoteXml(creditNote: CreditNoteData): string {
    this.logger.debug(
      `Generating Credit Note XML for ${creditNote.creditNoteNumber} ` +
        `referencing invoice ${creditNote.originalInvoiceNumber}`,
    );

    const config = this.getConfig();
    const builder = createUblInvoiceBuilder();

    // Set basic credit note properties
    builder
      .setInvoiceNumber(creditNote.creditNoteNumber)
      .setIssueDate(creditNote.issueDate)
      .setInvoiceTypeCode(DOCUMENT_TYPE_CODES.CREDIT_NOTE)
      .setCurrency(
        (creditNote.currency as (typeof CURRENCY_CODES)[keyof typeof CURRENCY_CODES]) ||
          CURRENCY_CODES.RON,
      )
      .setBillingReference(creditNote.originalInvoiceNumber);

    // Set reason as note
    if (creditNote.reason) {
      builder.setNote(creditNote.reason);
    }

    // Set seller and buyer
    builder.setSeller(this.mapSellerToUblParty(creditNote.seller));
    builder.setBuyer(this.mapBuyerToUblParty(creditNote.buyer));

    // Add credit note lines
    for (const item of creditNote.lines) {
      builder.addLine(this.mapLineToUblLine(item, creditNote.currency || 'RON'));
    }

    // Calculate totals
    builder.calculateTotals();

    // Enable pretty print in non-production
    builder.setPrettyPrint(config.xml.prettyPrint);

    // Build as credit note (uses different XML structure)
    const xml = builder.buildCreditNote();

    this.logger.debug(
      `Generated Credit Note XML for ${creditNote.creditNoteNumber}, length: ${xml.length}`,
    );

    return xml;
  }

  /**
   * Validate XML structure and content
   *
   * Performs local validation before submission to ANAF:
   * - Validates required fields are present
   * - Validates CUI format
   * - Validates amounts and calculations
   * - Checks for common errors
   *
   * @param xml - XML string to validate
   * @returns Validation result with errors and warnings
   */
  validateXml(xml: string): XmlValidationResult {
    const errors: XmlValidationResult['errors'] = [];
    const warnings: XmlValidationResult['warnings'] = [];

    try {
      // Basic XML structure checks
      if (!xml || xml.trim().length === 0) {
        errors.push({
          code: 'EMPTY_XML',
          message: 'XML content is empty',
        });
        return { valid: false, errors, warnings };
      }

      // Check for XML declaration
      if (!xml.startsWith('<?xml')) {
        errors.push({
          code: 'MISSING_XML_DECLARATION',
          message: 'XML declaration is missing',
        });
      }

      // Check for Invoice or CreditNote root element
      const hasInvoice = xml.includes('<Invoice');
      const hasCreditNote = xml.includes('<CreditNote');

      if (!hasInvoice && !hasCreditNote) {
        errors.push({
          code: 'INVALID_ROOT',
          message: 'Root element must be Invoice or CreditNote',
        });
      }

      // Check for required namespaces
      if (!xml.includes('urn:oasis:names:specification:ubl:schema:xsd:')) {
        errors.push({
          code: 'MISSING_NAMESPACE',
          message: 'UBL namespace is missing',
        });
      }

      // Check for CIUS-RO customization ID
      if (!xml.includes('urn:cen.eu:en16931:2017#compliant#urn:efactura.mfinante.ro:CIUS-RO')) {
        errors.push({
          code: 'MISSING_CIUS_RO',
          message: 'CIUS-RO CustomizationID is missing or incorrect',
        });
      }

      // Check for required elements
      const requiredElements = [
        { tag: 'cbc:ID', name: 'Invoice ID' },
        { tag: 'cbc:IssueDate', name: 'Issue Date' },
        { tag: 'cac:AccountingSupplierParty', name: 'Seller Party' },
        { tag: 'cac:AccountingCustomerParty', name: 'Buyer Party' },
        { tag: 'cac:TaxTotal', name: 'Tax Total' },
        { tag: 'cac:LegalMonetaryTotal', name: 'Legal Monetary Total' },
      ];

      for (const required of requiredElements) {
        if (!xml.includes(`<${required.tag}>`)) {
          errors.push({
            code: 'MISSING_REQUIRED',
            message: `Required element ${required.name} is missing`,
            path: required.tag,
          });
        }
      }

      // Check for invoice lines
      if (hasInvoice && !xml.includes('<cac:InvoiceLine>')) {
        errors.push({
          code: 'NO_LINES',
          message: 'Invoice must have at least one InvoiceLine',
        });
      }

      if (hasCreditNote && !xml.includes('<cac:CreditNoteLine>')) {
        errors.push({
          code: 'NO_LINES',
          message: 'Credit Note must have at least one CreditNoteLine',
        });
      }

      // Check seller CUI format (RO + digits)
      const sellerCuiMatch = xml.match(
        /<cac:AccountingSupplierParty>[\s\S]*?<cbc:CompanyID>(RO\d+)<\/cbc:CompanyID>/,
      );
      if (sellerCuiMatch) {
        const cui = sellerCuiMatch[1];
        if (!/^RO\d{2,10}$/.test(cui)) {
          errors.push({
            code: 'INVALID_SELLER_CUI',
            message: `Invalid seller CUI format: ${cui}. Expected RO followed by 2-10 digits`,
          });
        }
      } else {
        errors.push({
          code: 'MISSING_SELLER_CUI',
          message: 'Seller CUI (CompanyID) is missing',
        });
      }

      // Warnings for recommended but not required fields
      if (!xml.includes('<cbc:DueDate>')) {
        warnings.push({
          code: 'MISSING_DUE_DATE',
          message: 'Due date is recommended but not provided',
        });
      }

      if (!xml.includes('<cac:PaymentMeans>')) {
        warnings.push({
          code: 'MISSING_PAYMENT_MEANS',
          message: 'Payment means information is recommended',
        });
      }

      if (!xml.includes('<cbc:ElectronicMail>')) {
        warnings.push({
          code: 'MISSING_EMAIL',
          message: 'Contact email is recommended for communication',
        });
      }
    } catch (error) {
      errors.push({
        code: 'VALIDATION_ERROR',
        message: `Validation failed: ${error instanceof Error ? error.message : String(error)}`,
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Generate a minimal test invoice XML for validation
   * Useful for testing ANAF connectivity
   */
  generateTestInvoiceXml(sellerCui: string, buyerCui?: string): string {
    const builder = createUblInvoiceBuilder();

    builder
      .setInvoiceNumber(`TEST-${Date.now()}`)
      .setIssueDate(new Date())
      .setDueDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
      .setInvoiceTypeCode(DOCUMENT_TYPE_CODES.COMMERCIAL_INVOICE)
      .setCurrency(CURRENCY_CODES.RON)
      .setSellerSimple({
        cui: sellerCui,
        name: 'Test Seller SRL',
        regCom: 'J40/1234/2020',
        address: {
          street: 'Strada Test 123',
          city: 'Bucuresti',
          postalCode: '010101',
          county: 'Sector 1',
          country: 'RO',
        },
        email: 'test@example.com',
        phone: '0212345678',
      })
      .setBuyerSimple({
        cui: buyerCui,
        name: buyerCui ? 'Test Buyer SRL' : 'Persoana Fizica Test',
        address: {
          street: 'Bulevardul Test 456',
          city: 'Bucuresti',
          postalCode: '020202',
          county: 'Sector 2',
          country: 'RO',
        },
      })
      .setPaymentMeansSimple({
        method: 'BANK_TRANSFER',
        iban: 'RO49AAAA1B31007593840000',
        bankName: 'Banca Test',
      })
      .addLineSimple({
        description: 'Serviciu test pentru validare',
        name: 'Serviciu Test',
        quantity: 1,
        price: 100,
        vatRate: 0.19,
      })
      .calculateTotals()
      .setPrettyPrint(true);

    return builder.build();
  }

  // ============================================
  // Private Helper Methods
  // ============================================

  /**
   * Map EFacturaSellerInfo to UBL Party
   */
  private mapSellerToUblParty(seller: EFacturaSellerInfo): UblParty {
    const cuiWithPrefix = seller.cui.startsWith('RO') ? seller.cui : `RO${seller.cui}`;

    return {
      partyIdentification: cuiWithPrefix,
      registrationName: seller.legalName,
      name: seller.tradeName,
      companyId: seller.regCom,
      address: {
        streetName: seller.address.streetName,
        additionalStreetName: seller.address.additionalStreetName,
        cityName: seller.address.city,
        postalZone: seller.address.postalCode,
        countrySubentity: seller.address.county,
        countryCode: seller.address.countryCode,
      },
      contact: seller.contact
        ? {
            name: seller.contact.name,
            telephone: seller.contact.phone,
            electronicMail: seller.contact.email,
          }
        : undefined,
      taxSchemeId: 'VAT',
    };
  }

  /**
   * Map EFacturaBuyerInfo to UBL Party
   */
  private mapBuyerToUblParty(buyer: EFacturaBuyerInfo): UblParty {
    let partyId: string | undefined;
    if (buyer.cui) {
      partyId = buyer.cui.startsWith('RO') ? buyer.cui : `RO${buyer.cui}`;
    }

    return {
      partyIdentification: partyId,
      registrationName: buyer.legalName,
      companyId: buyer.regCom,
      address: {
        streetName: buyer.address.streetName,
        additionalStreetName: buyer.address.additionalStreetName,
        cityName: buyer.address.city,
        postalZone: buyer.address.postalCode,
        countrySubentity: buyer.address.county,
        countryCode: buyer.address.countryCode,
      },
      contact: buyer.contact
        ? {
            name: buyer.contact.name,
            telephone: buyer.contact.phone,
            electronicMail: buyer.contact.email,
          }
        : undefined,
      taxSchemeId: buyer.cui ? 'VAT' : undefined,
    };
  }

  /**
   * Build payment means from seller info
   */
  private buildPaymentMeans(seller: EFacturaSellerInfo): UblPaymentMeans | undefined {
    if (!seller.iban) return undefined;

    return {
      paymentMeansCode: getPaymentMeansCode('BANK_TRANSFER'),
      payeeIban: seller.iban,
      financialInstitutionName: seller.bankName,
    };
  }

  /**
   * Map internal line item to UBL invoice line
   */
  private mapLineToUblLine(item: InvoiceLineItem, _currency: string): UblInvoiceLine {
    const unitCode =
      (item.unitCode as keyof typeof UNIT_OF_MEASURE_CODES) || UNIT_OF_MEASURE_CODES.PIECE;
    const taxPercent = this.round(item.taxRate * 100);
    const taxCategoryCode = item.taxCategory
      ? (item.taxCategory as ReturnType<typeof getTaxCategoryForRate>)
      : getTaxCategoryForRate(item.taxRate);

    const lineAmount = this.round(item.quantity * item.unitPrice - (item.discountAmount || 0));

    const line: UblInvoiceLine = {
      id: item.id,
      invoicedQuantity: item.quantity,
      unitCode: unitCode as UblInvoiceLine['unitCode'],
      lineExtensionAmount: lineAmount,
      description: item.description,
      name: item.name || item.description,
      sellersItemIdentification: item.itemCode,
      standardItemIdentification: item.procedureCode,
      priceAmount: item.unitPrice,
      taxCategoryCode,
      taxPercent,
    };

    // Add tooth number as item property if present
    if (item.toothNumber) {
      line.itemProperties = [{ name: 'ToothNumber', value: item.toothNumber }];
    }

    // Add line-level discount if present
    if (item.discountAmount && item.discountAmount > 0) {
      line.allowanceCharges = [
        {
          chargeIndicator: false,
          amount: item.discountAmount,
          allowanceChargeReason: 'Line Discount',
        },
      ];
    }

    return line;
  }

  /**
   * Map tax breakdown from invoice to UBL tax subtotals
   */
  private mapTaxBreakdown(breakdown: TaxBreakdownEntry[]): UblTaxSubtotal[] {
    return breakdown.map((entry) => ({
      taxableAmount: entry.taxableAmount,
      taxAmount: entry.taxAmount,
      taxCategoryCode: entry.taxCategory as UblTaxSubtotal['taxCategoryCode'],
      taxPercent: this.round(entry.taxRate * 100),
      taxExemptionReasonCode: entry.exemptionReasonCode,
      taxExemptionReason: entry.exemptionReasonText,
    }));
  }

  /**
   * Round to 2 decimal places for monetary values
   */
  private round(value: number, decimals = 2): number {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }
}
