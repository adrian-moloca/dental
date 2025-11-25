import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GdprService } from '../services/gdpr.service';
import { PatientAuthGuard } from '@/common/guards/patient-auth.guard';
import { CurrentPatient, CurrentPatientPayload } from '@/common/decorators/current-patient.decorator';

@ApiTags('portal/gdpr')
@Controller('portal/patient/gdpr')
@UseGuards(PatientAuthGuard)
@ApiBearerAuth()
export class GdprController {
  constructor(private readonly gdprService: GdprService) {}

  @Get('export')
  @ApiOperation({ summary: 'Export all patient data' })
  async exportData(@CurrentPatient() patient: CurrentPatientPayload) {
    return this.gdprService.exportData(patient.patientId, {
      tenantId: patient.tenantId,
      organizationId: patient.organizationId,
      clinicId: patient.clinicId,
      patientId: patient.patientId,
    });
  }

  @Post('request-deletion')
  @ApiOperation({ summary: 'Request account deletion' })
  async requestDeletion(@CurrentPatient() patient: CurrentPatientPayload) {
    return this.gdprService.requestDeletion(patient.patientId, {
      tenantId: patient.tenantId,
      organizationId: patient.organizationId,
      clinicId: patient.clinicId,
      patientId: patient.patientId,
    });
  }

  @Get('consents')
  @ApiOperation({ summary: 'List consents' })
  async getConsents(@CurrentPatient() patient: CurrentPatientPayload) {
    return this.gdprService.getConsents(patient.patientId, {
      tenantId: patient.tenantId,
      organizationId: patient.organizationId,
      clinicId: patient.clinicId,
      patientId: patient.patientId,
    });
  }
}
