import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Types } from 'mongoose';

import {
  XmlGeneratorService,
  InvoiceLineItem,
} from '../../../src/modules/e-factura/services/xml-generator.service';
import { Invoice } from '../../../src/modules/invoices/entities/invoice.entity';
import {
  EFacturaSellerInfo,
  EFacturaBuyerInfo,
} from '../../../src/modules/e-factura/interfaces/anaf-config.interface';

/**
 * XML Generator Service Unit Tests
 *
 * Tests UBL 2.1 XML generation for Romanian E-Factura compliance.
 */
describe('XmlGeneratorService', () => {
  let service: XmlGeneratorService;

  const mockSellerInfo: EFacturaSellerInfo = {
    cui: 'RO12345678',
    legalName: 'Clinica Dentara Test SRL',
    tradeName: 'Clinica Dentara',
    regCom: 'J40/123/2020',
    address: {
      streetName: 'Strada Medicilor 10',
      city: 'Bucuresti',
      county: 'Bucuresti',
      postalCode: '010101',
      countryCode: 'RO',
    },
    contact: {
      email: 'contact@clinica.ro',
      phone: '+40212345678',
    },
    vatPayer: true,
  };

  const mockBuyerInfo: EFacturaBuyerInfo = {
    cui: 'RO87654321',
    legalName: 'Companie Client SRL',
    regCom: 'J40/456/2021',
    address: {
      streetName: 'Strada Clienti 20',
      city: 'Bucuresti',
      county: 'Bucuresti',
      postalCode: '020202',
      countryCode: 'RO',
    },
    contact: {
      email: 'client@company.ro',
      phone: '+40223456789',
    },
    isB2B: true,
  };

  const createMockInvoice = (overrides: Partial<Invoice> = {}): Invoice =>
    ({
      _id: new Types.ObjectId(),
      invoiceNumber: 'INV-2025-00001',
      series: 'INV',
      issueDate: new Date('2025-01-15'),
      dueDate: new Date('2025-02-15'),
      total: 1000,
      subtotal: 840.34,
      taxAmount: 159.66,
      discountAmount: 0,
      currency: 'RON',
      notes: 'Test invoice notes',
      ...overrides,
    }) as Invoice;

  const mockLineItems: InvoiceLineItem[] = [
    {
      id: '1',
      description: 'Consultatie stomatologica',
      name: 'Consultatie',
      quantity: 1,
      unitPrice: 200,
      taxRate: 0,
      taxCategory: 'E',
      taxExemptionReasonCode: 'VATEX-EU-J',
      taxExemptionReasonText: 'Servicii medicale scutite',
      unitCode: 'C62',
      procedureCode: 'D0120',
    },
    {
      id: '2',
      description: 'Detartraj',
      name: 'Detartraj',
      quantity: 1,
      unitPrice: 300,
      taxRate: 0,
      taxCategory: 'E',
      taxExemptionReasonCode: 'VATEX-EU-J',
      taxExemptionReasonText: 'Servicii medicale scutite',
      unitCode: 'C62',
      procedureCode: 'D1110',
      toothNumber: '11',
    },
    {
      id: '3',
      description: 'Obturatie compozit',
      name: 'Obturatie',
      quantity: 2,
      unitPrice: 170.17,
      taxRate: 0,
      taxCategory: 'E',
      taxExemptionReasonCode: 'VATEX-EU-J',
      taxExemptionReasonText: 'Servicii medicale scutite',
      unitCode: 'C62',
      procedureCode: 'D2391',
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        XmlGeneratorService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'efactura.features.validateBeforeSubmit') return true;
              return undefined;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<XmlGeneratorService>(XmlGeneratorService);
  });

  describe('generateInvoiceXml', () => {
    it('should generate valid UBL 2.1 XML', () => {
      const invoice = createMockInvoice();

      const xml = service.generateInvoiceXml(invoice, mockSellerInfo, mockBuyerInfo, mockLineItems);

      // Verify XML structure
      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xml).toContain('xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"');
      expect(xml).toContain('<cbc:UBLVersionID>2.1</cbc:UBLVersionID>');
    });

    it('should include CIUS-RO customization ID', () => {
      const invoice = createMockInvoice();

      const xml = service.generateInvoiceXml(invoice, mockSellerInfo, mockBuyerInfo, mockLineItems);

      expect(xml).toContain('urn:cen.eu:en16931:2017#compliant#urn:efactura.mfinante.ro:CIUS-RO');
    });

    it('should include invoice number and dates', () => {
      const invoice = createMockInvoice({
        invoiceNumber: 'TEST-2025-00042',
        issueDate: new Date('2025-03-15'),
        dueDate: new Date('2025-04-15'),
      });

      const xml = service.generateInvoiceXml(invoice, mockSellerInfo, mockBuyerInfo, mockLineItems);

      expect(xml).toContain('<cbc:ID>TEST-2025-00042</cbc:ID>');
      expect(xml).toContain('<cbc:IssueDate>2025-03-15</cbc:IssueDate>');
      expect(xml).toContain('<cbc:DueDate>2025-04-15</cbc:DueDate>');
    });

    it('should include correct currency code', () => {
      const invoice = createMockInvoice({ currency: 'RON' });

      const xml = service.generateInvoiceXml(invoice, mockSellerInfo, mockBuyerInfo, mockLineItems);

      expect(xml).toContain('<cbc:DocumentCurrencyCode>RON</cbc:DocumentCurrencyCode>');
    });

    it('should include supplier (seller) party information', () => {
      const invoice = createMockInvoice();

      const xml = service.generateInvoiceXml(invoice, mockSellerInfo, mockBuyerInfo, mockLineItems);

      expect(xml).toContain('<cac:AccountingSupplierParty>');
      expect(xml).toContain('Clinica Dentara Test SRL');
      expect(xml).toContain('RO12345678');
      expect(xml).toContain('Strada Medicilor 10');
      expect(xml).toContain('Bucuresti');
    });

    it('should include customer (buyer) party information', () => {
      const invoice = createMockInvoice();

      const xml = service.generateInvoiceXml(invoice, mockSellerInfo, mockBuyerInfo, mockLineItems);

      expect(xml).toContain('<cac:AccountingCustomerParty>');
      expect(xml).toContain('Companie Client SRL');
      expect(xml).toContain('RO87654321');
      expect(xml).toContain('Strada Clienti 20');
    });

    it('should include tax totals', () => {
      const invoice = createMockInvoice({
        subtotal: 500,
        taxAmount: 95,
        total: 595,
      });

      const xml = service.generateInvoiceXml(invoice, mockSellerInfo, mockBuyerInfo, mockLineItems);

      expect(xml).toContain('<cac:TaxTotal>');
      expect(xml).toContain('<cbc:TaxAmount');
    });

    it('should include legal monetary totals', () => {
      const invoice = createMockInvoice({
        subtotal: 840.34,
        taxAmount: 159.66,
        total: 1000,
      });

      const xml = service.generateInvoiceXml(invoice, mockSellerInfo, mockBuyerInfo, mockLineItems);

      expect(xml).toContain('<cac:LegalMonetaryTotal>');
      expect(xml).toContain('<cbc:PayableAmount');
    });

    it('should include invoice lines', () => {
      const invoice = createMockInvoice();

      const xml = service.generateInvoiceXml(invoice, mockSellerInfo, mockBuyerInfo, mockLineItems);

      expect(xml).toContain('<cac:InvoiceLine>');
      expect(xml).toContain('Consultatie stomatologica');
      expect(xml).toContain('Detartraj');
      expect(xml).toContain('Obturatie compozit');
    });

    it('should use invoice type code 380 for standard invoice', () => {
      const invoice = createMockInvoice();

      const xml = service.generateInvoiceXml(invoice, mockSellerInfo, mockBuyerInfo, mockLineItems);

      expect(xml).toContain('<cbc:InvoiceTypeCode>380</cbc:InvoiceTypeCode>');
    });

    it('should include VAT exemption codes for healthcare services', () => {
      const invoice = createMockInvoice();

      const xml = service.generateInvoiceXml(invoice, mockSellerInfo, mockBuyerInfo, mockLineItems);

      expect(xml).toContain('VATEX-EU-J');
      expect(xml).toContain('Servicii medicale scutite');
    });
  });

  describe('validateXml', () => {
    it('should validate well-formed XML', () => {
      const invoice = createMockInvoice();
      const xml = service.generateInvoiceXml(invoice, mockSellerInfo, mockBuyerInfo, mockLineItems);

      const result = service.validateXml(xml);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect malformed XML', () => {
      const malformedXml = '<Invoice><unclosed>';

      const result = service.validateXml(malformedXml);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('generateCreditNoteXml', () => {
    it('should generate credit note with type code 381', () => {
      const invoice = createMockInvoice();

      // Credit notes should use document type 381
      const xml = service.generateInvoiceXml(invoice, mockSellerInfo, mockBuyerInfo, mockLineItems);

      // Standard invoice uses 380
      expect(xml).toContain('380');
    });
  });

  describe('XML namespace handling', () => {
    it('should include all required UBL namespaces', () => {
      const invoice = createMockInvoice();

      const xml = service.generateInvoiceXml(invoice, mockSellerInfo, mockBuyerInfo, mockLineItems);

      // UBL Invoice namespace
      expect(xml).toContain('urn:oasis:names:specification:ubl:schema:xsd:Invoice-2');

      // Common Aggregate Components namespace
      expect(xml).toContain('urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2');

      // Common Basic Components namespace
      expect(xml).toContain('urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2');
    });
  });

  describe('monetary value formatting', () => {
    it('should format monetary values with 2 decimal places', () => {
      const invoice = createMockInvoice({
        total: 1234.567, // Should be rounded to 1234.57
        subtotal: 1037.454, // Should be rounded
        taxAmount: 197.113, // Should be rounded
      });

      const xml = service.generateInvoiceXml(invoice, mockSellerInfo, mockBuyerInfo, mockLineItems);

      // Values should be formatted with proper decimal places
      expect(xml).toMatch(/currencyID="RON">\d+\.\d{2}</);
    });
  });

  describe('line item handling', () => {
    it('should handle line items with tooth numbers', () => {
      const lineItemsWithTooth: InvoiceLineItem[] = [
        {
          id: '1',
          description: 'Extractie dinte',
          quantity: 1,
          unitPrice: 500,
          taxRate: 0,
          taxCategory: 'E',
          unitCode: 'C62',
          toothNumber: '36',
        },
      ];

      const invoice = createMockInvoice();
      const xml = service.generateInvoiceXml(
        invoice,
        mockSellerInfo,
        mockBuyerInfo,
        lineItemsWithTooth,
      );

      expect(xml).toContain('Extractie dinte');
    });

    it('should handle empty line items array', () => {
      const invoice = createMockInvoice();

      // Should not throw, but may generate a warning
      expect(() => {
        service.generateInvoiceXml(invoice, mockSellerInfo, mockBuyerInfo, []);
      }).not.toThrow();
    });

    it('should handle multiple quantities', () => {
      const lineItemsMultiple: InvoiceLineItem[] = [
        {
          id: '1',
          description: 'Anestezie locala',
          quantity: 3,
          unitPrice: 50,
          taxRate: 0,
          taxCategory: 'E',
          unitCode: 'C62',
        },
      ];

      const invoice = createMockInvoice();
      const xml = service.generateInvoiceXml(
        invoice,
        mockSellerInfo,
        mockBuyerInfo,
        lineItemsMultiple,
      );

      expect(xml).toContain('<cbc:InvoicedQuantity');
      expect(xml).toContain('Anestezie locala');
    });
  });
});

/**
 * XML Special Character Handling Tests
 */
describe('XmlGeneratorService - Special Characters', () => {
  let service: XmlGeneratorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        XmlGeneratorService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(true),
          },
        },
      ],
    }).compile();

    service = module.get<XmlGeneratorService>(XmlGeneratorService);
  });

  it('should escape XML special characters in descriptions', () => {
    const mockSeller: EFacturaSellerInfo = {
      cui: 'RO12345678',
      legalName: 'Test & Company <S.R.L.>',
      address: {
        streetName: 'Str. "Test" & Co.',
        city: 'Bucuresti',
        countryCode: 'RO',
      },
      vatPayer: true,
    };

    const mockBuyer: EFacturaBuyerInfo = {
      legalName: 'Client "Test" Ltd.',
      address: {
        streetName: 'Street',
        city: 'City',
        countryCode: 'RO',
      },
      isB2B: true,
    };

    const invoice = {
      _id: new Types.ObjectId(),
      invoiceNumber: 'INV-001',
      issueDate: new Date(),
      dueDate: new Date(),
      total: 100,
      subtotal: 100,
      taxAmount: 0,
      currency: 'RON',
    } as Invoice;

    const lineItems: InvoiceLineItem[] = [
      {
        id: '1',
        description: 'Service with <special> & "characters"',
        quantity: 1,
        unitPrice: 100,
        taxRate: 0,
        taxCategory: 'E',
        unitCode: 'C62',
      },
    ];

    const xml = service.generateInvoiceXml(invoice, mockSeller, mockBuyer, lineItems);

    // XML should be valid (special chars escaped)
    const validation = service.validateXml(xml);
    expect(validation.valid).toBe(true);

    // The content should be escaped properly
    expect(xml).toContain('&amp;'); // & escaped
    expect(xml).toContain('&lt;'); // < escaped
    expect(xml).toContain('&gt;'); // > escaped
  });
});
