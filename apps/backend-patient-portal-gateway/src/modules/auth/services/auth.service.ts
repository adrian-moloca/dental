/**
 * Auth Service
 *
 * Proxies authentication requests to backend-auth service.
 * Aggregates patient data from auth and patient services.
 *
 * @module modules/auth/services/auth-service
 */

import { Injectable, Logger } from '@nestjs/common';
import { AuthServiceClient } from '@/common/http/clients/auth-service.client';
import { PatientServiceClient } from '@/common/http/clients/patient-service.client';
import { TenantContext } from '@/common/http/http-microservice.client';
import { PatientRegisterDto } from '../dto/register.dto';
import { PatientLoginDto } from '../dto/login.dto';
import { MfaChallengeDto, MfaVerifyDto } from '../dto/mfa.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly authClient: AuthServiceClient,
    private readonly patientClient: PatientServiceClient,
  ) {}

  /**
   * Register a new patient
   */
  async register(dto: PatientRegisterDto) {
    this.logger.log({
      message: 'Registering new patient',
      email: dto.email,
      tenantId: dto.tenantId,
    });

    return this.authClient.register(dto);
  }

  /**
   * Login a patient
   */
  async login(dto: PatientLoginDto) {
    this.logger.log({
      message: 'Patient login attempt',
      email: dto.email,
      tenantId: dto.tenantId,
    });

    return this.authClient.login(dto);
  }

  /**
   * Request MFA challenge
   */
  async requestMfaChallenge(dto: MfaChallengeDto, tenantContext: TenantContext) {
    this.logger.log({
      message: 'Requesting MFA challenge',
      method: dto.method,
      patientId: tenantContext.patientId,
    });

    return this.authClient.requestMfaChallenge(dto, tenantContext);
  }

  /**
   * Verify MFA code
   */
  async verifyMfa(dto: MfaVerifyDto, tenantContext: TenantContext) {
    this.logger.log({
      message: 'Verifying MFA code',
      sessionId: dto.sessionId,
    });

    return this.authClient.verifyMfa(dto, tenantContext);
  }

  /**
   * Logout patient
   */
  async logout(tenantContext: TenantContext) {
    this.logger.log({
      message: 'Patient logout',
      patientId: tenantContext.patientId,
    });

    await this.authClient.logout(tenantContext);
  }

  /**
   * Get current patient profile (aggregated from auth + patient service)
   */
  async getCurrentPatient(tenantContext: TenantContext) {
    this.logger.log({
      message: 'Getting current patient profile',
      patientId: tenantContext.patientId,
    });

    // Get auth user info
    const authUser = await this.authClient.getCurrentUser(tenantContext);

    // Get patient profile if patientId exists
    let patientProfile = null;
    if (tenantContext.patientId) {
      try {
        patientProfile = await this.patientClient.getPatientById(
          tenantContext.patientId,
          tenantContext,
        );
      } catch (error) {
        this.logger.warn({
          message: 'Failed to fetch patient profile',
          patientId: tenantContext.patientId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Aggregate data
    return {
      ...authUser,
      profile: patientProfile,
    };
  }
}
