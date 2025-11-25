import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { EngagementService } from '../services/engagement.service';
import { PatientAuthGuard } from '@/common/guards/patient-auth.guard';
import { CurrentPatient, CurrentPatientPayload } from '@/common/decorators/current-patient.decorator';

@ApiTags('portal/engagement')
@Controller('portal/patient/engagement')
@UseGuards(PatientAuthGuard)
@ApiBearerAuth()
export class EngagementController {
  constructor(private readonly engagementService: EngagementService) {}

  @Get('loyalty')
  @ApiOperation({ summary: 'Get loyalty points and tier' })
  async getLoyalty(@CurrentPatient() patient: CurrentPatientPayload) {
    return this.engagementService.getLoyalty(patient.patientId, {
      tenantId: patient.tenantId,
      organizationId: patient.organizationId,
      clinicId: patient.clinicId,
      patientId: patient.patientId,
    });
  }

  @Get('referrals')
  @ApiOperation({ summary: 'Get referral code and history' })
  async getReferrals(@CurrentPatient() patient: CurrentPatientPayload) {
    return this.engagementService.getReferrals(patient.patientId, {
      tenantId: patient.tenantId,
      organizationId: patient.organizationId,
      clinicId: patient.clinicId,
      patientId: patient.patientId,
    });
  }

  @Get('offers')
  @ApiOperation({ summary: 'Get personalized offers' })
  async getOffers(@CurrentPatient() patient: CurrentPatientPayload) {
    return this.engagementService.getOffers(patient.patientId, {
      tenantId: patient.tenantId,
      organizationId: patient.organizationId,
      clinicId: patient.clinicId,
      patientId: patient.patientId,
    });
  }

  @Post('feedback')
  @Throttle({ default: { limit: 5, ttl: 3600000 } })
  @ApiOperation({ summary: 'Submit feedback' })
  async submitFeedback(@Body() dto: any, @CurrentPatient() patient: CurrentPatientPayload) {
    return this.engagementService.submitFeedback(patient.patientId, dto, {
      tenantId: patient.tenantId,
      organizationId: patient.organizationId,
      clinicId: patient.clinicId,
      patientId: patient.patientId,
    });
  }

  @Post('nps')
  @Throttle({ default: { limit: 5, ttl: 3600000 } })
  @ApiOperation({ summary: 'Submit NPS score' })
  async submitNps(@Body() dto: any, @CurrentPatient() patient: CurrentPatientPayload) {
    return this.engagementService.submitNps(patient.patientId, dto, {
      tenantId: patient.tenantId,
      organizationId: patient.organizationId,
      clinicId: patient.clinicId,
      patientId: patient.patientId,
    });
  }
}
