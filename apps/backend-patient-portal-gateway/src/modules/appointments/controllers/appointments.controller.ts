import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AppointmentsService } from '../services/appointments.service';
import { PatientAuthGuard } from '@/common/guards/patient-auth.guard';
import { CurrentPatient, CurrentPatientPayload } from '@/common/decorators/current-patient.decorator';

@ApiTags('portal/appointments')
@Controller('portal/patient/appointments')
@UseGuards(PatientAuthGuard)
@ApiBearerAuth()
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  @ApiOperation({ summary: 'List patient appointments' })
  async listAppointments(@CurrentPatient() patient: CurrentPatientPayload, @Query() params: any) {
    return this.appointmentsService.listAppointments(patient.patientId, {
      tenantId: patient.tenantId,
      organizationId: patient.organizationId,
      clinicId: patient.clinicId,
      patientId: patient.patientId,
    }, params);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get appointment details' })
  async getAppointment(@Param('id') id: string, @CurrentPatient() patient: CurrentPatientPayload) {
    return this.appointmentsService.getAppointment(id, {
      tenantId: patient.tenantId,
      organizationId: patient.organizationId,
      clinicId: patient.clinicId,
      patientId: patient.patientId,
    });
  }

  @Post()
  @ApiOperation({ summary: 'Book new appointment' })
  async createAppointment(@Body() dto: any, @CurrentPatient() patient: CurrentPatientPayload) {
    return this.appointmentsService.createAppointment({ ...dto, patientId: patient.patientId }, {
      tenantId: patient.tenantId,
      organizationId: patient.organizationId,
      clinicId: patient.clinicId,
      patientId: patient.patientId,
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Reschedule appointment' })
  async updateAppointment(@Param('id') id: string, @Body() dto: any, @CurrentPatient() patient: CurrentPatientPayload) {
    return this.appointmentsService.updateAppointment(id, dto, {
      tenantId: patient.tenantId,
      organizationId: patient.organizationId,
      clinicId: patient.clinicId,
      patientId: patient.patientId,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancel appointment' })
  async cancelAppointment(@Param('id') id: string, @CurrentPatient() patient: CurrentPatientPayload) {
    await this.appointmentsService.cancelAppointment(id, {
      tenantId: patient.tenantId,
      organizationId: patient.organizationId,
      clinicId: patient.clinicId,
      patientId: patient.patientId,
    });
  }
}
