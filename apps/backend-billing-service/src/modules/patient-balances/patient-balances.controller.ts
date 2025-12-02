import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { PatientBalancesService } from './patient-balances.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantIsolationGuard } from '../auth/guards/tenant-isolation.guard';

interface RequestWithTenant {
  tenantContext: {
    tenantId: string;
    organizationId: string;
    clinicId: string;
    userId?: string;
  };
}

@ApiTags('patient-balances')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantIsolationGuard)
@Controller('patient-balances')
export class PatientBalancesController {
  constructor(private readonly patientBalancesService: PatientBalancesService) {}

  @Get(':patientId')
  @ApiOperation({ summary: 'Get patient balance by patient ID' })
  @ApiParam({ name: 'patientId', description: 'The patient UUID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the patient balance information',
    schema: {
      type: 'object',
      properties: {
        patientId: { type: 'string' },
        currentBalance: { type: 'number' },
        totalInvoiced: { type: 'number' },
        totalPaid: { type: 'number' },
        overdueAmount: { type: 'number' },
        lastPaymentDate: { type: 'string', format: 'date-time', nullable: true },
        currency: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async getPatientBalance(
    @Param('patientId') patientId: string,
    @Request() req: RequestWithTenant,
  ) {
    const balance = await this.patientBalancesService.getBalance(patientId, req.tenantContext);

    return {
      patientId: balance.patientId,
      currentBalance: balance.currentBalance,
      totalInvoiced: balance.totalInvoiced,
      totalPaid: balance.totalPaid,
      overdueAmount: balance.overdueAmount,
      lastPaymentDate: balance.lastPaymentDate || null,
      currency: balance.currency,
    };
  }
}
