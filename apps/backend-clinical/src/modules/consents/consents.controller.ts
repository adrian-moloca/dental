import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ConsentsService } from './consents.service';
import { CreateConsentDto, SignConsentDto } from './dto/consent.dto';
import { JwtAuthGuard, PermissionsGuard, TenantIsolationGuard } from '../auth/guards';
import { GetCurrentUser, RequirePermissions } from '../auth/decorators';
import { CurrentUser } from '@dentalos/shared-auth';

@Controller()
@ApiTags('Clinical - Consents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantIsolationGuard, PermissionsGuard)
export class ConsentsController {
  constructor(private readonly service: ConsentsService) {}

  @Post('api/v1/clinical/patients/:patientId/consents')
  @RequirePermissions('clinical:consents')
  create(
    @Param('patientId') pid: string,
    @Body() dto: CreateConsentDto,
    @GetCurrentUser() user: CurrentUser,
  ) {
    return this.service.create(
      pid,
      dto,
      { tenantId: user.tenantId, organizationId: user.organizationId, clinicId: user.clinicId },
      user.userId,
    );
  }

  @Get('api/v1/clinical/patients/:patientId/consents')
  @RequirePermissions('clinical:read')
  findAll(@Param('patientId') pid: string, @GetCurrentUser() user: CurrentUser) {
    return this.service.findByPatient(pid, { tenantId: user.tenantId });
  }

  @Post('api/v1/clinical/consents/:consentId/sign')
  @RequirePermissions('clinical:consents')
  sign(
    @Param('consentId') id: string,
    @Body() dto: SignConsentDto,
    @GetCurrentUser() user: CurrentUser,
  ) {
    return this.service.sign(id, dto, { tenantId: user.tenantId }, user.userId);
  }

  @Get('api/v1/clinical/consents/:consentId/pdf')
  @RequirePermissions('clinical:read')
  getPdf(@Param('consentId') id: string, @GetCurrentUser() user: CurrentUser) {
    return this.service.generatePdf(id, { tenantId: user.tenantId });
  }
}
