/**
 * Auth Service Client
 *
 * Client for making requests to the backend-auth microservice.
 *
 * @module common/http/clients/auth-service-client
 */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpMicroserviceClient, TenantContext } from '../http-microservice.client';
import type { AppConfig } from '@/config/configuration';

export interface PatientRegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth: string;
  tenantId: string;
  organizationId?: string;
  clinicId?: string;
}

export interface PatientLoginDto {
  email: string;
  password: string;
  tenantId: string;
}

export interface MfaChallengeDto {
  method: 'sms' | 'email';
}

export interface MfaVerifyDto {
  code: string;
  sessionId: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
  };
}

export interface MfaChallengeResponse {
  sessionId: string;
  method: string;
  maskedDestination: string;
  expiresAt: string;
}

@Injectable()
export class AuthServiceClient {
  private readonly baseUrl: string;

  constructor(
    private readonly httpClient: HttpMicroserviceClient,
    private readonly configService: ConfigService<AppConfig, true>,
  ) {
    this.baseUrl = this.configService.get('microservices.authServiceUrl', {
      infer: true,
    });
  }

  /**
   * Register a new patient
   */
  async register(dto: PatientRegisterDto): Promise<AuthResponse> {
    const tenantContext: TenantContext = {
      tenantId: dto.tenantId,
      organizationId: dto.organizationId,
      clinicId: dto.clinicId,
    };

    return this.httpClient.post<AuthResponse>(
      this.baseUrl,
      '/api/auth/register/patient',
      tenantContext,
      dto,
    );
  }

  /**
   * Login a patient
   */
  async login(dto: PatientLoginDto): Promise<AuthResponse> {
    const tenantContext: TenantContext = {
      tenantId: dto.tenantId,
    };

    return this.httpClient.post<AuthResponse>(this.baseUrl, '/api/auth/login', tenantContext, dto);
  }

  /**
   * Request MFA challenge
   */
  async requestMfaChallenge(
    dto: MfaChallengeDto,
    tenantContext: TenantContext,
  ): Promise<MfaChallengeResponse> {
    return this.httpClient.post<MfaChallengeResponse>(
      this.baseUrl,
      '/api/auth/mfa/challenge',
      tenantContext,
      dto,
    );
  }

  /**
   * Verify MFA code
   */
  async verifyMfa(dto: MfaVerifyDto, tenantContext: TenantContext): Promise<AuthResponse> {
    return this.httpClient.post<AuthResponse>(
      this.baseUrl,
      '/api/auth/mfa/verify',
      tenantContext,
      dto,
    );
  }

  /**
   * Logout (invalidate token)
   */
  async logout(tenantContext: TenantContext): Promise<void> {
    await this.httpClient.post<void>(this.baseUrl, '/api/auth/logout', tenantContext);
  }

  /**
   * Get current user info
   */
  async getCurrentUser(tenantContext: TenantContext): Promise<any> {
    return this.httpClient.get<any>(this.baseUrl, '/api/auth/me', tenantContext);
  }
}
