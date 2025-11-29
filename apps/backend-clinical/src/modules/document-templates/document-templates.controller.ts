/**
 * Document Templates Controller
 *
 * REST API endpoints for document template management and generation.
 */

import { Controller, Get, Post, Body, Param, UseGuards, Req, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';

import { DocumentTemplatesService } from './document-templates.service';
import {
  GenerateDocumentDto,
  GeneratedDocumentResponseDto,
  PreviewTemplateDto,
  GenerateAppointmentDocumentsDto,
  BatchGeneratedDocumentsResponseDto,
} from './dto/generate-document.dto';
import { DocumentTemplate } from './entities/document-template.schema';

// Assuming these guards exist from auth module
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantIsolationGuard } from '../auth/guards/tenant-isolation.guard';

@ApiTags('Document Templates')
@ApiBearerAuth()
@Controller('document-templates')
@UseGuards(JwtAuthGuard, TenantIsolationGuard)
export class DocumentTemplatesController {
  constructor(private readonly documentTemplatesService: DocumentTemplatesService) {}

  /**
   * List all available templates for tenant
   */
  @Get()
  @ApiOperation({ summary: 'List all document templates' })
  @ApiResponse({
    status: 200,
    description: 'Templates retrieved successfully',
    type: [DocumentTemplate],
  })
  async findAll(@Req() req: any): Promise<DocumentTemplate[]> {
    const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
    return this.documentTemplatesService.findAll(tenantId);
  }

  /**
   * Get template by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get template by ID' })
  @ApiResponse({ status: 200, description: 'Template found', type: DocumentTemplate })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async findOne(@Param('id') id: string, @Req() req: any): Promise<DocumentTemplate> {
    const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
    return this.documentTemplatesService.findOne(id, tenantId);
  }

  /**
   * Generate document from template
   */
  @Post('generate')
  @ApiOperation({ summary: 'Generate document from template' })
  @ApiResponse({
    status: 201,
    description: 'Document generated successfully',
    type: GeneratedDocumentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Template or patient not found' })
  async generateDocument(
    @Body() dto: GenerateDocumentDto,
    @Req() req: any,
  ): Promise<GeneratedDocumentResponseDto> {
    const context = {
      tenantId: req.user?.tenantId || req.headers['x-tenant-id'],
      clinicId: req.user?.clinicId || req.headers['x-clinic-id'],
      userId: req.user?.id,
    };

    return this.documentTemplatesService.generateDocument(dto, context);
  }

  /**
   * Generate document and return as download stream
   */
  @Post('generate/download')
  @ApiOperation({ summary: 'Generate and download document' })
  @ApiResponse({ status: 200, description: 'Document download started' })
  async generateAndDownload(
    @Body() dto: GenerateDocumentDto,
    @Req() req: any,
    @Res() res: Response,
  ): Promise<void> {
    const context = {
      tenantId: req.user?.tenantId || req.headers['x-tenant-id'],
      clinicId: req.user?.clinicId || req.headers['x-clinic-id'],
      userId: req.user?.id,
    };

    // Force base64 return to send directly
    const dtoWithBase64 = { ...dto, returnBase64: true, outputFormat: 'pdf' as const };
    const result = await this.documentTemplatesService.generateDocument(dtoWithBase64, context);

    // Convert base64 to buffer
    const buffer = Buffer.from(result.documentBase64!, 'base64');

    // Set response headers
    res.set({
      'Content-Type': result.mimeType,
      'Content-Disposition': `attachment; filename="${result.fileName}"`,
      'Content-Length': buffer.length,
    });

    // Send buffer
    res.send(buffer);
  }

  /**
   * Preview template with sample data
   */
  @Post('preview')
  @ApiOperation({ summary: 'Preview template with sample data' })
  @ApiResponse({ status: 200, description: 'Preview generated successfully' })
  async previewTemplate(
    @Body() _dto: PreviewTemplateDto,
    @Req() _req: any,
  ): Promise<{ html: string }> {
    // Implementation would return HTML preview
    // Placeholder for now
    return {
      html: '<html><body><h1>Template Preview</h1><p>Not yet implemented</p></body></html>',
    };
  }

  /**
   * Generate multiple documents for an appointment
   */
  @Post('generate-batch/appointment')
  @ApiOperation({ summary: 'Generate multiple documents for appointment' })
  @ApiResponse({
    status: 201,
    description: 'Documents generated successfully',
    type: BatchGeneratedDocumentsResponseDto,
  })
  async generateAppointmentDocuments(
    @Body() dto: GenerateAppointmentDocumentsDto,
    @Req() req: any,
  ): Promise<BatchGeneratedDocumentsResponseDto> {
    const context = {
      tenantId: req.user?.tenantId || req.headers['x-tenant-id'],
      clinicId: req.user?.clinicId || req.headers['x-clinic-id'],
      userId: req.user?.id,
    };

    // Generate each document type
    const documents: GeneratedDocumentResponseDto[] = [];

    for (const docType of dto.documentTypes) {
      const generateDto: GenerateDocumentDto = {
        templateType: docType,
        patientId: 'patient-id-from-appointment', // Would fetch from appointment
        appointmentId: dto.appointmentId,
        outputFormat: 'pdf',
        returnBase64: !dto.returnAsZip,
      };

      const doc = await this.documentTemplatesService.generateDocument(generateDto, context);
      documents.push(doc);
    }

    const response: BatchGeneratedDocumentsResponseDto = {
      batchId: `batch-${Date.now()}`,
      documents,
      count: documents.length,
    };

    if (dto.returnAsZip) {
      // In production, create ZIP archive and upload to S3
      response.zipUrl = `/api/v1/documents/download/batch/${response.batchId}`;
    }

    return response;
  }

  /**
   * Generate document for patient (from patient profile)
   */
  @Post('patients/:patientId/documents/generate')
  @ApiOperation({ summary: 'Generate document for patient' })
  @ApiResponse({
    status: 201,
    description: 'Document generated successfully',
    type: GeneratedDocumentResponseDto,
  })
  async generatePatientDocument(
    @Param('patientId') patientId: string,
    @Body() dto: Omit<GenerateDocumentDto, 'patientId'>,
    @Req() req: any,
  ): Promise<GeneratedDocumentResponseDto> {
    const context = {
      tenantId: req.user?.tenantId || req.headers['x-tenant-id'],
      clinicId: req.user?.clinicId || req.headers['x-clinic-id'],
      userId: req.user?.id,
    };

    const fullDto: GenerateDocumentDto = {
      ...dto,
      patientId,
    };

    return this.documentTemplatesService.generateDocument(fullDto, context);
  }

  /**
   * Prepare all required documents for appointment
   * (Returns the document types that should be generated)
   */
  @Get('appointments/:appointmentId/prepare')
  @ApiOperation({ summary: 'Get list of required documents for appointment' })
  @ApiResponse({ status: 200, description: 'Required documents list retrieved' })
  async prepareAppointmentDocuments(
    @Param('appointmentId') _appointmentId: string,
    @Req() _req: any,
  ): Promise<{ required: string[]; optional: string[] }> {
    // Logic to determine which documents are required based on appointment type
    // Placeholder implementation
    return {
      required: ['consimtamant_general'],
      optional: ['consimtamant_procedura', 'reteta'],
    };
  }
}
