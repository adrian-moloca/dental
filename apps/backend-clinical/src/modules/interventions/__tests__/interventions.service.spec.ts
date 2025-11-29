/**
 * Interventions Service Unit Tests
 *
 * Tests the business logic of the clinical interventions service.
 * Mocks repository and event emitter to test service logic in isolation.
 *
 * @module interventions/__tests__
 */

import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { InterventionsService } from '../interventions.service';
import { InterventionsRepository, TenantContext } from '../interventions.repository';
import { OdontogramService } from '../../odontogram/odontogram.service';
import { INTERVENTION_EVENTS } from '../events';
import { InterventionType } from '../entities/intervention.schema';

describe('InterventionsService', () => {
  let service: InterventionsService;
  let repository: jest.Mocked<InterventionsRepository>;
  let odontogramService: jest.Mocked<OdontogramService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  const mockTenantContext: TenantContext = {
    tenantId: 'tenant-123',
    organizationId: 'org-123',
    clinicId: 'clinic-123',
  };

  const mockRequestContext = {
    userId: 'user-123',
    userName: 'Dr. Smith',
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0',
  };

  const mockIntervention = {
    _id: { toString: () => 'intervention-123' },
    tenantId: 'tenant-123',
    patientId: 'patient-123',
    organizationId: 'org-123',
    clinicId: 'clinic-123',
    performedAt: new Date(),
    providerId: 'user-123',
    providerName: 'Dr. Smith',
    type: 'fluoride' as InterventionType,
    procedureCode: 'D1206',
    teeth: ['11', '12'],
    surfaces: [],
    title: 'Fluoride application',
    status: 'completed',
    isBillable: true,
    billedAmount: 50,
    followUpRequired: false,
    attachments: [],
    currency: 'RON',
    version: 1,
    createdBy: 'user-123',
  };

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByPatientId: jest.fn(),
      findByAppointmentId: jest.fn(),
      findByToothNumber: jest.fn(),
      update: jest.fn(),
      cancel: jest.fn(),
      softDelete: jest.fn(),
      recordHistory: jest.fn(),
    };

    const mockOdontogramService = {
      addToothCondition: jest.fn(),
    };

    const mockEventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InterventionsService,
        { provide: InterventionsRepository, useValue: mockRepository },
        { provide: OdontogramService, useValue: mockOdontogramService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<InterventionsService>(InterventionsService);
    repository = module.get(InterventionsRepository);
    odontogramService = module.get(OdontogramService);
    eventEmitter = module.get(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createIntervention', () => {
    const validInput = {
      type: 'fluoride' as InterventionType,
      title: 'Fluoride application',
      teeth: ['11', '12'],
      surfaces: [] as string[],
      attachments: [],
      followUpRequired: false,
      isBillable: true,
      billedAmount: 50,
    };

    it('should create an intervention successfully', async () => {
      repository.create.mockResolvedValue(mockIntervention as any);
      repository.recordHistory.mockResolvedValue({} as any);
      odontogramService.addToothCondition.mockResolvedValue({ conditionId: 'cond-123' } as any);

      const result = await service.createIntervention(
        'patient-123',
        validInput,
        mockTenantContext,
        mockRequestContext,
      );

      expect(result.intervention).toBeDefined();
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: mockTenantContext.tenantId,
          patientId: 'patient-123',
          type: 'fluoride',
          title: 'Fluoride application',
        }),
      );
      expect(repository.recordHistory).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        INTERVENTION_EVENTS.CREATED,
        expect.any(Object),
      );
    });

    it('should reject performedAt in the future', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      await expect(
        service.createIntervention(
          'patient-123',
          { ...validInput, performedAt: futureDate.toISOString() },
          mockTenantContext,
          mockRequestContext,
        ),
      ).rejects.toThrow();
    });

    it('should update odontogram when teeth are involved', async () => {
      repository.create.mockResolvedValue(mockIntervention as any);
      repository.recordHistory.mockResolvedValue({} as any);
      odontogramService.addToothCondition.mockResolvedValue({ conditionId: 'cond-123' } as any);

      const result = await service.createIntervention(
        'patient-123',
        validInput,
        mockTenantContext,
        mockRequestContext,
      );

      expect(odontogramService.addToothCondition).toHaveBeenCalled();
      expect(result.odontogramConditionId).toBeDefined();
    });

    it('should emit follow-up event when follow-up is required', async () => {
      const inputWithFollowUp = {
        ...validInput,
        followUpRequired: true,
        followUpDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        followUpNotes: 'Check patient response',
      };

      repository.create.mockResolvedValue({
        ...mockIntervention,
        followUpRequired: true,
        followUpDate: new Date(inputWithFollowUp.followUpDate),
      } as any);
      repository.recordHistory.mockResolvedValue({} as any);

      await service.createIntervention(
        'patient-123',
        inputWithFollowUp,
        mockTenantContext,
        mockRequestContext,
      );

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        INTERVENTION_EVENTS.FOLLOW_UP_REQUIRED,
        expect.any(Object),
      );
    });

    it('should set default CDT code for known intervention types', async () => {
      repository.create.mockResolvedValue(mockIntervention as any);
      repository.recordHistory.mockResolvedValue({} as any);

      await service.createIntervention(
        'patient-123',
        { ...validInput, procedureCode: undefined },
        mockTenantContext,
        mockRequestContext,
      );

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          procedureCode: 'D1206', // Default CDT for fluoride
        }),
      );
    });
  });

  describe('createQuickIntervention', () => {
    const quickInput = {
      type: 'sensitivity_test' as InterventionType,
      teeth: ['16'],
      notes: 'Patient reported mild sensitivity',
    };

    it('should create a quick intervention with auto-filled defaults', async () => {
      repository.create.mockResolvedValue({
        ...mockIntervention,
        type: 'sensitivity_test',
        teeth: ['16'],
      } as any);
      repository.recordHistory.mockResolvedValue({} as any);

      const result = await service.createQuickIntervention(
        'patient-123',
        quickInput,
        mockTenantContext,
        mockRequestContext,
      );

      expect(result.intervention).toBeDefined();
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'completed',
          isBillable: false,
          providerId: mockRequestContext.userId,
        }),
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        INTERVENTION_EVENTS.CREATED,
        expect.objectContaining({
          isQuickIntervention: true,
        }),
      );
    });
  });

  describe('getIntervention', () => {
    it('should return intervention when found', async () => {
      repository.findById.mockResolvedValue(mockIntervention as any);

      const result = await service.getIntervention('intervention-123', mockTenantContext);

      expect(result).toBeDefined();
      expect(repository.findById).toHaveBeenCalledWith(
        'intervention-123',
        mockTenantContext,
        false,
      );
    });

    it('should throw NotFoundException when intervention not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.getIntervention('nonexistent', mockTenantContext),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateIntervention', () => {
    const updateInput = {
      title: 'Updated title',
      version: 1,
    };

    it('should update intervention and emit event', async () => {
      repository.findById.mockResolvedValue(mockIntervention as any);
      repository.update.mockResolvedValue({
        ...mockIntervention,
        title: 'Updated title',
        version: 2,
      } as any);
      repository.recordHistory.mockResolvedValue({} as any);

      const result = await service.updateIntervention(
        'intervention-123',
        updateInput,
        mockTenantContext,
        mockRequestContext,
      );

      expect(result.title).toBe('Updated title');
      expect(repository.recordHistory).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        INTERVENTION_EVENTS.UPDATED,
        expect.objectContaining({
          interventionId: 'intervention-123',
          fieldsChanged: expect.arrayContaining(['title']),
        }),
      );
    });
  });

  describe('cancelIntervention', () => {
    const cancelInput = {
      reason: 'Patient requested cancellation',
      version: 1,
    };

    it('should cancel intervention and emit event', async () => {
      repository.findById.mockResolvedValue(mockIntervention as any);
      repository.cancel.mockResolvedValue({
        ...mockIntervention,
        status: 'cancelled',
        cancellationReason: cancelInput.reason,
      } as any);
      repository.recordHistory.mockResolvedValue({} as any);

      const result = await service.cancelIntervention(
        'intervention-123',
        cancelInput,
        mockTenantContext,
        mockRequestContext,
      );

      expect(result.status).toBe('cancelled');
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        INTERVENTION_EVENTS.CANCELLED,
        expect.objectContaining({
          interventionId: 'intervention-123',
          cancellationReason: cancelInput.reason,
        }),
      );
    });
  });

  describe('deleteIntervention', () => {
    const deleteInput = {
      reason: 'Record entered in error',
      version: 1,
    };

    it('should soft-delete intervention and emit event', async () => {
      repository.findById.mockResolvedValue(mockIntervention as any);
      repository.softDelete.mockResolvedValue({
        ...mockIntervention,
        deletedAt: new Date(),
        deletedBy: mockRequestContext.userId,
        deleteReason: deleteInput.reason,
      } as any);
      repository.recordHistory.mockResolvedValue({} as any);

      const result = await service.deleteIntervention(
        'intervention-123',
        deleteInput,
        mockTenantContext,
        mockRequestContext,
      );

      expect(result.deletedAt).toBeDefined();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        INTERVENTION_EVENTS.DELETED,
        expect.objectContaining({
          interventionId: 'intervention-123',
          deleteReason: deleteInput.reason,
        }),
      );
    });
  });

  describe('getInterventionTypes', () => {
    it('should return all intervention types with metadata', () => {
      const types = service.getInterventionTypes();

      expect(Array.isArray(types)).toBe(true);
      expect(types.length).toBeGreaterThan(0);
      expect(types[0]).toHaveProperty('type');
      expect(types[0]).toHaveProperty('labelEn');
      expect(types[0]).toHaveProperty('labelRo');
    });
  });

  describe('listPatientInterventions', () => {
    it('should return paginated interventions', async () => {
      const mockResult = {
        data: [mockIntervention],
        total: 1,
        offset: 0,
        limit: 50,
        hasMore: false,
      };
      repository.findByPatientId.mockResolvedValue(mockResult as any);

      const result = await service.listPatientInterventions(
        'patient-123',
        { limit: 50, offset: 0 },
        mockTenantContext,
      );

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should apply filters correctly', async () => {
      const mockResult = {
        data: [],
        total: 0,
        offset: 0,
        limit: 50,
        hasMore: false,
      };
      repository.findByPatientId.mockResolvedValue(mockResult as any);

      await service.listPatientInterventions(
        'patient-123',
        {
          limit: 50,
          offset: 0,
          type: 'fluoride',
          status: 'completed',
          isBillable: true,
        },
        mockTenantContext,
      );

      expect(repository.findByPatientId).toHaveBeenCalledWith(
        'patient-123',
        mockTenantContext,
        expect.objectContaining({
          type: 'fluoride',
          status: 'completed',
          isBillable: true,
        }),
      );
    });
  });

  describe('getToothInterventions', () => {
    it('should return interventions for a specific tooth', async () => {
      const mockResult = {
        data: [mockIntervention],
        total: 1,
        offset: 0,
        limit: 50,
        hasMore: false,
      };
      repository.findByToothNumber.mockResolvedValue(mockResult as any);

      const result = await service.getToothInterventions(
        'patient-123',
        '16',
        { limit: 50, offset: 0 },
        mockTenantContext,
      );

      expect(repository.findByToothNumber).toHaveBeenCalledWith(
        'patient-123',
        '16',
        mockTenantContext,
        expect.any(Object),
      );
      expect(result.data).toHaveLength(1);
    });
  });
});
