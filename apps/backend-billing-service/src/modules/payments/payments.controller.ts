import { Controller, Get, Post, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto, CreateRefundDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantIsolationGuard } from '../auth/guards/tenant-isolation.guard';

@ApiTags('payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantIsolationGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'Record a new payment' })
  async create(@Body() createPaymentDto: CreatePaymentDto, @Request() req: any) {
    return this.paymentsService.create(createPaymentDto, req.tenantContext);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  async findOne(@Param('id') id: string, @Request() req: any) {
    return this.paymentsService.findOne(id, req.tenantContext);
  }

  @Get()
  @ApiOperation({ summary: 'Get payments by invoice or patient' })
  async findPayments(
    @Query('invoiceId') invoiceId?: string,
    @Query('patientId') patientId?: string,
    @Request() req?: any,
  ) {
    if (invoiceId) {
      return this.paymentsService.findByInvoice(invoiceId, req.tenantContext);
    }
    if (patientId) {
      return this.paymentsService.findByPatient(patientId, req.tenantContext);
    }
    return [];
  }

  @Post('refund')
  @ApiOperation({ summary: 'Process a refund' })
  async refund(@Body() createRefundDto: CreateRefundDto, @Request() req: any) {
    return this.paymentsService.createRefund(createRefundDto, req.tenantContext);
  }
}
