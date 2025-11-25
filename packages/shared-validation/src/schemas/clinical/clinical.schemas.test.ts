/**
 * Clinical schemas validation tests
 * @module shared-validation/schemas/clinical
 */

import { describe, it, expect } from 'vitest';
import {
  // Odontogram
  ToothNumberSchema,
  ToothSurfaceSchema,
  ToothConditionSchema,
  ToothStatusSchema,
  OdontogramEntrySchema,
  UpdateOdontogramDtoSchema,
  ToothSurface,
  ToothCondition,
  // Perio Chart
  PerioSiteSchema,
  PerioToothSchema,
  UpdatePerioChartDtoSchema,
  // Clinical Notes
  ClinicalNoteTypeSchema,
  SOAPNoteSchema,
  CreateClinicalNoteDtoSchema,
  ClinicalNoteSchema,
  ClinicalNoteType,
  // Treatment Plans
  TreatmentPlanStatusSchema,
  ProcedureItemSchema,
  TreatmentOptionSchema,
  CreateTreatmentPlanDtoSchema,
  UpdateTreatmentPlanDtoSchema,
  AcceptOptionDtoSchema,
  TreatmentPlanStatus,
  // Procedures
  ProcedureStatusSchema,
  ProcedureCodeSchema,
  CreateProcedureDtoSchema,
  CompleteProcedureDtoSchema,
  ProcedureSchema,
  ProcedureStatus,
  // Consent
  ConsentTypeSchema,
  ConsentStatusSchema,
  DigitalSignatureSchema,
  CreateConsentDtoSchema,
  ConsentSchema,
  ConsentType,
  ConsentStatus,
} from './clinical.schemas';

describe('Odontogram Schemas', () => {
  describe('ToothNumberSchema', () => {
    it('should accept valid tooth numbers (1-32)', () => {
      expect(() => ToothNumberSchema.parse(1)).not.toThrow();
      expect(() => ToothNumberSchema.parse(16)).not.toThrow();
      expect(() => ToothNumberSchema.parse(32)).not.toThrow();
    });

    it('should reject invalid tooth numbers', () => {
      expect(() => ToothNumberSchema.parse(0)).toThrow();
      expect(() => ToothNumberSchema.parse(33)).toThrow();
      expect(() => ToothNumberSchema.parse(1.5)).toThrow();
      expect(() => ToothNumberSchema.parse(-5)).toThrow();
    });
  });

  describe('ToothSurfaceSchema', () => {
    it('should accept valid tooth surfaces', () => {
      expect(() => ToothSurfaceSchema.parse(ToothSurface.OCCLUSAL)).not.toThrow();
      expect(() => ToothSurfaceSchema.parse(ToothSurface.MESIAL)).not.toThrow();
      expect(() => ToothSurfaceSchema.parse(ToothSurface.BUCCAL)).not.toThrow();
    });

    it('should reject invalid tooth surfaces', () => {
      expect(() => ToothSurfaceSchema.parse('INVALID')).toThrow();
    });
  });

  describe('UpdateOdontogramDtoSchema', () => {
    it('should validate valid odontogram update', () => {
      const validDto = {
        patientId: '123e4567-e89b-12d3-a456-426614174000',
        entries: [
          {
            toothNumber: 1,
            status: {
              condition: ToothCondition.HEALTHY,
            },
            lastUpdated: new Date().toISOString(),
          },
          {
            toothNumber: 8,
            status: {
              condition: ToothCondition.FILLED,
              surfaces: [ToothSurface.OCCLUSAL, ToothSurface.MESIAL],
              notes: 'Composite filling',
            },
            lastUpdated: new Date().toISOString(),
          },
        ],
        notes: 'Complete odontogram update',
      };

      expect(() => UpdateOdontogramDtoSchema.parse(validDto)).not.toThrow();
    });

    it('should reject duplicate tooth numbers', () => {
      const invalidDto = {
        patientId: '123e4567-e89b-12d3-a456-426614174000',
        entries: [
          {
            toothNumber: 1,
            status: { condition: ToothCondition.HEALTHY },
            lastUpdated: new Date().toISOString(),
          },
          {
            toothNumber: 1,
            status: { condition: ToothCondition.CARIES },
            lastUpdated: new Date().toISOString(),
          },
        ],
      };

      expect(() => UpdateOdontogramDtoSchema.parse(invalidDto)).toThrow();
    });

    it('should reject empty entries array', () => {
      const invalidDto = {
        patientId: '123e4567-e89b-12d3-a456-426614174000',
        entries: [],
      };

      expect(() => UpdateOdontogramDtoSchema.parse(invalidDto)).toThrow();
    });
  });
});

describe('Perio Chart Schemas', () => {
  describe('PerioSiteSchema', () => {
    it('should validate valid perio site measurements', () => {
      const validSite = {
        probingDepth: 3,
        recession: 1,
        bleeding: true,
        mobility: 1,
      };

      expect(() => PerioSiteSchema.parse(validSite)).not.toThrow();
    });

    it('should reject probing depth out of range', () => {
      expect(() =>
        PerioSiteSchema.parse({
          probingDepth: 16,
          bleeding: false,
        }),
      ).toThrow();

      expect(() =>
        PerioSiteSchema.parse({
          probingDepth: -1,
          bleeding: false,
        }),
      ).toThrow();
    });

    it('should reject invalid mobility score', () => {
      expect(() =>
        PerioSiteSchema.parse({
          probingDepth: 3,
          bleeding: false,
          mobility: 4,
        }),
      ).toThrow();
    });
  });

  describe('UpdatePerioChartDtoSchema', () => {
    it('should validate complete perio chart update', () => {
      const validDto = {
        patientId: '123e4567-e89b-12d3-a456-426614174000',
        teeth: [
          {
            toothNumber: 1,
            sites: [
              { probingDepth: 2, bleeding: false },
              { probingDepth: 3, bleeding: true },
              { probingDepth: 2, bleeding: false },
              { probingDepth: 3, bleeding: false },
              { probingDepth: 2, bleeding: true },
              { probingDepth: 3, bleeding: false },
            ],
          },
        ],
        examDate: new Date().toISOString(),
        examinerId: '123e4567-e89b-12d3-a456-426614174001',
        notes: 'Annual perio exam',
      };

      expect(() => UpdatePerioChartDtoSchema.parse(validDto)).not.toThrow();
    });

    it('should require exactly 6 sites per tooth', () => {
      const invalidDto = {
        patientId: '123e4567-e89b-12d3-a456-426614174000',
        teeth: [
          {
            toothNumber: 1,
            sites: [
              { probingDepth: 2, bleeding: false },
              { probingDepth: 3, bleeding: true },
              { probingDepth: 2, bleeding: false },
            ],
          },
        ],
        examDate: new Date().toISOString(),
        examinerId: '123e4567-e89b-12d3-a456-426614174001',
      };

      expect(() => UpdatePerioChartDtoSchema.parse(invalidDto)).toThrow();
    });
  });
});

describe('Clinical Note Schemas', () => {
  describe('SOAPNoteSchema', () => {
    it('should validate SOAP note structure', () => {
      const validSOAP = {
        subjective: 'Patient reports tooth pain in upper right molar',
        objective: 'Examination reveals large caries on tooth #3',
        assessment: 'Deep caries approaching pulp',
        plan: 'Root canal therapy scheduled for next week',
      };

      expect(() => SOAPNoteSchema.parse(validSOAP)).not.toThrow();
    });

    it('should reject if any SOAP section exceeds max length', () => {
      const invalidSOAP = {
        subjective: 'a'.repeat(2001),
        objective: 'Test',
        assessment: 'Test',
        plan: 'Test',
      };

      expect(() => SOAPNoteSchema.parse(invalidSOAP)).toThrow();
    });
  });

  describe('CreateClinicalNoteDtoSchema', () => {
    it('should validate SOAP note creation', () => {
      const validDto = {
        patientId: '123e4567-e89b-12d3-a456-426614174000',
        appointmentId: '123e4567-e89b-12d3-a456-426614174001',
        type: ClinicalNoteType.SOAP,
        content: {
          subjective: 'Patient reports tooth pain',
          objective: 'Caries detected',
          assessment: 'Deep caries',
          plan: 'Root canal',
        },
        chiefComplaint: 'Tooth pain',
        diagnosis: ['Caries', 'Pulpitis'],
        isConfidential: true,
      };

      expect(() => CreateClinicalNoteDtoSchema.parse(validDto)).not.toThrow();
    });

    it('should validate free-text note creation', () => {
      const validDto = {
        patientId: '123e4567-e89b-12d3-a456-426614174000',
        type: ClinicalNoteType.PROGRESS,
        content: {
          text: 'Patient healing well post-extraction',
        },
      };

      expect(() => CreateClinicalNoteDtoSchema.parse(validDto)).not.toThrow();
    });

    it('should limit attachments to 20', () => {
      const invalidDto = {
        patientId: '123e4567-e89b-12d3-a456-426614174000',
        type: ClinicalNoteType.CONSULTATION,
        content: { text: 'Note' },
        attachments: Array(21).fill('123e4567-e89b-12d3-a456-426614174000'),
      };

      expect(() => CreateClinicalNoteDtoSchema.parse(invalidDto)).toThrow();
    });
  });
});

describe('Treatment Plan Schemas', () => {
  describe('ProcedureItemSchema', () => {
    it('should validate valid procedure item', () => {
      const validItem = {
        code: 'D0120',
        description: 'Periodic oral evaluation',
        fee: 75.0,
        priority: 'IMMEDIATE',
      };

      expect(() => ProcedureItemSchema.parse(validItem)).not.toThrow();
    });

    it('should validate procedure with tooth and surfaces', () => {
      const validItem = {
        code: 'D2391',
        description: 'Resin-based composite - one surface, posterior',
        toothNumber: 19,
        surfaces: [ToothSurface.OCCLUSAL],
        fee: 150.0,
        insuranceCoverage: 80,
        priority: 'SOON',
        notes: 'Replace old amalgam filling',
      };

      expect(() => ProcedureItemSchema.parse(validItem)).not.toThrow();
    });

    it('should reject invalid ADA code format', () => {
      const invalidItem = {
        code: 'X1234',
        description: 'Invalid code',
        fee: 100.0,
        priority: 'IMMEDIATE',
      };

      expect(() => ProcedureItemSchema.parse(invalidItem)).toThrow();
    });

    it('should reject insurance coverage > 100%', () => {
      const invalidItem = {
        code: 'D0120',
        description: 'Test',
        fee: 100.0,
        insuranceCoverage: 150,
        priority: 'IMMEDIATE',
      };

      expect(() => ProcedureItemSchema.parse(invalidItem)).toThrow();
    });
  });

  describe('CreateTreatmentPlanDtoSchema', () => {
    it('should validate treatment plan with multiple options', () => {
      const validDto = {
        patientId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Comprehensive Restorative Treatment',
        description: 'Full mouth restoration plan',
        options: [
          {
            id: '123e4567-e89b-12d3-a456-426614174001',
            name: 'Conservative Approach',
            description: 'Fillings and crowns',
            procedures: [
              {
                code: 'D2391',
                description: 'Composite filling',
                toothNumber: 19,
                surfaces: [ToothSurface.OCCLUSAL],
                fee: 150.0,
                priority: 'IMMEDIATE',
              },
            ],
            totalFee: 150.0,
            estimatedDuration: 7,
            isRecommended: true,
          },
          {
            id: '123e4567-e89b-12d3-a456-426614174002',
            name: 'Aggressive Approach',
            description: 'Extraction and implant',
            procedures: [
              {
                code: 'D7140',
                description: 'Extraction',
                toothNumber: 19,
                fee: 200.0,
                priority: 'IMMEDIATE',
              },
            ],
            totalFee: 200.0,
            estimatedDuration: 90,
            isRecommended: false,
          },
        ],
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        requiresInsuranceApproval: true,
      };

      expect(() => CreateTreatmentPlanDtoSchema.parse(validDto)).not.toThrow();
    });

    it('should reject multiple recommended options', () => {
      const invalidDto = {
        patientId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Treatment Plan',
        options: [
          {
            id: '123e4567-e89b-12d3-a456-426614174001',
            name: 'Option 1',
            description: 'First option',
            procedures: [
              {
                code: 'D0120',
                description: 'Exam',
                fee: 75.0,
                priority: 'IMMEDIATE',
              },
            ],
            totalFee: 75.0,
            estimatedDuration: 1,
            isRecommended: true,
          },
          {
            id: '123e4567-e89b-12d3-a456-426614174002',
            name: 'Option 2',
            description: 'Second option',
            procedures: [
              {
                code: 'D0120',
                description: 'Exam',
                fee: 75.0,
                priority: 'IMMEDIATE',
              },
            ],
            totalFee: 75.0,
            estimatedDuration: 1,
            isRecommended: true,
          },
        ],
      };

      expect(() => CreateTreatmentPlanDtoSchema.parse(invalidDto)).toThrow();
    });
  });
});

describe('Procedure Schemas', () => {
  describe('ProcedureCodeSchema', () => {
    it('should validate ADA CDT codes', () => {
      expect(() => ProcedureCodeSchema.parse('D0120')).not.toThrow();
      expect(() => ProcedureCodeSchema.parse('D2391')).not.toThrow();
      expect(() => ProcedureCodeSchema.parse('D9999')).not.toThrow();
    });

    it('should reject invalid code formats', () => {
      expect(() => ProcedureCodeSchema.parse('D012')).toThrow();
      expect(() => ProcedureCodeSchema.parse('X0120')).toThrow();
      expect(() => ProcedureCodeSchema.parse('D01200')).toThrow();
      expect(() => ProcedureCodeSchema.parse('0120')).toThrow();
    });
  });

  describe('CreateProcedureDtoSchema', () => {
    it('should validate complete procedure creation', () => {
      const validDto = {
        patientId: '123e4567-e89b-12d3-a456-426614174000',
        appointmentId: '123e4567-e89b-12d3-a456-426614174001',
        treatmentPlanId: '123e4567-e89b-12d3-a456-426614174002',
        code: 'D2391',
        description: 'Composite filling - one surface',
        toothNumber: 19,
        surfaces: [ToothSurface.OCCLUSAL],
        providerId: '123e4567-e89b-12d3-a456-426614174003',
        assistantId: '123e4567-e89b-12d3-a456-426614174004',
        scheduledDate: new Date().toISOString(),
        estimatedDuration: 60,
        fee: 150.0,
        notes: 'Replace old amalgam filling',
      };

      expect(() => CreateProcedureDtoSchema.parse(validDto)).not.toThrow();
    });

    it('should reject duration > 480 minutes', () => {
      const invalidDto = {
        patientId: '123e4567-e89b-12d3-a456-426614174000',
        code: 'D0120',
        description: 'Exam',
        providerId: '123e4567-e89b-12d3-a456-426614174003',
        estimatedDuration: 500,
        fee: 75.0,
      };

      expect(() => CreateProcedureDtoSchema.parse(invalidDto)).toThrow();
    });
  });

  describe('CompleteProcedureDtoSchema', () => {
    it('should validate procedure completion with stock items', () => {
      const validDto = {
        procedureId: '123e4567-e89b-12d3-a456-426614174000',
        completedAt: new Date().toISOString(),
        actualDuration: 65,
        stockItemsUsed: [
          {
            itemId: '123e4567-e89b-12d3-a456-426614174001',
            quantity: 2,
          },
          {
            itemId: '123e4567-e89b-12d3-a456-426614174002',
            quantity: 1,
          },
        ],
        outcomeNotes: 'Procedure completed successfully',
        requiresFollowUp: true,
        followUpInDays: 7,
      };

      expect(() => CompleteProcedureDtoSchema.parse(validDto)).not.toThrow();
    });

    it('should limit stock items to 100', () => {
      const invalidDto = {
        procedureId: '123e4567-e89b-12d3-a456-426614174000',
        completedAt: new Date().toISOString(),
        actualDuration: 60,
        stockItemsUsed: Array(101)
          .fill(null)
          .map(() => ({
            itemId: '123e4567-e89b-12d3-a456-426614174001',
            quantity: 1,
          })),
      };

      expect(() => CompleteProcedureDtoSchema.parse(invalidDto)).toThrow();
    });
  });
});

describe('Consent Schemas', () => {
  describe('DigitalSignatureSchema', () => {
    it('should validate digital signature', () => {
      const validSignature = {
        signatureData: 'base64encodedimagedata...',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0...',
        signedAt: new Date().toISOString(),
      };

      expect(() => DigitalSignatureSchema.parse(validSignature)).not.toThrow();
    });

    it('should reject invalid IP address', () => {
      const invalidSignature = {
        signatureData: 'base64encodedimagedata...',
        ipAddress: '999.999.999.999',
        signedAt: new Date().toISOString(),
      };

      expect(() => DigitalSignatureSchema.parse(invalidSignature)).toThrow();
    });
  });

  describe('CreateConsentDtoSchema', () => {
    it('should validate consent creation with signatures', () => {
      const validDto = {
        patientId: '123e4567-e89b-12d3-a456-426614174000',
        type: ConsentType.TREATMENT,
        procedureId: '123e4567-e89b-12d3-a456-426614174001',
        title: 'Consent for Root Canal Therapy',
        content: 'I hereby consent to undergo root canal treatment...',
        patientSignature: {
          signatureData: 'base64encodedpatientdata...',
          ipAddress: '192.168.1.100',
          signedAt: new Date().toISOString(),
        },
        guardianSignature: {
          signatureData: 'base64encodedguardiandata...',
          signedAt: new Date().toISOString(),
        },
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        requiresGuardianConsent: true,
      };

      expect(() => CreateConsentDtoSchema.parse(validDto)).not.toThrow();
    });

    it('should reject consent content > 10000 characters', () => {
      const invalidDto = {
        patientId: '123e4567-e89b-12d3-a456-426614174000',
        type: ConsentType.TREATMENT,
        title: 'Consent',
        content: 'a'.repeat(10001),
      };

      expect(() => CreateConsentDtoSchema.parse(invalidDto)).toThrow();
    });
  });
});
