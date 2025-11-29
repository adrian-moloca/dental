import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BillingService } from '../services/billing.service';
import { PatientAuthGuard } from '@/common/guards/patient-auth.guard';
import {
  CurrentPatient,
  CurrentPatientPayload,
} from '@/common/decorators/current-patient.decorator';

@ApiTags('portal/billing')
@Controller('portal/patient/billing')
@UseGuards(PatientAuthGuard)
@ApiBearerAuth()
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('invoices')
  @ApiOperation({ summary: 'List invoices' })
  async listInvoices(@CurrentPatient() patient: CurrentPatientPayload, @Query() params: any) {
    return this.billingService.listInvoices(
      patient.patientId,
      {
        tenantId: patient.tenantId,
        organizationId: patient.organizationId,
        clinicId: patient.clinicId,
        patientId: patient.patientId,
      },
      params,
    );
  }

  @Get('invoices/:id')
  @ApiOperation({ summary: 'Get invoice details' })
  async getInvoice(@Param('id') id: string, @CurrentPatient() patient: CurrentPatientPayload) {
    return this.billingService.getInvoice(id, {
      tenantId: patient.tenantId,
      organizationId: patient.organizationId,
      clinicId: patient.clinicId,
      patientId: patient.patientId,
    });
  }

  @Get('payments')
  @ApiOperation({ summary: 'List payments' })
  async listPayments(@CurrentPatient() patient: CurrentPatientPayload) {
    return this.billingService.listPayments(patient.patientId, {
      tenantId: patient.tenantId,
      organizationId: patient.organizationId,
      clinicId: patient.clinicId,
      patientId: patient.patientId,
    });
  }

  @Get('balance')
  @ApiOperation({ summary: 'Get current balance' })
  async getBalance(@CurrentPatient() patient: CurrentPatientPayload) {
    return this.billingService.getBalance(patient.patientId, {
      tenantId: patient.tenantId,
      organizationId: patient.organizationId,
      clinicId: patient.clinicId,
      patientId: patient.patientId,
    });
  }

  @Post('invoices/:id/pay')
  @ApiOperation({ summary: 'Pay invoice' })
  async payInvoice(
    @Param('id') id: string,
    @Body() dto: any,
    @CurrentPatient() patient: CurrentPatientPayload,
  ) {
    return this.billingService.payInvoice(
      { ...dto, invoiceId: id },
      {
        tenantId: patient.tenantId,
        organizationId: patient.organizationId,
        clinicId: patient.clinicId,
        patientId: patient.patientId,
      },
    );
  }
}
