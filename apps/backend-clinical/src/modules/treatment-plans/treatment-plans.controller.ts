import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TreatmentPlansService } from './treatment-plans.service';
import { CreateTreatmentPlanDto } from './dto/create-treatment-plan.dto';
import { JwtAuthGuard, PermissionsGuard, TenantIsolationGuard } from '../auth/guards';
import { GetCurrentUser, RequirePermissions } from '../auth/decorators';
import { CurrentUser } from '@dentalos/shared-auth';

@Controller()
@ApiTags('Clinical - Treatment Plans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantIsolationGuard, PermissionsGuard)
export class TreatmentPlansController {
  constructor(private readonly service: TreatmentPlansService) {}

  @Post('api/v1/clinical/patients/:patientId/treatment-plans')
  @RequirePermissions('clinical:write')
  create(
    @Param('patientId') pid: string,
    @Body() dto: CreateTreatmentPlanDto,
    @GetCurrentUser() user: CurrentUser,
  ) {
    return this.service.create(
      pid,
      dto,
      { tenantId: user.tenantId, organizationId: user.organizationId, clinicId: user.clinicId },
      user.userId,
    );
  }

  @Get('api/v1/clinical/patients/:patientId/treatment-plans')
  @RequirePermissions('clinical:read')
  findAll(@Param('patientId') pid: string, @GetCurrentUser() user: CurrentUser) {
    return this.service.findByPatient(pid, { tenantId: user.tenantId });
  }

  @Post('api/v1/clinical/treatment-plans/:planId/accept-option')
  @RequirePermissions('clinical:write')
  acceptOption(
    @Param('planId') planId: string,
    @Body() body: { optionId: string },
    @GetCurrentUser() user: CurrentUser,
  ) {
    return this.service.acceptOption(
      planId,
      body.optionId,
      { tenantId: user.tenantId },
      user.userId,
    );
  }
}
