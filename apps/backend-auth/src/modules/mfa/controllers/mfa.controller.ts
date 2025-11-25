/**
 * MfaController - HTTP endpoints for MFA operations
 *
 * Responsibilities:
 * - Handle TOTP, SMS, Email, and Backup Code MFA operations
 * - Validate request DTOs using Zod schemas
 * - Extract user context from JWT tokens
 * - Return standardized API responses
 *
 * Security:
 * - All routes require JWT authentication
 * - All operations scoped to authenticated user
 * - Rate limiting applied to prevent abuse
 *
 * @module MfaController
 */

import { Controller, Post, Get, Delete, Body, Param, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ZodValidationPipe } from '@dentalos/shared-validation';
import { UUID, OrganizationId } from '@dentalos/shared-types';
import { MfaService } from '../services/mfa.service';
import { BackupCodeService } from '../services/backup-code.service';
import {
  EnrollTOTPSchema,
  EnrollTOTPDtoClass,
  VerifyTOTPSchema,
  VerifyTOTPDtoClass,
  EnrollSMSSchema,
  EnrollSMSDtoClass,
  VerifySMSSchema,
  VerifySMSDtoClass,
  GenerateBackupCodesSchema,
  GenerateBackupCodesDtoClass,
} from '../dto';

/**
 * Extended Request interface with user context
 */
interface RequestWithUser {
  user: {
    userId: string;
    email: string;
    organizationId: string;
  };
}

@ApiTags('MFA')
@Controller('mfa')
@ApiBearerAuth()
export class MfaController {
  constructor(
    private mfaService: MfaService,
    private backupCodeService: BackupCodeService
  ) {}

  @Post('totp/enroll')
  @ApiOperation({ summary: 'Enroll TOTP authenticator app' })
  @ApiResponse({ status: 201, description: 'TOTP factor enrolled successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async enrollTOTP(
    @Body(new ZodValidationPipe(EnrollTOTPSchema)) dto: EnrollTOTPDtoClass,
    @Request() req: RequestWithUser
  ) {
    const userId = req.user.userId as UUID;
    const email = req.user.email;
    const organizationId = dto.organizationId as OrganizationId;
    const result = await this.mfaService.enrollTOTP(userId, organizationId, dto.factorName, email);

    return {
      factorId: result.factor.id,
      secret: result.secret,
      qrCodeUri: result.qrCodeUri,
      factorName: dto.factorName,
    };
  }

  @Post('totp/verify')
  @ApiOperation({ summary: 'Verify and enable TOTP factor' })
  @ApiResponse({ status: 200, description: 'TOTP token verified successfully' })
  @ApiResponse({ status: 401, description: 'Invalid token' })
  async verifyTOTP(
    @Body(new ZodValidationPipe(VerifyTOTPSchema)) dto: VerifyTOTPDtoClass,
    @Request() req: RequestWithUser
  ) {
    const userId = req.user.userId as UUID;
    const organizationId = dto.organizationId as OrganizationId;
    const factorId = dto.factorId as UUID;
    const isValid = await this.mfaService.verifyTOTP(userId, organizationId, factorId, dto.token);

    return { verified: isValid };
  }

  @Post('sms/enroll')
  @ApiOperation({ summary: 'Enroll SMS MFA factor' })
  @ApiResponse({ status: 201, description: 'SMS factor enrolled successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async enrollSMS(
    @Body(new ZodValidationPipe(EnrollSMSSchema)) dto: EnrollSMSDtoClass,
    @Request() req: RequestWithUser
  ) {
    const userId = req.user.userId as UUID;
    const organizationId = dto.organizationId as OrganizationId;
    const factor = await this.mfaService.enrollSMS(
      userId,
      organizationId,
      dto.factorName,
      dto.phoneNumber
    );

    return {
      factorId: factor.id,
      factorName: dto.factorName,
      phoneNumber: dto.phoneNumber,
    };
  }

  @Post('sms/send')
  @ApiOperation({ summary: 'Send SMS verification code' })
  @ApiResponse({ status: 200, description: 'SMS code sent successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async sendSMSCode(
    @Body(new ZodValidationPipe(VerifySMSSchema)) dto: VerifySMSDtoClass,
    @Request() req: RequestWithUser
  ) {
    const userId = req.user.userId as UUID;
    const organizationId = dto.organizationId as OrganizationId;
    const factorId = dto.factorId as UUID;
    await this.mfaService.sendSMSCode(userId, organizationId, factorId);

    return { sent: true };
  }

  @Post('backup-codes/generate')
  @ApiOperation({ summary: 'Generate backup codes' })
  @ApiResponse({ status: 201, description: 'Backup codes generated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async generateBackupCodes(
    @Body(new ZodValidationPipe(GenerateBackupCodesSchema))
    dto: GenerateBackupCodesDtoClass,
    @Request() req: RequestWithUser
  ) {
    const userId = req.user.userId as UUID;
    const organizationId = dto.organizationId as OrganizationId;
    const codes = await this.backupCodeService.generateBackupCodes(userId, organizationId);

    return { codes };
  }

  @Get('factors')
  @ApiOperation({ summary: 'List all MFA factors for current user' })
  @ApiResponse({ status: 200, description: 'MFA factors retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async listFactors(@Request() req: RequestWithUser) {
    const userId = req.user.userId as UUID;
    const organizationId = req.user.organizationId as OrganizationId;
    const factors = await this.mfaService.listFactors(userId, organizationId);

    return { factors };
  }

  @Delete('factors/:factorId')
  @ApiOperation({ summary: 'Delete MFA factor' })
  @ApiResponse({ status: 200, description: 'MFA factor deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Factor not found' })
  async deleteFactor(@Param('factorId') factorId: string, @Request() req: RequestWithUser) {
    const userId = req.user.userId as UUID;
    const organizationId = req.user.organizationId as OrganizationId;
    await this.mfaService.deleteFactor(userId, organizationId, factorId as UUID);

    return { deleted: true };
  }
}
