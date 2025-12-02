/**
 * Patients Repository
 *
 * Data access layer for patient entities with strict tenant isolation.
 * All queries automatically enforce tenant boundaries.
 *
 * @module modules/patients
 */

import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Patient, PatientDocument } from './entities/patient.schema';
import { NotFoundError, ConflictError } from '@dentalos/shared-errors';
import type { UUID } from '@dentalos/shared-types';

export interface PatientSearchCriteria {
  tenantId: string;
  clinicId?: string;
  search?: string;
  status?: string;
  assignedProviderId?: string;
  tags?: string[];
  flags?: string[];
  gender?: string;
  minAge?: number;
  maxAge?: number;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Patients Repository
 *
 * Handles all database operations for patients with:
 * - Tenant isolation on every query
 * - Soft delete support
 * - Full-text search
 * - Complex filtering
 * - Pagination
 */
@Injectable()
export class PatientsRepository {
  private readonly logger = new Logger(PatientsRepository.name);

  constructor(
    @InjectModel(Patient.name)
    private readonly patientModel: Model<PatientDocument>,
  ) {}

  /**
   * Create a new patient
   *
   * @param patientData - Patient data to create
   * @returns Created patient document
   * @throws {ConflictError} If patient with same ID already exists
   */
  async create(patientData: Partial<Patient>): Promise<PatientDocument> {
    try {
      const patient = new this.patientModel(patientData);
      return await patient.save();
    } catch (error: any) {
      if (error.code === 11000) {
        // Duplicate key error
        this.logger.warn(`Duplicate patient creation attempted: ${error.message}`);
        throw new ConflictError('Patient with this ID or patient number already exists');
      }
      throw error;
    }
  }

  /**
   * Find patient by ID with tenant isolation
   *
   * @param id - Patient ID
   * @param tenantId - Tenant ID for isolation
   * @param includeDeleted - Whether to include soft-deleted records
   * @returns Patient document or null
   */
  async findById(
    id: UUID,
    tenantId: string,
    includeDeleted = false,
  ): Promise<PatientDocument | null> {
    const query: FilterQuery<PatientDocument> = {
      id,
      tenantId,
    };

    if (!includeDeleted) {
      query.isDeleted = false;
    }

    return this.patientModel.findOne(query).exec();
  }

  /**
   * Find patient by ID with tenant isolation or throw error
   *
   * @param id - Patient ID
   * @param tenantId - Tenant ID for isolation
   * @returns Patient document
   * @throws {NotFoundError} If patient not found
   */
  async findByIdOrFail(id: UUID, tenantId: string): Promise<PatientDocument> {
    const patient = await this.findById(id, tenantId);

    if (!patient) {
      throw new NotFoundError(`Patient with ID ${id} not found`);
    }

    return patient;
  }

  /**
   * Update patient by ID with tenant isolation
   *
   * @param id - Patient ID
   * @param tenantId - Tenant ID for isolation
   * @param updateData - Data to update
   * @returns Updated patient document
   * @throws {NotFoundError} If patient not found
   */
  async update(id: UUID, tenantId: string, updateData: Partial<Patient>): Promise<PatientDocument> {
    const patient = await this.patientModel
      .findOneAndUpdate(
        { id, tenantId, isDeleted: false },
        { $set: { ...updateData, version: { $inc: 1 } } },
        { new: true, runValidators: true },
      )
      .exec();

    if (!patient) {
      throw new NotFoundError(`Patient with ID ${id} not found`);
    }

    return patient;
  }

  /**
   * Soft delete patient
   *
   * @param id - Patient ID
   * @param tenantId - Tenant ID for isolation
   * @param deletedBy - User ID who deleted the patient
   * @returns Deleted patient document
   * @throws {NotFoundError} If patient not found
   */
  async softDelete(id: UUID, tenantId: string, deletedBy?: string): Promise<PatientDocument> {
    const patient = await this.patientModel
      .findOneAndUpdate(
        { id, tenantId, isDeleted: false },
        {
          $set: {
            isDeleted: true,
            deletedAt: new Date(),
            deletedBy,
            status: 'archived',
          },
        },
        { new: true },
      )
      .exec();

    if (!patient) {
      throw new NotFoundError(`Patient with ID ${id} not found`);
    }

    return patient;
  }

  /**
   * Search patients with filters and pagination
   *
   * @param criteria - Search criteria
   * @param options - Pagination options
   * @returns Paginated patient results
   */
  async search(
    criteria: PatientSearchCriteria,
    options: PaginationOptions,
  ): Promise<PaginatedResult<PatientDocument>> {
    const { page = 1, limit = 20, sortBy = 'person.lastName', sortOrder = 'asc' } = options;

    // Build query with tenant isolation
    const query: FilterQuery<PatientDocument> = {
      tenantId: criteria.tenantId,
      isDeleted: false,
    };

    // Apply filters
    if (criteria.clinicId) {
      query.clinicId = criteria.clinicId;
    }

    if (criteria.status) {
      query.status = criteria.status;
    }

    if (criteria.assignedProviderId) {
      query.assignedProviderId = criteria.assignedProviderId;
    }

    if (criteria.tags && criteria.tags.length > 0) {
      query.tags = { $in: criteria.tags };
    }

    if (criteria.flags && criteria.flags.length > 0) {
      query['medical.flags'] = { $in: criteria.flags };
    }

    if (criteria.gender) {
      query['person.gender'] = criteria.gender;
    }

    // Age filter (requires date calculation)
    if (criteria.minAge !== undefined || criteria.maxAge !== undefined) {
      const today = new Date();

      if (criteria.maxAge !== undefined) {
        const minDate = new Date(
          today.getFullYear() - criteria.maxAge,
          today.getMonth(),
          today.getDate(),
        );
        query['person.dateOfBirth'] = { $gte: minDate };
      }

      if (criteria.minAge !== undefined) {
        const maxDate = new Date(
          today.getFullYear() - criteria.minAge,
          today.getMonth(),
          today.getDate(),
        );
        if (query['person.dateOfBirth']) {
          (query['person.dateOfBirth'] as any).$lte = maxDate;
        } else {
          query['person.dateOfBirth'] = { $lte: maxDate };
        }
      }
    }

    // Text search with partial matching support
    if (criteria.search && criteria.search.trim()) {
      const searchTerm = criteria.search.trim();
      // Use regex for partial matching on name, email, and phone
      // Escape special regex characters
      const escapedSearch = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(escapedSearch, 'i');

      query.$or = [
        { 'person.firstName': searchRegex },
        { 'person.lastName': searchRegex },
        { 'person.preferredName': searchRegex },
        { 'contacts.phones.number': searchRegex },
        { 'contacts.emails.address': searchRegex },
        { patientNumber: searchRegex },
      ];
    }

    // Calculate skip
    const skip = (page - 1) * limit;

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query
    const [data, total] = await Promise.all([
      this.patientModel.find(query).sort(sort).skip(skip).limit(limit).exec(),
      this.patientModel.countDocuments(query).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  /**
   * Find potential duplicate patients
   *
   * Uses deterministic matching on phone, email, and name+DOB combinations.
   *
   * @param tenantId - Tenant ID for isolation
   * @returns Groups of potential duplicate patients
   */
  async findDuplicates(tenantId: string): Promise<Array<PatientDocument[]>> {
    const duplicateGroups: Array<PatientDocument[]> = [];

    // Find duplicates by phone number
    const phoneAggregation = await this.patientModel.aggregate([
      {
        $match: {
          tenantId,
          isDeleted: false,
          'contacts.phones.0': { $exists: true },
        },
      },
      { $unwind: '$contacts.phones' },
      {
        $group: {
          _id: '$contacts.phones.number',
          patients: { $addToSet: '$id' },
          count: { $sum: 1 },
        },
      },
      { $match: { count: { $gt: 1 } } },
    ]);

    for (const group of phoneAggregation) {
      const patients = await this.patientModel
        .find({ id: { $in: group.patients }, tenantId })
        .exec();
      if (patients.length > 1) {
        duplicateGroups.push(patients);
      }
    }

    // Find duplicates by email
    const emailAggregation = await this.patientModel.aggregate([
      {
        $match: {
          tenantId,
          isDeleted: false,
          'contacts.emails.0': { $exists: true },
        },
      },
      { $unwind: '$contacts.emails' },
      {
        $group: {
          _id: '$contacts.emails.address',
          patients: { $addToSet: '$id' },
          count: { $sum: 1 },
        },
      },
      { $match: { count: { $gt: 1 } } },
    ]);

    for (const group of emailAggregation) {
      const patients = await this.patientModel
        .find({ id: { $in: group.patients }, tenantId })
        .exec();
      if (patients.length > 1) {
        duplicateGroups.push(patients);
      }
    }

    // Find duplicates by lastName + dateOfBirth + firstName (first 3 characters)
    const nameAggregation = await this.patientModel.aggregate([
      {
        $match: {
          tenantId,
          isDeleted: false,
        },
      },
      {
        $project: {
          id: 1,
          lastName: { $toLower: '$person.lastName' },
          firstThree: { $toLower: { $substr: ['$person.firstName', 0, 3] } },
          dob: '$person.dateOfBirth',
        },
      },
      {
        $group: {
          _id: {
            lastName: '$lastName',
            firstThree: '$firstThree',
            dob: '$dob',
          },
          patients: { $addToSet: '$id' },
          count: { $sum: 1 },
        },
      },
      { $match: { count: { $gt: 1 } } },
    ]);

    for (const group of nameAggregation) {
      const patients = await this.patientModel
        .find({ id: { $in: group.patients }, tenantId })
        .exec();
      if (patients.length > 1) {
        duplicateGroups.push(patients);
      }
    }

    // Remove duplicate groups (same patients appearing in multiple groups)
    const uniqueGroups = new Map<string, PatientDocument[]>();
    for (const group of duplicateGroups) {
      const key = group
        .map((p) => p.id)
        .sort()
        .join(',');
      if (!uniqueGroups.has(key)) {
        uniqueGroups.set(key, group);
      }
    }

    return Array.from(uniqueGroups.values());
  }

  /**
   * Find patient by phone number
   *
   * @param phoneNumber - Phone number to search
   * @param tenantId - Tenant ID for isolation
   * @returns Matching patients
   */
  async findByPhoneNumber(phoneNumber: string, tenantId: string): Promise<PatientDocument[]> {
    return this.patientModel
      .find({
        tenantId,
        isDeleted: false,
        'contacts.phones.number': phoneNumber,
      })
      .exec();
  }

  /**
   * Find patient by email
   *
   * @param email - Email to search
   * @param tenantId - Tenant ID for isolation
   * @returns Matching patients
   */
  async findByEmail(email: string, tenantId: string): Promise<PatientDocument[]> {
    return this.patientModel
      .find({
        tenantId,
        isDeleted: false,
        'contacts.emails.address': email.toLowerCase(),
      })
      .exec();
  }

  /**
   * Count patients by criteria
   *
   * @param criteria - Search criteria
   * @returns Count of matching patients
   */
  async count(criteria: Partial<PatientSearchCriteria>): Promise<number> {
    const query: FilterQuery<PatientDocument> = {
      tenantId: criteria.tenantId,
      isDeleted: false,
    };

    if (criteria.clinicId) {
      query.clinicId = criteria.clinicId;
    }

    if (criteria.status) {
      query.status = criteria.status;
    }

    return this.patientModel.countDocuments(query).exec();
  }

  /**
   * Find patient by Romanian CNP (national ID) search hash
   *
   * @param cnpSearchHash - Deterministic hash of CNP for lookup
   * @param tenantId - Tenant ID for isolation
   * @returns Patient document or null
   */
  async findByCnpHash(cnpSearchHash: string, tenantId: string): Promise<PatientDocument | null> {
    return this.patientModel
      .findOne({
        tenantId,
        isDeleted: false,
        'person.nationalId.searchHash': cnpSearchHash,
      })
      .exec();
  }

  /**
   * Check if CNP already exists in the system
   *
   * @param cnpSearchHash - Deterministic hash of CNP
   * @param tenantId - Tenant ID for isolation
   * @param excludePatientId - Patient ID to exclude (for updates)
   * @returns Whether CNP already exists
   */
  async cnpExists(
    cnpSearchHash: string,
    tenantId: string,
    excludePatientId?: UUID,
  ): Promise<boolean> {
    const query: FilterQuery<PatientDocument> = {
      tenantId,
      isDeleted: false,
      'person.nationalId.searchHash': cnpSearchHash,
    };

    if (excludePatientId) {
      query.id = { $ne: excludePatientId };
    }

    const count = await this.patientModel.countDocuments(query).exec();
    return count > 0;
  }
}
