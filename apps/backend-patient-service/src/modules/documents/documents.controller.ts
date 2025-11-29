/**
 * Patient Documents Controller
 *
 * REST API endpoints for patient document management.
 * All endpoints enforce JWT authentication and tenant isolation.
 *
 * @module modules/documents
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  HttpCode,
  HttpStatus,
  Logger,
  Req,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { Request } from 'express';
import {
  DocumentsService,
  UploadedFile as UploadedFileType,
  TenantContext,
} from './documents.service';

// Multer file type - using Express namespace augmented by @types/multer
interface MulterFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
  fieldname: string;
  encoding: string;
}
import {
  CreateDocumentDto,
  UpdateDocumentDto,
  SearchDocumentsDto,
  SignDocumentDto,
  GenerateDocumentDto,
  BulkUploadDocumentsDto,
} from './dto';
import {
  JwtAuthGuard,
  TenantIsolationGuard,
  PermissionsGuard,
  RequirePermissions,
} from '../../guards';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUser as ICurrentUser } from '@dentalos/shared-auth';
import type { UUID } from '@dentalos/shared-types';
import { MAX_FILE_SIZE } from './services';

/**
 * Patient Documents Controller
 *
 * Provides REST endpoints for:
 * - Document upload (single and bulk)
 * - Document retrieval and search
 * - Metadata updates
 * - Document signing
 * - Document generation from templates
 * - Download URL generation
 */
@ApiTags('documents')
@ApiBearerAuth()
@Controller()
@UseGuards(JwtAuthGuard, TenantIsolationGuard, PermissionsGuard)
export class DocumentsController {
  private readonly logger = new Logger(DocumentsController.name);

  constructor(private readonly documentsService: DocumentsService) {}

  /**
   * Helper to build tenant context from current user
   */
  private getTenantContext(user: ICurrentUser): TenantContext {
    return {
      tenantId: user.organizationId,
      organizationId: user.organizationId,
      userId: user.userId,
      clinicId: user.clinicId,
    };
  }

  /**
   * Helper to get client IP from request
   */
  private getClientIp(req: Request): string | undefined {
    return (
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket?.remoteAddress
    );
  }

  // ============================================================================
  // DOCUMENT CRUD ENDPOINTS
  // ============================================================================

  /**
   * Upload a new document
   *
   * POST /patients/:patientId/documents
   */
  @Post('patients/:patientId/documents')
  @RequirePermissions('documents:write')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Upload a new document for a patient' })
  @ApiParam({ name: 'patientId', description: 'Patient ID', type: String })
  @ApiBody({
    description: 'Document file and metadata',
    schema: {
      type: 'object',
      required: ['file', 'title', 'category'],
      properties: {
        file: { type: 'string', format: 'binary' },
        title: { type: 'string' },
        category: {
          type: 'string',
          enum: [
            'consent',
            'anamnesis',
            'patient_form',
            'treatment_plan',
            'prescription',
            'referral',
            'lab_result',
            'imaging',
            'invoice',
            'insurance',
            'id_document',
            'other',
          ],
        },
        description: { type: 'string' },
        documentDate: { type: 'string', format: 'date' },
        expiryDate: { type: 'string', format: 'date' },
        appointmentId: { type: 'string', format: 'uuid' },
        requiresSignature: { type: 'boolean' },
        tags: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Document uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file or metadata' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 413, description: 'File too large' })
  async uploadDocument(
    @Param('patientId') patientId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE }),
          new FileTypeValidator({
            fileType: /(pdf|jpeg|jpg|png|gif|dicom|octet-stream)$/i,
          }),
        ],
      }),
    )
    file: MulterFile,
    @Body() dto: CreateDocumentDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    this.logger.log(`Uploading document for patient ${patientId}`);

    const uploadedFile: UploadedFileType = {
      buffer: file.buffer,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    };

    const document = await this.documentsService.uploadDocument(
      patientId,
      uploadedFile,
      dto,
      this.getTenantContext(user),
    );

    const response = await this.documentsService.toResponseDto(document, true);

    return {
      success: true,
      data: response,
      message: 'Document uploaded successfully',
    };
  }

  /**
   * Bulk upload multiple documents
   *
   * POST /patients/:patientId/documents/bulk-upload
   */
  @Post('patients/:patientId/documents/bulk-upload')
  @RequirePermissions('documents:write')
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiConsumes('multipart/form-data')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Upload multiple documents at once' })
  @ApiParam({ name: 'patientId', description: 'Patient ID', type: String })
  @ApiResponse({ status: 201, description: 'Documents uploaded' })
  @ApiResponse({ status: 400, description: 'Invalid files or metadata' })
  async bulkUploadDocuments(
    @Param('patientId') patientId: string,
    @UploadedFiles() files: MulterFile[],
    @Body() dto: BulkUploadDocumentsDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    this.logger.log(`Bulk uploading ${files?.length || 0} documents for patient ${patientId}`);

    // Build file map
    const fileMap = new Map<string, UploadedFileType>();
    if (files) {
      files.forEach((file, index) => {
        const key = `file_${index}`;
        fileMap.set(key, {
          buffer: file.buffer,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
        });
      });
    }

    const result = await this.documentsService.bulkUpload(
      patientId,
      fileMap,
      dto,
      this.getTenantContext(user),
    );

    return {
      success: true,
      data: result,
      message: `Uploaded ${result.successCount} of ${dto.files.length} documents`,
    };
  }

  /**
   * List documents for a patient
   *
   * GET /patients/:patientId/documents
   */
  @Get('patients/:patientId/documents')
  @RequirePermissions('documents:read')
  @ApiOperation({ summary: 'List and search patient documents' })
  @ApiParam({ name: 'patientId', description: 'Patient ID', type: String })
  @ApiResponse({ status: 200, description: 'Documents list returned' })
  async listDocuments(
    @Param('patientId') patientId: string,
    @Query() searchDto: SearchDocumentsDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    this.logger.log(`Listing documents for patient ${patientId}`);

    const result = await this.documentsService.listDocuments(
      patientId,
      searchDto,
      this.getTenantContext(user),
    );

    // Transform to response DTOs
    const data = await Promise.all(
      result.data.map((doc) => this.documentsService.toResponseDto(doc, false)),
    );

    return {
      success: true,
      data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        hasNext: result.hasNext,
        hasPrev: result.hasPrev,
      },
    };
  }

  /**
   * Get document by ID
   *
   * GET /patients/:patientId/documents/:documentId
   */
  @Get('patients/:patientId/documents/:documentId')
  @RequirePermissions('documents:read')
  @ApiOperation({ summary: 'Get document details' })
  @ApiParam({ name: 'patientId', description: 'Patient ID', type: String })
  @ApiParam({ name: 'documentId', description: 'Document ID', type: String })
  @ApiResponse({ status: 200, description: 'Document details returned' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async getDocument(
    @Param('patientId') patientId: string,
    @Param('documentId') documentId: string,
    @CurrentUser() user: ICurrentUser,
  ) {
    this.logger.log(`Getting document ${documentId} for patient ${patientId}`);

    const document = await this.documentsService.getDocument(
      patientId,
      documentId as UUID,
      this.getTenantContext(user),
    );

    const response = await this.documentsService.toResponseDto(document, true);

    return {
      success: true,
      data: response,
    };
  }

  /**
   * Update document metadata
   *
   * PATCH /patients/:patientId/documents/:documentId
   */
  @Patch('patients/:patientId/documents/:documentId')
  @RequirePermissions('documents:write')
  @ApiOperation({ summary: 'Update document metadata' })
  @ApiParam({ name: 'patientId', description: 'Patient ID', type: String })
  @ApiParam({ name: 'documentId', description: 'Document ID', type: String })
  @ApiResponse({ status: 200, description: 'Document updated successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async updateDocument(
    @Param('patientId') patientId: string,
    @Param('documentId') documentId: string,
    @Body() dto: UpdateDocumentDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    this.logger.log(`Updating document ${documentId} for patient ${patientId}`);

    const document = await this.documentsService.updateDocument(
      patientId,
      documentId as UUID,
      dto,
      this.getTenantContext(user),
    );

    const response = await this.documentsService.toResponseDto(document, false);

    return {
      success: true,
      data: response,
      message: 'Document updated successfully',
    };
  }

  /**
   * Soft delete document
   *
   * DELETE /patients/:patientId/documents/:documentId
   */
  @Delete('patients/:patientId/documents/:documentId')
  @RequirePermissions('documents:write')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete a document' })
  @ApiParam({ name: 'patientId', description: 'Patient ID', type: String })
  @ApiParam({ name: 'documentId', description: 'Document ID', type: String })
  @ApiResponse({ status: 200, description: 'Document deleted successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async deleteDocument(
    @Param('patientId') patientId: string,
    @Param('documentId') documentId: string,
    @Body('reason') reason: string | undefined,
    @CurrentUser() user: ICurrentUser,
  ) {
    this.logger.log(`Deleting document ${documentId} for patient ${patientId}`);

    await this.documentsService.deleteDocument(
      patientId,
      documentId as UUID,
      this.getTenantContext(user),
      reason,
    );

    return {
      success: true,
      message: 'Document deleted successfully',
    };
  }

  // ============================================================================
  // DOCUMENT ACTIONS
  // ============================================================================

  /**
   * Get download URL for document
   *
   * GET /patients/:patientId/documents/:documentId/download
   */
  @Get('patients/:patientId/documents/:documentId/download')
  @RequirePermissions('documents:read')
  @ApiOperation({ summary: 'Get pre-signed download URL' })
  @ApiParam({ name: 'patientId', description: 'Patient ID', type: String })
  @ApiParam({ name: 'documentId', description: 'Document ID', type: String })
  @ApiResponse({ status: 200, description: 'Download URL returned' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async getDownloadUrl(
    @Param('patientId') patientId: string,
    @Param('documentId') documentId: string,
    @Req() req: Request,
    @CurrentUser() user: ICurrentUser,
  ) {
    this.logger.log(`Getting download URL for document ${documentId}`);

    const downloadInfo = await this.documentsService.getDownloadUrl(
      patientId,
      documentId as UUID,
      this.getTenantContext(user),
      this.getClientIp(req),
    );

    return {
      success: true,
      data: downloadInfo,
    };
  }

  /**
   * Sign a document
   *
   * POST /patients/:patientId/documents/:documentId/sign
   */
  @Post('patients/:patientId/documents/:documentId/sign')
  @RequirePermissions('documents:write')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add signature to document' })
  @ApiParam({ name: 'patientId', description: 'Patient ID', type: String })
  @ApiParam({ name: 'documentId', description: 'Document ID', type: String })
  @ApiResponse({ status: 200, description: 'Document signed successfully' })
  @ApiResponse({ status: 400, description: 'Document already signed' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async signDocument(
    @Param('patientId') patientId: string,
    @Param('documentId') documentId: string,
    @Body() dto: SignDocumentDto,
    @Req() req: Request,
    @CurrentUser() user: ICurrentUser,
  ) {
    this.logger.log(`Signing document ${documentId} for patient ${patientId}`);

    const document = await this.documentsService.signDocument(
      patientId,
      documentId as UUID,
      dto,
      this.getTenantContext(user),
      this.getClientIp(req),
      req.headers['user-agent'],
    );

    const response = await this.documentsService.toResponseDto(document, false);

    return {
      success: true,
      data: response,
      message: 'Document signed successfully',
    };
  }

  /**
   * Generate document from template
   *
   * POST /patients/:patientId/documents/generate
   */
  @Post('patients/:patientId/documents/generate')
  @RequirePermissions('documents:write')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Generate document from template' })
  @ApiParam({ name: 'patientId', description: 'Patient ID', type: String })
  @ApiResponse({ status: 201, description: 'Document generated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid template or data' })
  async generateDocument(
    @Param('patientId') patientId: string,
    @Body() dto: GenerateDocumentDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    this.logger.log(`Generating document from template ${dto.templateId} for patient ${patientId}`);

    const document = await this.documentsService.generateDocument(
      patientId,
      dto,
      this.getTenantContext(user),
    );

    const response = await this.documentsService.toResponseDto(document, true);

    return {
      success: true,
      data: response,
      message: 'Document generated successfully',
    };
  }

  /**
   * Get documents summary for patient
   *
   * GET /patients/:patientId/documents/summary
   */
  @Get('patients/:patientId/documents/summary')
  @RequirePermissions('documents:read')
  @ApiOperation({ summary: 'Get documents summary for patient' })
  @ApiParam({ name: 'patientId', description: 'Patient ID', type: String })
  @ApiResponse({ status: 200, description: 'Summary returned' })
  async getDocumentsSummary(
    @Param('patientId') patientId: string,
    @CurrentUser() user: ICurrentUser,
  ) {
    this.logger.log(`Getting documents summary for patient ${patientId}`);

    const summary = await this.documentsService.getDocumentsSummary(
      patientId,
      this.getTenantContext(user),
    );

    return {
      success: true,
      data: summary,
    };
  }

  // ============================================================================
  // APPOINTMENT-BASED LOOKUP
  // ============================================================================

  /**
   * Get documents for an appointment
   *
   * GET /appointments/:appointmentId/documents
   */
  @Get('appointments/:appointmentId/documents')
  @RequirePermissions('documents:read')
  @ApiOperation({ summary: 'Get documents for an appointment' })
  @ApiParam({ name: 'appointmentId', description: 'Appointment ID', type: String })
  @ApiResponse({ status: 200, description: 'Documents returned' })
  async getAppointmentDocuments(
    @Param('appointmentId') appointmentId: string,
    @CurrentUser() user: ICurrentUser,
  ) {
    this.logger.log(`Getting documents for appointment ${appointmentId}`);

    const documents = await this.documentsService.getDocumentsForAppointment(
      appointmentId,
      this.getTenantContext(user),
    );

    const data = await Promise.all(
      documents.map((doc) => this.documentsService.toResponseDto(doc, false)),
    );

    return {
      success: true,
      data,
      count: data.length,
    };
  }
}
