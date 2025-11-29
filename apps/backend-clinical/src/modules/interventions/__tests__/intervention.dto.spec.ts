/**
 * Intervention DTO Validation Tests
 *
 * Tests the Zod validation schemas for clinical intervention DTOs.
 * Ensures clinical data integrity and safety validations work correctly.
 *
 * @module interventions/__tests__
 */

import {
  CreateInterventionSchema,
  QuickInterventionSchema,
  UpdateInterventionSchema,
  CancelInterventionSchema,
  DeleteInterventionSchema,
  ListInterventionsQuerySchema,
  FDIToothNumberSchema,
} from '../dto';

describe('Intervention DTO Validation', () => {
  describe('FDIToothNumberSchema', () => {
    it('should accept valid permanent teeth numbers', () => {
      const validTeeth = ['11', '12', '18', '21', '31', '48'];
      validTeeth.forEach((tooth) => {
        expect(() => FDIToothNumberSchema.parse(tooth)).not.toThrow();
      });
    });

    it('should accept valid deciduous teeth numbers', () => {
      const validTeeth = ['51', '55', '61', '75', '85'];
      validTeeth.forEach((tooth) => {
        expect(() => FDIToothNumberSchema.parse(tooth)).not.toThrow();
      });
    });

    it('should reject invalid tooth numbers', () => {
      const invalidTeeth = ['0', '33', '99', '100', 'A1', ''];
      invalidTeeth.forEach((tooth) => {
        expect(() => FDIToothNumberSchema.parse(tooth)).toThrow();
      });
    });
  });

  describe('CreateInterventionSchema', () => {
    const validInput = {
      type: 'fluoride',
      title: 'Fluoride application',
      teeth: ['11', '12'],
      surfaces: [],
      attachments: [],
      followUpRequired: false,
      isBillable: true,
      billedAmount: 50,
    };

    it('should accept valid input', () => {
      const result = CreateInterventionSchema.parse(validInput);
      expect(result.type).toBe('fluoride');
      expect(result.title).toBe('Fluoride application');
    });

    it('should reject empty title', () => {
      expect(() =>
        CreateInterventionSchema.parse({ ...validInput, title: '' }),
      ).toThrow();
    });

    it('should reject title exceeding max length', () => {
      expect(() =>
        CreateInterventionSchema.parse({
          ...validInput,
          title: 'x'.repeat(201),
        }),
      ).toThrow();
    });

    it('should reject invalid intervention type', () => {
      expect(() =>
        CreateInterventionSchema.parse({
          ...validInput,
          type: 'invalid_type',
        }),
      ).toThrow();
    });

    it('should reject invalid tooth numbers', () => {
      expect(() =>
        CreateInterventionSchema.parse({
          ...validInput,
          teeth: ['99'],
        }),
      ).toThrow();
    });

    it('should reject duplicate tooth numbers', () => {
      expect(() =>
        CreateInterventionSchema.parse({
          ...validInput,
          teeth: ['11', '11'],
        }),
      ).toThrow();
    });

    it('should reject performedAt in the future', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      expect(() =>
        CreateInterventionSchema.parse({
          ...validInput,
          performedAt: futureDate.toISOString(),
        }),
      ).toThrow();
    });

    it('should accept performedAt in the past', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const result = CreateInterventionSchema.parse({
        ...validInput,
        performedAt: pastDate.toISOString(),
      });
      expect(result.performedAt).toBeDefined();
    });

    it('should reject followUpDate before performedAt', () => {
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const dayBeforeYesterday = new Date(now);
      dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);

      expect(() =>
        CreateInterventionSchema.parse({
          ...validInput,
          performedAt: yesterday.toISOString(),
          followUpDate: dayBeforeYesterday.toISOString(),
          followUpRequired: true,
        }),
      ).toThrow();
    });

    it('should reject billedAmount without isBillable', () => {
      expect(() =>
        CreateInterventionSchema.parse({
          ...validInput,
          isBillable: false,
          billedAmount: 100,
        }),
      ).toThrow();
    });

    it('should accept all valid intervention types', () => {
      const types = [
        'examination',
        'consultation',
        'emergency',
        'fluoride',
        'sealant',
        'scaling',
        'polishing',
        'sensitivity_test',
        'vitality_test',
        'occlusion_check',
        'post_op_check',
        'suture_removal',
        'medication',
        'injection',
        'impression',
        'try_in',
        'cementation',
        'adjustment',
        'photo_documentation',
        'other',
      ];

      types.forEach((type) => {
        expect(() =>
          CreateInterventionSchema.parse({ ...validInput, type }),
        ).not.toThrow();
      });
    });

    it('should accept valid surface codes', () => {
      const result = CreateInterventionSchema.parse({
        ...validInput,
        surfaces: ['M', 'O', 'D', 'B', 'L'],
      });
      expect(result.surfaces).toHaveLength(5);
    });

    it('should reject invalid surface codes', () => {
      expect(() =>
        CreateInterventionSchema.parse({
          ...validInput,
          surfaces: ['X'],
        }),
      ).toThrow();
    });

    it('should accept valid quadrant values', () => {
      const quadrants = ['UR', 'UL', 'LR', 'LL', 'full'];
      quadrants.forEach((quadrant) => {
        expect(() =>
          CreateInterventionSchema.parse({ ...validInput, quadrant }),
        ).not.toThrow();
      });
    });

    it('should accept valid CDT code format', () => {
      const validCodes = ['D1110', 'D0120', 'd1206', '1110'];
      validCodes.forEach((code) => {
        expect(() =>
          CreateInterventionSchema.parse({ ...validInput, procedureCode: code }),
        ).not.toThrow();
      });
    });

    it('should reject invalid CDT code format', () => {
      const invalidCodes = ['DXXXX', 'D12', 'D123456', 'invalid'];
      invalidCodes.forEach((code) => {
        expect(() =>
          CreateInterventionSchema.parse({ ...validInput, procedureCode: code }),
        ).toThrow();
      });
    });

    it('should accept valid attachments', () => {
      const result = CreateInterventionSchema.parse({
        ...validInput,
        attachments: [
          {
            fileId: '123e4567-e89b-12d3-a456-426614174000',
            type: 'image',
            description: 'Before photo',
          },
        ],
      });
      expect(result.attachments).toHaveLength(1);
    });

    it('should reject attachment with invalid fileId', () => {
      expect(() =>
        CreateInterventionSchema.parse({
          ...validInput,
          attachments: [
            {
              fileId: 'not-a-uuid',
              type: 'image',
            },
          ],
        }),
      ).toThrow();
    });
  });

  describe('QuickInterventionSchema', () => {
    it('should accept minimal valid input', () => {
      const result = QuickInterventionSchema.parse({
        type: 'sensitivity_test',
      });
      expect(result.type).toBe('sensitivity_test');
      expect(result.teeth).toEqual([]);
    });

    it('should accept input with teeth and notes', () => {
      const result = QuickInterventionSchema.parse({
        type: 'fluoride',
        teeth: ['16'],
        notes: 'Applied to upper right molar',
      });
      expect(result.teeth).toEqual(['16']);
      expect(result.notes).toBeDefined();
    });

    it('should reject notes exceeding max length', () => {
      expect(() =>
        QuickInterventionSchema.parse({
          type: 'fluoride',
          notes: 'x'.repeat(2001),
        }),
      ).toThrow();
    });
  });

  describe('UpdateInterventionSchema', () => {
    it('should require version for optimistic locking', () => {
      expect(() =>
        UpdateInterventionSchema.parse({ title: 'New title' }),
      ).toThrow();
    });

    it('should accept valid update with version', () => {
      const result = UpdateInterventionSchema.parse({
        title: 'Updated title',
        version: 1,
      });
      expect(result.title).toBe('Updated title');
      expect(result.version).toBe(1);
    });

    it('should reject update with only version (no changes)', () => {
      expect(() =>
        UpdateInterventionSchema.parse({ version: 1 }),
      ).toThrow();
    });

    it('should accept nullable fields for clearing values', () => {
      const result = UpdateInterventionSchema.parse({
        description: null,
        followUpDate: null,
        version: 1,
      });
      expect(result.description).toBeNull();
      expect(result.followUpDate).toBeNull();
    });

    it('should only allow valid status transitions', () => {
      // Can only update to completed or pending_review (not cancelled)
      expect(() =>
        UpdateInterventionSchema.parse({
          status: 'cancelled',
          version: 1,
        }),
      ).toThrow();

      expect(() =>
        UpdateInterventionSchema.parse({
          status: 'completed',
          version: 1,
        }),
      ).not.toThrow();
    });
  });

  describe('CancelInterventionSchema', () => {
    it('should require reason', () => {
      expect(() =>
        CancelInterventionSchema.parse({ version: 1 }),
      ).toThrow();
    });

    it('should require version', () => {
      expect(() =>
        CancelInterventionSchema.parse({ reason: 'Patient requested' }),
      ).toThrow();
    });

    it('should reject empty reason', () => {
      expect(() =>
        CancelInterventionSchema.parse({ reason: '', version: 1 }),
      ).toThrow();
    });

    it('should reject reason exceeding max length', () => {
      expect(() =>
        CancelInterventionSchema.parse({
          reason: 'x'.repeat(501),
          version: 1,
        }),
      ).toThrow();
    });

    it('should accept valid cancellation', () => {
      const result = CancelInterventionSchema.parse({
        reason: 'Patient no longer requires procedure',
        version: 1,
      });
      expect(result.reason).toBeDefined();
      expect(result.version).toBe(1);
    });
  });

  describe('DeleteInterventionSchema', () => {
    it('should require reason for audit compliance', () => {
      expect(() =>
        DeleteInterventionSchema.parse({ version: 1 }),
      ).toThrow();
    });

    it('should accept valid deletion request', () => {
      const result = DeleteInterventionSchema.parse({
        reason: 'Record entered in error',
        version: 1,
      });
      expect(result.reason).toBeDefined();
      expect(result.version).toBe(1);
    });
  });

  describe('ListInterventionsQuerySchema', () => {
    it('should provide defaults', () => {
      const result = ListInterventionsQuerySchema.parse({});
      expect(result.limit).toBe(50);
      expect(result.offset).toBe(0);
      expect(result.includeDeleted).toBe(false);
    });

    it('should coerce string numbers', () => {
      const result = ListInterventionsQuerySchema.parse({
        limit: '25',
        offset: '10',
      });
      expect(result.limit).toBe(25);
      expect(result.offset).toBe(10);
    });

    it('should enforce limit boundaries', () => {
      expect(() =>
        ListInterventionsQuerySchema.parse({ limit: 0 }),
      ).toThrow();

      expect(() =>
        ListInterventionsQuerySchema.parse({ limit: 101 }),
      ).toThrow();
    });

    it('should accept valid date filters', () => {
      const result = ListInterventionsQuerySchema.parse({
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-12-31T23:59:59Z',
      });
      expect(result.startDate).toBeDefined();
      expect(result.endDate).toBeDefined();
    });

    it('should accept valid type filter', () => {
      const result = ListInterventionsQuerySchema.parse({
        type: 'fluoride',
      });
      expect(result.type).toBe('fluoride');
    });

    it('should reject invalid type filter', () => {
      expect(() =>
        ListInterventionsQuerySchema.parse({ type: 'invalid' }),
      ).toThrow();
    });

    it('should accept valid status filter', () => {
      const result = ListInterventionsQuerySchema.parse({
        status: 'completed',
      });
      expect(result.status).toBe('completed');
    });

    it('should coerce boolean filters', () => {
      const result = ListInterventionsQuerySchema.parse({
        isBillable: 'true',
        followUpRequired: 'false',
        includeDeleted: 'true',
      });
      expect(result.isBillable).toBe(true);
      expect(result.followUpRequired).toBe(false);
      expect(result.includeDeleted).toBe(true);
    });
  });
});
