/**
 * Document Templates Service
 *
 * Main service for generating legal documents from templates.
 * Orchestrates template loading, data mapping, placeholder substitution, and PDF generation.
 */

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { promises as fs } from 'fs';
import { join } from 'path';
import * as Mustache from 'mustache';
import { randomUUID } from 'crypto';

import {
  DocumentTemplate,
  DocumentTemplateType,
  DocumentTemplateDocument,
} from './entities/document-template.schema';
import { DocumentRendererService, RenderOptions } from './document-renderer.service';
import { DataMapperService } from './data-mapper.service';
import { GenerateDocumentDto, GeneratedDocumentResponseDto } from './dto/generate-document.dto';
import { DocumentGenerationData } from './interfaces/template-data.interface';

@Injectable()
export class DocumentTemplatesService {
  private readonly logger = new Logger(DocumentTemplatesService.name);
  private readonly templateCache: Map<string, string> = new Map();

  constructor(
    @InjectModel(DocumentTemplate.name)
    private readonly templateModel: Model<DocumentTemplateDocument>,
    private readonly rendererService: DocumentRendererService,
    private readonly dataMapperService: DataMapperService,
  ) {}

  /**
   * Generate document from template
   *
   * @param dto - Generation request
   * @param context - Request context (tenant, clinic, user)
   * @returns Generated document metadata
   */
  async generateDocument(
    dto: GenerateDocumentDto,
    context: { tenantId: string; clinicId: string; userId?: string },
  ): Promise<GeneratedDocumentResponseDto> {
    this.logger.log(`Generating document: ${dto.templateType} for patient: ${dto.patientId}`);

    try {
      // 1. Load template
      const template = await this.getTemplate(dto.templateType, context.tenantId);
      const htmlTemplate = await this.loadTemplateHTML(template);

      // 2. Fetch and map data
      const templateData = await this.dataMapperService.mapDocumentData({
        patientId: dto.patientId,
        tenantId: context.tenantId,
        clinicId: context.clinicId,
        appointmentId: dto.appointmentId,
        treatmentPlanId: dto.treatmentPlanId,
        procedureId: dto.procedureId,
        customData: dto.customData,
      });

      // 3. Substitute placeholders
      const renderedHTML = this.substitutePlaceholders(htmlTemplate, templateData);

      // 4. Generate output
      if (dto.outputFormat === 'html') {
        return this.createHTMLResponse(renderedHTML, dto.templateType);
      } else {
        const renderOptions = this.getRenderOptions(template);
        const pdfDocument = await this.rendererService.renderToPDF(renderedHTML, renderOptions);

        return this.createPDFResponse(pdfDocument, dto.templateType, dto.returnBase64);
      }
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error generating document: ${err.message}`, err.stack);
      throw error;
    }
  }

  /**
   * Get template by type
   *
   * @param templateType - Template type
   * @param tenantId - Tenant ID
   * @returns Template document
   */
  private async getTemplate(
    templateType: DocumentTemplateType,
    tenantId: string,
  ): Promise<DocumentTemplateDocument> {
    const template = await this.templateModel
      .findOne({
        tenantId,
        type: templateType,
        status: 'active',
        isDeleted: false,
      })
      .exec();

    if (!template) {
      throw new NotFoundException(`Template not found: ${templateType}`);
    }

    return template;
  }

  /**
   * Load HTML template content
   *
   * @param template - Template document
   * @returns HTML content
   */
  private async loadTemplateHTML(template: DocumentTemplateDocument): Promise<string> {
    // Get active version
    const activeVersion = template.versions.find(
      (v) => v.version === template.currentVersion && v.isActive,
    );

    if (!activeVersion) {
      throw new NotFoundException(`No active version found for template: ${template.type}`);
    }

    // If version has HTML content stored, use it
    if (activeVersion.htmlContent) {
      return activeVersion.htmlContent;
    }

    // Otherwise, load from file system
    const cacheKey = `${template.type}_${activeVersion.version}`;

    if (this.templateCache.has(cacheKey)) {
      this.logger.debug(`Using cached template: ${cacheKey}`);
      return this.templateCache.get(cacheKey)!;
    }

    const templatePath = this.getTemplatePath(template.type);
    const htmlContent = await fs.readFile(templatePath, 'utf-8');

    this.templateCache.set(cacheKey, htmlContent);

    return htmlContent;
  }

  /**
   * Get file system path for template
   *
   * @param templateType - Template type
   * @returns File path
   */
  private getTemplatePath(templateType: DocumentTemplateType): string {
    const templateFileMap: Record<DocumentTemplateType, string> = {
      [DocumentTemplateType.PATIENT_FORM]: 'fisa-pacient.html',
      [DocumentTemplateType.GENERAL_CONSENT]: 'consimtamant-general.html',
      [DocumentTemplateType.PROCEDURE_CONSENT]: 'consimtamant-procedura.html',
      [DocumentTemplateType.MEDICAL_HISTORY]: 'anamneza.html',
      [DocumentTemplateType.TREATMENT_PLAN]: 'plan-tratament.html',
      [DocumentTemplateType.PRESCRIPTION]: 'reteta.html',
    };

    const fileName = templateFileMap[templateType];
    if (!fileName) {
      throw new NotFoundException(`Template file not found for type: ${templateType}`);
    }

    return join(__dirname, 'templates', fileName);
  }

  /**
   * Substitute placeholders in template
   *
   * @param template - HTML template with {{placeholders}}
   * @param data - Data object
   * @returns Rendered HTML
   */
  private substitutePlaceholders(template: string, data: DocumentGenerationData): string {
    try {
      // Use Mustache for template rendering
      // Mustache supports {{variable}}, {{#section}}...{{/section}}, etc.
      return Mustache.render(template, data);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error substituting placeholders: ${err.message}`, err.stack);
      throw new Error(`Template rendering failed: ${err.message}`);
    }
  }

  /**
   * Get rendering options from template settings
   *
   * @param template - Template document
   * @returns Render options
   */
  private getRenderOptions(template: DocumentTemplateDocument): RenderOptions {
    return {
      pageSize: (template.settings?.pageSize as any) || 'A4',
      orientation: (template.settings?.orientation as any) || 'portrait',
      margins: template.settings?.margins || { top: 50, right: 50, bottom: 50, left: 50 },
      includePageNumbers: template.settings?.includePageNumbers ?? false,
    };
  }

  /**
   * Create HTML response
   *
   * @param html - Rendered HTML
   * @param templateType - Template type
   * @returns Response DTO
   */
  private createHTMLResponse(
    html: string,
    templateType: DocumentTemplateType,
  ): GeneratedDocumentResponseDto {
    const fileName = `${this.getTemplateFileName(templateType)}.html`;

    return {
      documentId: randomUUID(),
      templateType,
      documentBase64: Buffer.from(html, 'utf-8').toString('base64'),
      fileName,
      mimeType: 'text/html',
      fileSize: Buffer.from(html, 'utf-8').length,
      generatedAt: new Date(),
    };
  }

  /**
   * Create PDF response
   *
   * @param pdfDocument - Rendered PDF document
   * @param templateType - Template type
   * @param returnBase64 - Whether to return base64
   * @returns Response DTO
   */
  private createPDFResponse(
    pdfDocument: { buffer: Buffer; mimeType: string; fileName: string; fileSize: number },
    templateType: DocumentTemplateType,
    returnBase64: boolean = false,
  ): GeneratedDocumentResponseDto {
    const fileName = `${this.getTemplateFileName(templateType)}.pdf`;

    const response: GeneratedDocumentResponseDto = {
      documentId: randomUUID(),
      templateType,
      fileName,
      mimeType: pdfDocument.mimeType,
      fileSize: pdfDocument.fileSize,
      generatedAt: new Date(),
    };

    if (returnBase64) {
      response.documentBase64 = this.rendererService.bufferToBase64(pdfDocument.buffer);
    } else {
      // In production, upload to S3 and return URL
      response.documentUrl = `/api/v1/documents/download/${response.documentId}`;
    }

    return response;
  }

  /**
   * Get template file name based on type
   *
   * @param templateType - Template type
   * @returns File name (without extension)
   */
  private getTemplateFileName(templateType: DocumentTemplateType): string {
    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
    return `${templateType}_${timestamp}`;
  }

  /**
   * List all templates for a tenant
   *
   * @param tenantId - Tenant ID
   * @returns List of templates
   */
  async findAll(tenantId: string): Promise<DocumentTemplate[]> {
    return this.templateModel
      .find({
        tenantId,
        isDeleted: false,
      })
      .sort({ type: 1 })
      .exec();
  }

  /**
   * Get template by ID
   *
   * @param id - Template ID
   * @param tenantId - Tenant ID
   * @returns Template document
   */
  async findOne(id: string, tenantId: string): Promise<DocumentTemplate> {
    const template = await this.templateModel
      .findOne({
        id,
        tenantId,
        isDeleted: false,
      })
      .exec();

    if (!template) {
      throw new NotFoundException(`Template not found: ${id}`);
    }

    return template;
  }
}
