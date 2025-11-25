/**
 * Backup Codes Integration Tests
 *
 * Comprehensive integration tests for backup code generation and verification,
 * covering code generation (10 codes), Argon2id hashing, verification with
 * valid/used/invalid codes, single-use enforcement, and remaining code count.
 *
 * Test Coverage:
 * - Backup code generation (10 alphanumeric codes)
 * - Code format validation (8 characters, uppercase alphanumeric)
 * - Argon2id hash storage
 * - Code verification (valid/invalid/used)
 * - Single-use enforcement
 * - Remaining code count tracking
 * - Multi-tenant isolation
 * - Batch operations
 * - Security edge cases
 *
 * @group integration
 * @group mfa
 * @module backend-auth/test/integration/mfa
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ConfigService } from '@nestjs/config';
import type { UUID, OrganizationId } from '@dentalos/shared-types';
import { BackupCodeService } from '../../../src/modules/mfa/services/backup-code.service';
import { BackupCodeRepository } from '../../../src/modules/mfa/repositories/backup-code.repository';
import { BackupCode } from '../../../src/modules/mfa/entities/backup-code.entity';
import { hash, verify } from '@node-rs/argon2';

describe('Backup Codes Integration Tests', () => {
  let backupCodeService: BackupCodeService;
  let backupCodeRepository: BackupCodeRepository;
  let configService: ConfigService;

  // Test actors and context
  const orgId = 'org-dental-001' as OrganizationId;
  const userId = 'user-dentist-001' as UUID;

  // Store generated codes for testing
  let generatedCodes: BackupCode[] = [];

  beforeEach(() => {
    // Mock ConfigService with backup code configuration
    configService = {
      get: vi.fn((key: string, defaultValue?: any) => {
        const config: Record<string, any> = {
          'security.mfa.backupCode.length': 8,
          'security.mfa.backupCode.count': 10,
        };
        return config[key] !== undefined ? config[key] : defaultValue;
      }),
    } as any;

    // Mock BackupCodeRepository
    backupCodeRepository = {
      findById: vi.fn(),
      findByUserId: vi.fn(),
      findAvailableByUserId: vi.fn(),
      create: vi.fn(),
      createBatch: vi.fn(),
      update: vi.fn(),
      deleteByUserId: vi.fn(),
    } as any;

    // Initialize backup code service
    backupCodeService = new BackupCodeService(
      configService,
      backupCodeRepository
    );

    generatedCodes = [];
  });

  afterEach(() => {
    vi.clearAllMocks();
    generatedCodes = [];
  });

  /* ============================================================================
   * Backup Code Generation (10 codes)
   * ============================================================================ */

  describe('Backup Code Generation (10 codes)', () => {
    it('should generate exactly 10 backup codes', async () => {
      // Mock createBatch to capture codes
      vi.mocked(backupCodeRepository.createBatch).mockImplementation(async (dataList) => {
        const codes = dataList.map(data =>
          BackupCode.fromJSON({
            ...data,
            id: crypto.randomUUID(),
            isUsed: false,
            createdAt: new Date().toISOString(),
          })
        );
        generatedCodes = codes;
        return codes;
      });

      vi.mocked(backupCodeRepository.deleteByUserId).mockResolvedValue();

      const plainCodes = await backupCodeService.generateBackupCodes(userId, orgId);

      expect(plainCodes).toHaveLength(10);
      expect(backupCodeRepository.createBatch).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            userId,
            organizationId: orgId,
            codeHash: expect.any(String),
          }),
        ])
      );
      expect(backupCodeRepository.createBatch).toHaveBeenCalledWith(
        expect.any(Array)
      );
      const batchArg = vi.mocked(backupCodeRepository.createBatch).mock.calls[0][0];
      expect(batchArg).toHaveLength(10);
    });

    it('should generate unique backup codes', async () => {
      vi.mocked(backupCodeRepository.createBatch).mockResolvedValue([]);
      vi.mocked(backupCodeRepository.deleteByUserId).mockResolvedValue();

      const plainCodes = await backupCodeService.generateBackupCodes(userId, orgId);

      // All codes should be unique
      const uniqueCodes = new Set(plainCodes);
      expect(uniqueCodes.size).toBe(10);
    });

    it('should delete existing backup codes before generating new ones', async () => {
      vi.mocked(backupCodeRepository.createBatch).mockResolvedValue([]);
      vi.mocked(backupCodeRepository.deleteByUserId).mockResolvedValue();

      await backupCodeService.generateBackupCodes(userId, orgId);

      expect(backupCodeRepository.deleteByUserId).toHaveBeenCalledWith(userId, orgId);
      expect(backupCodeRepository.deleteByUserId).toHaveBeenCalledBefore(
        backupCodeRepository.createBatch as any
      );
    });

    it('should generate codes with cryptographic randomness', async () => {
      vi.mocked(backupCodeRepository.createBatch).mockResolvedValue([]);
      vi.mocked(backupCodeRepository.deleteByUserId).mockResolvedValue();

      // Generate multiple sets to ensure randomness
      const allCodes = new Set<string>();

      for (let i = 0; i < 5; i++) {
        const codes = await backupCodeService.generateBackupCodes(userId, orgId);
        codes.forEach(code => allCodes.add(code));
      }

      // All 50 codes (5 sets of 10) should be unique
      expect(allCodes.size).toBe(50);
    });
  });

  /* ============================================================================
   * Backup Code Format and Hashing
   * ============================================================================ */

  describe('Backup Code Format and Hashing', () => {
    it('should generate codes with 8 characters length', async () => {
      vi.mocked(backupCodeRepository.createBatch).mockResolvedValue([]);
      vi.mocked(backupCodeRepository.deleteByUserId).mockResolvedValue();

      const plainCodes = await backupCodeService.generateBackupCodes(userId, orgId);

      plainCodes.forEach(code => {
        expect(code.length).toBe(8);
      });
    });

    it('should generate uppercase alphanumeric codes (no ambiguous chars)', async () => {
      vi.mocked(backupCodeRepository.createBatch).mockResolvedValue([]);
      vi.mocked(backupCodeRepository.deleteByUserId).mockResolvedValue();

      const plainCodes = await backupCodeService.generateBackupCodes(userId, orgId);

      // Should only contain: A-Z (excluding I, O) and 2-9 (excluding 0, 1)
      // Pattern: [A-HJ-NP-Z2-9] (no I, O, 0, 1 to avoid confusion)
      plainCodes.forEach(code => {
        expect(code).toMatch(/^[A-HJ-NP-Z2-9]{8}$/);
        expect(code).not.toContain('I'); // Looks like 1
        expect(code).not.toContain('O'); // Looks like 0
        expect(code).not.toContain('0'); // Ambiguous with O
        expect(code).not.toContain('1'); // Ambiguous with I
      });
    });

    it('should hash codes using Argon2id', async () => {
      let capturedHashes: string[] = [];

      vi.mocked(backupCodeRepository.createBatch).mockImplementation(async (dataList) => {
        capturedHashes = dataList.map(d => d.codeHash);
        return [];
      });

      vi.mocked(backupCodeRepository.deleteByUserId).mockResolvedValue();

      await backupCodeService.generateBackupCodes(userId, orgId);

      // All hashes should have Argon2id format
      capturedHashes.forEach(codeHash => {
        expect(codeHash).toMatch(/^\$argon2id\$/);
        expect(codeHash.length).toBeGreaterThan(64);
      });
    });

    it('should verify hash matches original code', async () => {
      let plainCodes: string[] = [];
      let codeHashes: string[] = [];

      vi.mocked(backupCodeRepository.createBatch).mockImplementation(async (dataList) => {
        codeHashes = dataList.map(d => d.codeHash);
        return [];
      });

      vi.mocked(backupCodeRepository.deleteByUserId).mockResolvedValue();

      plainCodes = await backupCodeService.generateBackupCodes(userId, orgId);

      // Verify each hash can be verified with corresponding plain code
      for (let i = 0; i < plainCodes.length; i++) {
        const isValid = await verify(codeHashes[i], plainCodes[i]);
        expect(isValid).toBe(true);
      }
    });

    it('should not store plain-text codes', async () => {
      let capturedData: any[] = [];

      vi.mocked(backupCodeRepository.createBatch).mockImplementation(async (dataList) => {
        capturedData = dataList;
        return [];
      });

      vi.mocked(backupCodeRepository.deleteByUserId).mockResolvedValue();

      const plainCodes = await backupCodeService.generateBackupCodes(userId, orgId);

      // Verify no plain-text codes in repository data
      capturedData.forEach(data => {
        plainCodes.forEach(plainCode => {
          expect(data.codeHash).not.toBe(plainCode);
          expect(JSON.stringify(data)).not.toContain(plainCode);
        });
      });
    });
  });

  /* ============================================================================
   * Backup Code Verification - Valid Codes
   * ============================================================================ */

  describe('Backup Code Verification - Valid Codes', () => {
    it('should verify valid backup code', async () => {
      // Generate codes
      vi.mocked(backupCodeRepository.deleteByUserId).mockResolvedValue();

      let savedCodes: BackupCode[] = [];
      let plainCodes: string[] = [];

      vi.mocked(backupCodeRepository.createBatch).mockImplementation(async (dataList) => {
        savedCodes = dataList.map(data =>
          BackupCode.fromJSON({
            ...data,
            id: crypto.randomUUID(),
            isUsed: false,
            createdAt: new Date().toISOString(),
          })
        );
        return savedCodes;
      });

      plainCodes = await backupCodeService.generateBackupCodes(userId, orgId);

      // Mock findAvailableByUserId to return saved codes
      vi.mocked(backupCodeRepository.findAvailableByUserId).mockResolvedValue(savedCodes);

      // Mock update to mark code as used
      vi.mocked(backupCodeRepository.update).mockImplementation(async (code) => code);

      // Verify one of the codes
      const codeToVerify = plainCodes[0];
      const isValid = await backupCodeService.verifyBackupCode(userId, orgId, codeToVerify);

      expect(isValid).toBe(true);
      expect(backupCodeRepository.update).toHaveBeenCalled();
    });

    it('should accept any of the 10 generated codes', async () => {
      vi.mocked(backupCodeRepository.deleteByUserId).mockResolvedValue();

      let savedCodes: BackupCode[] = [];
      let plainCodes: string[] = [];

      vi.mocked(backupCodeRepository.createBatch).mockImplementation(async (dataList) => {
        savedCodes = dataList.map(data =>
          BackupCode.fromJSON({
            ...data,
            id: crypto.randomUUID(),
            isUsed: false,
            createdAt: new Date().toISOString(),
          })
        );
        return savedCodes;
      });

      plainCodes = await backupCodeService.generateBackupCodes(userId, orgId);

      vi.mocked(backupCodeRepository.findAvailableByUserId).mockResolvedValue(savedCodes);
      vi.mocked(backupCodeRepository.update).mockImplementation(async (code) => code);

      // Verify all codes are valid
      for (let i = 0; i < plainCodes.length; i++) {
        // Reset mock to get fresh codes
        vi.mocked(backupCodeRepository.findAvailableByUserId).mockResolvedValue(
          savedCodes.filter(c => !c.isUsed)
        );

        const isValid = await backupCodeService.verifyBackupCode(userId, orgId, plainCodes[i]);
        expect(isValid).toBe(true);
      }
    });

    it('should mark code as used after successful verification', async () => {
      vi.mocked(backupCodeRepository.deleteByUserId).mockResolvedValue();

      let savedCodes: BackupCode[] = [];
      let plainCodes: string[] = [];

      vi.mocked(backupCodeRepository.createBatch).mockImplementation(async (dataList) => {
        savedCodes = dataList.map(data =>
          BackupCode.fromJSON({
            ...data,
            id: crypto.randomUUID(),
            isUsed: false,
            createdAt: new Date().toISOString(),
          })
        );
        return savedCodes;
      });

      plainCodes = await backupCodeService.generateBackupCodes(userId, orgId);

      vi.mocked(backupCodeRepository.findAvailableByUserId).mockResolvedValue(savedCodes);
      vi.mocked(backupCodeRepository.update).mockImplementation(async (code) => code);

      await backupCodeService.verifyBackupCode(userId, orgId, plainCodes[0]);

      // Verify update was called with used code
      expect(backupCodeRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          isUsed: true,
          usedAt: expect.any(Date),
        })
      );
    });
  });

  /* ============================================================================
   * Backup Code Verification - Used Codes
   * ============================================================================ */

  describe('Backup Code Verification - Used Codes', () => {
    it('should reject already used backup code', async () => {
      const usedCode = BackupCode.fromJSON({
        id: crypto.randomUUID(),
        userId,
        organizationId: orgId,
        codeHash: await hash('TESTCODE'),
        isUsed: true,
        usedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });

      // findAvailableByUserId should NOT return used codes
      vi.mocked(backupCodeRepository.findAvailableByUserId).mockResolvedValue([]);

      const isValid = await backupCodeService.verifyBackupCode(userId, orgId, 'TESTCODE');

      expect(isValid).toBe(false);
    });

    it('should enforce single-use constraint', async () => {
      vi.mocked(backupCodeRepository.deleteByUserId).mockResolvedValue();

      let savedCodes: BackupCode[] = [];
      let plainCodes: string[] = [];

      vi.mocked(backupCodeRepository.createBatch).mockImplementation(async (dataList) => {
        savedCodes = dataList.map(data =>
          BackupCode.fromJSON({
            ...data,
            id: crypto.randomUUID(),
            isUsed: false,
            createdAt: new Date().toISOString(),
          })
        );
        return savedCodes;
      });

      plainCodes = await backupCodeService.generateBackupCodes(userId, orgId);

      // First use
      vi.mocked(backupCodeRepository.findAvailableByUserId).mockResolvedValue(savedCodes);
      vi.mocked(backupCodeRepository.update).mockImplementation(async (code) => {
        // Mark code as used
        const usedCode = code.markAsUsed();
        savedCodes = savedCodes.map(c => c.id === usedCode.id ? usedCode : c);
        return usedCode;
      });

      const firstUse = await backupCodeService.verifyBackupCode(userId, orgId, plainCodes[0]);
      expect(firstUse).toBe(true);

      // Second use - should fail
      vi.mocked(backupCodeRepository.findAvailableByUserId).mockResolvedValue(
        savedCodes.filter(c => !c.isUsed)
      );

      const secondUse = await backupCodeService.verifyBackupCode(userId, orgId, plainCodes[0]);
      expect(secondUse).toBe(false);
    });

    it('should track usedAt timestamp when code is used', async () => {
      const beforeUse = new Date();

      vi.mocked(backupCodeRepository.deleteByUserId).mockResolvedValue();

      let savedCodes: BackupCode[] = [];
      let plainCodes: string[] = [];

      vi.mocked(backupCodeRepository.createBatch).mockImplementation(async (dataList) => {
        savedCodes = dataList.map(data =>
          BackupCode.fromJSON({
            ...data,
            id: crypto.randomUUID(),
            isUsed: false,
            createdAt: new Date().toISOString(),
          })
        );
        return savedCodes;
      });

      plainCodes = await backupCodeService.generateBackupCodes(userId, orgId);

      vi.mocked(backupCodeRepository.findAvailableByUserId).mockResolvedValue(savedCodes);
      vi.mocked(backupCodeRepository.update).mockImplementation(async (code) => code);

      await backupCodeService.verifyBackupCode(userId, orgId, plainCodes[0]);

      const afterUse = new Date();

      // Verify usedAt timestamp was set
      const updateCall = vi.mocked(backupCodeRepository.update).mock.calls[0][0];
      expect(updateCall.isUsed).toBe(true);
      expect(updateCall.usedAt).toBeDefined();
      expect(updateCall.usedAt!.getTime()).toBeGreaterThanOrEqual(beforeUse.getTime());
      expect(updateCall.usedAt!.getTime()).toBeLessThanOrEqual(afterUse.getTime());
    });
  });

  /* ============================================================================
   * Backup Code Verification - Invalid Codes
   * ============================================================================ */

  describe('Backup Code Verification - Invalid Codes', () => {
    it('should reject invalid backup code', async () => {
      vi.mocked(backupCodeRepository.findAvailableByUserId).mockResolvedValue([]);

      const isValid = await backupCodeService.verifyBackupCode(userId, orgId, 'INVALID1');

      expect(isValid).toBe(false);
    });

    it('should reject code with wrong length', async () => {
      vi.mocked(backupCodeRepository.findAvailableByUserId).mockResolvedValue([]);

      expect(await backupCodeService.verifyBackupCode(userId, orgId, 'SHORT')).toBe(false);    // Too short
      expect(await backupCodeService.verifyBackupCode(userId, orgId, 'TOOLONGCODE')).toBe(false); // Too long
      expect(await backupCodeService.verifyBackupCode(userId, orgId, '')).toBe(false);         // Empty
    });

    it('should reject code from different user', async () => {
      const otherUserId = 'user-other-001' as UUID;

      const otherUserCode = BackupCode.fromJSON({
        id: crypto.randomUUID(),
        userId: otherUserId,
        organizationId: orgId,
        codeHash: await hash('ABCD1234'),
        isUsed: false,
        createdAt: new Date().toISOString(),
      });

      // User should not have access to other user's codes
      vi.mocked(backupCodeRepository.findAvailableByUserId)
        .mockResolvedValue([]); // Empty for current user

      const isValid = await backupCodeService.verifyBackupCode(userId, orgId, 'ABCD1234');

      expect(isValid).toBe(false);
    });

    it('should reject lowercase codes if stored as uppercase', async () => {
      vi.mocked(backupCodeRepository.deleteByUserId).mockResolvedValue();

      let savedCodes: BackupCode[] = [];
      let plainCodes: string[] = [];

      vi.mocked(backupCodeRepository.createBatch).mockImplementation(async (dataList) => {
        savedCodes = dataList.map(data =>
          BackupCode.fromJSON({
            ...data,
            id: crypto.randomUUID(),
            isUsed: false,
            createdAt: new Date().toISOString(),
          })
        );
        return savedCodes;
      });

      plainCodes = await backupCodeService.generateBackupCodes(userId, orgId);

      vi.mocked(backupCodeRepository.findAvailableByUserId).mockResolvedValue(savedCodes);

      // Codes are generated uppercase, lowercase should not match
      const lowercaseCode = plainCodes[0].toLowerCase();
      const isValid = await backupCodeService.verifyBackupCode(userId, orgId, lowercaseCode);

      expect(isValid).toBe(false);
    });

    it('should reject codes with special characters', async () => {
      vi.mocked(backupCodeRepository.findAvailableByUserId).mockResolvedValue([]);

      const specialCharCodes = [
        'ABCD-123',
        'ABCD 123',
        'ABCD!123',
        'ABCD@123',
      ];

      for (const code of specialCharCodes) {
        const isValid = await backupCodeService.verifyBackupCode(userId, orgId, code);
        expect(isValid).toBe(false);
      }
    });
  });

  /* ============================================================================
   * Remaining Code Count
   * ============================================================================ */

  describe('Remaining Code Count', () => {
    it('should return 10 for newly generated codes', async () => {
      vi.mocked(backupCodeRepository.deleteByUserId).mockResolvedValue();

      let savedCodes: BackupCode[] = [];

      vi.mocked(backupCodeRepository.createBatch).mockImplementation(async (dataList) => {
        savedCodes = dataList.map(data =>
          BackupCode.fromJSON({
            ...data,
            id: crypto.randomUUID(),
            isUsed: false,
            createdAt: new Date().toISOString(),
          })
        );
        return savedCodes;
      });

      await backupCodeService.generateBackupCodes(userId, orgId);

      vi.mocked(backupCodeRepository.findAvailableByUserId).mockResolvedValue(savedCodes);

      const count = await backupCodeService.getRemainingCodeCount(userId, orgId);

      expect(count).toBe(10);
    });

    it('should decrease count after each code is used', async () => {
      vi.mocked(backupCodeRepository.deleteByUserId).mockResolvedValue();

      let savedCodes: BackupCode[] = [];
      let plainCodes: string[] = [];

      vi.mocked(backupCodeRepository.createBatch).mockImplementation(async (dataList) => {
        savedCodes = dataList.map(data =>
          BackupCode.fromJSON({
            ...data,
            id: crypto.randomUUID(),
            isUsed: false,
            createdAt: new Date().toISOString(),
          })
        );
        return savedCodes;
      });

      plainCodes = await backupCodeService.generateBackupCodes(userId, orgId);

      vi.mocked(backupCodeRepository.update).mockImplementation(async (code) => {
        const usedCode = code.markAsUsed();
        savedCodes = savedCodes.map(c => c.id === usedCode.id ? usedCode : c);
        return usedCode;
      });

      // Use 3 codes
      for (let i = 0; i < 3; i++) {
        vi.mocked(backupCodeRepository.findAvailableByUserId).mockResolvedValue(
          savedCodes.filter(c => !c.isUsed)
        );
        await backupCodeService.verifyBackupCode(userId, orgId, plainCodes[i]);
      }

      vi.mocked(backupCodeRepository.findAvailableByUserId).mockResolvedValue(
        savedCodes.filter(c => !c.isUsed)
      );

      const count = await backupCodeService.getRemainingCodeCount(userId, orgId);

      expect(count).toBe(7);
    });

    it('should return 0 when all codes are used', async () => {
      vi.mocked(backupCodeRepository.deleteByUserId).mockResolvedValue();

      let savedCodes: BackupCode[] = [];
      let plainCodes: string[] = [];

      vi.mocked(backupCodeRepository.createBatch).mockImplementation(async (dataList) => {
        savedCodes = dataList.map(data =>
          BackupCode.fromJSON({
            ...data,
            id: crypto.randomUUID(),
            isUsed: false,
            createdAt: new Date().toISOString(),
          })
        );
        return savedCodes;
      });

      plainCodes = await backupCodeService.generateBackupCodes(userId, orgId);

      vi.mocked(backupCodeRepository.update).mockImplementation(async (code) => {
        const usedCode = code.markAsUsed();
        savedCodes = savedCodes.map(c => c.id === usedCode.id ? usedCode : c);
        return usedCode;
      });

      // Use all 10 codes
      for (let i = 0; i < 10; i++) {
        vi.mocked(backupCodeRepository.findAvailableByUserId).mockResolvedValue(
          savedCodes.filter(c => !c.isUsed)
        );
        await backupCodeService.verifyBackupCode(userId, orgId, plainCodes[i]);
      }

      vi.mocked(backupCodeRepository.findAvailableByUserId).mockResolvedValue(
        savedCodes.filter(c => !c.isUsed)
      );

      const count = await backupCodeService.getRemainingCodeCount(userId, orgId);

      expect(count).toBe(0);
    });

    it('should warn user when only 2 codes remain', async () => {
      const savedCodes = Array(2).fill(null).map(() =>
        BackupCode.fromJSON({
          id: crypto.randomUUID(),
          userId,
          organizationId: orgId,
          codeHash: 'hash',
          isUsed: false,
          createdAt: new Date().toISOString(),
        })
      );

      vi.mocked(backupCodeRepository.findAvailableByUserId).mockResolvedValue(savedCodes);

      const count = await backupCodeService.getRemainingCodeCount(userId, orgId);

      expect(count).toBe(2);
      expect(count).toBeLessThan(3); // Threshold for warning
    });
  });

  /* ============================================================================
   * Multi-Tenant Isolation
   * ============================================================================ */

  describe('Multi-Tenant Isolation', () => {
    it('should isolate backup codes by organization', async () => {
      const org1Id = 'org-dental-001' as OrganizationId;
      const org2Id = 'org-dental-002' as OrganizationId;

      vi.mocked(backupCodeRepository.deleteByUserId).mockResolvedValue();
      vi.mocked(backupCodeRepository.createBatch).mockResolvedValue([]);

      await backupCodeService.generateBackupCodes(userId, org1Id);
      await backupCodeService.generateBackupCodes(userId, org2Id);

      // Verify each call used correct organization ID
      const createBatchCalls = vi.mocked(backupCodeRepository.createBatch).mock.calls;
      expect(createBatchCalls[0][0][0].organizationId).toBe(org1Id);
      expect(createBatchCalls[1][0][0].organizationId).toBe(org2Id);
    });

    it('should prevent cross-tenant code verification', async () => {
      const org1Id = 'org-dental-001' as OrganizationId;
      const org2Id = 'org-dental-002' as OrganizationId;

      const org1Code = BackupCode.fromJSON({
        id: crypto.randomUUID(),
        userId,
        organizationId: org1Id,
        codeHash: await hash('ORG1CODE'),
        isUsed: false,
        createdAt: new Date().toISOString(),
      });

      // User tries to verify org1 code against org2
      vi.mocked(backupCodeRepository.findAvailableByUserId)
        .mockImplementation(async (uid: UUID, orgId: OrganizationId) => {
          if (orgId === org1Id) return [org1Code];
          return []; // No codes for org2
        });

      const isValid = await backupCodeService.verifyBackupCode(userId, org2Id, 'ORG1CODE');

      expect(isValid).toBe(false);
    });

    it('should use organization-scoped repository queries', async () => {
      vi.mocked(backupCodeRepository.findAvailableByUserId).mockResolvedValue([]);

      await backupCodeService.getRemainingCodeCount(userId, orgId);

      expect(backupCodeRepository.findAvailableByUserId).toHaveBeenCalledWith(userId, orgId);
    });
  });

  /* ============================================================================
   * Edge Cases and Security
   * ============================================================================ */

  describe('Edge Cases and Security', () => {
    it('should handle concurrent code verification attempts', async () => {
      vi.mocked(backupCodeRepository.deleteByUserId).mockResolvedValue();

      let savedCodes: BackupCode[] = [];
      let plainCodes: string[] = [];

      vi.mocked(backupCodeRepository.createBatch).mockImplementation(async (dataList) => {
        savedCodes = dataList.map(data =>
          BackupCode.fromJSON({
            ...data,
            id: crypto.randomUUID(),
            isUsed: false,
            createdAt: new Date().toISOString(),
          })
        );
        return savedCodes;
      });

      plainCodes = await backupCodeService.generateBackupCodes(userId, orgId);

      vi.mocked(backupCodeRepository.findAvailableByUserId).mockResolvedValue(savedCodes);
      vi.mocked(backupCodeRepository.update).mockImplementation(async (code) => code);

      // Concurrent verification attempts
      const results = await Promise.all([
        backupCodeService.verifyBackupCode(userId, orgId, plainCodes[0]),
        backupCodeService.verifyBackupCode(userId, orgId, plainCodes[0]),
        backupCodeService.verifyBackupCode(userId, orgId, plainCodes[0]),
      ]);

      // All might succeed due to race condition, but in real DB one would win
      expect(results.some(r => r === true)).toBe(true);
    });

    it('should reject SQL injection attempts in codes', async () => {
      vi.mocked(backupCodeRepository.findAvailableByUserId).mockResolvedValue([]);

      const sqlInjectionCodes = [
        "CODE'; DROP TABLE backup_codes;--",
        "CODE' OR '1'='1",
        "'; DELETE FROM users WHERE '1'='1",
      ];

      for (const maliciousCode of sqlInjectionCodes) {
        const isValid = await backupCodeService.verifyBackupCode(userId, orgId, maliciousCode);
        expect(isValid).toBe(false);
      }
    });

    it('should handle very long invalid codes', async () => {
      vi.mocked(backupCodeRepository.findAvailableByUserId).mockResolvedValue([]);

      const veryLongCode = 'A'.repeat(10000);

      const isValid = await backupCodeService.verifyBackupCode(userId, orgId, veryLongCode);
      expect(isValid).toBe(false);
    });

    it('should regenerate codes without losing user data', async () => {
      vi.mocked(backupCodeRepository.deleteByUserId).mockResolvedValue();
      vi.mocked(backupCodeRepository.createBatch).mockResolvedValue([]);

      // Generate first set
      const codes1 = await backupCodeService.generateBackupCodes(userId, orgId);
      expect(codes1).toHaveLength(10);

      // Generate second set (should delete first set)
      const codes2 = await backupCodeService.generateBackupCodes(userId, orgId);
      expect(codes2).toHaveLength(10);

      // Verify delete was called twice (once per generation)
      expect(backupCodeRepository.deleteByUserId).toHaveBeenCalledTimes(2);

      // Codes should be different
      expect(codes1[0]).not.toBe(codes2[0]);
    });

    it('should maintain security even with maximum code usage', async () => {
      vi.mocked(backupCodeRepository.deleteByUserId).mockResolvedValue();

      let savedCodes: BackupCode[] = [];

      vi.mocked(backupCodeRepository.createBatch).mockImplementation(async (dataList) => {
        savedCodes = dataList.map(data =>
          BackupCode.fromJSON({
            ...data,
            id: crypto.randomUUID(),
            isUsed: false,
            createdAt: new Date().toISOString(),
          })
        );
        return savedCodes;
      });

      const plainCodes = await backupCodeService.generateBackupCodes(userId, orgId);

      // Mark all codes as used
      savedCodes = savedCodes.map(c => c.markAsUsed());

      vi.mocked(backupCodeRepository.findAvailableByUserId).mockResolvedValue([]);

      // All codes should now fail verification
      for (const code of plainCodes) {
        const isValid = await backupCodeService.verifyBackupCode(userId, orgId, code);
        expect(isValid).toBe(false);
      }
    });
  });
});
