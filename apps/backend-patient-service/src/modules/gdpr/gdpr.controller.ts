/**
 * GDPR Controller
 *
 * REST API endpoints for GDPR compliance operations.
 *
 * @module modules/gdpr
 */

import { Controller, Get, Delete, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GdprService } from './gdpr.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantIsolationGuard } from '../auth/guards/tenant-isolation.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import type { CurrentUser as ICurrentUser } from '@dentalos/shared-auth';

@ApiTags('gdpr')
@ApiBearerAuth()
@Controller('patients/:patientId/gdpr')
@UseGuards(JwtAuthGuard, TenantIsolationGuard, PermissionsGuard)
export class GdprController {
  constructor(private readonly gdprService: GdprService) {}

  @Get('export')
  @RequirePermissions('patients:export')
  async exportData(@Param('patientId') patientId: string, @CurrentUser() user: ICurrentUser) {
    const data = await this.gdprService.exportPatientData(
      patientId as any,
      user.tenantContext.organizationId,
    );

    return {
      success: true,
      data,
    };
  }

  @Delete('anonymize')
  @RequirePermissions('patients:export')
  @HttpCode(HttpStatus.OK)
  async anonymize(@Param('patientId') patientId: string, @CurrentUser() user: ICurrentUser) {
    await this.gdprService.anonymizePatient(
      patientId as any,
      user.tenantContext.organizationId,
      user.tenantContext.organizationId,
      user.userId,
    );

    return {
      success: true,
      message: 'Patient data anonymized',
    };
  }
}
