import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ClinicalService } from '../services/clinical.service';
import { PatientAuthGuard } from '@/common/guards/patient-auth.guard';
import { CurrentPatient, CurrentPatientPayload } from '@/common/decorators/current-patient.decorator';

@ApiTags('portal/clinical')
@Controller('portal/patient/clinical')
@UseGuards(PatientAuthGuard)
@ApiBearerAuth()
export class ClinicalController {
  constructor(private readonly clinicalService: ClinicalService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get clinical summary' })
  async getClinicalSummary(@CurrentPatient() patient: CurrentPatientPayload) {
    return this.clinicalService.getClinicalSummary(patient.patientId, {
      tenantId: patient.tenantId,
      organizationId: patient.organizationId,
      clinicId: patient.clinicId,
      patientId: patient.patientId,
    });
  }

  @Get('visits')
  @ApiOperation({ summary: 'List past visits' })
  async listVisits(@CurrentPatient() patient: CurrentPatientPayload) {
    return this.clinicalService.listVisits(patient.patientId, {
      tenantId: patient.tenantId,
      organizationId: patient.organizationId,
      clinicId: patient.clinicId,
      patientId: patient.patientId,
    });
  }

  @Get('visits/:id')
  @ApiOperation({ summary: 'Get visit details' })
  async getVisit(@Param('id') id: string, @CurrentPatient() patient: CurrentPatientPayload) {
    return this.clinicalService.getVisit(id, {
      tenantId: patient.tenantId,
      organizationId: patient.organizationId,
      clinicId: patient.clinicId,
      patientId: patient.patientId,
    });
  }

  @Get('treatment-plans')
  @ApiOperation({ summary: 'List treatment plans' })
  async listTreatmentPlans(@CurrentPatient() patient: CurrentPatientPayload) {
    return this.clinicalService.listTreatmentPlans(patient.patientId, {
      tenantId: patient.tenantId,
      organizationId: patient.organizationId,
      clinicId: patient.clinicId,
      patientId: patient.patientId,
    });
  }

  @Get('treatment-plans/:id')
  @ApiOperation({ summary: 'Get treatment plan details' })
  async getTreatmentPlan(@Param('id') id: string, @CurrentPatient() patient: CurrentPatientPayload) {
    return this.clinicalService.getTreatmentPlan(id, {
      tenantId: patient.tenantId,
      organizationId: patient.organizationId,
      clinicId: patient.clinicId,
      patientId: patient.patientId,
    });
  }
}
