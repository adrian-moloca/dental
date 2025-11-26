import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  Res,
  HttpStatus,
  Logger,
  Header,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

import { EFacturaService } from './e-factura.service';
import {
  SubmitInvoiceRequestDto,
  RetrySubmissionRequestDto,
  CancelSubmissionRequestDto,
  ListSubmissionsQueryDto,
  EFacturaSubmissionResponseDto,
  EFacturaStatusResponseDto,
  PaginatedSubmissionsResponseDto,
  EFacturaStatisticsDto,
} from './dto';
import { TenantContext } from './interfaces/anaf-config.interface';
import { EFacturaSubmission, EFacturaSubmissionStatus } from './entities/e-factura-submission.schema';

// Placeholder decorators - replace with actual auth decorators from shared-auth package
// import { RequiresPermission } from '@dentalos/shared-auth';
// import { CurrentUser, CurrentTenant } from '@dentalos/shared-auth';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * Placeholder for tenant context extraction
 * In production, use @CurrentTenant() decorator from shared-auth
 */
function getTenantContext(req: any): TenantContext {
  // This would be populated by auth middleware
  return {
    tenantId: req.user?.tenantId || 'default-tenant',
    organizationId: req.user?.organizationId || 'default-org',
    clinicId: req.user?.clinicId || 'default-clinic',
    userId: req.user?.userId,
  };
}

/**
 * E-Factura Controller
 *
 * REST API endpoints for managing E-Factura submissions to Romania's ANAF system.
 * These endpoints handle the complete lifecycle of electronic invoice submissions.
 *
 * Endpoints:
 * - POST /invoices/:invoiceId/e-factura/submit - Submit invoice to ANAF
 * - GET /e-factura/submissions/:submissionId - Get submission details
 * - GET /e-factura/submissions/:submissionId/status - Check ANAF status
 * - POST /e-factura/submissions/:submissionId/retry - Retry failed submission
 * - POST /e-factura/submissions/:submissionId/cancel - Cancel pending submission
 * - GET /e-factura/submissions/:submissionId/download - Download signed invoice
 * - GET /e-factura/submissions - List all submissions with filters
 * - GET /e-factura/statistics - Get submission statistics
 * - GET /e-factura/submissions/:submissionId/logs - Get submission audit logs
 *
 * All endpoints require authentication and proper tenant context.
 */
@ApiTags('E-Factura')
@ApiBearerAuth()
@Controller()
// @UseGuards(JwtAuthGuard) // Uncomment when auth is configured
export class EFacturaController {
  private readonly logger = new Logger(EFacturaController.name);

  constructor(private readonly eFacturaService: EFacturaService) {}

  /**
   * Submit an invoice to ANAF E-Factura system
   */
  @Post('invoices/:invoiceId/e-factura/submit')
  @ApiOperation({
    summary: 'Submit invoice to E-Factura',
    description:
      'Submits an invoice to the Romanian ANAF E-Factura system. ' +
      'The invoice must be in ISSUED status and contain valid B2B information.',
  })
  @ApiParam({
    name: 'invoiceId',
    description: 'MongoDB ObjectId of the invoice',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 201,
    description: 'Submission created successfully',
    type: EFacturaSubmissionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invoice not eligible for E-Factura' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  @ApiResponse({ status: 409, description: 'Submission already exists' })
  async submitInvoice(
    @Param('invoiceId') invoiceId: string,
    @Body() dto: SubmitInvoiceRequestDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<EFacturaSubmissionResponseDto> {
    // In production, get context from @CurrentTenant() decorator
    const context = getTenantContext((res as any).req);

    this.logger.log(`API: Submit invoice ${invoiceId} to E-Factura`);

    const submission = await this.eFacturaService.submitInvoice(invoiceId, context, {
      idempotencyKey: dto.idempotencyKey,
      correlationId: dto.correlationId,
    });

    res.status(HttpStatus.CREATED);
    return this.mapSubmissionToResponse(submission);
  }

  /**
   * Get submission details
   */
  @Get('e-factura/submissions/:submissionId')
  @ApiOperation({
    summary: 'Get submission details',
    description: 'Retrieves the full details of an E-Factura submission.',
  })
  @ApiParam({
    name: 'submissionId',
    description: 'MongoDB ObjectId of the submission',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Submission details',
    type: EFacturaSubmissionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Submission not found' })
  async getSubmission(
    @Param('submissionId') submissionId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<EFacturaSubmissionResponseDto> {
    const context = getTenantContext((res as any).req);

    const submission = await this.eFacturaService.findOne(submissionId, context);
    return this.mapSubmissionToResponse(submission);
  }

  /**
   * Check submission status with ANAF
   */
  @Get('e-factura/submissions/:submissionId/status')
  @ApiOperation({
    summary: 'Check submission status',
    description:
      'Queries ANAF to get the current processing status of a submission. ' +
      'This will update the local record if the status has changed.',
  })
  @ApiParam({
    name: 'submissionId',
    description: 'MongoDB ObjectId of the submission',
  })
  @ApiResponse({
    status: 200,
    description: 'Current status information',
    type: EFacturaStatusResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Submission not found' })
  async checkStatus(
    @Param('submissionId') submissionId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<EFacturaStatusResponseDto> {
    const context = getTenantContext((res as any).req);

    return this.eFacturaService.checkStatus(submissionId, context);
  }

  /**
   * Retry a failed submission
   */
  @Post('e-factura/submissions/:submissionId/retry')
  @ApiOperation({
    summary: 'Retry failed submission',
    description:
      'Retries a failed or errored submission. ' +
      'Respects max retry limits unless force=true is specified.',
  })
  @ApiParam({
    name: 'submissionId',
    description: 'MongoDB ObjectId of the submission',
  })
  @ApiResponse({
    status: 200,
    description: 'Submission queued for retry',
    type: EFacturaSubmissionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Submission cannot be retried' })
  @ApiResponse({ status: 404, description: 'Submission not found' })
  async retrySubmission(
    @Param('submissionId') submissionId: string,
    @Body() dto: RetrySubmissionRequestDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<EFacturaSubmissionResponseDto> {
    const context = getTenantContext((res as any).req);

    this.logger.log(`API: Retry submission ${submissionId}`);

    const submission = await this.eFacturaService.retrySubmission(submissionId, context, {
      force: dto.force,
    });

    return this.mapSubmissionToResponse(submission);
  }

  /**
   * Cancel a pending submission
   */
  @Post('e-factura/submissions/:submissionId/cancel')
  @ApiOperation({
    summary: 'Cancel pending submission',
    description:
      'Cancels a pending or errored submission. ' +
      'Once submitted to ANAF, cancellation is not possible.',
  })
  @ApiParam({
    name: 'submissionId',
    description: 'MongoDB ObjectId of the submission',
  })
  @ApiResponse({ status: 200, description: 'Submission cancelled' })
  @ApiResponse({ status: 400, description: 'Submission cannot be cancelled' })
  @ApiResponse({ status: 404, description: 'Submission not found' })
  async cancelSubmission(
    @Param('submissionId') submissionId: string,
    @Body() dto: CancelSubmissionRequestDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ success: boolean; message: string }> {
    const context = getTenantContext((res as any).req);

    this.logger.log(`API: Cancel submission ${submissionId}`);

    await this.eFacturaService.cancelSubmission(submissionId, dto.reason, context);

    return {
      success: true,
      message: 'Submission cancelled successfully',
    };
  }

  /**
   * Download signed invoice
   */
  @Get('e-factura/submissions/:submissionId/download')
  @ApiOperation({
    summary: 'Download signed invoice',
    description:
      'Downloads the signed invoice from ANAF. ' +
      'Only available for submissions with SIGNED status.',
  })
  @ApiParam({
    name: 'submissionId',
    description: 'MongoDB ObjectId of the submission',
  })
  @ApiResponse({
    status: 200,
    description: 'Signed invoice file (ZIP or XML)',
    content: {
      'application/zip': {},
      'application/xml': {},
    },
  })
  @ApiResponse({ status: 400, description: 'Signed invoice not available' })
  @ApiResponse({ status: 404, description: 'Submission not found' })
  @Header('Content-Type', 'application/zip')
  async downloadSignedInvoice(
    @Param('submissionId') submissionId: string,
    @Res() res: Response,
  ): Promise<void> {
    this.logger.log(`API: Download signed invoice for ${submissionId}`);

    const buffer = await this.eFacturaService.downloadSignedInvoice(submissionId);

    // Get submission for filename
    const submission = await this.eFacturaService.findOne(submissionId, getTenantContext((res as any).req));

    const filename = `e-factura-${submission.invoiceNumber}-signed.zip`;

    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });

    res.send(buffer);
  }

  /**
   * List submissions with filters
   */
  @Get('e-factura/submissions')
  @ApiOperation({
    summary: 'List E-Factura submissions',
    description: 'Lists all E-Factura submissions with optional filters and pagination.',
  })
  @ApiQuery({ name: 'status', enum: EFacturaSubmissionStatus, required: false })
  @ApiQuery({ name: 'invoiceId', required: false })
  @ApiQuery({ name: 'invoiceNumber', required: false })
  @ApiQuery({ name: 'sellerCui', required: false })
  @ApiQuery({ name: 'fromDate', required: false, example: '2025-01-01T00:00:00.000Z' })
  @ApiQuery({ name: 'toDate', required: false, example: '2025-12-31T23:59:59.999Z' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of submissions',
    type: PaginatedSubmissionsResponseDto,
  })
  async listSubmissions(
    @Query() query: ListSubmissionsQueryDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<PaginatedSubmissionsResponseDto> {
    const context = getTenantContext((res as any).req);

    const result = await this.eFacturaService.findAll(
      {
        status: query.status,
        invoiceId: query.invoiceId,
        invoiceNumber: query.invoiceNumber,
        sellerCui: query.sellerCui,
        fromDate: query.fromDate,
        toDate: query.toDate,
        page: query.page || 1,
        limit: query.limit || 20,
      },
      context,
    );

    return {
      data: result.data.map((s) => this.mapSubmissionToResponse(s)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  /**
   * Get submission statistics
   */
  @Get('e-factura/statistics')
  @ApiOperation({
    summary: 'Get E-Factura statistics',
    description: 'Returns aggregate statistics about E-Factura submissions.',
  })
  @ApiResponse({
    status: 200,
    description: 'Submission statistics',
    type: EFacturaStatisticsDto,
  })
  async getStatistics(
    @Res({ passthrough: true }) res: Response,
  ): Promise<EFacturaStatisticsDto> {
    const context = getTenantContext((res as any).req);

    return this.eFacturaService.getStatistics(context);
  }

  /**
   * Get submission audit logs
   */
  @Get('e-factura/submissions/:submissionId/logs')
  @ApiOperation({
    summary: 'Get submission logs',
    description: 'Returns the audit log history for a submission.',
  })
  @ApiParam({
    name: 'submissionId',
    description: 'MongoDB ObjectId of the submission',
  })
  @ApiResponse({
    status: 200,
    description: 'List of audit log entries',
  })
  @ApiResponse({ status: 404, description: 'Submission not found' })
  async getSubmissionLogs(
    @Param('submissionId') submissionId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<any[]> {
    const context = getTenantContext((res as any).req);

    const logs = await this.eFacturaService.getLogs(submissionId, context);

    return logs.map((log) => ({
      id: log._id.toString(),
      action: log.action,
      success: log.success,
      errorMessage: log.errorMessage,
      errorCode: log.errorCode,
      uploadIndex: log.uploadIndex,
      performedBy: log.performedBy,
      durationMs: log.durationMs,
      createdAt: log.createdAt,
      metadata: log.metadata,
    }));
  }

  /**
   * Check OAuth token status for a CUI
   */
  @Get('e-factura/token-status/:cui')
  @ApiOperation({
    summary: 'Check OAuth token status',
    description: 'Checks the OAuth token status for a specific CUI.',
  })
  @ApiParam({
    name: 'cui',
    description: 'Company CUI (tax ID)',
    example: 'RO12345678',
  })
  @ApiResponse({
    status: 200,
    description: 'Token status information',
  })
  async getTokenStatus(
    @Param('cui') cui: string,
  ): Promise<{
    exists: boolean;
    valid: boolean;
    expiresAt?: Date;
    needsRefresh?: boolean;
    message: string;
  }> {
    const status = await this.eFacturaService.getTokenStatus(cui);

    let message = 'Token status retrieved';
    if (!status.exists) {
      message = 'No OAuth tokens found. Please complete the authorization flow.';
    } else if (!status.valid) {
      message = 'Token has expired. Please re-authorize.';
    } else if (status.needsRefresh) {
      message = 'Token is valid but will expire soon.';
    } else {
      message = 'Token is valid and active.';
    }

    return {
      ...status,
      message,
    };
  }

  /**
   * Map EFacturaSubmission to response DTO
   */
  private mapSubmissionToResponse(submission: EFacturaSubmission): EFacturaSubmissionResponseDto {
    return {
      id: submission._id.toString(),
      invoiceId: submission.invoiceId.toString(),
      invoiceNumber: submission.invoiceNumber,
      uploadIndex: submission.uploadIndex,
      downloadId: submission.downloadId,
      status: submission.status,
      submittedAt: submission.submittedAt,
      validatedAt: submission.validatedAt,
      signedAt: submission.signedAt,
      validationErrors: submission.validationErrors,
      lastErrorMessage: submission.lastErrorMessage,
      retryCount: submission.retryCount,
      nextRetryAt: submission.nextRetryAt,
      sellerCui: submission.sellerCui,
      buyerCui: submission.buyerCui,
      createdAt: submission.createdAt,
      updatedAt: submission.updatedAt,
    };
  }
}
