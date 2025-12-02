/**
 * Clinical Notes Controller
 *
 * REST API endpoints for clinical note management.
 * Handles SOAP notes, signing workflow, amendments, and attachments.
 *
 * AUTHENTICATION: All endpoints require JWT authentication.
 * AUTHORIZATION: Routes are protected by permission guards.
 *
 * API PATH: /api/v1/clinical/patients/:patientId/notes
 *
 * @module clinical-notes/controller
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
  ParseUUIDPipe,
  Ip,
  Headers,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ZodValidationPipe } from '@dentalos/shared-validation';
import { JwtAuthGuard, PermissionsGuard, TenantIsolationGuard } from '../auth/guards';
import { GetCurrentUser, RequirePermissions } from '../auth/decorators';
import { ClinicalNotesService } from './clinical-notes.service';
import { AuditContext } from './clinical-notes.repository';
import {
  CreateClinicalNoteSchema,
  CreateClinicalNoteDto,
  UpdateClinicalNoteSchema,
  UpdateClinicalNoteDto,
  SignClinicalNoteSchema,
  SignClinicalNoteDto,
  AmendClinicalNoteSchema,
  AmendClinicalNoteDto,
  ClinicalNoteQuerySchema,
  ClinicalNoteQueryDto,
  AddAttachmentSchema,
  AddAttachmentDto,
  CreateDiagnosisSchema,
  CreateDiagnosisDto,
  CreateProcedureNoteSchema,
  CreateProcedureNoteDto,
  CompleteProcedureSchema,
  CompleteProcedureDto,
} from './dto/clinical-note.dto';

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * Current user from JWT token
 */
interface CurrentUser {
  userId: string;
  tenantId: string;
  organizationId: string;
  clinicId: string;
  email: string;
  displayName: string;
  credentials?: string;
  roles: string[];
  permissions: string[];
}

// ============================================================================
// CONTROLLER IMPLEMENTATION
// ============================================================================

@ApiTags('Clinical - Notes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantIsolationGuard, PermissionsGuard)
@Controller()
export class ClinicalNotesController {
  constructor(private readonly clinicalNotesService: ClinicalNotesService) {}

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Create audit context from current user and request info
   */
  private createAuditContext(
    user: CurrentUser,
    ipAddress?: string,
    userAgent?: string,
  ): AuditContext {
    return {
      tenantId: user.tenantId,
      organizationId: user.organizationId,
      clinicId: user.clinicId,
      userId: user.userId,
      userName: user.displayName,
      ipAddress,
      userAgent,
    };
  }

  // ============================================================================
  // CRUD ENDPOINTS
  // ============================================================================

  /**
   * Create a new clinical note
   *
   * POST /api/v1/clinical/patients/:patientId/notes
   */
  @Post('clinical/patients/:patientId/notes')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('clinical:notes:create')
  @ApiOperation({ summary: 'Create a new clinical note' })
  @ApiParam({ name: 'patientId', description: 'Patient UUID' })
  @ApiResponse({ status: 201, description: 'Note created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async createNote(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @Body(new ZodValidationPipe(CreateClinicalNoteSchema)) dto: CreateClinicalNoteDto,
    @GetCurrentUser() user: CurrentUser,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const context = this.createAuditContext(user, ip, userAgent);

    const note = await this.clinicalNotesService.createClinicalNote(
      patientId,
      dto,
      user.displayName,
      context,
    );

    return {
      success: true,
      message: 'Clinical note created successfully',
      data: {
        id: note._id.toString(),
        patientId: note.patientId,
        noteType: note.noteType,
        status: note.status,
        version: note.version,
        authorId: note.authorId,
        authorName: note.authorName,
        createdAt: note.createdAt,
      },
    };
  }

  /**
   * Get all clinical notes for a patient
   *
   * GET /api/v1/clinical/patients/:patientId/notes
   */
  @Get('clinical/patients/:patientId/notes')
  @RequirePermissions('clinical:notes:read')
  @ApiOperation({ summary: 'Get all clinical notes for a patient' })
  @ApiParam({ name: 'patientId', description: 'Patient UUID' })
  @ApiQuery({ name: 'noteType', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getNotes(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @Query(new ZodValidationPipe(ClinicalNoteQuerySchema)) query: ClinicalNoteQueryDto,
    @GetCurrentUser() user: CurrentUser,
  ) {
    const context = {
      tenantId: user.tenantId,
      organizationId: user.organizationId,
      clinicId: user.clinicId,
    };

    const result = await this.clinicalNotesService.getByPatient(patientId, context, query);

    return {
      success: true,
      data: result.data.map((note) => ({
        id: note._id.toString(),
        patientId: note.patientId,
        noteType: note.noteType,
        status: note.status,
        version: note.version,
        title: note.title,
        chiefComplaint: note.chiefComplaint,
        authorId: note.authorId,
        authorName: note.authorName,
        signedAt: note.signature?.signedAt,
        diagnosisCount: note.diagnoses.length,
        procedureCount: note.procedures.length,
        attachmentCount: note.attachments.length,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      })),
      meta: result.meta,
    };
  }

  /**
   * Get a specific clinical note
   *
   * GET /api/v1/clinical/patients/:patientId/notes/:noteId
   */
  @Get('clinical/patients/:patientId/notes/:noteId')
  @RequirePermissions('clinical:notes:read')
  @ApiOperation({ summary: 'Get a specific clinical note' })
  @ApiParam({ name: 'patientId', description: 'Patient UUID' })
  @ApiParam({ name: 'noteId', description: 'Note UUID' })
  async getNote(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @Param('noteId', ParseUUIDPipe) noteId: string,
    @GetCurrentUser() user: CurrentUser,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const context = this.createAuditContext(user, ip, userAgent);

    const note = await this.clinicalNotesService.getById(noteId, context);

    // Verify note belongs to the specified patient
    if (note.patientId !== patientId) {
      return {
        success: false,
        message: 'Clinical note not found for this patient',
      };
    }

    return {
      success: true,
      data: {
        id: note._id.toString(),
        patientId: note.patientId,
        tenantId: note.tenantId,
        organizationId: note.organizationId,
        clinicId: note.clinicId,
        appointmentId: note.appointmentId,
        noteType: note.noteType,
        soap: note.soap,
        chiefComplaint: note.chiefComplaint,
        diagnoses: note.diagnoses.map((d) => ({
          id: d._id.toString(),
          icd10Code: d.icd10Code,
          description: d.description,
          tooth: d.tooth,
          isPrimary: d.isPrimary,
          notes: d.notes,
        })),
        procedures: note.procedures.map((p) => ({
          id: p._id.toString(),
          cdtCode: p.cdtCode,
          description: p.description,
          teeth: p.teeth,
          surfaces: p.surfaces,
          status: p.status,
          completedAt: p.completedAt,
          performedBy: p.performedBy,
          notes: p.notes,
        })),
        attachments: note.attachments.map((a) => ({
          id: a._id.toString(),
          fileId: a.fileId,
          type: a.type,
          fileName: a.fileName,
          fileSize: a.fileSize,
          mimeType: a.mimeType,
          description: a.description,
          annotationCount: a.annotations.length,
          uploadedAt: a.uploadedAt,
        })),
        authorId: note.authorId,
        authorName: note.authorName,
        authorCredentials: note.authorCredentials,
        signature: note.signature
          ? {
              signedBy: note.signature.signedBy,
              signerName: note.signature.signerName,
              credentials: note.signature.credentials,
              signedAt: note.signature.signedAt,
              signatureMethod: note.signature.signatureMethod,
            }
          : undefined,
        version: note.version,
        previousVersionId: note.previousVersionId,
        amendmentReason: note.amendmentReason,
        status: note.status,
        title: note.title,
        content: note.content,
        treatmentPlanId: note.treatmentPlanId,
        tags: note.tags,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
        createdBy: note.createdBy,
        updatedBy: note.updatedBy,
      },
    };
  }

  /**
   * Update a draft clinical note
   *
   * PUT /api/v1/clinical/patients/:patientId/notes/:noteId
   */
  @Put('clinical/patients/:patientId/notes/:noteId')
  @RequirePermissions('clinical:notes:update')
  @ApiOperation({ summary: 'Update a draft clinical note' })
  @ApiParam({ name: 'patientId', description: 'Patient UUID' })
  @ApiParam({ name: 'noteId', description: 'Note UUID' })
  @ApiQuery({
    name: 'version',
    required: true,
    description: 'Expected version for optimistic locking',
  })
  async updateNote(
    @Param('patientId', ParseUUIDPipe) _patientId: string,
    @Param('noteId', ParseUUIDPipe) noteId: string,
    @Body(new ZodValidationPipe(UpdateClinicalNoteSchema)) dto: UpdateClinicalNoteDto,
    @Query('version') version: string,
    @GetCurrentUser() user: CurrentUser,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const context = this.createAuditContext(user, ip, userAgent);
    const expectedVersion = parseInt(version, 10) || 1;

    const note = await this.clinicalNotesService.updateClinicalNote(
      noteId,
      dto,
      expectedVersion,
      context,
    );

    return {
      success: true,
      message: 'Clinical note updated successfully',
      data: {
        id: note._id.toString(),
        status: note.status,
        version: note.version,
        updatedAt: note.updatedAt,
      },
    };
  }

  // ============================================================================
  // SIGNING WORKFLOW
  // ============================================================================

  /**
   * Sign a clinical note (digitally finalize)
   *
   * POST /api/v1/clinical/patients/:patientId/notes/:noteId/sign
   */
  @Post('clinical/patients/:patientId/notes/:noteId/sign')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('clinical:notes:sign')
  @ApiOperation({ summary: 'Sign a clinical note (digitally finalize)' })
  @ApiParam({ name: 'patientId', description: 'Patient UUID' })
  @ApiParam({ name: 'noteId', description: 'Note UUID' })
  async signNote(
    @Param('patientId', ParseUUIDPipe) _patientId: string,
    @Param('noteId', ParseUUIDPipe) noteId: string,
    @Body(new ZodValidationPipe(SignClinicalNoteSchema)) dto: SignClinicalNoteDto,
    @GetCurrentUser() user: CurrentUser,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const context = this.createAuditContext(user, ip, userAgent);

    // Add IP and user agent to signature
    const signatureDto: SignClinicalNoteDto = {
      ...dto,
      ipAddress: ip,
      userAgent,
    };

    const note = await this.clinicalNotesService.signClinicalNote(noteId, signatureDto, context);

    return {
      success: true,
      message: 'Clinical note signed successfully',
      data: {
        id: note._id.toString(),
        status: note.status,
        version: note.version,
        signature: {
          signedBy: note.signature!.signedBy,
          signerName: note.signature!.signerName,
          signedAt: note.signature!.signedAt,
          signatureMethod: note.signature!.signatureMethod,
        },
      },
    };
  }

  /**
   * Create an amendment to a signed note
   *
   * POST /api/v1/clinical/patients/:patientId/notes/:noteId/amend
   */
  @Post('clinical/patients/:patientId/notes/:noteId/amend')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('clinical:notes:amend')
  @ApiOperation({ summary: 'Create an amendment to a signed clinical note' })
  @ApiParam({ name: 'patientId', description: 'Patient UUID' })
  @ApiParam({ name: 'noteId', description: 'Note UUID' })
  async amendNote(
    @Param('patientId', ParseUUIDPipe) _patientId: string,
    @Param('noteId', ParseUUIDPipe) noteId: string,
    @Body(new ZodValidationPipe(AmendClinicalNoteSchema)) dto: AmendClinicalNoteDto,
    @GetCurrentUser() user: CurrentUser,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const context = this.createAuditContext(user, ip, userAgent);

    const result = await this.clinicalNotesService.amendClinicalNote(noteId, dto, context);

    return {
      success: true,
      message: 'Clinical note amended successfully',
      data: {
        originalNote: {
          id: result.original._id.toString(),
          status: result.original.status,
          version: result.original.version,
        },
        amendment: {
          id: result.amendment._id.toString(),
          status: result.amendment.status,
          version: result.amendment.version,
          amendmentReason: result.amendment.amendmentReason,
          previousVersionId: result.amendment.previousVersionId,
          createdAt: result.amendment.createdAt,
        },
      },
    };
  }

  // ============================================================================
  // VERSION HISTORY
  // ============================================================================

  /**
   * Get version history for a note (amendment chain)
   *
   * GET /api/v1/clinical/patients/:patientId/notes/:noteId/versions
   */
  @Get('clinical/patients/:patientId/notes/:noteId/versions')
  @RequirePermissions('clinical:notes:read')
  @ApiOperation({ summary: 'Get version history for a clinical note' })
  @ApiParam({ name: 'patientId', description: 'Patient UUID' })
  @ApiParam({ name: 'noteId', description: 'Note UUID' })
  async getVersionHistory(
    @Param('patientId', ParseUUIDPipe) _patientId: string,
    @Param('noteId', ParseUUIDPipe) noteId: string,
    @GetCurrentUser() user: CurrentUser,
  ) {
    const context = {
      tenantId: user.tenantId,
      organizationId: user.organizationId,
      clinicId: user.clinicId,
    };

    const versions = await this.clinicalNotesService.getVersionHistory(noteId, context);

    return {
      success: true,
      data: {
        totalVersions: versions.length,
        versions: versions.map((note, index) => ({
          id: note._id.toString(),
          version: note.version,
          status: note.status,
          amendmentReason: note.amendmentReason,
          previousVersionId: note.previousVersionId,
          authorId: note.authorId,
          authorName: note.authorName,
          signedAt: note.signature?.signedAt,
          signerName: note.signature?.signerName,
          createdAt: note.createdAt,
          isCurrentVersion: index === 0,
        })),
      },
    };
  }

  /**
   * Get audit history for a note
   *
   * GET /api/v1/clinical/patients/:patientId/notes/:noteId/history
   */
  @Get('clinical/patients/:patientId/notes/:noteId/history')
  @RequirePermissions('clinical:notes:audit')
  @ApiOperation({ summary: 'Get audit history for a clinical note' })
  @ApiParam({ name: 'patientId', description: 'Patient UUID' })
  @ApiParam({ name: 'noteId', description: 'Note UUID' })
  async getAuditHistory(
    @Param('patientId', ParseUUIDPipe) _patientId: string,
    @Param('noteId', ParseUUIDPipe) noteId: string,
    @Query('limit') limit: string,
    @Query('offset') offset: string,
    @GetCurrentUser() user: CurrentUser,
  ) {
    const context = {
      tenantId: user.tenantId,
      organizationId: user.organizationId,
      clinicId: user.clinicId,
    };

    const history = await this.clinicalNotesService.getAuditHistory(noteId, context, {
      limit: parseInt(limit, 10) || 50,
      offset: parseInt(offset, 10) || 0,
    });

    return {
      success: true,
      data: history.map((entry) => ({
        id: entry._id.toString(),
        changeType: entry.changeType,
        previousStatus: entry.previousStatus,
        newStatus: entry.newStatus,
        version: entry.version,
        changedBy: entry.changedBy,
        changedByName: entry.changedByName,
        reason: entry.reason,
        createdAt: entry.createdAt,
      })),
    };
  }

  // ============================================================================
  // ATTACHMENTS
  // ============================================================================

  /**
   * Add an attachment to a clinical note
   *
   * POST /api/v1/clinical/patients/:patientId/notes/:noteId/attachments
   */
  @Post('clinical/patients/:patientId/notes/:noteId/attachments')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('clinical:notes:update')
  @ApiOperation({ summary: 'Add an attachment to a clinical note' })
  @ApiParam({ name: 'patientId', description: 'Patient UUID' })
  @ApiParam({ name: 'noteId', description: 'Note UUID' })
  async addAttachment(
    @Param('patientId', ParseUUIDPipe) _patientId: string,
    @Param('noteId', ParseUUIDPipe) noteId: string,
    @Body(new ZodValidationPipe(AddAttachmentSchema)) dto: AddAttachmentDto,
    @GetCurrentUser() user: CurrentUser,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const context = this.createAuditContext(user, ip, userAgent);

    const note = await this.clinicalNotesService.addAttachment(noteId, dto, context);

    // Find the newly added attachment
    const attachment = note.attachments[note.attachments.length - 1];

    return {
      success: true,
      message: 'Attachment added successfully',
      data: {
        noteId: note._id.toString(),
        noteVersion: note.version,
        attachment: {
          id: attachment._id.toString(),
          fileId: attachment.fileId,
          type: attachment.type,
          fileName: attachment.fileName,
          uploadedAt: attachment.uploadedAt,
        },
      },
    };
  }

  // ============================================================================
  // DIAGNOSES
  // ============================================================================

  /**
   * Add a diagnosis to a clinical note
   *
   * POST /api/v1/clinical/patients/:patientId/notes/:noteId/diagnoses
   */
  @Post('clinical/patients/:patientId/notes/:noteId/diagnoses')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('clinical:notes:update')
  @ApiOperation({ summary: 'Add a diagnosis to a clinical note' })
  @ApiParam({ name: 'patientId', description: 'Patient UUID' })
  @ApiParam({ name: 'noteId', description: 'Note UUID' })
  async addDiagnosis(
    @Param('patientId', ParseUUIDPipe) _patientId: string,
    @Param('noteId', ParseUUIDPipe) noteId: string,
    @Body(new ZodValidationPipe(CreateDiagnosisSchema)) dto: CreateDiagnosisDto,
    @GetCurrentUser() user: CurrentUser,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const context = this.createAuditContext(user, ip, userAgent);

    const note = await this.clinicalNotesService.addDiagnosis(noteId, dto, context);

    // Find the newly added diagnosis
    const diagnosis = note.diagnoses[note.diagnoses.length - 1];

    return {
      success: true,
      message: 'Diagnosis added successfully',
      data: {
        noteId: note._id.toString(),
        noteVersion: note.version,
        diagnosis: {
          id: diagnosis._id.toString(),
          icd10Code: diagnosis.icd10Code,
          description: diagnosis.description,
          tooth: diagnosis.tooth,
          isPrimary: diagnosis.isPrimary,
        },
      },
    };
  }

  // ============================================================================
  // PROCEDURES
  // ============================================================================

  /**
   * Add a procedure to a clinical note
   *
   * POST /api/v1/clinical/patients/:patientId/notes/:noteId/procedures
   */
  @Post('clinical/patients/:patientId/notes/:noteId/procedures')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('clinical:notes:update')
  @ApiOperation({ summary: 'Add a procedure to a clinical note' })
  @ApiParam({ name: 'patientId', description: 'Patient UUID' })
  @ApiParam({ name: 'noteId', description: 'Note UUID' })
  async addProcedure(
    @Param('patientId', ParseUUIDPipe) _patientId: string,
    @Param('noteId', ParseUUIDPipe) noteId: string,
    @Body(new ZodValidationPipe(CreateProcedureNoteSchema)) dto: CreateProcedureNoteDto,
    @GetCurrentUser() user: CurrentUser,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const context = this.createAuditContext(user, ip, userAgent);

    const note = await this.clinicalNotesService.addProcedure(noteId, dto, context);

    // Find the newly added procedure
    const procedure = note.procedures[note.procedures.length - 1];

    return {
      success: true,
      message: 'Procedure added successfully',
      data: {
        noteId: note._id.toString(),
        noteVersion: note.version,
        procedure: {
          id: procedure._id.toString(),
          cdtCode: procedure.cdtCode,
          description: procedure.description,
          teeth: procedure.teeth,
          surfaces: procedure.surfaces,
          status: procedure.status,
        },
      },
    };
  }

  /**
   * Complete a procedure in a clinical note
   *
   * POST /api/v1/clinical/patients/:patientId/notes/:noteId/procedures/:procedureId/complete
   */
  @Post('clinical/patients/:patientId/notes/:noteId/procedures/:procedureId/complete')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('clinical:notes:update')
  @ApiOperation({ summary: 'Mark a procedure as completed' })
  @ApiParam({ name: 'patientId', description: 'Patient UUID' })
  @ApiParam({ name: 'noteId', description: 'Note UUID' })
  @ApiParam({ name: 'procedureId', description: 'Procedure ID within the note' })
  async completeProcedure(
    @Param('patientId', ParseUUIDPipe) _patientId: string,
    @Param('noteId', ParseUUIDPipe) noteId: string,
    @Param('procedureId') procedureId: string,
    @Body(new ZodValidationPipe(CompleteProcedureSchema)) dto: CompleteProcedureDto,
    @GetCurrentUser() user: CurrentUser,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const context = this.createAuditContext(user, ip, userAgent);

    const note = await this.clinicalNotesService.completeProcedure(
      noteId,
      procedureId,
      dto,
      context,
    );

    // Find the completed procedure
    const procedure = note.procedures.find((p) => p._id.toString() === procedureId);

    return {
      success: true,
      message: 'Procedure marked as completed',
      data: {
        noteId: note._id.toString(),
        noteVersion: note.version,
        procedure: {
          id: procedure!._id.toString(),
          cdtCode: procedure!.cdtCode,
          status: procedure!.status,
          completedAt: procedure!.completedAt,
          performedBy: procedure!.performedBy,
        },
      },
    };
  }

  // ============================================================================
  // SOFT DELETE
  // ============================================================================

  /**
   * Soft delete a clinical note (draft only)
   *
   * DELETE /api/v1/clinical/patients/:patientId/notes/:noteId
   */
  @Delete('clinical/patients/:patientId/notes/:noteId')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('clinical:notes:delete')
  @ApiOperation({ summary: 'Soft delete a clinical note (draft notes only)' })
  @ApiParam({ name: 'patientId', description: 'Patient UUID' })
  @ApiParam({ name: 'noteId', description: 'Note UUID' })
  async deleteNote(
    @Param('patientId', ParseUUIDPipe) _patientId: string,
    @Param('noteId', ParseUUIDPipe) noteId: string,
    @Body('reason') reason: string,
    @GetCurrentUser() user: CurrentUser,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const context = this.createAuditContext(user, ip, userAgent);

    const note = await this.clinicalNotesService.softDeleteNote(noteId, reason, context);

    return {
      success: true,
      message: 'Clinical note deleted successfully',
      data: {
        id: note._id.toString(),
        deletedAt: note.deletedAt,
        deleteReason: note.deleteReason,
      },
    };
  }

  // ============================================================================
  // DASHBOARD / METRICS
  // ============================================================================

  /**
   * Get unsigned drafts for current user (signature workflow)
   *
   * GET /api/v1/clinical/notes/unsigned-drafts
   */
  @Get('clinical/notes/unsigned-drafts')
  @RequirePermissions('clinical:notes:read')
  @ApiOperation({ summary: 'Get unsigned draft notes for the current user' })
  async getUnsignedDrafts(@GetCurrentUser() user: CurrentUser) {
    const context = {
      tenantId: user.tenantId,
      organizationId: user.organizationId,
      clinicId: user.clinicId,
    };

    const drafts = await this.clinicalNotesService.getUnsignedDrafts(user.userId, context);

    return {
      success: true,
      data: drafts.map((note) => ({
        id: note._id.toString(),
        patientId: note.patientId,
        noteType: note.noteType,
        title: note.title,
        chiefComplaint: note.chiefComplaint,
        createdAt: note.createdAt,
        hoursOld: Math.round((Date.now() - new Date(note.createdAt).getTime()) / (60 * 60 * 1000)),
      })),
      meta: {
        total: drafts.length,
      },
    };
  }

  /**
   * Get note status counts for dashboard
   *
   * GET /api/v1/clinical/notes/status-counts
   */
  @Get('clinical/notes/status-counts')
  @RequirePermissions('clinical:notes:read')
  @ApiOperation({ summary: 'Get clinical note status counts for dashboard' })
  async getStatusCounts(@GetCurrentUser() user: CurrentUser) {
    const context = {
      tenantId: user.tenantId,
      organizationId: user.organizationId,
      clinicId: user.clinicId,
    };

    const counts = await this.clinicalNotesService.getStatusCounts(context);

    return {
      success: true,
      data: counts,
    };
  }
}
