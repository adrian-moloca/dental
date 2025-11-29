import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProfileService } from '../services/profile.service';
import { PatientAuthGuard } from '@/common/guards/patient-auth.guard';
import {
  CurrentPatient,
  CurrentPatientPayload,
} from '@/common/decorators/current-patient.decorator';

@ApiTags('portal/profile')
@Controller('portal/patient/profile')
@UseGuards(PatientAuthGuard)
@ApiBearerAuth()
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Get patient profile' })
  async getProfile(@CurrentPatient() patient: CurrentPatientPayload) {
    return this.profileService.getProfile(patient.patientId, {
      tenantId: patient.tenantId,
      organizationId: patient.organizationId,
      clinicId: patient.clinicId,
      patientId: patient.patientId,
    });
  }

  @Patch()
  @ApiOperation({ summary: 'Update patient profile' })
  async updateProfile(@Body() dto: any, @CurrentPatient() patient: CurrentPatientPayload) {
    return this.profileService.updateProfile(patient.patientId, dto, {
      tenantId: patient.tenantId,
      organizationId: patient.organizationId,
      clinicId: patient.clinicId,
      patientId: patient.patientId,
    });
  }

  @Get('preferences')
  @ApiOperation({ summary: 'Get patient preferences' })
  async getPreferences(@CurrentPatient() patient: CurrentPatientPayload) {
    return this.profileService.getPreferences(patient.patientId, {
      tenantId: patient.tenantId,
      organizationId: patient.organizationId,
      clinicId: patient.clinicId,
      patientId: patient.patientId,
    });
  }

  @Patch('preferences')
  @ApiOperation({ summary: 'Update patient preferences' })
  async updatePreferences(@Body() dto: any, @CurrentPatient() patient: CurrentPatientPayload) {
    return this.profileService.updatePreferences(patient.patientId, dto, {
      tenantId: patient.tenantId,
      organizationId: patient.organizationId,
      clinicId: patient.clinicId,
      patientId: patient.patientId,
    });
  }
}
