/**
 * Treatment Plans Service Unit Tests
 *
 * Comprehensive tests for the treatment plan service.
 * Covers plan creation, status transitions, financial calculations,
 * phase/item management, and domain event emission.
 *
 * CLINICAL SAFETY: Tests verify that:
 * - Status transitions follow valid state machine
 * - Financial calculations are accurate
 * - Only draft plans can be modified
 * - Presented plans can be accepted or declined
 * - Procedure completion triggers proper events
 * - Patient consent workflow is enforced
 *
 * @module treatment-plans/tests
 */

import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';

import { TreatmentPlansService } from '../../src/modules/treatment-plans/treatment-plans.service';
import {
  TreatmentPlansRepository,
  AuditContext,
} from '../../src/modules/treatment-plans/treatment-plans.repository';
import {
  TreatmentPlanDocument,
  TreatmentPhase,
  TreatmentPlanItem,
} from '../../src/modules/treatment-plans/entities/treatment-plan.schema';

// ============================================================================
// MOCK SETUP
// ============================================================================

const mockAuditContext: AuditContext = {
  tenantId: 'tenant-123',
  organizationId: 'org-123',
  clinicId: 'clinic-123',
  userId: 'provider-123',
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0',
};

const createMockItem = (overrides: Partial<TreatmentPlanItem> = {}): TreatmentPlanItem => ({
  _id: { toString: () => `item-${Math.random().toString(36).substr(2, 9)}` } as any,
  procedureCode: 'D2391',
  procedureName: 'Resin-based composite - 1 surface',
  teeth: ['16'],
  surfaces: ['O'],
  quantity: 1,
  unitPriceCents: 25000, // 250 RON
  discountCents: 0,
  discountPercent: 0,
  taxCents: 4750, // 19% VAT
  totalCents: 29750,
  status: 'planned',
  materials: [],
  sortOrder: 0,
  ...overrides,
});

const createMockPhase = (overrides: Partial<TreatmentPhase> = {}): TreatmentPhase => ({
  _id: { toString: () => `phase-${Math.random().toString(36).substr(2, 9)}` } as any,
  phaseNumber: 1,
  name: 'Phase 1: Restorative',
  description: 'Fillings and restorations',
  sequenceRequired: false,
  items: [createMockItem()],
  subtotalCents: 29750,
  estimatedDurationMinutes: 45,
  sortOrder: 0,
  ...overrides,
});

const createMockPlan = (overrides: Partial<TreatmentPlanDocument> = {}): TreatmentPlanDocument => {
  const basePlan = {
    _id: { toString: () => 'plan-123' },
    tenantId: 'tenant-123',
    organizationId: 'org-123',
    clinicId: 'clinic-123',
    patientId: 'patient-123',
    providerId: 'provider-123',
    title: 'Comprehensive Treatment Plan',
    description: 'Complete dental restoration',
    status: 'draft' as const,
    phases: [createMockPhase()],
    alternatives: [],
    financial: {
      subtotalCents: 25000,
      discountTotalCents: 0,
      taxTotalCents: 4750,
      totalCents: 29750,
      patientResponsibilityCents: 29750,
      currency: 'RON',
    },
    approvals: [],
    tags: [],
    priority: 'normal' as const,
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'provider-123',
    updatedBy: 'provider-123',
    revisionNumber: 0,
    patientQuestions: [],
  };

  return { ...basePlan, ...overrides } as unknown as TreatmentPlanDocument;
};

// ============================================================================
// TEST SUITE
// ============================================================================

describe('TreatmentPlansService', () => {
  let service: TreatmentPlansService;
  let repository: jest.Mocked<TreatmentPlansRepository>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByIdOrFail: jest.fn(),
      findByPatient: jest.fn(),
      findCurrentActivePlan: jest.fn(),
      findActiveByPatient: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
      completeItem: jest.fn(),
      softDelete: jest.fn(),
      getHistory: jest.fn(),
      countByStatus: jest.fn(),
    };

    const mockEventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TreatmentPlansService,
        { provide: TreatmentPlansRepository, useValue: mockRepository },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<TreatmentPlansService>(TreatmentPlansService);
    repository = module.get(TreatmentPlansRepository);
    eventEmitter = module.get(EventEmitter2);
  });

  // ============================================================================
  // PLAN CREATION TESTS
  // ============================================================================

  describe('createTreatmentPlan', () => {
    it('should create a new treatment plan in draft status', async () => {
      const dto = {
        title: 'Test Treatment Plan',
        phases: [
          {
            phaseNumber: 1,
            name: 'Phase 1',
            items: [
              {
                procedureCode: 'D2391',
                procedureName: 'Composite filling',
                unitPriceCents: 25000,
                teeth: ['16'],
                surfaces: ['O'],
              },
            ],
          },
        ],
        alternatives: [],
        tags: [],
        priority: 'normal' as const,
      };

      const expectedPlan = createMockPlan({ title: dto.title });
      repository.create.mockResolvedValue(expectedPlan);

      const result = await service.createTreatmentPlan('patient-123', dto as any, mockAuditContext);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          patientId: 'patient-123',
          providerId: mockAuditContext.userId,
          status: 'draft',
        }),
        mockAuditContext,
      );
      expect(result.status).toBe('draft');
    });

    it('should emit TreatmentPlanCreated event', async () => {
      const dto = {
        phases: [
          {
            phaseNumber: 1,
            name: 'Phase 1',
            items: [
              {
                procedureCode: 'D2391',
                procedureName: 'Filling',
                unitPriceCents: 25000,
              },
            ],
          },
        ],
        alternatives: [],
        tags: [],
        priority: 'normal' as const,
      };

      repository.create.mockResolvedValue(createMockPlan());

      await service.createTreatmentPlan('patient-123', dto as any, mockAuditContext);

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'treatment.plan.created',
        expect.objectContaining({
          treatmentPlanId: 'plan-123',
          patientId: 'patient-123',
          providerId: mockAuditContext.userId,
        }),
      );
    });

    it('should calculate financial totals correctly', async () => {
      const dto = {
        phases: [
          {
            phaseNumber: 1,
            name: 'Phase 1',
            items: [
              {
                procedureCode: 'D2391',
                procedureName: 'Filling 1',
                unitPriceCents: 25000,
                quantity: 1,
                taxCents: 4750, // 19% VAT
              },
              {
                procedureCode: 'D2392',
                procedureName: 'Filling 2',
                unitPriceCents: 30000,
                quantity: 2,
                discountCents: 5000,
                taxCents: 10450, // 19% on 55000
              },
            ],
          },
        ],
        alternatives: [],
        tags: [],
        priority: 'normal' as const,
      };

      repository.create.mockImplementation(async (data) => {
        return createMockPlan({
          financial: data.financial,
        });
      });

      const result = await service.createTreatmentPlan('patient-123', dto as any, mockAuditContext);

      // Expected: (25000 + 60000) = 85000 subtotal
      // Discount: 5000
      // Tax: 4750 + 10450 = 15200
      // Total: 85000 - 5000 + 15200 = 95200
      expect(result.financial.subtotalCents).toBe(85000);
      expect(result.financial.discountTotalCents).toBe(5000);
      expect(result.financial.taxTotalCents).toBe(15200);
      expect(result.financial.totalCents).toBe(95200);
    });
  });

  // ============================================================================
  // PLAN UPDATE TESTS
  // ============================================================================

  describe('updateTreatmentPlan', () => {
    it('should update a draft plan', async () => {
      const draftPlan = createMockPlan({ status: 'draft' });
      const dto = {
        title: 'Updated Title',
        description: 'Updated description',
      };

      repository.findByIdOrFail.mockResolvedValue(draftPlan);
      repository.update.mockResolvedValue(createMockPlan({ ...dto, version: 2 }));

      const result = await service.updateTreatmentPlan('plan-123', dto, 1, mockAuditContext);

      expect(repository.update).toHaveBeenCalledWith(
        'plan-123',
        expect.objectContaining({ title: 'Updated Title' }),
        1,
        mockAuditContext,
        'Treatment plan updated',
      );
      expect(result.version).toBe(2);
    });

    it('should reject updates to presented plans', async () => {
      const presentedPlan = createMockPlan({ status: 'presented' });
      repository.findByIdOrFail.mockResolvedValue(presentedPlan);

      await expect(
        service.updateTreatmentPlan('plan-123', { title: 'New' }, 1, mockAuditContext),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject updates to accepted plans', async () => {
      const acceptedPlan = createMockPlan({ status: 'accepted' });
      repository.findByIdOrFail.mockResolvedValue(acceptedPlan);

      await expect(
        service.updateTreatmentPlan('plan-123', { title: 'New' }, 1, mockAuditContext),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject updates to in_progress plans', async () => {
      const inProgressPlan = createMockPlan({ status: 'in_progress' });
      repository.findByIdOrFail.mockResolvedValue(inProgressPlan);

      await expect(
        service.updateTreatmentPlan('plan-123', { title: 'New' }, 1, mockAuditContext),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ============================================================================
  // STATUS TRANSITION TESTS
  // ============================================================================

  describe('presentTreatmentPlan', () => {
    it('should transition from draft to presented', async () => {
      const draftPlan = createMockPlan({ status: 'draft' });
      const presentedPlan = createMockPlan({
        status: 'presented',
        presentedAt: new Date(),
        presentedBy: mockAuditContext.userId,
      });

      repository.findByIdOrFail.mockResolvedValue(draftPlan);
      repository.updateStatus.mockResolvedValue(presentedPlan);

      const result = await service.presentTreatmentPlan(
        'plan-123',
        { presentationNotes: 'Discussed with patient', patientQuestions: [] },
        mockAuditContext,
      );

      expect(repository.updateStatus).toHaveBeenCalledWith(
        'plan-123',
        'presented',
        mockAuditContext,
        expect.objectContaining({
          reason: 'Plan presented to patient',
        }),
      );
      expect(result.status).toBe('presented');
    });

    it('should reject presenting empty plan', async () => {
      const emptyPlan = createMockPlan({
        status: 'draft',
        phases: [createMockPhase({ items: [] })],
      });
      repository.findByIdOrFail.mockResolvedValue(emptyPlan);

      await expect(
        service.presentTreatmentPlan('plan-123', { patientQuestions: [] }, mockAuditContext),
      ).rejects.toThrow(BadRequestException);
    });

    it('should emit TreatmentPlanPresented event', async () => {
      const draftPlan = createMockPlan({ status: 'draft' });
      repository.findByIdOrFail.mockResolvedValue(draftPlan);
      repository.updateStatus.mockResolvedValue(
        createMockPlan({ status: 'presented', presentedAt: new Date() }),
      );

      await service.presentTreatmentPlan('plan-123', { patientQuestions: [] }, mockAuditContext);

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'treatment.plan.presented',
        expect.objectContaining({
          treatmentPlanId: 'plan-123',
          patientId: 'patient-123',
          presentedBy: mockAuditContext.userId,
        }),
      );
    });

    it('should reject presenting non-draft plan', async () => {
      const inProgressPlan = createMockPlan({ status: 'in_progress' });
      repository.findByIdOrFail.mockResolvedValue(inProgressPlan);

      await expect(
        service.presentTreatmentPlan('plan-123', { patientQuestions: [] }, mockAuditContext),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('acceptTreatmentPlan', () => {
    it('should transition from presented to accepted', async () => {
      const presentedPlan = createMockPlan({ status: 'presented' });
      const acceptedPlan = createMockPlan({
        status: 'accepted',
        acceptedAt: new Date(),
      });

      repository.findByIdOrFail.mockResolvedValue(presentedPlan);
      repository.updateStatus.mockResolvedValue(acceptedPlan);

      const dto = {
        approvedBy: 'patient' as const,
        approverId: 'patient-123',
        approverName: 'John Doe',
        signatureRef: 'sig-123',
        approvalMethod: 'electronic' as const,
      };

      const result = await service.acceptTreatmentPlan('plan-123', dto, mockAuditContext);

      expect(repository.updateStatus).toHaveBeenCalledWith(
        'plan-123',
        'accepted',
        mockAuditContext,
        expect.objectContaining({
          reason: 'Plan accepted by patient',
        }),
      );
      expect(result.status).toBe('accepted');
    });

    it('should reject expired plans', async () => {
      const expiredPlan = createMockPlan({
        status: 'presented',
        expiresAt: new Date(Date.now() - 1000), // Expired
      });
      repository.findByIdOrFail.mockResolvedValue(expiredPlan);

      await expect(
        service.acceptTreatmentPlan(
          'plan-123',
          {
            approvedBy: 'patient',
            approverId: 'patient-123',
            approverName: 'John',
          },
          mockAuditContext,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should emit TreatmentPlanAccepted event', async () => {
      const presentedPlan = createMockPlan({ status: 'presented' });
      repository.findByIdOrFail.mockResolvedValue(presentedPlan);
      repository.updateStatus.mockResolvedValue(
        createMockPlan({ status: 'accepted', acceptedAt: new Date() }),
      );

      await service.acceptTreatmentPlan(
        'plan-123',
        {
          approvedBy: 'patient',
          approverId: 'patient-123',
          approverName: 'John',
        },
        mockAuditContext,
      );

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'treatment.plan.accepted',
        expect.objectContaining({
          treatmentPlanId: 'plan-123',
          acceptedBy: 'patient-123',
          approvalType: 'patient',
        }),
      );
    });

    it('should reject accepting non-presented plan', async () => {
      const draftPlan = createMockPlan({ status: 'draft' });
      repository.findByIdOrFail.mockResolvedValue(draftPlan);

      await expect(
        service.acceptTreatmentPlan(
          'plan-123',
          {
            approvedBy: 'patient',
            approverId: 'patient-123',
            approverName: 'John',
          },
          mockAuditContext,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should validate selected alternative exists', async () => {
      const presentedPlan = createMockPlan({ status: 'presented' });
      repository.findByIdOrFail.mockResolvedValue(presentedPlan);

      await expect(
        service.acceptTreatmentPlan(
          'plan-123',
          {
            approvedBy: 'patient',
            approverId: 'patient-123',
            approverName: 'John',
            selectedAlternativeId: 'non-existent-alt',
          },
          mockAuditContext,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('declineTreatmentPlan', () => {
    it('should transition from presented to cancelled with decline reason', async () => {
      const presentedPlan = createMockPlan({ status: 'presented' });
      const cancelledPlan = createMockPlan({
        status: 'cancelled',
        cancelledAt: new Date(),
        cancellationReason: 'Too expensive',
      });

      repository.findByIdOrFail.mockResolvedValue(presentedPlan);
      repository.updateStatus.mockResolvedValue(cancelledPlan);

      const result = await service.declineTreatmentPlan(
        'plan-123',
        {
          reason: 'Too expensive',
          requestAlternative: true,
          concerns: ['price', 'timing'],
        },
        mockAuditContext,
      );

      expect(result.status).toBe('cancelled');
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'treatment.plan.declined',
        expect.objectContaining({
          treatmentPlanId: 'plan-123',
          reason: 'Too expensive',
          requestAlternative: true,
        }),
      );
    });

    it('should reject declining non-presented plan', async () => {
      const draftPlan = createMockPlan({ status: 'draft' });
      repository.findByIdOrFail.mockResolvedValue(draftPlan);

      await expect(
        service.declineTreatmentPlan(
          'plan-123',
          { reason: 'Test', requestAlternative: false, concerns: [] },
          mockAuditContext,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ============================================================================
  // PROCEDURE COMPLETION TESTS
  // ============================================================================

  describe('completeProcedureItem', () => {
    it('should mark item as completed', async () => {
      const inProgressPlan = createMockPlan({
        status: 'in_progress',
        phases: [
          createMockPhase({
            _id: { toString: () => 'phase-1' } as any,
            items: [
              createMockItem({
                _id: { toString: () => 'item-1' } as any,
                status: 'scheduled',
              }),
            ],
          }),
        ],
      });

      const completedPlan = createMockPlan({
        status: 'in_progress',
        phases: [
          createMockPhase({
            items: [
              createMockItem({
                status: 'completed',
                completedAt: new Date(),
              }),
            ],
          }),
        ],
      });

      repository.findByIdOrFail.mockResolvedValue(inProgressPlan);
      repository.completeItem.mockResolvedValue(completedPlan);

      const result = await service.completeProcedureItem(
        'plan-123',
        'phase-1',
        'item-1',
        {
          materialsUsed: [],
          outcome: 'successful',
        },
        mockAuditContext,
      );

      expect(repository.completeItem).toHaveBeenCalledWith(
        'plan-123',
        'phase-1',
        'item-1',
        expect.objectContaining({
          completedBy: mockAuditContext.userId,
        }),
        mockAuditContext,
      );
    });

    it('should emit TreatmentProcedureCompleted event', async () => {
      const inProgressPlan = createMockPlan({
        status: 'in_progress',
        phases: [
          createMockPhase({
            _id: { toString: () => 'phase-1' } as any,
            items: [
              createMockItem({
                _id: { toString: () => 'item-1' } as any,
                status: 'scheduled',
              }),
            ],
          }),
        ],
      });

      repository.findByIdOrFail.mockResolvedValue(inProgressPlan);
      repository.completeItem.mockResolvedValue(createMockPlan({ status: 'in_progress' }));

      await service.completeProcedureItem(
        'plan-123',
        'phase-1',
        'item-1',
        { materialsUsed: [], outcome: 'successful' },
        mockAuditContext,
      );

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'treatment.procedure.completed',
        expect.objectContaining({
          treatmentPlanId: 'plan-123',
          phaseId: 'phase-1',
          itemId: 'item-1',
          procedureCode: 'D2391',
        }),
      );
    });

    it('should reject completing already completed item', async () => {
      const inProgressPlan = createMockPlan({
        status: 'in_progress',
        phases: [
          createMockPhase({
            _id: { toString: () => 'phase-1' } as any,
            items: [
              createMockItem({
                _id: { toString: () => 'item-1' } as any,
                status: 'completed',
              }),
            ],
          }),
        ],
      });

      repository.findByIdOrFail.mockResolvedValue(inProgressPlan);

      await expect(
        service.completeProcedureItem(
          'plan-123',
          'phase-1',
          'item-1',
          { materialsUsed: [], outcome: 'successful' },
          mockAuditContext,
        ),
      ).rejects.toThrow(ConflictException);
    });

    it('should reject completing cancelled item', async () => {
      const inProgressPlan = createMockPlan({
        status: 'in_progress',
        phases: [
          createMockPhase({
            _id: { toString: () => 'phase-1' } as any,
            items: [
              createMockItem({
                _id: { toString: () => 'item-1' } as any,
                status: 'cancelled',
              }),
            ],
          }),
        ],
      });

      repository.findByIdOrFail.mockResolvedValue(inProgressPlan);

      await expect(
        service.completeProcedureItem(
          'plan-123',
          'phase-1',
          'item-1',
          { materialsUsed: [], outcome: 'successful' },
          mockAuditContext,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should enforce sequence requirements', async () => {
      const inProgressPlan = createMockPlan({
        status: 'in_progress',
        phases: [
          createMockPhase({
            _id: { toString: () => 'phase-1' } as any,
            sequenceRequired: true,
            items: [
              createMockItem({
                _id: { toString: () => 'item-1' } as any,
                status: 'planned',
                sortOrder: 0,
              }),
              createMockItem({
                _id: { toString: () => 'item-2' } as any,
                status: 'planned',
                sortOrder: 1,
              }),
            ],
          }),
        ],
      });

      repository.findByIdOrFail.mockResolvedValue(inProgressPlan);

      // Try to complete second item when first is not done
      await expect(
        service.completeProcedureItem(
          'plan-123',
          'phase-1',
          'item-2',
          { materialsUsed: [], outcome: 'successful' },
          mockAuditContext,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ============================================================================
  // PHASE/ITEM MANAGEMENT TESTS
  // ============================================================================

  describe('addPhase', () => {
    it('should add phase to draft plan', async () => {
      const draftPlan = createMockPlan({ status: 'draft' });
      const updatedPlan = createMockPlan({
        phases: [...draftPlan.phases, createMockPhase({ phaseNumber: 2 })],
      });

      repository.findByIdOrFail.mockResolvedValue(draftPlan);
      repository.update.mockResolvedValue(updatedPlan);

      const result = await service.addPhase(
        'plan-123',
        {
          phaseNumber: 2,
          name: 'Phase 2',
          items: [
            {
              procedureCode: 'D2750',
              procedureName: 'Crown',
              unitPriceCents: 150000,
            },
          ],
        } as any,
        mockAuditContext,
      );

      expect(result.phases).toHaveLength(2);
    });

    it('should reject adding phase to non-draft plan', async () => {
      const presentedPlan = createMockPlan({ status: 'presented' });
      repository.findByIdOrFail.mockResolvedValue(presentedPlan);

      await expect(
        service.addPhase(
          'plan-123',
          { phaseNumber: 2, name: 'Phase 2', items: [] } as any,
          mockAuditContext,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('removePhase', () => {
    it('should remove phase from draft plan', async () => {
      const draftPlan = createMockPlan({
        status: 'draft',
        phases: [
          createMockPhase({ _id: { toString: () => 'phase-1' } as any }),
          createMockPhase({ _id: { toString: () => 'phase-2' } as any }),
        ],
      });
      const updatedPlan = createMockPlan({
        phases: [draftPlan.phases[0]],
      });

      repository.findByIdOrFail.mockResolvedValue(draftPlan);
      repository.update.mockResolvedValue(updatedPlan);

      const result = await service.removePhase('plan-123', 'phase-2', mockAuditContext);

      expect(result.phases).toHaveLength(1);
    });

    it('should reject removing last phase', async () => {
      const draftPlan = createMockPlan({
        status: 'draft',
        phases: [createMockPhase({ _id: { toString: () => 'phase-1' } as any })],
      });

      repository.findByIdOrFail.mockResolvedValue(draftPlan);

      await expect(
        service.removePhase('plan-123', 'phase-1', mockAuditContext),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('addItemToPhase', () => {
    it('should add item and recalculate financials', async () => {
      const draftPlan = createMockPlan({
        status: 'draft',
        phases: [
          createMockPhase({
            _id: { toString: () => 'phase-1' } as any,
            items: [createMockItem()],
          }),
        ],
      });

      repository.findByIdOrFail.mockResolvedValue(draftPlan);
      repository.update.mockImplementation(async (_, data) => {
        return createMockPlan(data);
      });

      const result = await service.addItemToPhase(
        'plan-123',
        'phase-1',
        {
          procedureCode: 'D2392',
          procedureName: 'Filling 2',
          unitPriceCents: 30000,
          taxCents: 5700,
        } as any,
        mockAuditContext,
      );

      // Check item was added
      expect(result.phases[0].items).toHaveLength(2);
    });
  });

  // ============================================================================
  // ALTERNATIVES TESTS
  // ============================================================================

  describe('addAlternative', () => {
    it('should add alternative to draft plan', async () => {
      const draftPlan = createMockPlan({ status: 'draft', alternatives: [] });
      const updatedPlan = createMockPlan({
        alternatives: [
          {
            _id: { toString: () => 'alt-1' },
            name: 'Conservative Option',
            phases: [],
            advantages: ['Less invasive'],
            disadvantages: ['May need retreatment'],
            isRecommended: false,
            totalCents: 20000,
          },
        ] as any,
      });

      repository.findByIdOrFail.mockResolvedValue(draftPlan);
      repository.update.mockResolvedValue(updatedPlan);

      const result = await service.addAlternative(
        'plan-123',
        {
          name: 'Conservative Option',
          phases: [
            {
              phaseNumber: 1,
              name: 'Phase 1',
              items: [
                { procedureCode: 'D2391', procedureName: 'Filling', unitPriceCents: 20000 },
              ],
            },
          ],
          advantages: ['Less invasive'],
          disadvantages: ['May need retreatment'],
          isRecommended: false,
        } as any,
        mockAuditContext,
      );

      expect(result.alternatives).toHaveLength(1);
    });

    it('should unmark other alternatives when adding recommended', async () => {
      const draftPlan = createMockPlan({
        status: 'draft',
        alternatives: [
          {
            _id: { toString: () => 'alt-1' },
            name: 'Option A',
            isRecommended: true,
            phases: [],
            advantages: [],
            disadvantages: [],
            totalCents: 10000,
          },
        ] as any,
      });

      repository.findByIdOrFail.mockResolvedValue(draftPlan);
      repository.update.mockImplementation(async (_, data) => {
        return createMockPlan(data);
      });

      await service.addAlternative(
        'plan-123',
        {
          name: 'Option B',
          phases: [
            {
              phaseNumber: 1,
              name: 'Phase 1',
              items: [{ procedureCode: 'D2391', procedureName: 'Filling', unitPriceCents: 20000 }],
            },
          ],
          advantages: [],
          disadvantages: [],
          isRecommended: true,
        } as any,
        mockAuditContext,
      );

      expect(repository.update).toHaveBeenCalledWith(
        'plan-123',
        expect.objectContaining({
          alternatives: expect.arrayContaining([
            expect.objectContaining({ name: 'Option A', isRecommended: false }),
            expect.objectContaining({ name: 'Option B', isRecommended: true }),
          ]),
        }),
        expect.any(Number),
        mockAuditContext,
        expect.any(String),
      );
    });
  });

  // ============================================================================
  // FINANCIAL CALCULATION TESTS
  // ============================================================================

  describe('calculateFinancials', () => {
    it('should calculate correct totals with VAT', () => {
      const phases = [
        {
          items: [
            { quantity: 1, unitPriceCents: 25000, discountCents: 0, taxCents: 4750 },
            { quantity: 2, unitPriceCents: 15000, discountCents: 2000, taxCents: 5320 },
          ],
        },
      ] as any;

      const result = service.calculateFinancials(phases);

      // Subtotal: 25000 + 30000 = 55000
      // Discount: 0 + 2000 = 2000
      // Tax: 4750 + 5320 = 10070
      // Total: 55000 - 2000 + 10070 = 63070
      expect(result.subtotalCents).toBe(55000);
      expect(result.discountTotalCents).toBe(2000);
      expect(result.taxTotalCents).toBe(10070);
      expect(result.totalCents).toBe(63070);
    });

    it('should calculate payment plan installments', () => {
      const phases = [
        {
          items: [{ quantity: 1, unitPriceCents: 100000, discountCents: 0, taxCents: 19000 }],
        },
      ] as any;

      const result = service.calculateFinancials(phases, {
        paymentPlan: {
          downPaymentCents: 30000,
          installments: 6,
          frequency: 'monthly',
          interestRatePercent: 0,
        },
      });

      // Total: 119000
      // Patient responsibility: 119000 (no insurance)
      // Down payment: 30000
      // Remaining: 89000
      // 6 installments: ~14834 each
      expect(result.paymentPlan).toBeDefined();
      expect(result.paymentPlan?.downPaymentCents).toBe(30000);
      expect(result.paymentPlan?.installments).toBe(6);
      expect(result.paymentPlan?.installmentAmountCents).toBe(14834);
    });

    it('should apply insurance coverage correctly', () => {
      const phases = [
        {
          items: [{ quantity: 1, unitPriceCents: 100000, discountCents: 0, taxCents: 19000 }],
        },
      ] as any;

      const result = service.calculateFinancials(phases, {
        insuranceCoverageCents: 50000,
      });

      expect(result.insuranceCoverageCents).toBe(50000);
      expect(result.patientResponsibilityCents).toBe(69000); // 119000 - 50000
    });
  });

  // ============================================================================
  // REVISION TESTS
  // ============================================================================

  describe('reviseTreatmentPlan', () => {
    it('should create revision from presented plan', async () => {
      const presentedPlan = createMockPlan({
        status: 'presented',
        revisionNumber: 0,
      });
      const revisedPlan = createMockPlan({
        _id: { toString: () => 'plan-456' } as any,
        status: 'draft',
        previousVersionId: 'plan-123',
        revisionNumber: 1,
      });

      repository.findByIdOrFail.mockResolvedValue(presentedPlan);
      repository.create.mockResolvedValue(revisedPlan);

      const result = await service.reviseTreatmentPlan(
        'plan-123',
        { reason: 'Patient requested changes' },
        mockAuditContext,
      );

      expect(result.previousVersionId).toBe('plan-123');
      expect(result.revisionNumber).toBe(1);
      expect(result.status).toBe('draft');
    });

    it('should reject revision of draft plan', async () => {
      const draftPlan = createMockPlan({ status: 'draft' });
      repository.findByIdOrFail.mockResolvedValue(draftPlan);

      await expect(
        service.reviseTreatmentPlan(
          'plan-123',
          { reason: 'Test' },
          mockAuditContext,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should copy phases when not provided in DTO', async () => {
      const presentedPlan = createMockPlan({
        status: 'presented',
        phases: [createMockPhase({ name: 'Original Phase' })],
      });

      repository.findByIdOrFail.mockResolvedValue(presentedPlan);
      repository.create.mockImplementation(async (data) => {
        return createMockPlan(data);
      });

      const result = await service.reviseTreatmentPlan(
        'plan-123',
        { reason: 'Minor changes' },
        mockAuditContext,
      );

      expect(result.phases[0].name).toBe('Original Phase');
    });
  });

  // ============================================================================
  // CANCELLATION TESTS
  // ============================================================================

  describe('cancelTreatmentPlan', () => {
    it('should cancel plan with reason', async () => {
      const acceptedPlan = createMockPlan({ status: 'accepted' });
      const cancelledPlan = createMockPlan({
        status: 'cancelled',
        cancelledAt: new Date(),
        cancellationReason: 'Patient moved away',
      });

      repository.findByIdOrFail.mockResolvedValue(acceptedPlan);
      repository.updateStatus.mockResolvedValue(cancelledPlan);

      const result = await service.cancelTreatmentPlan(
        'plan-123',
        { reason: 'Patient moved away' },
        mockAuditContext,
      );

      expect(result.status).toBe('cancelled');
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'treatment.plan.cancelled',
        expect.objectContaining({
          reason: 'Patient moved away',
        }),
      );
    });

    it('should reject cancelling completed plan', async () => {
      const completedPlan = createMockPlan({ status: 'completed' });
      repository.findByIdOrFail.mockResolvedValue(completedPlan);

      await expect(
        service.cancelTreatmentPlan(
          'plan-123',
          { reason: 'Test' },
          mockAuditContext,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ============================================================================
  // DELETE TESTS
  // ============================================================================

  describe('deleteTreatmentPlan', () => {
    it('should soft delete draft plan', async () => {
      const draftPlan = createMockPlan({ status: 'draft' });
      repository.findByIdOrFail.mockResolvedValue(draftPlan);
      repository.softDelete.mockResolvedValue(
        createMockPlan({ deletedAt: new Date() } as any),
      );

      const result = await service.deleteTreatmentPlan(
        'plan-123',
        'Created in error',
        mockAuditContext,
      );

      expect(repository.softDelete).toHaveBeenCalledWith(
        'plan-123',
        mockAuditContext,
        'Created in error',
      );
    });

    it('should reject deleting accepted plan', async () => {
      const acceptedPlan = createMockPlan({ status: 'accepted' });
      repository.findByIdOrFail.mockResolvedValue(acceptedPlan);

      await expect(
        service.deleteTreatmentPlan('plan-123', 'Test', mockAuditContext),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject deleting in_progress plan', async () => {
      const inProgressPlan = createMockPlan({ status: 'in_progress' });
      repository.findByIdOrFail.mockResolvedValue(inProgressPlan);

      await expect(
        service.deleteTreatmentPlan('plan-123', 'Test', mockAuditContext),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
