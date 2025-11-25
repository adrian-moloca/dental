/**
 * Imaging & Diagnostics validation schemas tests
 * @module shared-validation/schemas/imaging
 */

import { describe, it, expect } from 'vitest';
import {
  // Enums
  ImagingModality,
  ImagingRegion,
  ImagingStudyStatus,
  ImagingFileType,
  FindingSeverity,
  FindingType,
  ReportType,
  ReportStatus,
  ToothSurface,
  // Schemas
  CreateImagingStudyDtoSchema,
  UpdateImagingStudyDtoSchema,
  QueryImagingStudiesDtoSchema,
  AttachFilesToStudyDtoSchema,
  DicomMetadataSchema,
  AIFindingSchema,
  AttachAIResultDtoSchema,
  BoundingBoxSchema,
  CreateImagingReportDtoSchema,
  UpdateImagingReportDtoSchema,
  QueryImagingReportsDtoSchema,
  ToothNumberSchema,
  ToothNumbersArraySchema,
} from './imaging.schemas';

describe('Imaging Validation Schemas', () => {
  // ============================================================================
  // TOOTH NUMBER VALIDATION
  // ============================================================================

  describe('ToothNumberSchema', () => {
    it('should accept valid tooth numbers (1-32)', () => {
      expect(ToothNumberSchema.safeParse(1).success).toBe(true);
      expect(ToothNumberSchema.safeParse(16).success).toBe(true);
      expect(ToothNumberSchema.safeParse(32).success).toBe(true);
    });

    it('should reject invalid tooth numbers', () => {
      expect(ToothNumberSchema.safeParse(0).success).toBe(false);
      expect(ToothNumberSchema.safeParse(33).success).toBe(false);
      expect(ToothNumberSchema.safeParse(-1).success).toBe(false);
      expect(ToothNumberSchema.safeParse(1.5).success).toBe(false);
    });
  });

  describe('ToothNumbersArraySchema', () => {
    it('should accept valid tooth number arrays', () => {
      expect(ToothNumbersArraySchema.safeParse([]).success).toBe(true);
      expect(ToothNumbersArraySchema.safeParse([1, 2, 3]).success).toBe(true);
      expect(ToothNumbersArraySchema.safeParse([16, 17, 18, 19]).success).toBe(true);
    });

    it('should reject duplicate tooth numbers', () => {
      const result = ToothNumbersArraySchema.safeParse([1, 2, 2, 3]);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('unique');
      }
    });

    it('should reject arrays with more than 32 teeth', () => {
      const teeth = Array.from({ length: 33 }, (_, i) => i + 1);
      expect(ToothNumbersArraySchema.safeParse(teeth).success).toBe(false);
    });
  });

  // ============================================================================
  // IMAGING STUDY SCHEMAS
  // ============================================================================

  describe('CreateImagingStudyDtoSchema', () => {
    const validStudyData = {
      patientId: '123e4567-e89b-12d3-a456-426614174000',
      modality: ImagingModality.INTRAORAL_XRAY,
      region: ImagingRegion.MAXILLA,
      studyDate: new Date('2024-11-20').toISOString(),
      description: 'Routine dental X-ray examination',
      referringProviderId: '123e4567-e89b-12d3-a456-426614174001',
    };

    it('should accept valid imaging study data', () => {
      const result = CreateImagingStudyDtoSchema.safeParse(validStudyData);
      expect(result.success).toBe(true);
    });

    it('should require tooth numbers when region is SPECIFIC_TOOTH', () => {
      const data = {
        ...validStudyData,
        region: ImagingRegion.SPECIFIC_TOOTH,
      };
      const result = CreateImagingStudyDtoSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Tooth numbers are required');
      }
    });

    it('should accept tooth numbers with SPECIFIC_TOOTH region', () => {
      const data = {
        ...validStudyData,
        region: ImagingRegion.SPECIFIC_TOOTH,
        toothNumbers: [14, 15],
      };
      const result = CreateImagingStudyDtoSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject future study dates', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const data = {
        ...validStudyData,
        studyDate: futureDate.toISOString(),
      };
      const result = CreateImagingStudyDtoSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('future');
      }
    });

    it('should accept optional fields', () => {
      const data = {
        ...validStudyData,
        clinicalNotes: 'Patient reports pain in upper right quadrant',
        appointmentId: '123e4567-e89b-12d3-a456-426614174002',
        procedureId: '123e4567-e89b-12d3-a456-426614174003',
        urgency: 'URGENT' as const,
      };
      const result = CreateImagingStudyDtoSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject invalid modality', () => {
      const data = {
        ...validStudyData,
        modality: 'INVALID_MODALITY',
      };
      expect(CreateImagingStudyDtoSchema.safeParse(data).success).toBe(false);
    });

    it('should validate description length', () => {
      const data = {
        ...validStudyData,
        description: 'x'.repeat(501),
      };
      expect(CreateImagingStudyDtoSchema.safeParse(data).success).toBe(false);
    });
  });

  describe('UpdateImagingStudyDtoSchema', () => {
    it('should accept partial updates', () => {
      const data = {
        status: ImagingStudyStatus.COMPLETED,
        completedAt: new Date().toISOString(),
      };
      const result = UpdateImagingStudyDtoSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should require completedAt when status is COMPLETED', () => {
      const data = {
        status: ImagingStudyStatus.COMPLETED,
      };
      const result = UpdateImagingStudyDtoSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('completedAt');
      }
    });

    it('should accept status COMPLETED with completedAt', () => {
      const data = {
        status: ImagingStudyStatus.COMPLETED,
        completedAt: new Date().toISOString(),
      };
      const result = UpdateImagingStudyDtoSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept empty update object', () => {
      const result = UpdateImagingStudyDtoSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  describe('QueryImagingStudiesDtoSchema', () => {
    it('should accept valid query parameters', () => {
      const data = {
        patientId: '123e4567-e89b-12d3-a456-426614174000',
        modality: ImagingModality.CBCT,
        status: ImagingStudyStatus.FINAL,
        page: 1,
        limit: 20,
      };
      const result = QueryImagingStudiesDtoSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should validate date range', () => {
      const data = {
        fromDate: new Date('2024-12-01').toISOString(),
        toDate: new Date('2024-11-01').toISOString(),
      };
      const result = QueryImagingStudiesDtoSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('before');
      }
    });

    it('should apply defaults', () => {
      const result = QueryImagingStudiesDtoSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
        expect(result.data.sortBy).toBe('studyDate');
        expect(result.data.sortOrder).toBe('desc');
      }
    });

    it('should enforce limit maximum', () => {
      const data = { limit: 101 };
      expect(QueryImagingStudiesDtoSchema.safeParse(data).success).toBe(false);
    });
  });

  // ============================================================================
  // IMAGING FILE SCHEMAS
  // ============================================================================

  describe('DicomMetadataSchema', () => {
    it('should accept valid DICOM metadata', () => {
      const data = {
        studyInstanceUID: '1.2.840.113619.2.176.3596.3538055',
        seriesInstanceUID: '1.2.840.113619.2.176.3596.3538056',
        sopInstanceUID: '1.2.840.113619.2.176.3596.3538057',
        patientName: 'Doe^John',
        modality: 'DX',
        manufacturer: 'Planmeca',
        kvp: 70,
        exposureTime: 125,
        imageRows: 1024,
        imageColumns: 1024,
      };
      const result = DicomMetadataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept empty DICOM metadata', () => {
      const result = DicomMetadataSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should validate numeric fields', () => {
      const data = {
        kvp: -10,
      };
      expect(DicomMetadataSchema.safeParse(data).success).toBe(false);
    });
  });

  describe('AttachFilesToStudyDtoSchema', () => {
    const validFileData = {
      studyId: '123e4567-e89b-12d3-a456-426614174000',
      files: [
        {
          storageKey: 's3://bucket/path/to/file.dcm',
          fileName: 'xray-01.dcm',
          mimeType: 'application/dicom',
          fileSize: 1024000,
          fileType: ImagingFileType.DICOM,
        },
      ],
    };

    it('should accept valid file attachment data', () => {
      const result = AttachFilesToStudyDtoSchema.safeParse(validFileData);
      expect(result.success).toBe(true);
    });

    it('should require at least one file', () => {
      const data = {
        ...validFileData,
        files: [],
      };
      expect(AttachFilesToStudyDtoSchema.safeParse(data).success).toBe(false);
    });

    it('should enforce file size limit (5GB)', () => {
      const data = {
        ...validFileData,
        files: [
          {
            ...validFileData.files[0],
            fileSize: 6 * 1024 * 1024 * 1024, // 6GB
          },
        ],
      };
      expect(AttachFilesToStudyDtoSchema.safeParse(data).success).toBe(false);
    });

    it('should enforce maximum files limit', () => {
      const data = {
        ...validFileData,
        files: Array(101).fill(validFileData.files[0]),
      };
      expect(AttachFilesToStudyDtoSchema.safeParse(data).success).toBe(false);
    });
  });

  // ============================================================================
  // AI ANALYSIS SCHEMAS
  // ============================================================================

  describe('BoundingBoxSchema', () => {
    it('should accept valid normalized bounding box', () => {
      const data = {
        x: 0.1,
        y: 0.2,
        width: 0.3,
        height: 0.4,
      };
      const result = BoundingBoxSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject bounding box extending beyond image width', () => {
      const data = {
        x: 0.8,
        y: 0.1,
        width: 0.3,
        height: 0.2,
      };
      const result = BoundingBoxSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('width');
      }
    });

    it('should reject bounding box extending beyond image height', () => {
      const data = {
        x: 0.1,
        y: 0.9,
        width: 0.2,
        height: 0.3,
      };
      const result = BoundingBoxSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('height');
      }
    });

    it('should reject coordinates outside 0-1 range', () => {
      expect(BoundingBoxSchema.safeParse({ x: -0.1, y: 0, width: 0.5, height: 0.5 }).success).toBe(false);
      expect(BoundingBoxSchema.safeParse({ x: 0, y: 1.1, width: 0.5, height: 0.5 }).success).toBe(false);
      expect(BoundingBoxSchema.safeParse({ x: 0, y: 0, width: 1.1, height: 0.5 }).success).toBe(false);
      expect(BoundingBoxSchema.safeParse({ x: 0, y: 0, width: 0.5, height: 1.1 }).success).toBe(false);
    });
  });

  describe('AIFindingSchema', () => {
    const validFinding = {
      findingCode: 'CARIES-001',
      findingType: FindingType.CARIES,
      name: 'Dental Caries - Tooth #14',
      severity: FindingSeverity.MODERATE,
      confidence: 0.92,
      toothNumbers: [14],
      surfaces: [ToothSurface.OCCLUSAL, ToothSurface.MESIAL],
    };

    it('should accept valid AI finding', () => {
      const result = AIFindingSchema.safeParse(validFinding);
      expect(result.success).toBe(true);
    });

    it('should validate confidence range (0-1)', () => {
      expect(AIFindingSchema.safeParse({ ...validFinding, confidence: -0.1 }).success).toBe(false);
      expect(AIFindingSchema.safeParse({ ...validFinding, confidence: 1.1 }).success).toBe(false);
      expect(AIFindingSchema.safeParse({ ...validFinding, confidence: 0 }).success).toBe(true);
      expect(AIFindingSchema.safeParse({ ...validFinding, confidence: 1 }).success).toBe(true);
    });

    it('should accept finding with bounding box', () => {
      const data = {
        ...validFinding,
        boundingBox: { x: 0.1, y: 0.2, width: 0.3, height: 0.4 },
      };
      const result = AIFindingSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept finding with annotations', () => {
      const data = {
        ...validFinding,
        annotations: [
          {
            type: 'POINT' as const,
            coordinates: [0.5, 0.6],
            label: 'Caries location',
          },
        ],
      };
      const result = AIFindingSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('AttachAIResultDtoSchema', () => {
    const validAIResult = {
      studyId: '123e4567-e89b-12d3-a456-426614174000',
      aiModelName: 'DentalVision AI',
      aiModelVersion: '2.1.0',
      findings: [
        {
          findingCode: 'CARIES-001',
          findingType: FindingType.CARIES,
          name: 'Dental Caries',
          severity: FindingSeverity.MODERATE,
          confidence: 0.92,
        },
      ],
    };

    it('should accept valid AI result', () => {
      const result = AttachAIResultDtoSchema.safeParse(validAIResult);
      expect(result.success).toBe(true);
    });

    it('should accept empty findings array (normal study)', () => {
      const data = {
        ...validAIResult,
        findings: [],
      };
      const result = AttachAIResultDtoSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should enforce maximum findings limit', () => {
      const data = {
        ...validAIResult,
        findings: Array(101).fill(validAIResult.findings[0]),
      };
      expect(AttachAIResultDtoSchema.safeParse(data).success).toBe(false);
    });

    it('should validate overall confidence range', () => {
      expect(
        AttachAIResultDtoSchema.safeParse({ ...validAIResult, overallConfidence: -0.1 }).success,
      ).toBe(false);
      expect(
        AttachAIResultDtoSchema.safeParse({ ...validAIResult, overallConfidence: 1.1 }).success,
      ).toBe(false);
      expect(
        AttachAIResultDtoSchema.safeParse({ ...validAIResult, overallConfidence: 0.95 }).success,
      ).toBe(true);
    });
  });

  // ============================================================================
  // IMAGING REPORT SCHEMAS
  // ============================================================================

  describe('CreateImagingReportDtoSchema', () => {
    const validReport = {
      studyId: '123e4567-e89b-12d3-a456-426614174000',
      reportType: ReportType.FINAL,
      findings: 'Multiple dental caries identified in teeth #14, #15, and #18.',
      impression: 'Moderate dental caries requiring treatment.',
      recommendations: 'Recommend restorative treatment for affected teeth.',
    };

    it('should accept valid imaging report', () => {
      const result = CreateImagingReportDtoSchema.safeParse(validReport);
      expect(result.success).toBe(true);
    });

    it('should apply default status (DRAFT)', () => {
      const result = CreateImagingReportDtoSchema.safeParse(validReport);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe(ReportStatus.DRAFT);
      }
    });

    it('should validate text field lengths', () => {
      expect(
        CreateImagingReportDtoSchema.safeParse({ ...validReport, findings: 'x'.repeat(5001) })
          .success,
      ).toBe(false);
      expect(
        CreateImagingReportDtoSchema.safeParse({ ...validReport, impression: 'x'.repeat(2001) })
          .success,
      ).toBe(false);
      expect(
        CreateImagingReportDtoSchema.safeParse({ ...validReport, recommendations: 'x'.repeat(2001) })
          .success,
      ).toBe(false);
    });

    it('should accept optional fields', () => {
      const data = {
        ...validReport,
        technique: 'Intraoral periapical radiography',
        comparison: 'No prior studies available',
        clinicalHistory: 'Patient reports tooth pain',
        signedById: '123e4567-e89b-12d3-a456-426614174001',
        signedAt: new Date().toISOString(),
        criticalFindings: ['Periapical abscess requiring immediate treatment'],
      };
      const result = CreateImagingReportDtoSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('UpdateImagingReportDtoSchema', () => {
    it('should accept partial updates', () => {
      const data = {
        status: ReportStatus.FINAL,
        signedById: '123e4567-e89b-12d3-a456-426614174001',
        signedAt: new Date().toISOString(),
      };
      const result = UpdateImagingReportDtoSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should require signedById and signedAt when status is FINAL', () => {
      const data = {
        status: ReportStatus.FINAL,
      };
      const result = UpdateImagingReportDtoSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('signedById');
      }
    });

    it('should require amendmentReason when status is AMENDED', () => {
      const data = {
        status: ReportStatus.AMENDED,
      };
      const result = UpdateImagingReportDtoSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('amendmentReason');
      }
    });

    it('should accept status AMENDED with amendmentReason', () => {
      const data = {
        status: ReportStatus.AMENDED,
        amendmentReason: 'Corrected tooth number identification',
      };
      const result = UpdateImagingReportDtoSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept empty update object', () => {
      const result = UpdateImagingReportDtoSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  describe('QueryImagingReportsDtoSchema', () => {
    it('should accept valid query parameters', () => {
      const data = {
        patientId: '123e4567-e89b-12d3-a456-426614174000',
        reportType: ReportType.FINAL,
        status: ReportStatus.FINAL,
        hasCriticalFindings: true,
        page: 1,
        limit: 20,
      };
      const result = QueryImagingReportsDtoSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should validate date range', () => {
      const data = {
        fromDate: new Date('2024-12-01').toISOString(),
        toDate: new Date('2024-11-01').toISOString(),
      };
      const result = QueryImagingReportsDtoSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('before');
      }
    });

    it('should apply defaults', () => {
      const result = QueryImagingReportsDtoSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
        expect(result.data.sortBy).toBe('signedAt');
        expect(result.data.sortOrder).toBe('desc');
      }
    });
  });
});
