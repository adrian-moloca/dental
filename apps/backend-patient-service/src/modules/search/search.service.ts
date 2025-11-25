/**
 * Search Service
 *
 * Advanced patient search with duplicate detection.
 * Uses the patients repository for actual search operations.
 *
 * @module modules/search
 */

import { Injectable } from '@nestjs/common';
import { PatientsRepository } from '../patients/patients.repository';

@Injectable()
export class SearchService {
  constructor(private readonly patientsRepository: PatientsRepository) {}

  /**
   * Find potential duplicate patients
   *
   * Wraps the repository's duplicate detection logic.
   */
  async findDuplicates(tenantId: string) {
    return this.patientsRepository.findDuplicates(tenantId);
  }

  /**
   * Search patients by phone number
   */
  async searchByPhone(phoneNumber: string, tenantId: string) {
    return this.patientsRepository.findByPhoneNumber(phoneNumber, tenantId);
  }

  /**
   * Search patients by email
   */
  async searchByEmail(email: string, tenantId: string) {
    return this.patientsRepository.findByEmail(email, tenantId);
  }
}
