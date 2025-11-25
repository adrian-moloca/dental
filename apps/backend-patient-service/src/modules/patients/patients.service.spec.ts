/**
 * PatientsService Unit Tests
 *
 * Tests CRUD operations, validation, and business logic.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PatientsService } from './patients.service';
import { PatientsRepository } from './patients.repository';
import { CreatePatientDto } from './dto';
import { ValidationError, NotFoundError } from '@dentalos/shared-errors';
import type { UUID } from '@dentalos/shared-types';

describe('PatientsService', () => {
  let service: PatientsService;
  let repository: jest.Mocked<PatientsRepository>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  const mockTenantId = 'tenant-123';
  const mockOrganizationId = 'org-123';
  const mockUserId = 'user-123';
  const mockPatientId = 'patient-123' as UUID;

  const mockPatientDocument = {
    id: mockPatientId,
    tenantId: mockTenantId,
    organizationId: mockOrganizationId,
    clinicId: 'clinic-123',
    patientNumber: 'PAT-001',
    person: {
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'male',
    },
    contacts: {
      phones: [{ type: 'mobile', number: '+1234567890', isPrimary: true, isActive: true }],
      emails: [
        { type: 'personal', address: 'john@example.com', isPrimary: true, isVerified: false },
      ],
      addresses: [],
    },
    medical: {
      allergies: [],
      medications: [],
      conditions: [],
      flags: [],
    },
    tags: [],
    communicationPreferences: {
      preferredChannel: 'email',
      appointmentReminders: true,
      marketingConsent: false,
      recallReminders: true,
      smsNotifications: false,
      emailNotifications: true,
    },
    consent: {
      gdprConsent: true,
      gdprConsentDate: new Date(),
      marketingConsent: false,
      dataProcessingConsent: true,
      dataProcessingConsentDate: new Date(),
      treatmentConsent: false,
    },
    valueScore: 0,
    status: 'active',
    isDeleted: false,
    isAnonymized: false,
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientsService,
        {
          provide: PatientsRepository,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            findByIdOrFail: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
            search: jest.fn(),
            findDuplicates: jest.fn(),
            findByPhoneNumber: jest.fn(),
            findByEmail: jest.fn(),
            count: jest.fn(),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PatientsService>(PatientsService);
    repository = module.get(PatientsRepository) as jest.Mocked<PatientsRepository>;
    eventEmitter = module.get(EventEmitter2) as jest.Mocked<EventEmitter2>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto: CreatePatientDto = {
      clinicId: 'clinic-123',
      patientNumber: 'PAT-001',
      person: {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('1990-01-01'),
        gender: 'male',
      },
      contacts: {
        phones: [{ type: 'mobile', number: '+1234567890', isPrimary: true }],
        emails: [{ type: 'personal', address: 'john@example.com', isPrimary: true }],
      },
      consent: {
        gdprConsent: true,
        dataProcessingConsent: true,
      },
    };

    it('should create a patient successfully', async () => {
      repository.create.mockResolvedValue(mockPatientDocument);

      const result = await service.create(createDto, mockTenantId, mockOrganizationId, mockUserId);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: mockTenantId,
          organizationId: mockOrganizationId,
          clinicId: createDto.clinicId,
          person: expect.objectContaining({
            firstName: 'John',
            lastName: 'Doe',
          }),
          status: 'active',
          isDeleted: false,
          version: 1,
        }),
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith('patient.created', expect.any(Object));
      expect(result).toEqual(mockPatientDocument);
    });

    it('should throw ValidationError if GDPR consent is not provided', async () => {
      const invalidDto = { ...createDto, consent: { gdprConsent: false } };

      await expect(
        service.create(invalidDto, mockTenantId, mockOrganizationId, mockUserId),
      ).rejects.toThrow(ValidationError);

      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should throw ValidationError if date of birth is in the future', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const invalidDto = {
        ...createDto,
        person: { ...createDto.person, dateOfBirth: futureDate },
      };

      await expect(
        service.create(invalidDto, mockTenantId, mockOrganizationId, mockUserId),
      ).rejects.toThrow(ValidationError);

      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should throw ValidationError if date of birth is too far in the past', async () => {
      const ancientDate = new Date();
      ancientDate.setFullYear(ancientDate.getFullYear() - 200);
      const invalidDto = {
        ...createDto,
        person: { ...createDto.person, dateOfBirth: ancientDate },
      };

      await expect(
        service.create(invalidDto, mockTenantId, mockOrganizationId, mockUserId),
      ).rejects.toThrow(ValidationError);

      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should set consent dates when consent is granted', async () => {
      repository.create.mockResolvedValue(mockPatientDocument);

      await service.create(createDto, mockTenantId, mockOrganizationId, mockUserId);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          consent: expect.objectContaining({
            gdprConsent: true,
            gdprConsentDate: expect.any(Date),
            dataProcessingConsent: true,
            dataProcessingConsentDate: expect.any(Date),
          }),
        }),
      );
    });

    it('should warn if patient created without contact methods', async () => {
      const loggerWarnSpy = jest.spyOn(service['logger'], 'warn');
      const noContactDto = { ...createDto, contacts: undefined };
      repository.create.mockResolvedValue(mockPatientDocument);

      await service.create(noContactDto, mockTenantId, mockOrganizationId, mockUserId);

      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Patient created without email or phone contact'),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated patients', async () => {
      const mockResult = {
        data: [mockPatientDocument],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      };
      repository.search.mockResolvedValue(mockResult);

      const result = await service.findAll(mockTenantId, 1, 20);

      expect(repository.search).toHaveBeenCalledWith(
        { tenantId: mockTenantId },
        { page: 1, limit: 20, sortBy: 'person.lastName', sortOrder: 'asc' },
      );
      expect(result).toEqual(mockResult);
    });

    it('should use default pagination values', async () => {
      const mockResult = {
        data: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      };
      repository.search.mockResolvedValue(mockResult);

      await service.findAll(mockTenantId);

      expect(repository.search).toHaveBeenCalledWith(
        { tenantId: mockTenantId },
        { page: 1, limit: 20, sortBy: 'person.lastName', sortOrder: 'asc' },
      );
    });
  });

  describe('findById', () => {
    it('should return a patient by ID', async () => {
      repository.findByIdOrFail.mockResolvedValue(mockPatientDocument);

      const result = await service.findById(mockPatientId, mockTenantId);

      expect(repository.findByIdOrFail).toHaveBeenCalledWith(mockPatientId, mockTenantId);
      expect(result).toEqual(mockPatientDocument);
    });

    it('should throw NotFoundError if patient not found', async () => {
      repository.findByIdOrFail.mockRejectedValue(new NotFoundError('Patient not found'));

      await expect(service.findById(mockPatientId, mockTenantId)).rejects.toThrow(NotFoundError);
    });
  });

  describe('update', () => {
    const updateDto = {
      person: {
        firstName: 'Jane',
      },
      contacts: {
        emails: [{ type: 'personal', address: 'jane@example.com', isPrimary: true }],
      },
    };

    it('should update a patient successfully', async () => {
      repository.findByIdOrFail.mockResolvedValue(mockPatientDocument);
      const updatedPatient = {
        ...mockPatientDocument,
        person: { ...mockPatientDocument.person, firstName: 'Jane' },
      };
      repository.update.mockResolvedValue(updatedPatient);

      const result = await service.update(
        mockPatientId,
        updateDto,
        mockTenantId,
        mockOrganizationId,
        mockUserId,
      );

      expect(repository.findByIdOrFail).toHaveBeenCalledWith(mockPatientId, mockTenantId);
      expect(repository.update).toHaveBeenCalledWith(
        mockPatientId,
        mockTenantId,
        expect.objectContaining({
          updatedBy: mockUserId,
          person: expect.objectContaining({
            firstName: 'Jane',
          }),
        }),
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith('patient.updated', expect.any(Object));
      expect(result).toEqual(updatedPatient);
    });

    it('should throw NotFoundError if patient not found', async () => {
      repository.findByIdOrFail.mockRejectedValue(new NotFoundError('Patient not found'));

      await expect(
        service.update(mockPatientId, updateDto, mockTenantId, mockOrganizationId, mockUserId),
      ).rejects.toThrow(NotFoundError);

      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should merge existing data with updates', async () => {
      repository.findByIdOrFail.mockResolvedValue(mockPatientDocument);
      repository.update.mockResolvedValue(mockPatientDocument);

      await service.update(
        mockPatientId,
        { person: { firstName: 'Jane' } },
        mockTenantId,
        mockOrganizationId,
        mockUserId,
      );

      expect(repository.update).toHaveBeenCalledWith(
        mockPatientId,
        mockTenantId,
        expect.objectContaining({
          person: expect.objectContaining({
            firstName: 'Jane',
            lastName: 'Doe', // Existing data preserved
          }),
        }),
      );
    });
  });

  describe('softDelete', () => {
    it('should soft delete a patient successfully', async () => {
      const deletedPatient = { ...mockPatientDocument, isDeleted: true, deletedAt: new Date() };
      repository.softDelete.mockResolvedValue(deletedPatient);

      const result = await service.softDelete(
        mockPatientId,
        mockTenantId,
        mockOrganizationId,
        mockUserId,
      );

      expect(repository.softDelete).toHaveBeenCalledWith(mockPatientId, mockTenantId, mockUserId);
      expect(eventEmitter.emit).toHaveBeenCalledWith('patient.deleted', expect.any(Object));
      expect(result).toEqual(deletedPatient);
    });

    it('should throw NotFoundError if patient not found', async () => {
      repository.softDelete.mockRejectedValue(new NotFoundError('Patient not found'));

      await expect(
        service.softDelete(mockPatientId, mockTenantId, mockOrganizationId, mockUserId),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('search', () => {
    it('should search patients with criteria', async () => {
      const searchDto = {
        search: 'John',
        clinicId: 'clinic-123',
        status: 'active',
        page: 1,
        limit: 20,
      };
      const mockResult = {
        data: [mockPatientDocument],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      };
      repository.search.mockResolvedValue(mockResult);

      const result = await service.search(searchDto, mockTenantId);

      expect(repository.search).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: mockTenantId,
          search: 'John',
          clinicId: 'clinic-123',
          status: 'active',
        }),
        expect.objectContaining({
          page: 1,
          limit: 20,
        }),
      );
      expect(result).toEqual(mockResult);
    });

    it('should handle empty search results', async () => {
      const mockResult = {
        data: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      };
      repository.search.mockResolvedValue(mockResult);

      const result = await service.search({ page: 1, limit: 20 }, mockTenantId);

      expect(result.total).toBe(0);
      expect(result.data).toEqual([]);
    });
  });

  describe('findDuplicates', () => {
    it('should find duplicate patients', async () => {
      const duplicates = [
        [mockPatientDocument, { ...mockPatientDocument, id: 'patient-456' as UUID }],
      ];
      repository.findDuplicates.mockResolvedValue(duplicates);

      const result = await service.findDuplicates(mockTenantId);

      expect(repository.findDuplicates).toHaveBeenCalledWith(mockTenantId);
      expect(result).toEqual(duplicates);
    });
  });

  describe('merge', () => {
    const masterId = 'master-123' as UUID;
    const duplicateId = 'duplicate-456' as UUID;
    const masterPatient = { ...mockPatientDocument, id: masterId };
    const duplicatePatient = {
      ...mockPatientDocument,
      id: duplicateId,
      person: { ...mockPatientDocument.person, firstName: 'Jane' },
      medical: {
        allergies: ['peanuts'],
        medications: ['aspirin'],
        conditions: [],
        flags: [],
      },
    };

    it('should merge two patients successfully', async () => {
      repository.findByIdOrFail
        .mockResolvedValueOnce(masterPatient)
        .mockResolvedValueOnce(duplicatePatient);
      repository.update.mockResolvedValue(masterPatient);
      repository.softDelete.mockResolvedValue(duplicatePatient);

      const result = await service.merge(
        { masterId, duplicateId },
        mockTenantId,
        mockOrganizationId,
        mockUserId,
      );

      expect(repository.findByIdOrFail).toHaveBeenCalledTimes(2);
      expect(repository.update).toHaveBeenCalledWith(
        masterId,
        mockTenantId,
        expect.objectContaining({
          updatedBy: mockUserId,
        }),
      );
      expect(repository.softDelete).toHaveBeenCalledWith(duplicateId, mockTenantId, mockUserId);
      expect(eventEmitter.emit).toHaveBeenCalledWith('patient.merged', expect.any(Object));
      expect(result).toEqual(masterPatient);
    });

    it('should throw ValidationError if merging same patient', async () => {
      await expect(
        service.merge(
          { masterId, duplicateId: masterId },
          mockTenantId,
          mockOrganizationId,
          mockUserId,
        ),
      ).rejects.toThrow(ValidationError);

      expect(repository.findByIdOrFail).not.toHaveBeenCalled();
    });

    it('should combine medical information from both patients', async () => {
      repository.findByIdOrFail
        .mockResolvedValueOnce(masterPatient)
        .mockResolvedValueOnce(duplicatePatient);
      repository.update.mockResolvedValue(masterPatient);
      repository.softDelete.mockResolvedValue(duplicatePatient);

      await service.merge({ masterId, duplicateId }, mockTenantId, mockOrganizationId, mockUserId);

      expect(repository.update).toHaveBeenCalledWith(
        masterId,
        mockTenantId,
        expect.objectContaining({
          medical: expect.objectContaining({
            allergies: expect.arrayContaining(['peanuts']),
            medications: expect.arrayContaining(['aspirin']),
          }),
        }),
      );
    });
  });

  describe('calculateValueScore', () => {
    it('should return 0 as stub implementation', () => {
      const score = service.calculateValueScore(mockPatientDocument);
      expect(score).toBe(0);
    });
  });
});
