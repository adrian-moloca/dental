import { create } from 'xmlbuilder2';
import { XMLBuilder } from 'xmlbuilder2/lib/interfaces';

import {
  TAX_CATEGORY_CODES,
  PAYMENT_MEANS_CODES,
  DOCUMENT_TYPE_CODES,
  UNIT_OF_MEASURE_CODES,
  CURRENCY_CODES,
  COUNTRY_CODES,
  CIUS_RO_REQUIREMENTS,
  getTaxCategoryForRate,
  getPaymentMeansCode,
  TaxCategoryCode,
  PaymentMeansCode,
  DocumentTypeCode,
  UnitOfMeasureCode,
  CurrencyCode,
} from '../constants/ubl-codes.constant';

/**
 * UBL 2.1 Invoice Namespaces
 * Required for CIUS-RO compliant XML
 */
export const UBL_NAMESPACES = {
  INVOICE: 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2',
  CREDIT_NOTE: 'urn:oasis:names:specification:ubl:schema:xsd:CreditNote-2',
  CAC: 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2',
  CBC: 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2',
} as const;

/**
 * Address information for UBL
 */
export interface UblAddress {
  streetName: string;
  additionalStreetName?: string;
  cityName: string;
  postalZone?: string;
  countrySubentity?: string;
  countryCode: string;
}

/**
 * Contact information for UBL
 */
export interface UblContact {
  name?: string;
  telephone?: string;
  electronicMail?: string;
}

/**
 * Party information (seller/buyer) for UBL
 */
export interface UblParty {
  /** CUI/VAT ID with prefix (e.g., 'RO12345678') */
  partyIdentification?: string;
  /** Legal registration name */
  registrationName: string;
  /** Trade/commercial name */
  name?: string;
  /** Registration number (Reg. Com.) */
  companyId?: string;
  /** Address information */
  address: UblAddress;
  /** Contact information */
  contact?: UblContact;
  /** Tax scheme ID (usually 'VAT') */
  taxSchemeId?: string;
}

/**
 * Payment means information
 */
export interface UblPaymentMeans {
  /** Payment means code from UNCL4461 */
  paymentMeansCode: PaymentMeansCode;
  /** IBAN for bank transfers */
  payeeIban?: string;
  /** Bank name */
  financialInstitutionName?: string;
  /** Payment ID/reference */
  paymentId?: string;
}

/**
 * Allowance or Charge (discount/surcharge) at document level
 */
export interface UblAllowanceCharge {
  /** true = charge, false = allowance (discount) */
  chargeIndicator: boolean;
  /** Reason code */
  allowanceChargeReasonCode?: string;
  /** Reason text */
  allowanceChargeReason?: string;
  /** Amount */
  amount: number;
  /** Tax category for this allowance/charge */
  taxCategoryCode?: TaxCategoryCode;
  /** Tax rate */
  taxRate?: number;
}

/**
 * Tax subtotal for a specific tax category/rate
 */
export interface UblTaxSubtotal {
  /** Taxable amount */
  taxableAmount: number;
  /** Tax amount */
  taxAmount: number;
  /** Tax category code (S, E, Z, etc.) */
  taxCategoryCode: TaxCategoryCode;
  /** Tax rate as percentage (e.g., 19 for 19%) */
  taxPercent: number;
  /** Exemption reason code (required if exempt) */
  taxExemptionReasonCode?: string;
  /** Exemption reason text */
  taxExemptionReason?: string;
}

/**
 * Invoice line item
 */
export interface UblInvoiceLine {
  /** Line ID (1, 2, 3...) */
  id: string;
  /** Quantity */
  invoicedQuantity: number;
  /** Unit of measure code */
  unitCode: UnitOfMeasureCode;
  /** Line extension amount (quantity * price - discounts) */
  lineExtensionAmount: number;
  /** Item description */
  description: string;
  /** Item name */
  name: string;
  /** Seller's item identifier */
  sellersItemIdentification?: string;
  /** Standard item identifier (e.g., CPT code) */
  standardItemIdentification?: string;
  /** Price per unit */
  priceAmount: number;
  /** Base quantity for price (usually 1) */
  baseQuantity?: number;
  /** Tax category code */
  taxCategoryCode: TaxCategoryCode;
  /** Tax rate as percentage */
  taxPercent: number;
  /** Line level allowances/charges */
  allowanceCharges?: UblAllowanceCharge[];
  /** Additional item properties */
  itemProperties?: Array<{ name: string; value: string }>;
}

/**
 * Complete invoice data for UBL generation
 */
export interface UblInvoiceData {
  /** Invoice number */
  id: string;
  /** Issue date (YYYY-MM-DD) */
  issueDate: string;
  /** Due date (YYYY-MM-DD) */
  dueDate?: string;
  /** Invoice type code (380 = Commercial Invoice, 381 = Credit Note) */
  invoiceTypeCode: DocumentTypeCode;
  /** Document currency code */
  documentCurrencyCode: CurrencyCode;
  /** Tax currency code (if different from document currency) */
  taxCurrencyCode?: CurrencyCode;
  /** Buyer reference / order number */
  buyerReference?: string;
  /** Contract reference */
  contractReference?: string;
  /** Billing reference (for credit notes) */
  billingReference?: string;
  /** Invoice note/description */
  note?: string;
  /** Seller/supplier party */
  seller: UblParty;
  /** Buyer/customer party */
  buyer: UblParty;
  /** Payment means */
  paymentMeans?: UblPaymentMeans;
  /** Payment terms */
  paymentTerms?: string;
  /** Document level allowances/charges */
  allowanceCharges?: UblAllowanceCharge[];
  /** Tax subtotals by category */
  taxSubtotals: UblTaxSubtotal[];
  /** Invoice lines */
  lines: UblInvoiceLine[];
  /** Totals */
  totals: {
    lineExtensionAmount: number;
    taxExclusiveAmount: number;
    taxInclusiveAmount: number;
    allowanceTotalAmount?: number;
    chargeTotalAmount?: number;
    prepaidAmount?: number;
    payableAmount: number;
  };
}

/**
 * UBL 2.1 Invoice Builder
 *
 * Fluent builder for generating UBL 2.1 XML compliant with Romanian CIUS-RO specifications.
 * This builder creates invoices and credit notes that can be submitted to ANAF E-Factura.
 *
 * Usage:
 * ```typescript
 * const xml = new UblInvoiceBuilder()
 *   .setInvoiceNumber('INV-2025-001')
 *   .setIssueDate(new Date())
 *   .setSeller({ cui: 'RO12345678', name: 'Dental Clinic SRL', ... })
 *   .setBuyer({ cui: 'RO87654321', name: 'Patient Inc', ... })
 *   .addLine({ description: 'Dental cleaning', quantity: 1, price: 200, vatRate: 0.19 })
 *   .calculateTotals()
 *   .build();
 * ```
 *
 * @see https://docs.peppol.eu/poacc/billing/3.0/
 * @see https://mfinante.gov.ro/web/efactura
 */
export class UblInvoiceBuilder {
  private data: Partial<UblInvoiceData> = {
    invoiceTypeCode: DOCUMENT_TYPE_CODES.COMMERCIAL_INVOICE,
    documentCurrencyCode: CURRENCY_CODES.RON,
    lines: [],
    taxSubtotals: [],
    allowanceCharges: [],
  };

  private prettyPrint = false;

  /**
   * Set the invoice number/ID
   */
  setInvoiceNumber(id: string): this {
    this.data.id = id;
    return this;
  }

  /**
   * Set the issue date
   */
  setIssueDate(date: Date | string): this {
    this.data.issueDate = this.formatDate(date);
    return this;
  }

  /**
   * Set the due date
   */
  setDueDate(date: Date | string): this {
    this.data.dueDate = this.formatDate(date);
    return this;
  }

  /**
   * Set the invoice type code
   * @param code - Document type code (380 = Invoice, 381 = Credit Note, etc.)
   */
  setInvoiceTypeCode(code: DocumentTypeCode): this {
    this.data.invoiceTypeCode = code;
    return this;
  }

  /**
   * Set the document currency code
   * @param code - ISO 4217 currency code (RON, EUR, etc.)
   */
  setCurrency(code: CurrencyCode): this {
    this.data.documentCurrencyCode = code;
    return this;
  }

  /**
   * Set the buyer reference (order number, contract reference)
   */
  setBuyerReference(reference: string): this {
    this.data.buyerReference = reference;
    return this;
  }

  /**
   * Set the billing reference (for credit notes referencing an invoice)
   */
  setBillingReference(invoiceNumber: string): this {
    this.data.billingReference = invoiceNumber;
    return this;
  }

  /**
   * Set invoice note/description
   */
  setNote(note: string): this {
    this.data.note = note;
    return this;
  }

  /**
   * Set the seller/supplier party
   */
  setSeller(seller: UblParty): this {
    this.data.seller = seller;
    return this;
  }

  /**
   * Set seller from simplified parameters
   */
  setSellerSimple(params: {
    cui: string;
    name: string;
    regCom?: string;
    address: {
      street: string;
      city: string;
      postalCode?: string;
      county?: string;
      country?: string;
    };
    email?: string;
    phone?: string;
  }): this {
    const cuiPrefix = params.cui.startsWith('RO') ? params.cui : `RO${params.cui}`;

    this.data.seller = {
      partyIdentification: cuiPrefix,
      registrationName: params.name,
      companyId: params.regCom,
      address: {
        streetName: params.address.street,
        cityName: params.address.city,
        postalZone: params.address.postalCode,
        countrySubentity: params.address.county,
        countryCode: params.address.country || COUNTRY_CODES.ROMANIA,
      },
      contact: {
        electronicMail: params.email,
        telephone: params.phone,
      },
      taxSchemeId: CIUS_RO_REQUIREMENTS.TAX_SCHEME_ID,
    };
    return this;
  }

  /**
   * Set the buyer/customer party
   */
  setBuyer(buyer: UblParty): this {
    this.data.buyer = buyer;
    return this;
  }

  /**
   * Set buyer from simplified parameters
   */
  setBuyerSimple(params: {
    cui?: string;
    name: string;
    regCom?: string;
    address: {
      street: string;
      city: string;
      postalCode?: string;
      county?: string;
      country?: string;
    };
    email?: string;
    phone?: string;
  }): this {
    let partyId: string | undefined;
    if (params.cui) {
      partyId = params.cui.startsWith('RO') ? params.cui : `RO${params.cui}`;
    }

    this.data.buyer = {
      partyIdentification: partyId,
      registrationName: params.name,
      companyId: params.regCom,
      address: {
        streetName: params.address.street,
        cityName: params.address.city,
        postalZone: params.address.postalCode,
        countrySubentity: params.address.county,
        countryCode: params.address.country || COUNTRY_CODES.ROMANIA,
      },
      contact: {
        electronicMail: params.email,
        telephone: params.phone,
      },
      taxSchemeId: params.cui ? CIUS_RO_REQUIREMENTS.TAX_SCHEME_ID : undefined,
    };
    return this;
  }

  /**
   * Set payment means
   */
  setPaymentMeans(paymentMeans: UblPaymentMeans): this {
    this.data.paymentMeans = paymentMeans;
    return this;
  }

  /**
   * Set payment means from simplified parameters
   */
  setPaymentMeansSimple(params: {
    method: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'CHECK' | string;
    iban?: string;
    bankName?: string;
    paymentId?: string;
  }): this {
    this.data.paymentMeans = {
      paymentMeansCode: getPaymentMeansCode(params.method),
      payeeIban: params.iban,
      financialInstitutionName: params.bankName,
      paymentId: params.paymentId,
    };
    return this;
  }

  /**
   * Set payment terms
   */
  setPaymentTerms(terms: string): this {
    this.data.paymentTerms = terms;
    return this;
  }

  /**
   * Add a document-level allowance (discount)
   */
  addAllowance(params: {
    amount: number;
    reason?: string;
    reasonCode?: string;
    taxCategoryCode?: TaxCategoryCode;
    taxRate?: number;
  }): this {
    if (!this.data.allowanceCharges) {
      this.data.allowanceCharges = [];
    }
    this.data.allowanceCharges.push({
      chargeIndicator: false,
      amount: params.amount,
      allowanceChargeReason: params.reason,
      allowanceChargeReasonCode: params.reasonCode,
      taxCategoryCode: params.taxCategoryCode,
      taxRate: params.taxRate,
    });
    return this;
  }

  /**
   * Add a document-level charge
   */
  addCharge(params: {
    amount: number;
    reason?: string;
    reasonCode?: string;
    taxCategoryCode?: TaxCategoryCode;
    taxRate?: number;
  }): this {
    if (!this.data.allowanceCharges) {
      this.data.allowanceCharges = [];
    }
    this.data.allowanceCharges.push({
      chargeIndicator: true,
      amount: params.amount,
      allowanceChargeReason: params.reason,
      allowanceChargeReasonCode: params.reasonCode,
      taxCategoryCode: params.taxCategoryCode,
      taxRate: params.taxRate,
    });
    return this;
  }

  /**
   * Add an invoice line
   */
  addLine(line: UblInvoiceLine): this {
    if (!this.data.lines) {
      this.data.lines = [];
    }
    this.data.lines.push(line);
    return this;
  }

  /**
   * Add an invoice line from simplified parameters
   */
  addLineSimple(params: {
    description: string;
    name?: string;
    quantity: number;
    unitCode?: UnitOfMeasureCode;
    price: number;
    vatRate: number;
    itemCode?: string;
    discount?: number;
  }): this {
    if (!this.data.lines) {
      this.data.lines = [];
    }

    const lineId = String(this.data.lines.length + 1);
    const unitCode = params.unitCode || UNIT_OF_MEASURE_CODES.PIECE;
    const lineAmount = this.round(params.quantity * params.price - (params.discount || 0));
    const taxPercent = this.round(params.vatRate * 100);
    const taxCategoryCode = getTaxCategoryForRate(params.vatRate);

    const line: UblInvoiceLine = {
      id: lineId,
      invoicedQuantity: params.quantity,
      unitCode,
      lineExtensionAmount: lineAmount,
      description: params.description,
      name: params.name || params.description,
      sellersItemIdentification: params.itemCode,
      priceAmount: params.price,
      taxCategoryCode,
      taxPercent,
    };

    if (params.discount && params.discount > 0) {
      line.allowanceCharges = [
        {
          chargeIndicator: false,
          amount: params.discount,
          allowanceChargeReason: 'Discount',
        },
      ];
    }

    this.data.lines.push(line);
    return this;
  }

  /**
   * Calculate totals and tax subtotals from lines
   * Must be called before build() if lines were added individually
   */
  calculateTotals(): this {
    const lines = this.data.lines || [];
    const allowanceCharges = this.data.allowanceCharges || [];

    // Calculate line extension total
    const lineExtensionAmount = lines.reduce((sum, line) => sum + line.lineExtensionAmount, 0);

    // Calculate allowances and charges
    const allowanceTotalAmount = allowanceCharges
      .filter((ac) => !ac.chargeIndicator)
      .reduce((sum, ac) => sum + ac.amount, 0);

    const chargeTotalAmount = allowanceCharges
      .filter((ac) => ac.chargeIndicator)
      .reduce((sum, ac) => sum + ac.amount, 0);

    // Calculate tax subtotals by category
    const taxMap = new Map<string, UblTaxSubtotal>();

    for (const line of lines) {
      const key = `${line.taxCategoryCode}-${line.taxPercent}`;
      const existing = taxMap.get(key);

      if (existing) {
        existing.taxableAmount = this.round(existing.taxableAmount + line.lineExtensionAmount);
        existing.taxAmount = this.round(
          existing.taxAmount + (line.lineExtensionAmount * line.taxPercent) / 100,
        );
      } else {
        taxMap.set(key, {
          taxCategoryCode: line.taxCategoryCode,
          taxPercent: line.taxPercent,
          taxableAmount: line.lineExtensionAmount,
          taxAmount: this.round((line.lineExtensionAmount * line.taxPercent) / 100),
        });
      }
    }

    this.data.taxSubtotals = Array.from(taxMap.values());

    // Calculate totals
    const taxExclusiveAmount = this.round(
      lineExtensionAmount - allowanceTotalAmount + chargeTotalAmount,
    );
    const totalTaxAmount = this.data.taxSubtotals.reduce((sum, ts) => sum + ts.taxAmount, 0);
    const taxInclusiveAmount = this.round(taxExclusiveAmount + totalTaxAmount);

    this.data.totals = {
      lineExtensionAmount: this.round(lineExtensionAmount),
      allowanceTotalAmount: allowanceTotalAmount > 0 ? this.round(allowanceTotalAmount) : undefined,
      chargeTotalAmount: chargeTotalAmount > 0 ? this.round(chargeTotalAmount) : undefined,
      taxExclusiveAmount,
      taxInclusiveAmount,
      payableAmount: taxInclusiveAmount,
    };

    return this;
  }

  /**
   * Set totals directly (for pre-calculated invoices)
   */
  setTotals(totals: UblInvoiceData['totals']): this {
    this.data.totals = totals;
    return this;
  }

  /**
   * Set tax subtotals directly
   */
  setTaxSubtotals(subtotals: UblTaxSubtotal[]): this {
    this.data.taxSubtotals = subtotals;
    return this;
  }

  /**
   * Enable pretty printing (for debugging)
   */
  setPrettyPrint(enabled: boolean): this {
    this.prettyPrint = enabled;
    return this;
  }

  /**
   * Build the UBL 2.1 XML string
   * @throws Error if required fields are missing
   */
  build(): string {
    this.validate();

    const doc = create({ version: '1.0', encoding: 'UTF-8' }).ele(
      UBL_NAMESPACES.INVOICE,
      'Invoice',
    );

    // Add namespace declarations
    doc.att('xmlns:cac', UBL_NAMESPACES.CAC);
    doc.att('xmlns:cbc', UBL_NAMESPACES.CBC);

    // Build document
    this.buildHeader(doc);
    this.buildParties(doc);
    this.buildPaymentMeans(doc);
    this.buildAllowanceCharges(doc);
    this.buildTaxTotal(doc);
    this.buildLegalMonetaryTotal(doc);
    this.buildInvoiceLines(doc);

    return doc.end({ prettyPrint: this.prettyPrint });
  }

  /**
   * Build Credit Note XML
   * Sets the invoice type to Credit Note and builds with proper namespace
   */
  buildCreditNote(): string {
    this.data.invoiceTypeCode = DOCUMENT_TYPE_CODES.CREDIT_NOTE;
    this.validate();

    const doc = create({ version: '1.0', encoding: 'UTF-8' }).ele(
      UBL_NAMESPACES.CREDIT_NOTE,
      'CreditNote',
    );

    // Add namespace declarations
    doc.att('xmlns:cac', UBL_NAMESPACES.CAC);
    doc.att('xmlns:cbc', UBL_NAMESPACES.CBC);

    // Build document (same structure as invoice)
    this.buildHeader(doc, true);
    this.buildParties(doc);
    this.buildPaymentMeans(doc);
    this.buildAllowanceCharges(doc);
    this.buildTaxTotal(doc);
    this.buildLegalMonetaryTotal(doc);
    this.buildCreditNoteLines(doc);

    return doc.end({ prettyPrint: this.prettyPrint });
  }

  /**
   * Get the current invoice data (for inspection)
   */
  getData(): Partial<UblInvoiceData> {
    return { ...this.data };
  }

  /**
   * Reset the builder to initial state
   */
  reset(): this {
    this.data = {
      invoiceTypeCode: DOCUMENT_TYPE_CODES.COMMERCIAL_INVOICE,
      documentCurrencyCode: CURRENCY_CODES.RON,
      lines: [],
      taxSubtotals: [],
      allowanceCharges: [],
    };
    this.prettyPrint = false;
    return this;
  }

  // ============================================
  // Private helper methods
  // ============================================

  private validate(): void {
    const errors: string[] = [];

    if (!this.data.id) errors.push('Invoice number (id) is required');
    if (!this.data.issueDate) errors.push('Issue date is required');
    if (!this.data.seller) errors.push('Seller information is required');
    if (!this.data.buyer) errors.push('Buyer information is required');
    if (!this.data.lines || this.data.lines.length === 0)
      errors.push('At least one invoice line is required');
    if (!this.data.totals) errors.push('Totals must be calculated before building');
    if (!this.data.taxSubtotals || this.data.taxSubtotals.length === 0)
      errors.push('Tax subtotals are required');

    // Seller validation
    if (this.data.seller) {
      if (!this.data.seller.partyIdentification)
        errors.push('Seller CUI/VAT ID (partyIdentification) is required');
      if (!this.data.seller.registrationName) errors.push('Seller registration name is required');
      if (!this.data.seller.address?.streetName) errors.push('Seller street address is required');
      if (!this.data.seller.address?.cityName) errors.push('Seller city is required');
      if (!this.data.seller.address?.countryCode) errors.push('Seller country code is required');
    }

    // Buyer validation
    if (this.data.buyer) {
      if (!this.data.buyer.registrationName) errors.push('Buyer name is required');
      if (!this.data.buyer.address?.streetName) errors.push('Buyer street address is required');
      if (!this.data.buyer.address?.cityName) errors.push('Buyer city is required');
      if (!this.data.buyer.address?.countryCode) errors.push('Buyer country code is required');
    }

    if (errors.length > 0) {
      throw new Error(`UBL Invoice validation failed:\n- ${errors.join('\n- ')}`);
    }
  }

  private buildHeader(doc: XMLBuilder, isCreditNote = false): void {
    const data = this.data as UblInvoiceData;

    // CustomizationID - Required for CIUS-RO
    doc.ele('cbc:CustomizationID').txt(CIUS_RO_REQUIREMENTS.CUSTOMIZATION_ID);

    // ProfileID - Required
    doc.ele('cbc:ProfileID').txt(CIUS_RO_REQUIREMENTS.PROFILE_ID);

    // ID - Invoice/Credit Note number
    doc.ele('cbc:ID').txt(data.id);

    // IssueDate
    doc.ele('cbc:IssueDate').txt(data.issueDate);

    // DueDate (optional for invoice, not used in credit note)
    if (data.dueDate && !isCreditNote) {
      doc.ele('cbc:DueDate').txt(data.dueDate);
    }

    // InvoiceTypeCode / CreditNoteTypeCode
    if (isCreditNote) {
      doc.ele('cbc:CreditNoteTypeCode').txt(data.invoiceTypeCode);
    } else {
      doc.ele('cbc:InvoiceTypeCode').txt(data.invoiceTypeCode);
    }

    // Note (optional)
    if (data.note) {
      doc.ele('cbc:Note').txt(data.note);
    }

    // DocumentCurrencyCode
    doc.ele('cbc:DocumentCurrencyCode').txt(data.documentCurrencyCode);

    // TaxCurrencyCode (optional)
    if (data.taxCurrencyCode) {
      doc.ele('cbc:TaxCurrencyCode').txt(data.taxCurrencyCode);
    }

    // BuyerReference (optional)
    if (data.buyerReference) {
      doc.ele('cbc:BuyerReference').txt(data.buyerReference);
    }

    // BillingReference (for credit notes)
    if (data.billingReference) {
      const billingRef = doc.ele('cac:BillingReference');
      const invoiceDocRef = billingRef.ele('cac:InvoiceDocumentReference');
      invoiceDocRef.ele('cbc:ID').txt(data.billingReference);
    }

    // ContractDocumentReference (optional)
    if (data.contractReference) {
      const contractRef = doc.ele('cac:ContractDocumentReference');
      contractRef.ele('cbc:ID').txt(data.contractReference);
    }
  }

  private buildParties(doc: XMLBuilder): void {
    const data = this.data as UblInvoiceData;

    // AccountingSupplierParty (Seller)
    const supplierParty = doc.ele('cac:AccountingSupplierParty');
    this.buildParty(supplierParty.ele('cac:Party'), data.seller);

    // AccountingCustomerParty (Buyer)
    const customerParty = doc.ele('cac:AccountingCustomerParty');
    this.buildParty(customerParty.ele('cac:Party'), data.buyer);
  }

  private buildParty(partyEle: XMLBuilder, party: UblParty): void {
    // PartyIdentification (CUI/VAT ID)
    if (party.partyIdentification) {
      const partyId = partyEle.ele('cac:PartyIdentification');
      partyId.ele('cbc:ID').txt(party.partyIdentification);
    }

    // PartyName (trade name)
    if (party.name) {
      const partyName = partyEle.ele('cac:PartyName');
      partyName.ele('cbc:Name').txt(party.name);
    }

    // PostalAddress
    const postalAddr = partyEle.ele('cac:PostalAddress');
    postalAddr.ele('cbc:StreetName').txt(party.address.streetName);

    if (party.address.additionalStreetName) {
      postalAddr.ele('cbc:AdditionalStreetName').txt(party.address.additionalStreetName);
    }

    postalAddr.ele('cbc:CityName').txt(party.address.cityName);

    if (party.address.postalZone) {
      postalAddr.ele('cbc:PostalZone').txt(party.address.postalZone);
    }

    if (party.address.countrySubentity) {
      postalAddr.ele('cbc:CountrySubentity').txt(party.address.countrySubentity);
    }

    const country = postalAddr.ele('cac:Country');
    country.ele('cbc:IdentificationCode').txt(party.address.countryCode);

    // PartyTaxScheme (VAT registration)
    if (party.partyIdentification) {
      const taxScheme = partyEle.ele('cac:PartyTaxScheme');
      taxScheme.ele('cbc:CompanyID').txt(party.partyIdentification);
      const taxSchemeInner = taxScheme.ele('cac:TaxScheme');
      taxSchemeInner.ele('cbc:ID').txt(party.taxSchemeId || CIUS_RO_REQUIREMENTS.TAX_SCHEME_ID);
    }

    // PartyLegalEntity
    const legalEntity = partyEle.ele('cac:PartyLegalEntity');
    legalEntity.ele('cbc:RegistrationName').txt(party.registrationName);

    if (party.companyId) {
      legalEntity.ele('cbc:CompanyID').txt(party.companyId);
    }

    // Contact (optional)
    if (party.contact) {
      const contact = partyEle.ele('cac:Contact');

      if (party.contact.name) {
        contact.ele('cbc:Name').txt(party.contact.name);
      }

      if (party.contact.telephone) {
        contact.ele('cbc:Telephone').txt(party.contact.telephone);
      }

      if (party.contact.electronicMail) {
        contact.ele('cbc:ElectronicMail').txt(party.contact.electronicMail);
      }
    }
  }

  private buildPaymentMeans(doc: XMLBuilder): void {
    const data = this.data as UblInvoiceData;

    if (!data.paymentMeans) return;

    const paymentMeans = doc.ele('cac:PaymentMeans');
    paymentMeans.ele('cbc:PaymentMeansCode').txt(data.paymentMeans.paymentMeansCode);

    if (data.paymentMeans.paymentId) {
      paymentMeans.ele('cbc:PaymentID').txt(data.paymentMeans.paymentId);
    }

    // PayeeFinancialAccount
    if (data.paymentMeans.payeeIban) {
      const payeeAccount = paymentMeans.ele('cac:PayeeFinancialAccount');
      payeeAccount.ele('cbc:ID').txt(data.paymentMeans.payeeIban);

      if (data.paymentMeans.financialInstitutionName) {
        const branch = payeeAccount.ele('cac:FinancialInstitutionBranch');
        branch.ele('cbc:Name').txt(data.paymentMeans.financialInstitutionName);
      }
    }

    // PaymentTerms
    if (data.paymentTerms) {
      const paymentTerms = doc.ele('cac:PaymentTerms');
      paymentTerms.ele('cbc:Note').txt(data.paymentTerms);
    }
  }

  private buildAllowanceCharges(doc: XMLBuilder): void {
    const data = this.data as UblInvoiceData;

    if (!data.allowanceCharges) return;

    for (const ac of data.allowanceCharges) {
      const allowanceCharge = doc.ele('cac:AllowanceCharge');

      allowanceCharge.ele('cbc:ChargeIndicator').txt(ac.chargeIndicator ? 'true' : 'false');

      if (ac.allowanceChargeReasonCode) {
        allowanceCharge.ele('cbc:AllowanceChargeReasonCode').txt(ac.allowanceChargeReasonCode);
      }

      if (ac.allowanceChargeReason) {
        allowanceCharge.ele('cbc:AllowanceChargeReason').txt(ac.allowanceChargeReason);
      }

      allowanceCharge
        .ele('cbc:Amount')
        .att('currencyID', data.documentCurrencyCode)
        .txt(this.formatAmount(ac.amount));

      // Tax category for allowance/charge
      if (ac.taxCategoryCode) {
        const taxCategory = allowanceCharge.ele('cac:TaxCategory');
        taxCategory.ele('cbc:ID').txt(ac.taxCategoryCode);

        if (ac.taxRate !== undefined) {
          taxCategory.ele('cbc:Percent').txt(String(ac.taxRate));
        }

        const taxScheme = taxCategory.ele('cac:TaxScheme');
        taxScheme.ele('cbc:ID').txt(CIUS_RO_REQUIREMENTS.TAX_SCHEME_ID);
      }
    }
  }

  private buildTaxTotal(doc: XMLBuilder): void {
    const data = this.data as UblInvoiceData;

    const taxTotal = doc.ele('cac:TaxTotal');

    const totalTaxAmount = data.taxSubtotals.reduce((sum, ts) => sum + ts.taxAmount, 0);
    taxTotal
      .ele('cbc:TaxAmount')
      .att('currencyID', data.documentCurrencyCode)
      .txt(this.formatAmount(totalTaxAmount));

    for (const subtotal of data.taxSubtotals) {
      const taxSubtotal = taxTotal.ele('cac:TaxSubtotal');

      taxSubtotal
        .ele('cbc:TaxableAmount')
        .att('currencyID', data.documentCurrencyCode)
        .txt(this.formatAmount(subtotal.taxableAmount));

      taxSubtotal
        .ele('cbc:TaxAmount')
        .att('currencyID', data.documentCurrencyCode)
        .txt(this.formatAmount(subtotal.taxAmount));

      const taxCategory = taxSubtotal.ele('cac:TaxCategory');
      taxCategory.ele('cbc:ID').txt(subtotal.taxCategoryCode);
      taxCategory.ele('cbc:Percent').txt(String(subtotal.taxPercent));

      if (subtotal.taxExemptionReasonCode) {
        taxCategory.ele('cbc:TaxExemptionReasonCode').txt(subtotal.taxExemptionReasonCode);
      }

      if (subtotal.taxExemptionReason) {
        taxCategory.ele('cbc:TaxExemptionReason').txt(subtotal.taxExemptionReason);
      }

      const taxScheme = taxCategory.ele('cac:TaxScheme');
      taxScheme.ele('cbc:ID').txt(CIUS_RO_REQUIREMENTS.TAX_SCHEME_ID);
    }
  }

  private buildLegalMonetaryTotal(doc: XMLBuilder): void {
    const data = this.data as UblInvoiceData;
    const totals = data.totals;

    const lmt = doc.ele('cac:LegalMonetaryTotal');

    lmt
      .ele('cbc:LineExtensionAmount')
      .att('currencyID', data.documentCurrencyCode)
      .txt(this.formatAmount(totals.lineExtensionAmount));

    lmt
      .ele('cbc:TaxExclusiveAmount')
      .att('currencyID', data.documentCurrencyCode)
      .txt(this.formatAmount(totals.taxExclusiveAmount));

    lmt
      .ele('cbc:TaxInclusiveAmount')
      .att('currencyID', data.documentCurrencyCode)
      .txt(this.formatAmount(totals.taxInclusiveAmount));

    if (totals.allowanceTotalAmount !== undefined && totals.allowanceTotalAmount > 0) {
      lmt
        .ele('cbc:AllowanceTotalAmount')
        .att('currencyID', data.documentCurrencyCode)
        .txt(this.formatAmount(totals.allowanceTotalAmount));
    }

    if (totals.chargeTotalAmount !== undefined && totals.chargeTotalAmount > 0) {
      lmt
        .ele('cbc:ChargeTotalAmount')
        .att('currencyID', data.documentCurrencyCode)
        .txt(this.formatAmount(totals.chargeTotalAmount));
    }

    if (totals.prepaidAmount !== undefined && totals.prepaidAmount > 0) {
      lmt
        .ele('cbc:PrepaidAmount')
        .att('currencyID', data.documentCurrencyCode)
        .txt(this.formatAmount(totals.prepaidAmount));
    }

    lmt
      .ele('cbc:PayableAmount')
      .att('currencyID', data.documentCurrencyCode)
      .txt(this.formatAmount(totals.payableAmount));
  }

  private buildInvoiceLines(doc: XMLBuilder): void {
    const data = this.data as UblInvoiceData;

    for (const line of data.lines) {
      const invoiceLine = doc.ele('cac:InvoiceLine');

      invoiceLine.ele('cbc:ID').txt(line.id);

      invoiceLine
        .ele('cbc:InvoicedQuantity')
        .att('unitCode', line.unitCode)
        .txt(String(line.invoicedQuantity));

      invoiceLine
        .ele('cbc:LineExtensionAmount')
        .att('currencyID', data.documentCurrencyCode)
        .txt(this.formatAmount(line.lineExtensionAmount));

      // Line level allowances/charges
      if (line.allowanceCharges) {
        for (const ac of line.allowanceCharges) {
          const allowanceCharge = invoiceLine.ele('cac:AllowanceCharge');

          allowanceCharge.ele('cbc:ChargeIndicator').txt(ac.chargeIndicator ? 'true' : 'false');

          if (ac.allowanceChargeReason) {
            allowanceCharge.ele('cbc:AllowanceChargeReason').txt(ac.allowanceChargeReason);
          }

          allowanceCharge
            .ele('cbc:Amount')
            .att('currencyID', data.documentCurrencyCode)
            .txt(this.formatAmount(ac.amount));
        }
      }

      // Item
      const item = invoiceLine.ele('cac:Item');

      if (line.description) {
        item.ele('cbc:Description').txt(line.description);
      }

      item.ele('cbc:Name').txt(line.name);

      // Seller's Item Identification
      if (line.sellersItemIdentification) {
        const sellerId = item.ele('cac:SellersItemIdentification');
        sellerId.ele('cbc:ID').txt(line.sellersItemIdentification);
      }

      // Standard Item Identification (e.g., CPT code)
      if (line.standardItemIdentification) {
        const stdId = item.ele('cac:StandardItemIdentification');
        stdId.ele('cbc:ID').att('schemeID', '0160').txt(line.standardItemIdentification);
      }

      // Classified Tax Category
      const taxCategory = item.ele('cac:ClassifiedTaxCategory');
      taxCategory.ele('cbc:ID').txt(line.taxCategoryCode);
      taxCategory.ele('cbc:Percent').txt(String(line.taxPercent));

      const taxScheme = taxCategory.ele('cac:TaxScheme');
      taxScheme.ele('cbc:ID').txt(CIUS_RO_REQUIREMENTS.TAX_SCHEME_ID);

      // Additional Item Properties
      if (line.itemProperties) {
        for (const prop of line.itemProperties) {
          const itemProp = item.ele('cac:AdditionalItemProperty');
          itemProp.ele('cbc:Name').txt(prop.name);
          itemProp.ele('cbc:Value').txt(prop.value);
        }
      }

      // Price
      const price = invoiceLine.ele('cac:Price');
      price
        .ele('cbc:PriceAmount')
        .att('currencyID', data.documentCurrencyCode)
        .txt(this.formatAmount(line.priceAmount));

      if (line.baseQuantity && line.baseQuantity !== 1) {
        price.ele('cbc:BaseQuantity').att('unitCode', line.unitCode).txt(String(line.baseQuantity));
      }
    }
  }

  private buildCreditNoteLines(doc: XMLBuilder): void {
    const data = this.data as UblInvoiceData;

    for (const line of data.lines) {
      const creditNoteLine = doc.ele('cac:CreditNoteLine');

      creditNoteLine.ele('cbc:ID').txt(line.id);

      creditNoteLine
        .ele('cbc:CreditedQuantity')
        .att('unitCode', line.unitCode)
        .txt(String(line.invoicedQuantity));

      creditNoteLine
        .ele('cbc:LineExtensionAmount')
        .att('currencyID', data.documentCurrencyCode)
        .txt(this.formatAmount(line.lineExtensionAmount));

      // Item (same structure as invoice)
      const item = creditNoteLine.ele('cac:Item');

      if (line.description) {
        item.ele('cbc:Description').txt(line.description);
      }

      item.ele('cbc:Name').txt(line.name);

      const taxCategory = item.ele('cac:ClassifiedTaxCategory');
      taxCategory.ele('cbc:ID').txt(line.taxCategoryCode);
      taxCategory.ele('cbc:Percent').txt(String(line.taxPercent));

      const taxScheme = taxCategory.ele('cac:TaxScheme');
      taxScheme.ele('cbc:ID').txt(CIUS_RO_REQUIREMENTS.TAX_SCHEME_ID);

      // Price
      const price = creditNoteLine.ele('cac:Price');
      price
        .ele('cbc:PriceAmount')
        .att('currencyID', data.documentCurrencyCode)
        .txt(this.formatAmount(line.priceAmount));
    }
  }

  private formatDate(date: Date | string): string {
    if (typeof date === 'string') {
      // Assume it's already in YYYY-MM-DD format
      return date.substring(0, 10);
    }
    return date.toISOString().substring(0, 10);
  }

  private formatAmount(amount: number): string {
    return this.round(amount).toFixed(2);
  }

  private round(value: number, decimals = 2): number {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }
}

/**
 * Factory function for creating a new UBL Invoice Builder
 */
export function createUblInvoiceBuilder(): UblInvoiceBuilder {
  return new UblInvoiceBuilder();
}

/**
 * Re-export code constants for convenience
 */
export {
  TAX_CATEGORY_CODES,
  PAYMENT_MEANS_CODES,
  DOCUMENT_TYPE_CODES,
  UNIT_OF_MEASURE_CODES,
  CURRENCY_CODES,
  COUNTRY_CODES,
  getTaxCategoryForRate,
  getPaymentMeansCode,
};
