/**
 * Clinical Notes DTO Validation Unit Tests
 *
 * Tests for Zod validation schemas ensuring clinical data integrity.
 * Validates ICD-10 codes, CDT codes, FDI tooth numbers, and surface notations.
 *
 * CLINICAL SAFETY: These tests ensure that:
 * - Invalid diagnosis codes are rejected
 * - Invalid procedure codes are rejected
 * - Invalid tooth numbers are rejected
 * - Invalid surfaces are rejected
 * - Only one primary diagnosis is allowed per note
 *
 * @module clinical-notes/dto/tests
 */

import {
  CreateClinicalNoteSchema,
  UpdateClinicalNoteSchema,
  SignClinicalNoteSchema,
  AmendClinicalNoteSchema,
  ClinicalNoteQuerySchema,
  CreateDiagnosisSchema,
  CreateProcedureNoteSchema,
  AddAttachmentSchema,
  CompleteProcedureSchema,
  SOAPNoteSchema,
  validateICD10Format,
  validateCDTFormat,
  validateFDITooth,
  validateSurface,
} from '../../src/modules/clinical-notes/dto/clinical-note.dto';

// ============================================================================
// ICD-10 CODE VALIDATION TESTS
// ============================================================================

describe('ICD-10 Code Validation', () => {
  describe('validateICD10Format', () => {
    it('should accept valid ICD-10 codes', () => {
      const validCodes = [
        'K02',      // Dental caries (3 char)
        'K02.9',    // Dental caries, unspecified
        'K04.0',    // Pulpitis
        'K04.01',   // Reversible pulpitis
        'K05.10',   // Chronic gingivitis
        'K08.1',    // Complete loss of teeth
        'Z01.21',   // Encounter for dental examination
        'S02.5',    // Fracture of tooth
        'M26.69',   // Other dentofacial anomalies
        'K00.0',    // Anodontia
      ];

      validCodes.forEach((code) => {
        expect(validateICD10Format(code)).toBe(true);
      });
    });

    it('should reject invalid ICD-10 codes', () => {
      const invalidCodes = [
        'K2',       // Too short
        '123',      // No letter prefix
        'KK02',     // Double letter
        'K02.12345', // Too many decimal digits
        'k02.9',    // Lowercase letter
        'K02.',     // Trailing decimal
        '.K02',     // Leading decimal
        'K-02',     // Invalid character
        '',         // Empty string
      ];

      invalidCodes.forEach((code) => {
        expect(validateICD10Format(code)).toBe(false);
      });
    });
  });

  describe('CreateDiagnosisSchema', () => {
    it('should accept valid diagnosis', () => {
      const validDiagnosis = {
        icd10Code: 'K02.9',
        description: 'Dental caries, unspecified',
        isPrimary: true,
      };

      const result = CreateDiagnosisSchema.safeParse(validDiagnosis);
      expect(result.success).toBe(true);
    });

    it('should accept diagnosis with tooth number', () => {
      const diagnosisWithTooth = {
        icd10Code: 'K04.0',
        description: 'Pulpitis',
        tooth: '14',
        isPrimary: true,
        notes: 'Severe pain reported',
      };

      const result = CreateDiagnosisSchema.safeParse(diagnosisWithTooth);
      expect(result.success).toBe(true);
    });

    it('should reject invalid ICD-10 code format', () => {
      const invalidDiagnosis = {
        icd10Code: 'INVALID',
        description: 'Test',
        isPrimary: false,
      };

      const result = CreateDiagnosisSchema.safeParse(invalidDiagnosis);
      expect(result.success).toBe(false);
    });

    it('should require description', () => {
      const missingDescription = {
        icd10Code: 'K02.9',
        isPrimary: false,
      };

      const result = CreateDiagnosisSchema.safeParse(missingDescription);
      expect(result.success).toBe(false);
    });
  });
});

// ============================================================================
// CDT CODE VALIDATION TESTS
// ============================================================================

describe('CDT Code Validation', () => {
  describe('validateCDTFormat', () => {
    it('should accept valid CDT codes', () => {
      const validCodes = [
        'D0120',  // Periodic oral evaluation
        'D0140',  // Limited oral evaluation
        'D0150',  // Comprehensive oral evaluation
        'D1110',  // Prophylaxis - adult
        'D2391',  // Resin-based composite - one surface, posterior
        'D2750',  // Crown - porcelain fused to metal
        'D3310',  // Endodontic therapy, anterior tooth
        'D4341',  // Periodontal scaling and root planing
        'D7140',  // Extraction, erupted tooth
        'D9110',  // Emergency treatment
      ];

      validCodes.forEach((code) => {
        expect(validateCDTFormat(code)).toBe(true);
      });
    });

    it('should accept custom codes starting with X', () => {
      const customCodes = [
        'X0001',  // Custom code
        'XCUSTOM', // Custom alphanumeric
        'X-SPECIAL',
      ];

      customCodes.forEach((code) => {
        expect(validateCDTFormat(code)).toBe(true);
      });
    });

    it('should reject invalid CDT codes', () => {
      const invalidCodes = [
        'D123',   // Too few digits
        'D12345', // Too many digits
        '1234',   // Missing D prefix
        'd2391',  // Lowercase d
        'E2391',  // Wrong prefix letter
        'D 2391', // Space in code
        '',       // Empty string
      ];

      invalidCodes.forEach((code) => {
        expect(validateCDTFormat(code)).toBe(false);
      });
    });
  });

  describe('CreateProcedureNoteSchema', () => {
    it('should accept valid procedure', () => {
      const validProcedure = {
        cdtCode: 'D2391',
        description: 'Resin-based composite - one surface, posterior',
        teeth: ['14'],
        surfaces: ['O'],
        status: 'planned',
      };

      const result = CreateProcedureNoteSchema.safeParse(validProcedure);
      expect(result.success).toBe(true);
    });

    it('should accept procedure with multiple teeth and surfaces', () => {
      const multiSurfaceProcedure = {
        cdtCode: 'D2392',
        description: 'Resin-based composite - two surfaces, posterior',
        teeth: ['14', '15'],
        surfaces: ['M', 'O', 'D'],
        status: 'completed',
        completedAt: new Date().toISOString(),
      };

      const result = CreateProcedureNoteSchema.safeParse(multiSurfaceProcedure);
      expect(result.success).toBe(true);
    });

    it('should reject invalid CDT code', () => {
      const invalidProcedure = {
        cdtCode: 'INVALID',
        description: 'Test',
        status: 'planned',
      };

      const result = CreateProcedureNoteSchema.safeParse(invalidProcedure);
      expect(result.success).toBe(false);
    });
  });
});

// ============================================================================
// FDI TOOTH NUMBER VALIDATION TESTS
// ============================================================================

describe('FDI Tooth Number Validation', () => {
  describe('validateFDITooth', () => {
    it('should accept valid permanent teeth (quadrants 1-4)', () => {
      const permanentTeeth = [
        // Upper right (quadrant 1)
        '11', '12', '13', '14', '15', '16', '17', '18',
        // Upper left (quadrant 2)
        '21', '22', '23', '24', '25', '26', '27', '28',
        // Lower left (quadrant 3)
        '31', '32', '33', '34', '35', '36', '37', '38',
        // Lower right (quadrant 4)
        '41', '42', '43', '44', '45', '46', '47', '48',
      ];

      permanentTeeth.forEach((tooth) => {
        expect(validateFDITooth(tooth)).toBe(true);
      });
    });

    it('should accept valid deciduous teeth (quadrants 5-8)', () => {
      const deciduousTeeth = [
        // Upper right primary
        '51', '52', '53', '54', '55',
        // Upper left primary
        '61', '62', '63', '64', '65',
        // Lower left primary
        '71', '72', '73', '74', '75',
        // Lower right primary
        '81', '82', '83', '84', '85',
      ];

      deciduousTeeth.forEach((tooth) => {
        expect(validateFDITooth(tooth)).toBe(true);
      });
    });

    it('should reject invalid tooth numbers', () => {
      const invalidTeeth = [
        '0',      // Too short
        '00',     // Invalid quadrant
        '19',     // Invalid tooth number (max is 8)
        '90',     // Invalid quadrant
        '123',    // Too many digits
        'A1',     // Contains letter
        '1A',     // Contains letter
        '',       // Empty string
      ];

      invalidTeeth.forEach((tooth) => {
        expect(validateFDITooth(tooth)).toBe(false);
      });
    });
  });
});

// ============================================================================
// TOOTH SURFACE VALIDATION TESTS
// ============================================================================

describe('Tooth Surface Validation', () => {
  describe('validateSurface', () => {
    it('should accept valid surfaces', () => {
      const validSurfaces = [
        'M',  // Mesial
        'O',  // Occlusal
        'D',  // Distal
        'B',  // Buccal
        'L',  // Lingual
        'I',  // Incisal
        'F',  // Facial
      ];

      validSurfaces.forEach((surface) => {
        expect(validateSurface(surface)).toBe(true);
      });
    });

    it('should reject invalid surfaces', () => {
      const invalidSurfaces = [
        'm',      // Lowercase
        'o',      // Lowercase
        'X',      // Invalid surface
        'MO',     // Multiple (should be separate)
        '1',      // Numeric
        '',       // Empty
        'MESIAL', // Full name
      ];

      invalidSurfaces.forEach((surface) => {
        expect(validateSurface(surface)).toBe(false);
      });
    });
  });
});

// ============================================================================
// SOAP NOTE SCHEMA TESTS
// ============================================================================

describe('SOAPNoteSchema', () => {
  it('should accept valid SOAP note', () => {
    const validSoap = {
      subjective: 'Patient reports tooth pain in upper right quadrant for 3 days',
      objective: 'Deep caries visible on tooth #3 MOD. Cold test positive. Percussion negative.',
      assessment: 'Reversible pulpitis secondary to dental caries, tooth #3',
      plan: 'Excavate caries, direct restoration D2393. Review in 2 weeks.',
    };

    const result = SOAPNoteSchema.safeParse(validSoap);
    expect(result.success).toBe(true);
  });

  it('should accept empty strings (draft notes)', () => {
    const emptySoap = {
      subjective: '',
      objective: '',
      assessment: '',
      plan: '',
    };

    const result = SOAPNoteSchema.safeParse(emptySoap);
    expect(result.success).toBe(true);
  });

  it('should reject content exceeding max length', () => {
    const tooLongSoap = {
      subjective: 'a'.repeat(10001),
      objective: 'test',
      assessment: 'test',
      plan: 'test',
    };

    const result = SOAPNoteSchema.safeParse(tooLongSoap);
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// CREATE CLINICAL NOTE SCHEMA TESTS
// ============================================================================

describe('CreateClinicalNoteSchema', () => {
  it('should accept valid SOAP note', () => {
    const validNote = {
      noteType: 'soap',
      soap: {
        subjective: 'Patient complaint',
        objective: 'Clinical findings',
        assessment: 'Diagnosis',
        plan: 'Treatment plan',
      },
      diagnoses: [
        { icd10Code: 'K02.9', description: 'Dental caries', isPrimary: true },
      ],
      procedures: [
        { cdtCode: 'D2391', description: 'Filling', status: 'planned', teeth: [], surfaces: [] },
      ],
      tags: [],
    };

    const result = CreateClinicalNoteSchema.safeParse(validNote);
    expect(result.success).toBe(true);
  });

  it('should accept minimal note (note type only)', () => {
    const minimalNote = {
      noteType: 'progress',
    };

    const result = CreateClinicalNoteSchema.safeParse(minimalNote);
    expect(result.success).toBe(true);
  });

  it('should reject multiple primary diagnoses', () => {
    const multiplePrimary = {
      noteType: 'soap',
      diagnoses: [
        { icd10Code: 'K02.9', description: 'Caries', isPrimary: true },
        { icd10Code: 'K04.0', description: 'Pulpitis', isPrimary: true },
      ],
    };

    const result = CreateClinicalNoteSchema.safeParse(multiplePrimary);
    expect(result.success).toBe(false);
  });

  it('should accept appointment link', () => {
    const noteWithAppointment = {
      noteType: 'soap',
      appointmentId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    };

    const result = CreateClinicalNoteSchema.safeParse(noteWithAppointment);
    expect(result.success).toBe(true);
  });

  it('should reject invalid appointment UUID', () => {
    const invalidAppointment = {
      noteType: 'soap',
      appointmentId: 'not-a-uuid',
    };

    const result = CreateClinicalNoteSchema.safeParse(invalidAppointment);
    expect(result.success).toBe(false);
  });

  it('should accept all valid note types', () => {
    const noteTypes = ['soap', 'progress', 'consultation', 'operative', 'referral'];

    noteTypes.forEach((type) => {
      const note = { noteType: type };
      const result = CreateClinicalNoteSchema.safeParse(note);
      expect(result.success).toBe(true);
    });
  });

  it('should reject invalid note type', () => {
    const invalidType = {
      noteType: 'invalid_type',
    };

    const result = CreateClinicalNoteSchema.safeParse(invalidType);
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// UPDATE CLINICAL NOTE SCHEMA TESTS
// ============================================================================

describe('UpdateClinicalNoteSchema', () => {
  it('should accept partial update (SOAP only)', () => {
    const partialUpdate = {
      soap: {
        subjective: 'Updated subjective',
        objective: '',
        assessment: '',
        plan: '',
      },
    };

    const result = UpdateClinicalNoteSchema.safeParse(partialUpdate);
    expect(result.success).toBe(true);
  });

  it('should accept empty update (no fields)', () => {
    const emptyUpdate = {};

    const result = UpdateClinicalNoteSchema.safeParse(emptyUpdate);
    expect(result.success).toBe(true);
  });

  it('should accept diagnoses update', () => {
    const diagnosesUpdate = {
      diagnoses: [
        { icd10Code: 'K02.9', description: 'Updated diagnosis', isPrimary: true },
      ],
    };

    const result = UpdateClinicalNoteSchema.safeParse(diagnosesUpdate);
    expect(result.success).toBe(true);
  });
});

// ============================================================================
// SIGN CLINICAL NOTE SCHEMA TESTS
// ============================================================================

describe('SignClinicalNoteSchema', () => {
  it('should accept valid signature data', () => {
    const validSignature = {
      signerName: 'Dr. John Smith, DDS',
      credentials: 'DDS, MS',
      signatureMethod: 'electronic',
    };

    const result = SignClinicalNoteSchema.safeParse(validSignature);
    expect(result.success).toBe(true);
  });

  it('should require signer name', () => {
    const missingName = {
      credentials: 'DDS',
      signatureMethod: 'electronic',
    };

    const result = SignClinicalNoteSchema.safeParse(missingName);
    expect(result.success).toBe(false);
  });

  it('should accept all signature methods', () => {
    const methods = ['electronic', 'digital_certificate', 'biometric'];

    methods.forEach((method) => {
      const signature = { signerName: 'Dr. Smith', signatureMethod: method };
      const result = SignClinicalNoteSchema.safeParse(signature);
      expect(result.success).toBe(true);
    });
  });

  it('should reject invalid signature method', () => {
    const invalidMethod = {
      signerName: 'Dr. Smith',
      signatureMethod: 'invalid_method',
    };

    const result = SignClinicalNoteSchema.safeParse(invalidMethod);
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// AMEND CLINICAL NOTE SCHEMA TESTS
// ============================================================================

describe('AmendClinicalNoteSchema', () => {
  it('should require amendment reason', () => {
    const withoutReason = {
      soap: {
        subjective: 'Updated',
        objective: '',
        assessment: '',
        plan: '',
      },
    };

    const result = AmendClinicalNoteSchema.safeParse(withoutReason);
    expect(result.success).toBe(false);
  });

  it('should accept amendment with reason', () => {
    const validAmendment = {
      amendmentReason: 'Corrected diagnosis code after lab results received',
      diagnoses: [
        { icd10Code: 'K04.0', description: 'Pulpitis', isPrimary: true },
      ],
    };

    const result = AmendClinicalNoteSchema.safeParse(validAmendment);
    expect(result.success).toBe(true);
  });

  it('should reject empty amendment reason', () => {
    const emptyReason = {
      amendmentReason: '',
    };

    const result = AmendClinicalNoteSchema.safeParse(emptyReason);
    expect(result.success).toBe(false);
  });

  it('should accept amendment reason up to 1000 characters', () => {
    const longReason = {
      amendmentReason: 'a'.repeat(1000),
    };

    const result = AmendClinicalNoteSchema.safeParse(longReason);
    expect(result.success).toBe(true);
  });

  it('should reject amendment reason over 1000 characters', () => {
    const tooLongReason = {
      amendmentReason: 'a'.repeat(1001),
    };

    const result = AmendClinicalNoteSchema.safeParse(tooLongReason);
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// QUERY SCHEMA TESTS
// ============================================================================

describe('ClinicalNoteQuerySchema', () => {
  it('should apply default values', () => {
    const emptyQuery = {};

    const result = ClinicalNoteQuerySchema.safeParse(emptyQuery);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
      expect(result.data.sortBy).toBe('createdAt');
      expect(result.data.sortOrder).toBe('desc');
      expect(result.data.includeDeleted).toBe(false);
    }
  });

  it('should accept filter parameters', () => {
    const filterQuery = {
      noteType: 'soap',
      status: 'signed',
      page: 2,
      limit: 50,
    };

    const result = ClinicalNoteQuerySchema.safeParse(filterQuery);
    expect(result.success).toBe(true);
  });

  it('should coerce string numbers to integers', () => {
    const stringQuery = {
      page: '3',
      limit: '25',
    };

    const result = ClinicalNoteQuerySchema.safeParse(stringQuery);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(25);
    }
  });

  it('should reject limit over 100', () => {
    const largeLimit = {
      limit: 101,
    };

    const result = ClinicalNoteQuerySchema.safeParse(largeLimit);
    expect(result.success).toBe(false);
  });

  it('should accept date range filters', () => {
    const dateQuery = {
      fromDate: '2024-01-01',
      toDate: '2024-12-31',
    };

    const result = ClinicalNoteQuerySchema.safeParse(dateQuery);
    expect(result.success).toBe(true);
  });
});

// ============================================================================
// ADD ATTACHMENT SCHEMA TESTS
// ============================================================================

describe('AddAttachmentSchema', () => {
  it('should accept valid attachment', () => {
    const validAttachment = {
      fileId: 'file-123',
      type: 'image',
      fileName: 'xray-tooth-14.jpg',
      fileSize: 1024000,
      mimeType: 'image/jpeg',
      description: 'Periapical radiograph of tooth 14',
    };

    const result = AddAttachmentSchema.safeParse(validAttachment);
    expect(result.success).toBe(true);
  });

  it('should accept all attachment types', () => {
    const types = ['image', 'pdf', 'dicom'];

    types.forEach((type) => {
      const attachment = { fileId: 'file-1', type, fileName: 'test.file' };
      const result = AddAttachmentSchema.safeParse(attachment);
      expect(result.success).toBe(true);
    });
  });

  it('should reject invalid attachment type', () => {
    const invalidType = {
      fileId: 'file-1',
      type: 'video',
      fileName: 'test.mp4',
    };

    const result = AddAttachmentSchema.safeParse(invalidType);
    expect(result.success).toBe(false);
  });

  it('should require fileId and fileName', () => {
    const missingFields = {
      type: 'image',
    };

    const result = AddAttachmentSchema.safeParse(missingFields);
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// COMPLETE PROCEDURE SCHEMA TESTS
// ============================================================================

describe('CompleteProcedureSchema', () => {
  it('should accept minimal completion data', () => {
    const minimalCompletion = {};

    const result = CompleteProcedureSchema.safeParse(minimalCompletion);
    expect(result.success).toBe(true);
  });

  it('should accept completion with all fields', () => {
    const fullCompletion = {
      completedAt: new Date().toISOString(),
      performedBy: 'provider-456',
      notes: 'Procedure completed without complications',
      procedureRecordId: 'proc-record-789',
    };

    const result = CompleteProcedureSchema.safeParse(fullCompletion);
    expect(result.success).toBe(true);
  });

  it('should coerce date string to Date', () => {
    const dateCompletion = {
      completedAt: '2024-03-15T10:30:00Z',
    };

    const result = CompleteProcedureSchema.safeParse(dateCompletion);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.completedAt).toBeInstanceOf(Date);
    }
  });
});
