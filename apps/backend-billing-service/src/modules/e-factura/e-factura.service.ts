import { Injectable, Logger, NotFoundException, Optional } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { v4 as uuidv4 } from 'uuid';

import {
  EFacturaSubmission,
  EFacturaSubmissionStatus,
} from './entities/e-factura-submission.schema';
import { EFacturaLog, EFacturaLogAction } from './entities/e-factura-log.schema';
import { Invoice, EFacturaStatus } from '../invoices/entities/invoice.entity';
import { InvoiceItem } from '../invoice-items/entities/invoice-item.entity';
import {
  TenantContext,
  EFacturaSellerInfo,
  EFacturaBuyerInfo,
} from './interfaces/anaf-config.interface';
import { EFacturaConfigType } from './config/e-factura.config';
import { EFacturaStatusResponseDto, EFacturaStatisticsDto, ListSubmissionsQueryInput } from './dto';
import { XmlGeneratorService, InvoiceLineItem } from './services/xml-generator.service';
import { AnafApiService } from './services/anaf-api.service';
import { AnafOAuthService } from './services/anaf-oauth.service';
import {
  XmlGenerationException,
  XmlValidationException,
  AnafApiException,
  InvoiceNotEligibleException,
  DuplicateSubmissionException,
  SubmissionNotFoundException,
  SubmissionNotCancellableException,
  SubmissionNotRetryableException,
  SignedInvoiceNotAvailableException,
  SellerConfigurationException,
  BuyerInfoMissingException,
} from './exceptions/e-factura.exceptions';
import { ClinicFiscalService } from './services/clinic-fiscal.service';
import { HealthcareVatService, VatTreatment } from './services/healthcare-vat.service';

/**
 * E-Factura Service
 *
 * Core service for managing E-Factura submissions to Romania's ANAF system.
 * This service handles the complete lifecycle of electronic invoice submissions
 * including creation, submission, status tracking, retries, and cancellation.
 *
 * Phase 2 Implementation:
 * - XML generation (UBL 2.1 format)
 * - ANAF API integration
 * - OAuth2 authentication
 * - Status polling
 * - Signed invoice download
 *
 * Key responsibilities:
 * - Submit invoices to ANAF E-Factura system
 * - Track submission status and handle state transitions
 * - Implement retry logic for failed submissions
 * - Maintain audit trail of all operations
 * - Ensure idempotent submissions
 */
@Injectable()
export class EFacturaService {
  private readonly logger = new Logger(EFacturaService.name);

  constructor(
    @InjectModel(EFacturaSubmission.name)
    private readonly submissionModel: Model<EFacturaSubmission>,
    @InjectModel(EFacturaLog.name)
    private readonly logModel: Model<EFacturaLog>,
    @InjectModel(Invoice.name)
    private readonly invoiceModel: Model<Invoice>,
    @InjectModel(InvoiceItem.name)
    private readonly invoiceItemModel: Model<InvoiceItem>,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
    @Optional() private readonly xmlGenerator?: XmlGeneratorService,
    @Optional() private readonly anafApi?: AnafApiService,
    @Optional() private readonly oauthService?: AnafOAuthService,
    @Optional() private readonly clinicFiscalService?: ClinicFiscalService,
    @Optional() private readonly healthcareVatService?: HealthcareVatService,
  ) {}

  /**
   * Get E-Factura configuration
   */
  private getConfig(): EFacturaConfigType {
    return this.configService.get<EFacturaConfigType>('efactura')!;
  }

  /**
   * Submit an invoice to ANAF E-Factura system
   *
   * This is the main entry point for submitting invoices. It:
   * 1. Validates the invoice exists and is eligible for submission
   * 2. Creates a submission record with idempotency protection
   * 3. Generates UBL XML
   * 4. Submits to ANAF API
   * 5. Updates submission status based on response
   *
   * @param invoiceId - MongoDB ObjectId of the invoice to submit
   * @param context - Tenant context for multi-tenancy isolation
   * @returns EFacturaSubmission record
   * @throws NotFoundException if invoice not found
   * @throws BadRequestException if invoice is not eligible for submission
   * @throws ConflictException if submission already exists for this invoice
   */
  async submitInvoice(
    invoiceId: string,
    context: TenantContext,
    options?: {
      idempotencyKey?: string;
      correlationId?: string;
    },
  ): Promise<EFacturaSubmission> {
    const correlationId = options?.correlationId || uuidv4();
    this.logger.log(`Submitting invoice ${invoiceId} to E-Factura`, { context, correlationId });

    // Fetch invoice and validate eligibility
    const invoice = await this.getInvoiceForSubmission(invoiceId, context);

    // Check for existing submission
    const existingSubmission = await this.findExistingSubmission(invoiceId, context);
    if (existingSubmission && !existingSubmission.canRetry) {
      throw new DuplicateSubmissionException(
        invoiceId,
        existingSubmission._id.toString(),
        existingSubmission.status,
      );
    }

    // Generate idempotency key
    const idempotencyKey =
      options?.idempotencyKey || `${context.tenantId}:${invoiceId}:${Date.now()}`;

    // Get seller and buyer information
    const seller = await this.getSellerInfo(context);
    const buyer = this.getBuyerInfo(invoice);

    // Create submission record
    const submission = new this.submissionModel({
      invoiceId: new Types.ObjectId(invoiceId),
      invoiceNumber: invoice.invoiceNumber,
      invoiceSeries: invoice.series || undefined,
      status: EFacturaSubmissionStatus.PENDING,
      idempotencyKey,
      correlationId,
      tenantId: context.tenantId,
      organizationId: context.organizationId,
      clinicId: context.clinicId,
      sellerCui: seller.cui,
      buyerCui: buyer.cui,
      invoiceTotal: invoice.total,
      currency: invoice.currency,
      isTest: this.getConfig().anaf.isTestEnvironment,
      createdBy: context.userId,
      retryCount: 0,
    });

    await submission.save();

    // Log the submission creation
    await this.createLog({
      submissionId: submission._id,
      action: EFacturaLogAction.SUBMIT,
      success: true,
      tenantId: context.tenantId,
      organizationId: context.organizationId,
      invoiceNumber: invoice.invoiceNumber,
      correlationId,
      metadata: { phase: 'creation', status: 'pending' },
    });

    // Emit event
    this.eventEmitter.emit('efactura.submission.created', {
      submissionId: submission._id.toString(),
      invoiceId,
      invoiceNumber: invoice.invoiceNumber,
      correlationId,
      ...context,
    });

    this.logger.log(
      `Created E-Factura submission ${submission._id} for invoice ${invoice.invoiceNumber}`,
    );

    // Phase 2: Generate XML and submit to ANAF
    if (this.xmlGenerator && this.anafApi) {
      try {
        await this.processSubmission(submission, invoice, seller, buyer, context);
      } catch (error) {
        // Update submission with error
        submission.status = EFacturaSubmissionStatus.ERROR;
        submission.lastErrorMessage = error instanceof Error ? error.message : String(error);
        submission.nextRetryAt = this.calculateNextRetryTime();
        await submission.save();

        await this.createLog({
          submissionId: submission._id,
          action: EFacturaLogAction.API_ERROR,
          success: false,
          tenantId: context.tenantId,
          organizationId: context.organizationId,
          invoiceNumber: invoice.invoiceNumber,
          correlationId,
          errorMessage: submission.lastErrorMessage,
          metadata: { error: submission.lastErrorMessage },
        });

        // Don't throw - return submission with error status
        this.logger.error(`Submission ${submission._id} failed: ${submission.lastErrorMessage}`);
      }
    }

    return submission;
  }

  /**
   * Process a submission - generate XML and submit to ANAF
   */
  private async processSubmission(
    submission: EFacturaSubmission,
    invoice: Invoice,
    seller: EFacturaSellerInfo,
    buyer: EFacturaBuyerInfo,
    context: TenantContext,
  ): Promise<void> {
    if (!this.xmlGenerator || !this.anafApi) {
      throw new Error('XML Generator or ANAF API service not available');
    }

    const config = this.getConfig();
    const startTime = Date.now();

    // Step 1: Generate XML
    this.logger.debug(`Generating XML for submission ${submission._id}`);

    const lineItems = await this.getInvoiceLineItems(invoice);
    let xml: string;

    try {
      xml = this.xmlGenerator.generateInvoiceXml(invoice, seller, buyer, lineItems);
    } catch (error) {
      throw new XmlGenerationException(
        `Failed to generate XML: ${error instanceof Error ? error.message : String(error)}`,
        { invoiceId: invoice._id.toString() },
      );
    }

    // Log XML generation
    await this.createLog({
      submissionId: submission._id,
      action: EFacturaLogAction.XML_GENERATION,
      success: true,
      tenantId: context.tenantId,
      organizationId: context.organizationId,
      invoiceNumber: invoice.invoiceNumber,
      correlationId: submission.correlationId,
      durationMs: Date.now() - startTime,
      metadata: { xmlLength: xml.length },
    });

    // Step 2: Validate XML locally
    if (config.features.validateBeforeSubmit) {
      const validation = this.xmlGenerator.validateXml(xml);
      if (!validation.valid) {
        throw new XmlValidationException(
          'XML validation failed before submission',
          validation.errors,
          { warnings: validation.warnings },
        );
      }

      // Log warnings if any
      if (validation.warnings.length > 0) {
        this.logger.warn(
          `XML validation warnings for ${submission._id}: ${JSON.stringify(validation.warnings)}`,
        );
      }
    }

    // Step 3: Store XML in submission
    submission.xmlContent = xml;
    await submission.save();

    // Step 4: Submit to ANAF
    this.logger.debug(`Submitting to ANAF for submission ${submission._id}`);

    const uploadResult = await this.anafApi.uploadInvoice(
      xml,
      seller.cui,
      submission.idempotencyKey,
    );

    // Log the API call
    await this.createLog({
      submissionId: submission._id,
      action: EFacturaLogAction.SUBMIT,
      success: uploadResult.success,
      tenantId: context.tenantId,
      organizationId: context.organizationId,
      invoiceNumber: invoice.invoiceNumber,
      correlationId: submission.correlationId,
      durationMs: uploadResult.requestDurationMs,
      metadata: {
        uploadIndex: uploadResult.uploadIndex,
        rawResponse: config.logging.logApiResponses ? uploadResult.rawResponse : undefined,
      },
    });

    if (!uploadResult.success) {
      throw new AnafApiException(
        uploadResult.errorMessage || 'ANAF upload failed',
        'UPLOAD_ERROR',
        uploadResult.rawResponse,
      );
    }

    // Step 5: Update submission with upload index
    submission.uploadIndex = uploadResult.uploadIndex;
    submission.status = EFacturaSubmissionStatus.SUBMITTED;
    submission.submittedAt = new Date();
    await submission.save();

    // Step 6: Update invoice with E-Factura status
    await this.updateInvoiceEFacturaStatus(invoice._id.toString(), {
      status: EFacturaStatus.SUBMITTED,
      uploadIndex: uploadResult.uploadIndex,
      submittedAt: submission.submittedAt,
      submissionId: submission._id,
    });

    // Emit event
    this.eventEmitter.emit('efactura.submission.submitted', {
      submissionId: submission._id.toString(),
      invoiceId: invoice._id.toString(),
      invoiceNumber: invoice.invoiceNumber,
      uploadIndex: uploadResult.uploadIndex,
      ...context,
    });

    this.logger.log(
      `Successfully submitted invoice ${invoice.invoiceNumber} to ANAF. ` +
        `Upload index: ${uploadResult.uploadIndex}`,
    );
  }

  /**
   * Check the status of an E-Factura submission
   *
   * Queries ANAF API to get the current status of a submission.
   * Updates the local submission record based on the response.
   *
   * @param submissionId - MongoDB ObjectId of the submission
   * @returns Status information
   */
  async checkStatus(
    submissionId: string,
    _context?: TenantContext,
  ): Promise<EFacturaStatusResponseDto> {
    this.logger.log(`Checking status for submission ${submissionId}`);

    const submission = await this.submissionModel.findById(submissionId);
    if (!submission) {
      throw new SubmissionNotFoundException(submissionId);
    }

    // If submission has an upload index and is in a non-terminal state, query ANAF
    if (
      this.anafApi &&
      submission.uploadIndex &&
      !this.isTerminalStatus(submission.status) &&
      submission.status !== EFacturaSubmissionStatus.PENDING
    ) {
      await this.pollAnafStatus(submission);
    }

    const response: EFacturaStatusResponseDto = {
      submissionId: submission._id.toString(),
      status: submission.status,
      uploadIndex: submission.uploadIndex,
      downloadId: submission.downloadId,
      validationErrors: submission.validationErrors,
      message: this.getStatusMessage(submission.status),
      isTerminal: this.isTerminalStatus(submission.status),
      canDownload: submission.status === EFacturaSubmissionStatus.SIGNED && !!submission.downloadId,
    };

    // Log the status check
    await this.createLog({
      submissionId: submission._id,
      action: EFacturaLogAction.STATUS_CHECK,
      success: true,
      tenantId: submission.tenantId,
      organizationId: submission.organizationId,
      invoiceNumber: submission.invoiceNumber,
      uploadIndex: submission.uploadIndex,
      metadata: { currentStatus: submission.status },
    });

    return response;
  }

  /**
   * Poll ANAF for submission status and update local record
   */
  private async pollAnafStatus(submission: EFacturaSubmission): Promise<void> {
    if (!submission.uploadIndex || !this.anafApi) {
      return;
    }

    const statusResult = await this.anafApi.checkStatus(
      submission.uploadIndex,
      submission.sellerCui,
    );

    // Update submission based on ANAF response
    if (statusResult.status === 'ok' && statusResult.downloadId) {
      submission.status = EFacturaSubmissionStatus.SIGNED;
      submission.downloadId = statusResult.downloadId;
      submission.signedAt = new Date();

      // Download and store signed XML if configured
      if (this.getConfig().features.storeSignedXml) {
        try {
          const downloadResult = await this.anafApi.downloadSignedInvoice(
            statusResult.downloadId,
            submission.sellerCui,
          );
          if (downloadResult.success && downloadResult.data) {
            submission.signedXmlContent = downloadResult.data.toString('base64');
          }
        } catch (error) {
          this.logger.warn(`Failed to download signed XML for ${submission._id}: ${error}`);
        }
      }

      // Update invoice status
      await this.updateInvoiceEFacturaStatus(submission.invoiceId.toString(), {
        status: EFacturaStatus.SIGNED,
        downloadId: statusResult.downloadId,
        signedAt: submission.signedAt,
      });

      // Emit success event
      this.eventEmitter.emit('efactura.submission.signed', {
        submissionId: submission._id.toString(),
        invoiceNumber: submission.invoiceNumber,
        downloadId: statusResult.downloadId,
      });
    } else if (statusResult.status === 'error') {
      submission.status = EFacturaSubmissionStatus.REJECTED;
      submission.validationErrors = statusResult.errors.map((e) => ({
        code: e.code,
        message: e.message,
        field: e.field,
      }));
      submission.lastErrorMessage = statusResult.errors[0]?.message;

      // Update invoice status
      await this.updateInvoiceEFacturaStatus(submission.invoiceId.toString(), {
        status: EFacturaStatus.REJECTED,
        lastError: submission.lastErrorMessage,
      });

      // Emit rejection event
      this.eventEmitter.emit('efactura.submission.rejected', {
        submissionId: submission._id.toString(),
        invoiceNumber: submission.invoiceNumber,
        errors: statusResult.errors,
      });
    } else if (statusResult.status === 'processing') {
      submission.status = EFacturaSubmissionStatus.PROCESSING;
    }

    await submission.save();
  }

  /**
   * Download the signed invoice from ANAF
   *
   * After ANAF successfully validates and signs an invoice,
   * this method downloads the signed XML for archival.
   *
   * @param submissionId - MongoDB ObjectId of the submission
   * @returns Buffer containing the signed XML (or ZIP file)
   * @throws NotFoundException if submission not found
   * @throws BadRequestException if invoice is not yet signed
   */
  async downloadSignedInvoice(submissionId: string): Promise<Buffer> {
    this.logger.log(`Downloading signed invoice for submission ${submissionId}`);

    const submission = await this.submissionModel.findById(submissionId);
    if (!submission) {
      throw new SubmissionNotFoundException(submissionId);
    }

    if (submission.status !== EFacturaSubmissionStatus.SIGNED) {
      throw new SignedInvoiceNotAvailableException(submissionId, submission.status);
    }

    if (!submission.downloadId) {
      throw new SignedInvoiceNotAvailableException(submissionId, 'NO_DOWNLOAD_ID');
    }

    // If we have cached signed XML, return it
    if (submission.signedXmlContent) {
      return Buffer.from(submission.signedXmlContent, 'base64');
    }

    // Download from ANAF if API is available
    if (this.anafApi) {
      const downloadResult = await this.anafApi.downloadSignedInvoice(
        submission.downloadId,
        submission.sellerCui,
      );

      if (!downloadResult.success || !downloadResult.data) {
        throw new AnafApiException(
          downloadResult.errorMessage || 'Download failed',
          'DOWNLOAD_ERROR',
        );
      }

      // Cache for future requests
      submission.signedXmlContent = downloadResult.data.toString('base64');
      await submission.save();

      await this.createLog({
        submissionId: submission._id,
        action: EFacturaLogAction.DOWNLOAD,
        success: true,
        tenantId: submission.tenantId,
        organizationId: submission.organizationId,
        invoiceNumber: submission.invoiceNumber,
        uploadIndex: submission.uploadIndex,
        durationMs: downloadResult.requestDurationMs,
      });

      return downloadResult.data;
    }

    // Return placeholder if no API available
    return Buffer.from('<!-- Signed XML requires ANAF API -->', 'utf-8');
  }

  /**
   * Retry a failed submission
   *
   * Attempts to resubmit a failed or errored submission.
   * Implements exponential backoff and respects max retry limits.
   *
   * @param submissionId - MongoDB ObjectId of the submission
   * @param context - Tenant context
   * @param options.force - Force retry even if max retries exceeded
   * @returns Updated submission record
   */
  async retrySubmission(
    submissionId: string,
    context: TenantContext,
    options?: { force?: boolean },
  ): Promise<EFacturaSubmission> {
    this.logger.log(`Retrying submission ${submissionId}`, { force: options?.force });

    const submission = await this.submissionModel.findById(submissionId);
    if (!submission) {
      throw new SubmissionNotFoundException(submissionId);
    }

    // Validate retry eligibility
    const maxRetries = this.getConfig().submission.maxRetries;
    if (!options?.force && submission.retryCount >= maxRetries) {
      throw new SubmissionNotRetryableException(
        submissionId,
        submission.status,
        submission.retryCount,
        maxRetries,
      );
    }

    if (!this.canRetry(submission.status)) {
      throw new SubmissionNotRetryableException(
        submissionId,
        submission.status,
        submission.retryCount,
        maxRetries,
      );
    }

    // Update submission for retry
    submission.retryCount += 1;
    submission.lastRetryAt = new Date();
    submission.status = EFacturaSubmissionStatus.PENDING;
    submission.lastErrorMessage = undefined;
    submission.validationErrors = [];
    submission.nextRetryAt = undefined;

    await submission.save();

    // Log the retry
    await this.createLog({
      submissionId: submission._id,
      action: EFacturaLogAction.RETRY,
      success: true,
      tenantId: submission.tenantId,
      organizationId: submission.organizationId,
      invoiceNumber: submission.invoiceNumber,
      metadata: { retryCount: submission.retryCount },
    });

    // Emit event
    this.eventEmitter.emit('efactura.submission.retried', {
      submissionId: submission._id.toString(),
      invoiceNumber: submission.invoiceNumber,
      retryCount: submission.retryCount,
    });

    this.logger.log(
      `Submission ${submissionId} queued for retry (attempt ${submission.retryCount})`,
    );

    // Get invoice and re-process if APIs available
    if (this.xmlGenerator && this.anafApi) {
      const invoice = await this.invoiceModel.findById(submission.invoiceId);
      if (invoice) {
        const seller = await this.getSellerInfo(context);
        const buyer = this.getBuyerInfo(invoice);

        try {
          await this.processSubmission(submission, invoice, seller, buyer, context);
        } catch (error) {
          submission.status = EFacturaSubmissionStatus.ERROR;
          submission.lastErrorMessage = error instanceof Error ? error.message : String(error);
          submission.nextRetryAt = this.calculateNextRetryTime();
          await submission.save();
        }
      }
    }

    return submission;
  }

  /**
   * Cancel a pending submission
   *
   * Cancels a submission that has not yet been successfully submitted to ANAF.
   * Note: Once submitted to ANAF, cancellation is not possible - the invoice
   * must be corrected with a credit note.
   *
   * @param submissionId - MongoDB ObjectId of the submission
   * @param reason - Reason for cancellation (required for audit)
   * @param context - Tenant context
   */
  async cancelSubmission(
    submissionId: string,
    reason: string,
    context: TenantContext,
  ): Promise<void> {
    this.logger.log(`Cancelling submission ${submissionId}`, { reason });

    const submission = await this.submissionModel.findById(submissionId);
    if (!submission) {
      throw new SubmissionNotFoundException(submissionId);
    }

    // Validate tenant access
    if (submission.tenantId !== context.tenantId) {
      throw new SubmissionNotFoundException(submissionId);
    }

    // Validate cancellation eligibility
    if (this.isTerminalStatus(submission.status)) {
      throw new SubmissionNotCancellableException(
        submissionId,
        submission.status,
        `Submission is in terminal status ${submission.status}`,
      );
    }

    if (submission.status === EFacturaSubmissionStatus.SUBMITTED) {
      throw new SubmissionNotCancellableException(
        submissionId,
        submission.status,
        'Cannot cancel a submitted invoice. Wait for ANAF processing or issue a credit note.',
      );
    }

    // Update submission
    submission.status = EFacturaSubmissionStatus.CANCELLED;
    submission.cancellationReason = reason;
    submission.cancelledBy = context.userId;
    submission.cancelledAt = new Date();
    submission.updatedBy = context.userId;

    await submission.save();

    // Log the cancellation
    await this.createLog({
      submissionId: submission._id,
      action: EFacturaLogAction.CANCEL,
      success: true,
      tenantId: submission.tenantId,
      organizationId: submission.organizationId,
      invoiceNumber: submission.invoiceNumber,
      performedBy: context.userId,
      metadata: { reason },
    });

    // Emit event
    this.eventEmitter.emit('efactura.submission.cancelled', {
      submissionId: submission._id.toString(),
      invoiceNumber: submission.invoiceNumber,
      reason,
      ...context,
    });

    this.logger.log(`Cancelled submission ${submissionId}`);
  }

  /**
   * Get all pending submissions that need processing
   *
   * Used by scheduled jobs to find submissions that:
   * - Are in PENDING status
   * - Are in ERROR status and eligible for retry
   * - Have passed their nextRetryAt time
   *
   * @param tenantId - Optional tenant filter
   * @returns List of pending submissions
   */
  async getPendingSubmissions(tenantId?: string): Promise<EFacturaSubmission[]> {
    const now = new Date();
    const query: Record<string, unknown> = {
      $or: [
        { status: EFacturaSubmissionStatus.PENDING },
        {
          status: EFacturaSubmissionStatus.ERROR,
          retryCount: { $lt: this.getConfig().submission.maxRetries },
          $or: [{ nextRetryAt: { $lte: now } }, { nextRetryAt: { $exists: false } }],
        },
      ],
    };

    if (tenantId) {
      query.tenantId = tenantId;
    }

    const batchSize = this.getConfig().submission.batchSize;

    return this.submissionModel.find(query).limit(batchSize).sort({ createdAt: 1 });
  }

  /**
   * Get submissions needing status check
   */
  async getSubmissionsNeedingStatusCheck(tenantId?: string): Promise<EFacturaSubmission[]> {
    const query: Record<string, unknown> = {
      status: { $in: [EFacturaSubmissionStatus.SUBMITTED, EFacturaSubmissionStatus.PROCESSING] },
      uploadIndex: { $exists: true, $ne: null },
    };

    if (tenantId) {
      query.tenantId = tenantId;
    }

    return this.submissionModel
      .find(query)
      .limit(this.getConfig().submission.batchSize)
      .sort({ submittedAt: 1 });
  }

  /**
   * Get a submission by ID
   */
  async findOne(submissionId: string, context: TenantContext): Promise<EFacturaSubmission> {
    const submission = await this.submissionModel.findOne({
      _id: submissionId,
      tenantId: context.tenantId,
    });

    if (!submission) {
      throw new SubmissionNotFoundException(submissionId);
    }

    return submission;
  }

  /**
   * Find submission by invoice ID
   */
  async findByInvoiceId(
    invoiceId: string,
    context: TenantContext,
  ): Promise<EFacturaSubmission | null> {
    return this.submissionModel.findOne({
      invoiceId: new Types.ObjectId(invoiceId),
      tenantId: context.tenantId,
    });
  }

  /**
   * List submissions with filtering and pagination
   */
  async findAll(
    query: ListSubmissionsQueryInput,
    context: TenantContext,
  ): Promise<{
    data: EFacturaSubmission[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const filter: Record<string, unknown> = {
      tenantId: context.tenantId,
      organizationId: context.organizationId,
    };

    if (query.status) filter.status = query.status;
    if (query.invoiceId) filter.invoiceId = new Types.ObjectId(query.invoiceId);
    if (query.invoiceNumber) filter.invoiceNumber = { $regex: query.invoiceNumber, $options: 'i' };
    if (query.sellerCui) filter.sellerCui = query.sellerCui;

    if (query.fromDate || query.toDate) {
      filter.createdAt = {};
      if (query.fromDate)
        (filter.createdAt as Record<string, unknown>).$gte = new Date(query.fromDate);
      if (query.toDate) (filter.createdAt as Record<string, unknown>).$lte = new Date(query.toDate);
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.submissionModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      this.submissionModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get submission statistics for a tenant
   */
  async getStatistics(context: TenantContext): Promise<EFacturaStatisticsDto> {
    const filter = {
      tenantId: context.tenantId,
      organizationId: context.organizationId,
    };

    const [statusCounts, avgProcessingTime] = await Promise.all([
      this.submissionModel.aggregate([
        { $match: filter },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      this.submissionModel.aggregate([
        {
          $match: {
            ...filter,
            status: EFacturaSubmissionStatus.SIGNED,
            submittedAt: { $exists: true },
            signedAt: { $exists: true },
          },
        },
        {
          $project: {
            processingTime: { $subtract: ['$signedAt', '$submittedAt'] },
          },
        },
        { $group: { _id: null, avg: { $avg: '$processingTime' } } },
      ]),
    ]);

    const counts: Record<string, number> = {};
    let total = 0;
    for (const item of statusCounts) {
      counts[item._id] = item.count;
      total += item.count;
    }

    const signed = counts[EFacturaSubmissionStatus.SIGNED] || 0;
    const rejected = counts[EFacturaSubmissionStatus.REJECTED] || 0;
    const completed = signed + rejected;
    const successRate = completed > 0 ? (signed / completed) * 100 : 0;

    return {
      total,
      pending: counts[EFacturaSubmissionStatus.PENDING] || 0,
      submitted:
        (counts[EFacturaSubmissionStatus.SUBMITTED] || 0) +
        (counts[EFacturaSubmissionStatus.PROCESSING] || 0) +
        (counts[EFacturaSubmissionStatus.VALIDATED] || 0),
      signed,
      rejected,
      errors: counts[EFacturaSubmissionStatus.ERROR] || 0,
      cancelled: counts[EFacturaSubmissionStatus.CANCELLED] || 0,
      avgProcessingTimeMs: avgProcessingTime[0]?.avg || 0,
      successRate: Math.round(successRate * 100) / 100,
    };
  }

  /**
   * Get submission logs
   */
  async getLogs(submissionId: string, context: TenantContext): Promise<EFacturaLog[]> {
    // Verify access
    await this.findOne(submissionId, context);

    return this.logModel
      .find({ submissionId: new Types.ObjectId(submissionId) })
      .sort({ createdAt: -1 })
      .limit(100);
  }

  /**
   * Check OAuth token status for a CUI
   */
  async getTokenStatus(cui: string): Promise<{
    exists: boolean;
    valid: boolean;
    expiresAt?: Date;
    needsRefresh?: boolean;
  }> {
    if (!this.oauthService) {
      return { exists: false, valid: false };
    }
    return this.oauthService.getTokenStatus(cui);
  }

  // ============================================
  // Private Helper Methods
  // ============================================

  /**
   * Get invoice for submission with validation
   */
  private async getInvoiceForSubmission(
    invoiceId: string,
    context: TenantContext,
  ): Promise<Invoice> {
    const invoice = await this.invoiceModel.findOne({
      _id: invoiceId,
      tenantId: context.tenantId,
      organizationId: context.organizationId,
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice ${invoiceId} not found`);
    }

    // Validate invoice status
    if ((invoice as any).status === 'DRAFT') {
      throw new InvoiceNotEligibleException(
        `Invoice ${invoiceId} is still in draft status`,
        invoiceId,
        'Invoice must be issued before submitting to E-Factura',
      );
    }

    if ((invoice as any).status === 'VOIDED') {
      throw new InvoiceNotEligibleException(
        `Invoice ${invoiceId} has been voided`,
        invoiceId,
        'Voided invoices cannot be submitted',
      );
    }

    // Validate B2B requirement for E-Factura
    const b2bValidation = this.validateB2BRequirement(invoice);
    if (!b2bValidation.isB2B) {
      throw new InvoiceNotEligibleException(
        `Invoice ${invoiceId} is a B2C invoice`,
        invoiceId,
        'E-Factura is only required for B2B invoices (invoices with buyer CUI). B2C invoices should not be submitted.',
      );
    }

    // Validate buyer information completeness for B2B
    if (b2bValidation.missingFields.length > 0) {
      throw new BuyerInfoMissingException(invoiceId, b2bValidation.missingFields);
    }

    return invoice;
  }

  /**
   * Validate B2B requirement for E-Factura
   * E-Factura is mandatory only for B2B transactions in Romania
   *
   * Returns whether the invoice is B2B and what buyer information is missing
   */
  private validateB2BRequirement(invoice: Invoice): {
    isB2B: boolean;
    missingFields: string[];
  } {
    const customerBusiness = invoice.customerBusiness;

    // If no CUI, this is a B2C invoice (patient is an individual)
    if (!customerBusiness?.cui) {
      return {
        isB2B: false,
        missingFields: [],
      };
    }

    // B2B invoice - validate required fields
    const missingFields: string[] = [];

    // CUI is present (checked above)
    // Validate CUI format (Romanian tax ID)
    const cui = customerBusiness.cui;
    if (!this.isValidRomanianCui(cui)) {
      missingFields.push('cui (invalid format)');
    }

    // Legal name is required
    if (!customerBusiness.legalName || customerBusiness.legalName.trim().length === 0) {
      missingFields.push('legalName');
    }

    // Address is required for UBL compliance
    if (!customerBusiness.address) {
      missingFields.push('address');
    } else {
      if (!customerBusiness.address.streetName) {
        missingFields.push('address.streetName');
      }
      if (!customerBusiness.address.city) {
        missingFields.push('address.city');
      }
    }

    return {
      isB2B: true,
      missingFields,
    };
  }

  /**
   * Validate Romanian CUI format
   * CUI can be: RO followed by 2-10 digits, or just 2-10 digits
   */
  private isValidRomanianCui(cui: string): boolean {
    if (!cui) return false;
    // Remove spaces
    const cleanCui = cui.replace(/\s/g, '');
    // Match RO prefix + digits or just digits
    const cuiPattern = /^(RO)?\d{2,10}$/i;
    return cuiPattern.test(cleanCui);
  }

  /**
   * Check if an invoice requires E-Factura submission
   * Public method for use by other services to determine requirement
   */
  async isEFacturaRequired(
    invoiceId: string,
    context: TenantContext,
  ): Promise<{
    required: boolean;
    reason: string;
    isB2B: boolean;
    buyerCui?: string;
  }> {
    const invoice = await this.invoiceModel.findOne({
      _id: invoiceId,
      tenantId: context.tenantId,
    });

    if (!invoice) {
      return {
        required: false,
        reason: 'Invoice not found',
        isB2B: false,
      };
    }

    const b2bValidation = this.validateB2BRequirement(invoice);

    if (!b2bValidation.isB2B) {
      return {
        required: false,
        reason: 'B2C invoice - E-Factura not required for individual patients',
        isB2B: false,
      };
    }

    // Check if clinic has E-Factura enabled
    if (this.clinicFiscalService) {
      try {
        const isConfigured = await this.clinicFiscalService.isClinicConfiguredForEFactura(
          context.clinicId,
        );
        if (!isConfigured) {
          return {
            required: false,
            reason: 'Clinic is not configured for E-Factura',
            isB2B: true,
            buyerCui: invoice.customerBusiness?.cui,
          };
        }
      } catch {
        // If we can't check, assume E-Factura is required for B2B
      }
    }

    return {
      required: true,
      reason: 'B2B invoice with Romanian buyer - E-Factura required',
      isB2B: true,
      buyerCui: invoice.customerBusiness?.cui,
    };
  }

  /**
   * Auto-detect and mark invoice E-Factura requirement
   * Call this when invoice is created or customer business info is updated
   */
  async updateEFacturaRequirement(
    invoiceId: string,
    context: TenantContext,
  ): Promise<{ required: boolean; reason: string }> {
    const requirement = await this.isEFacturaRequired(invoiceId, context);

    await this.invoiceModel.updateOne(
      { _id: new Types.ObjectId(invoiceId) },
      {
        $set: {
          'eFactura.required': requirement.required,
        },
      },
    );

    this.logger.debug(
      `Updated E-Factura requirement for invoice ${invoiceId}: required=${requirement.required}, reason=${requirement.reason}`,
    );

    return {
      required: requirement.required,
      reason: requirement.reason,
    };
  }

  /**
   * Find existing submission for an invoice
   */
  private async findExistingSubmission(
    invoiceId: string,
    context: TenantContext,
  ): Promise<(EFacturaSubmission & { canRetry: boolean }) | null> {
    const submission = await this.submissionModel.findOne({
      invoiceId: new Types.ObjectId(invoiceId),
      tenantId: context.tenantId,
      status: { $nin: [EFacturaSubmissionStatus.CANCELLED] },
    });

    if (!submission) return null;

    const obj = submission.toObject();
    return {
      ...obj,
      canRetry: this.canRetry(submission.status),
    } as unknown as EFacturaSubmission & { canRetry: boolean };
  }

  /**
   * Get seller information from clinic fiscal settings via enterprise-service
   */
  private async getSellerInfo(context: TenantContext): Promise<EFacturaSellerInfo> {
    // Fetch seller info from enterprise service via ClinicFiscalService
    if (!this.clinicFiscalService) {
      throw new SellerConfigurationException(context.clinicId, [
        'clinicFiscalService not available',
      ]);
    }

    try {
      const sellerInfo = await this.clinicFiscalService.getSellerInfo(context.clinicId);

      // Validate required fields
      if (!sellerInfo.cui || sellerInfo.cui === 'RO00000000') {
        throw new SellerConfigurationException(context.clinicId, ['cui']);
      }

      if (!sellerInfo.legalName) {
        throw new SellerConfigurationException(context.clinicId, ['legalName']);
      }

      if (!sellerInfo.address?.streetName || !sellerInfo.address?.city) {
        throw new SellerConfigurationException(context.clinicId, [
          'address.streetName',
          'address.city',
        ]);
      }

      return sellerInfo;
    } catch (error) {
      if (error instanceof SellerConfigurationException) {
        throw error;
      }

      // Convert NotFoundException from clinic service to SellerConfigurationException
      if (error instanceof NotFoundException) {
        throw new SellerConfigurationException(context.clinicId, [
          'Clinic fiscal settings not configured',
        ]);
      }

      this.logger.error(
        `Failed to fetch seller info for clinic ${context.clinicId}: ${error instanceof Error ? error.message : String(error)}`,
      );

      throw new SellerConfigurationException(context.clinicId, [
        'Unable to fetch fiscal settings from enterprise service',
      ]);
    }
  }

  /**
   * Get buyer information from invoice
   */
  private getBuyerInfo(invoice: Invoice): EFacturaBuyerInfo {
    const customerBusiness = invoice.customerBusiness;

    if (customerBusiness?.cui) {
      // B2B invoice
      return {
        cui: customerBusiness.cui,
        legalName: customerBusiness.legalName,
        regCom: customerBusiness.regCom,
        address: customerBusiness.address
          ? {
              streetName: customerBusiness.address.streetName,
              additionalStreetName: customerBusiness.address.additionalStreetName,
              city: customerBusiness.address.city,
              county: customerBusiness.address.county,
              postalCode: customerBusiness.address.postalCode,
              countryCode: customerBusiness.address.countryCode || 'RO',
            }
          : {
              streetName: 'Unknown',
              city: 'Unknown',
              countryCode: 'RO',
            },
        contact: {
          email: customerBusiness.email,
          phone: customerBusiness.phone,
        },
        isB2B: true,
      };
    }

    // B2C invoice (individual patient)
    return {
      legalName: 'Persoana Fizica',
      address: {
        streetName: 'Romania',
        city: 'Romania',
        countryCode: 'RO',
      },
      isB2B: false,
    };
  }

  /**
   * Get invoice line items from database
   * Fetches actual invoice items and maps them to E-Factura line format
   */
  private async getInvoiceLineItems(invoice: Invoice): Promise<InvoiceLineItem[]> {
    // If invoice has no items, return a single aggregate line
    if (!invoice.items || invoice.items.length === 0) {
      this.logger.warn(`Invoice ${invoice.invoiceNumber} has no line items, using aggregate line`);
      return this.createAggregateLine(invoice);
    }

    // Fetch actual line items from database
    const items = await this.invoiceItemModel
      .find({
        _id: { $in: invoice.items },
      })
      .exec();

    // If no items found (orphaned references), fall back to aggregate
    if (items.length === 0) {
      this.logger.warn(
        `Invoice ${invoice.invoiceNumber} has ${invoice.items.length} item refs but none found in DB`,
      );
      return this.createAggregateLine(invoice);
    }

    // Map InvoiceItem documents to InvoiceLineItem format for E-Factura
    return items.map((item) => {
      // Get proper VAT treatment from healthcare VAT service
      const vatTreatment = this.getVatTreatmentForItem(item);

      return {
        id: item._id.toString(),
        description: this.formatLineDescription(item),
        name: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountAmount: 0, // Line-level discounts handled separately
        taxRate: vatTreatment.taxRate,
        taxCategory: vatTreatment.taxCategoryCode,
        taxExemptionReasonCode: vatTreatment.exemptionReasonCode,
        taxExemptionReasonText: vatTreatment.exemptionReasonText,
        itemCode: item.code || item.procedureCode,
        unitCode: 'C62', // Unit (piece) - standard UBL code
        toothNumber: item.toothNumber,
        procedureCode: item.procedureCode,
      };
    });
  }

  /**
   * Create an aggregate line item when no detailed items exist
   * Used for legacy invoices or when items are not itemized
   * Default to healthcare VAT exempt for dental services
   */
  private createAggregateLine(invoice: Invoice): InvoiceLineItem[] {
    // For aggregate dental services, default to healthcare VAT exempt
    const vatTreatment = this.healthcareVatService
      ? this.healthcareVatService.getVatTreatment(undefined, 'PROCEDURE')
      : this.getDefaultHealthcareVatTreatment();

    return [
      {
        id: '1',
        description: 'Servicii stomatologice / Dental services',
        quantity: 1,
        unitPrice: invoice.subtotal,
        taxRate: vatTreatment.taxRate,
        taxCategory: vatTreatment.taxCategoryCode,
        taxExemptionReasonCode: vatTreatment.exemptionReasonCode,
        taxExemptionReasonText: vatTreatment.exemptionReasonText,
        discountAmount: invoice.discountAmount || 0,
        unitCode: 'C62',
      },
    ];
  }

  /**
   * Format line description for E-Factura
   * Includes procedure code, tooth number, and surfaces if available
   */
  private formatLineDescription(item: InvoiceItem): string {
    const parts: string[] = [item.description];

    // Add procedure code if available
    if (item.procedureCode) {
      parts.unshift(`[${item.procedureCode}]`);
    }

    // Add tooth number if available
    if (item.toothNumber) {
      parts.push(`(Dinte/Tooth: ${item.toothNumber})`);
    }

    // Add surfaces if available
    if (item.surfaces && item.surfaces.length > 0) {
      parts.push(`(Suprafețe/Surfaces: ${item.surfaces.join(', ')})`);
    }

    return parts.join(' ');
  }

  /**
   * Get UBL tax category code from tax rate
   * @deprecated Use getVatTreatmentForItem() with HealthcareVatService instead
   */
  private getTaxCategoryCode(taxRate: number): string {
    if (taxRate === 0) {
      // Zero rate - could be exempt or zero-rated
      return 'E'; // Exempt
    }
    if (taxRate === 0.09) {
      return 'S'; // Standard rate (reduced in Romania is 9%)
    }
    if (taxRate === 0.19) {
      return 'S'; // Standard rate (19% in Romania)
    }
    if (taxRate === 0.05) {
      return 'S'; // Reduced rate (5% in Romania)
    }
    // Default to standard
    return 'S';
  }

  /**
   * Get VAT treatment for an invoice item using the HealthcareVatService
   * Falls back to default treatment if service is not available
   */
  private getVatTreatmentForItem(item: InvoiceItem): VatTreatment {
    if (this.healthcareVatService) {
      return this.healthcareVatService.getVatTreatment(item.procedureCode, item.itemType);
    }

    // Fallback: use existing tax rate from item or default to healthcare exempt
    if (item.taxRate !== undefined && item.taxRate !== null) {
      return {
        taxRate: item.taxRate,
        taxCategoryCode: this.getTaxCategoryCode(item.taxRate) as
          | 'S'
          | 'E'
          | 'Z'
          | 'AE'
          | 'K'
          | 'G'
          | 'O'
          | 'L'
          | 'M'
          | 'B',
        isHealthcareExempt: item.taxRate === 0,
        exemptionReasonCode: item.taxRate === 0 ? 'VATEX-EU-J' : undefined,
        exemptionReasonText:
          item.taxRate === 0
            ? 'Servicii medicale stomatologice scutite conform Art. 292 Cod Fiscal / Dental medical services exempt under Art. 292 Tax Code'
            : undefined,
      };
    }

    return this.getDefaultHealthcareVatTreatment();
  }

  /**
   * Get default healthcare VAT treatment for dental services
   * Used as fallback when HealthcareVatService is not available
   */
  private getDefaultHealthcareVatTreatment(): VatTreatment {
    return {
      taxRate: 0,
      taxCategoryCode: 'E', // Exempt
      isHealthcareExempt: true,
      exemptionReasonCode: 'VATEX-EU-J',
      exemptionReasonText:
        'Servicii medicale stomatologice scutite conform Art. 292 Cod Fiscal / ' +
        'Dental medical services exempt under Art. 292 Tax Code',
    };
  }

  /**
   * Update invoice E-Factura status
   */
  private async updateInvoiceEFacturaStatus(
    invoiceId: string,
    update: Partial<{
      status: EFacturaStatus;
      uploadIndex: string;
      downloadId: string;
      submittedAt: Date;
      signedAt: Date;
      lastError: string;
      submissionId: Types.ObjectId;
    }>,
  ): Promise<void> {
    await this.invoiceModel.updateOne(
      { _id: new Types.ObjectId(invoiceId) },
      {
        $set: {
          'eFactura.status': update.status,
          ...(update.uploadIndex && { 'eFactura.uploadIndex': update.uploadIndex }),
          ...(update.downloadId && { 'eFactura.downloadId': update.downloadId }),
          ...(update.submittedAt && { 'eFactura.submittedAt': update.submittedAt }),
          ...(update.signedAt && { 'eFactura.signedAt': update.signedAt }),
          ...(update.lastError && { 'eFactura.lastError': update.lastError }),
          ...(update.submissionId && { 'eFactura.submissionId': update.submissionId }),
        },
      },
    );
  }

  /**
   * Calculate next retry time with exponential backoff
   */
  private calculateNextRetryTime(): Date {
    const config = this.getConfig();
    // Simple linear backoff for now
    return new Date(Date.now() + config.submission.retryDelayMs);
  }

  /**
   * Check if status allows retry
   */
  private canRetry(status: EFacturaSubmissionStatus): boolean {
    return [EFacturaSubmissionStatus.ERROR, EFacturaSubmissionStatus.PENDING].includes(status);
  }

  /**
   * Check if status is terminal (no further transitions)
   */
  private isTerminalStatus(status: EFacturaSubmissionStatus): boolean {
    return [
      EFacturaSubmissionStatus.SIGNED,
      EFacturaSubmissionStatus.REJECTED,
      EFacturaSubmissionStatus.CANCELLED,
    ].includes(status);
  }

  /**
   * Get human-readable status message
   */
  private getStatusMessage(status: EFacturaSubmissionStatus): string {
    const messages: Record<EFacturaSubmissionStatus, string> = {
      [EFacturaSubmissionStatus.PENDING]: 'Invoice is pending submission to ANAF',
      [EFacturaSubmissionStatus.SUBMITTED]: 'Invoice has been submitted to ANAF',
      [EFacturaSubmissionStatus.PROCESSING]: 'ANAF is processing the invoice',
      [EFacturaSubmissionStatus.VALIDATED]: 'Invoice has been validated by ANAF',
      [EFacturaSubmissionStatus.SIGNED]: 'Invoice has been signed by ANAF - Complete',
      [EFacturaSubmissionStatus.REJECTED]: 'Invoice was rejected by ANAF - See errors',
      [EFacturaSubmissionStatus.ERROR]: 'Technical error occurred - Retry available',
      [EFacturaSubmissionStatus.CANCELLED]: 'Submission was cancelled',
    };
    return messages[status];
  }

  /**
   * Create a log entry
   */
  private async createLog(params: {
    submissionId: Types.ObjectId;
    action: EFacturaLogAction;
    success: boolean;
    tenantId: string;
    organizationId: string;
    invoiceNumber?: string;
    uploadIndex?: string;
    performedBy?: string;
    errorMessage?: string;
    errorCode?: string;
    correlationId?: string;
    durationMs?: number;
    metadata?: Record<string, unknown>;
  }): Promise<EFacturaLog> {
    const log = new this.logModel({
      submissionId: params.submissionId,
      action: params.action,
      success: params.success,
      tenantId: params.tenantId,
      organizationId: params.organizationId,
      invoiceNumber: params.invoiceNumber,
      uploadIndex: params.uploadIndex,
      performedBy: params.performedBy,
      errorMessage: params.errorMessage,
      errorCode: params.errorCode,
      correlationId: params.correlationId,
      durationMs: params.durationMs,
      metadata: params.metadata,
      environment: this.getConfig().anaf.isTestEnvironment ? 'test' : 'production',
    });

    return log.save();
  }
}
