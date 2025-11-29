import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { Response } from 'express';
import { InvoicesService } from './invoices.service';
import {
  CreateInvoiceDto,
  UpdateInvoiceStatusDto,
  UpdateInvoiceDto,
  CreateInvoiceFromAppointmentDto,
  SendInvoiceDto,
  CancelInvoiceDto,
  InvoiceResponseDto,
  InvoiceGenerationResultDto,
  InvoiceCancellationResultDto,
} from './dto/create-invoice.dto';
import { InvoiceItemsService } from '../invoice-items/invoice-items.service';
import { CreateInvoiceItemDto } from '../invoice-items/dto/create-invoice-item.dto';
import { PaymentsService } from '../payments/payments.service';
import { CreatePaymentDto } from '../payments/dto/create-payment.dto';
import { InvoiceGenerationService } from './services/invoice-generation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantIsolationGuard } from '../auth/guards/tenant-isolation.guard';
import { InvoiceStatus } from '../../common/types';

@ApiTags('invoices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantIsolationGuard)
@Controller('invoices')
export class InvoicesController {
  constructor(
    private readonly invoicesService: InvoicesService,
    private readonly invoiceItemsService: InvoiceItemsService,
    private readonly paymentsService: PaymentsService,
    private readonly invoiceGenerationService: InvoiceGenerationService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new invoice' })
  async create(@Body() createInvoiceDto: CreateInvoiceDto, @Request() req: any) {
    return this.invoicesService.create(createInvoiceDto, req.tenantContext);
  }

  @Get()
  @ApiOperation({ summary: 'Get all invoices with filters and pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'patientId', required: false, type: String })
  @ApiQuery({ name: 'providerId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: InvoiceStatus })
  @ApiQuery({ name: 'fromDate', required: false, type: String })
  @ApiQuery({ name: 'toDate', required: false, type: String })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('patientId') patientId?: string,
    @Query('providerId') providerId?: string,
    @Query('status') status?: InvoiceStatus,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Request() req?: any,
  ) {
    const filters = {
      patientId,
      providerId,
      status,
      fromDate: fromDate ? new Date(fromDate) : undefined,
      toDate: toDate ? new Date(toDate) : undefined,
    };
    return this.invoicesService.findAllWithPagination(filters, { page, limit }, req.tenantContext);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice by ID' })
  async findOne(@Param('id') id: string, @Request() req: any) {
    return this.invoicesService.findOne(id, req.tenantContext);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update invoice (only if unpaid)' })
  async update(
    @Param('id') id: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
    @Request() req: any,
  ) {
    return this.invoicesService.update(id, updateInvoiceDto, req.tenantContext);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update invoice status' })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateInvoiceStatusDto,
    @Request() req: any,
  ) {
    return this.invoicesService.updateStatus(
      id,
      updateStatusDto.status,
      updateStatusDto.reason,
      req.tenantContext,
    );
  }

  @Post(':id/issue')
  @ApiOperation({ summary: 'Issue an invoice' })
  async issueInvoice(@Param('id') id: string, @Request() req: any) {
    return this.invoicesService.issueInvoice(id, req.tenantContext);
  }

  @Post(':id/items')
  @ApiOperation({ summary: 'Add line item to invoice' })
  async addItem(
    @Param('id') id: string,
    @Body() createInvoiceItemDto: CreateInvoiceItemDto,
    @Request() req: any,
  ) {
    return this.invoiceItemsService.create(id, createInvoiceItemDto, req.tenantContext);
  }

  @Delete(':id/items/:itemId')
  @ApiOperation({ summary: 'Remove line item from invoice' })
  async removeItem(@Param('id') id: string, @Param('itemId') itemId: string, @Request() req: any) {
    await this.invoiceItemsService.delete(id, itemId, req.tenantContext);
    return { message: 'Item removed successfully' };
  }

  @Get(':id/items')
  @ApiOperation({ summary: 'Get all line items for invoice' })
  async getItems(@Param('id') id: string, @Request() req: any) {
    return this.invoiceItemsService.findByInvoice(id, req.tenantContext);
  }

  @Post(':id/payments')
  @ApiOperation({ summary: 'Record payment for invoice' })
  async recordPayment(
    @Param('id') id: string,
    @Body() createPaymentDto: CreatePaymentDto,
    @Request() req: any,
  ) {
    // Ensure invoiceId matches the path parameter
    createPaymentDto.invoiceId = id;
    return this.paymentsService.create(createPaymentDto, req.tenantContext);
  }

  @Get(':id/payments')
  @ApiOperation({ summary: 'Get all payments for invoice' })
  async getPayments(@Param('id') id: string, @Request() req: any) {
    return this.paymentsService.findByInvoice(id, req.tenantContext);
  }

  @Get(':id/pdf')
  @ApiOperation({ summary: 'Generate PDF for invoice' })
  async generatePdf(@Param('id') id: string, @Request() req: any, @Res() res: Response) {
    // Placeholder implementation
    const invoice = await this.invoicesService.findOne(id, req.tenantContext);

    // For now, return JSON as placeholder
    // TODO: Implement actual PDF generation with proper library
    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="invoice-${invoice.invoiceNumber}.json"`,
    );
    res.send({
      message: 'PDF generation not yet implemented',
      invoice: invoice,
      note: 'This is a placeholder. Integrate a PDF library like pdfmake or puppeteer',
    });
  }

  // ============================================
  // Invoice Generation Endpoints
  // ============================================

  @Post('from-appointment/:appointmentId')
  @ApiOperation({
    summary: 'Create invoice from completed appointment',
    description:
      'Creates an invoice from a completed appointment with procedures. ' +
      'Includes automatic VAT calculation (19% for Romania), invoice numbering, and ledger entries.',
  })
  @ApiParam({ name: 'appointmentId', description: 'The ID of the completed appointment' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Invoice created successfully',
    type: InvoiceGenerationResultDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request or invoice already exists for this appointment',
  })
  @HttpCode(HttpStatus.CREATED)
  async createFromAppointment(
    @Param('appointmentId') appointmentId: string,
    @Body() dto: CreateInvoiceFromAppointmentDto,
    @Request() req: any,
  ) {
    const appointmentData = {
      appointmentId,
      patientId: dto.patientId,
      patientName: dto.patientName,
      providerId: dto.providerId,
      providerName: dto.providerName,
      completedAt: new Date().toISOString(),
      procedures: dto.procedures.map((p) => ({
        procedureId: p.procedureId,
        procedureCode: p.procedureCode,
        procedureName: p.procedureName,
        tooth: p.tooth,
        surfaces: p.surfaces,
        quantity: p.quantity || 1,
        unitPrice: p.unitPrice,
        discountPercent: p.discountPercent,
        providerId: p.providerId || dto.providerId,
        commissionRate: p.commissionRate,
        taxExempt: p.taxExempt,
        taxExemptionReason: p.taxExemptionReason,
      })),
      treatmentPlanId: dto.treatmentPlanId,
      customerName: dto.customerName,
      customerAddress: dto.customerAddress,
      customerTaxId: dto.customerTaxId,
      customerEmail: dto.customerEmail,
    };

    const result = await this.invoiceGenerationService.createFromAppointment(
      appointmentData,
      {
        series: dto.series,
        paymentTerms: dto.paymentTerms,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        notes: dto.notes,
        autoIssue: dto.autoIssue,
        currency: dto.currency,
      },
      req.tenantContext,
    );

    return {
      invoice: this.mapInvoiceToResponse(result.invoice),
      itemCount: result.invoiceItems.length,
      warnings: result.warnings,
    };
  }

  @Post(':id/send')
  @ApiOperation({
    summary: 'Send invoice to patient',
    description: 'Sends the invoice to the specified email address. Invoice must be issued first.',
  })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Invoice sent successfully',
    type: InvoiceResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot send draft invoice',
  })
  @HttpCode(HttpStatus.OK)
  async sendInvoice(@Param('id') id: string, @Body() dto: SendInvoiceDto, @Request() req: any) {
    const invoice = await this.invoiceGenerationService.sendInvoice(
      id,
      dto.email,
      req.tenantContext,
    );
    return this.mapInvoiceToResponse(invoice);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Cancel invoice (creates credit note)',
    description:
      'Cancels an invoice by creating a credit note. ' +
      'The original invoice is voided and a credit note is created to reverse it. ' +
      'This ensures proper audit trail for accounting purposes.',
  })
  @ApiParam({ name: 'id', description: 'Invoice ID to cancel' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Invoice cancelled successfully',
    type: InvoiceCancellationResultDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invoice is already voided or is a credit note',
  })
  @HttpCode(HttpStatus.OK)
  async cancelInvoice(@Param('id') id: string, @Body() dto: CancelInvoiceDto, @Request() req: any) {
    const result = await this.invoiceGenerationService.cancelInvoice(
      id,
      dto.reason,
      req.tenantContext,
    );

    return {
      originalInvoice: this.mapInvoiceToResponse(result.originalInvoice),
      creditNote: this.mapInvoiceToResponse(result.creditNote),
    };
  }

  // ============================================
  // Helper Methods
  // ============================================

  /**
   * Map invoice document to response DTO
   */
  private mapInvoiceToResponse(invoice: any): InvoiceResponseDto {
    return {
      id: invoice._id?.toString() || invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      patientId: invoice.patientId,
      providerId: invoice.providerId,
      status: invoice.status,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      subtotal: invoice.subtotal,
      taxAmount: invoice.taxAmount,
      discountAmount: invoice.discountAmount,
      total: invoice.total,
      amountPaid: invoice.amountPaid,
      balance: invoice.balance,
      currency: invoice.currency,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
    };
  }
}
