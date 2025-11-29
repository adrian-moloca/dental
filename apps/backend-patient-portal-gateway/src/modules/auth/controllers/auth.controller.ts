/**
 * Auth Controller
 *
 * Handles patient authentication endpoints.
 *
 * @module modules/auth/controllers/auth-controller
 */

import { Controller, Post, Get, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from '../services/auth.service';
import { PatientRegisterDto } from '../dto/register.dto';
import { PatientLoginDto } from '../dto/login.dto';
import { MfaChallengeDto, MfaVerifyDto } from '../dto/mfa.dto';
import { Public } from '@/common/decorators/public.decorator';
import {
  CurrentPatient,
  CurrentPatientPayload,
} from '@/common/decorators/current-patient.decorator';
import { PatientAuthGuard } from '@/common/guards/patient-auth.guard';

@ApiTags('portal/auth')
@Controller('portal/patient/auth')
@UseGuards(PatientAuthGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute
  @ApiOperation({ summary: 'Register a new patient' })
  @ApiResponse({ status: 201, description: 'Patient registered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async register(@Body() dto: PatientRegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  @ApiOperation({ summary: 'Login as a patient' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: PatientLoginDto) {
    return this.authService.login(dto);
  }

  @Post('mfa/challenge')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Request MFA challenge' })
  @ApiResponse({ status: 200, description: 'MFA challenge sent' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async requestMfaChallenge(
    @Body() dto: MfaChallengeDto,
    @CurrentPatient() patient: CurrentPatientPayload,
  ) {
    return this.authService.requestMfaChallenge(dto, {
      tenantId: patient.tenantId,
      organizationId: patient.organizationId,
      clinicId: patient.clinicId,
      patientId: patient.patientId,
    });
  }

  @Post('mfa/verify')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify MFA code' })
  @ApiResponse({ status: 200, description: 'MFA verification successful' })
  @ApiResponse({ status: 401, description: 'Invalid MFA code' })
  async verifyMfa(@Body() dto: MfaVerifyDto, @CurrentPatient() patient: CurrentPatientPayload) {
    return this.authService.verifyMfa(dto, {
      tenantId: patient.tenantId,
      organizationId: patient.organizationId,
      clinicId: patient.clinicId,
      patientId: patient.patientId,
    });
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout patient' })
  @ApiResponse({ status: 204, description: 'Logout successful' })
  async logout(@CurrentPatient() patient: CurrentPatientPayload) {
    await this.authService.logout({
      tenantId: patient.tenantId,
      organizationId: patient.organizationId,
      clinicId: patient.clinicId,
      patientId: patient.patientId,
    });
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current patient profile (aggregated)' })
  @ApiResponse({ status: 200, description: 'Patient profile retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCurrentPatient(@CurrentPatient() patient: CurrentPatientPayload) {
    return this.authService.getCurrentPatient({
      tenantId: patient.tenantId,
      organizationId: patient.organizationId,
      clinicId: patient.clinicId,
      patientId: patient.patientId,
    });
  }
}
