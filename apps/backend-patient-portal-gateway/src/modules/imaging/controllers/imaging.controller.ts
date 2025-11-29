import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ImagingService } from '../services/imaging.service';
import { PatientAuthGuard } from '@/common/guards/patient-auth.guard';
import {
  CurrentPatient,
  CurrentPatientPayload,
} from '@/common/decorators/current-patient.decorator';

@ApiTags('portal/imaging')
@Controller('portal/patient/imaging')
@UseGuards(PatientAuthGuard)
@ApiBearerAuth()
export class ImagingController {
  constructor(private readonly imagingService: ImagingService) {}

  @Get()
  @ApiOperation({ summary: 'List imaging studies' })
  async listStudies(@CurrentPatient() patient: CurrentPatientPayload) {
    return this.imagingService.listStudies(patient.patientId, {
      tenantId: patient.tenantId,
      organizationId: patient.organizationId,
      clinicId: patient.clinicId,
      patientId: patient.patientId,
    });
  }

  @Get('studies/:id')
  @ApiOperation({ summary: 'Get imaging study details with viewer URL' })
  async getStudy(@Param('id') id: string, @CurrentPatient() patient: CurrentPatientPayload) {
    return this.imagingService.getStudy(id, {
      tenantId: patient.tenantId,
      organizationId: patient.organizationId,
      clinicId: patient.clinicId,
      patientId: patient.patientId,
    });
  }
}
