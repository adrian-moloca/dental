import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PerioChartService } from './perio-chart.service';
import { CreatePerioChartDto } from './dto/create-perio-chart.dto';
import { JwtAuthGuard, PermissionsGuard, TenantIsolationGuard } from '../auth/guards';
import { GetCurrentUser, RequirePermissions } from '../auth/decorators';
import { CurrentUser } from '@dentalos/shared-auth';

@ApiTags('Clinical - Perio Charts')
@ApiBearerAuth()
@Controller('api/v1/clinical/patients/:patientId/perio-charts')
@UseGuards(JwtAuthGuard, TenantIsolationGuard, PermissionsGuard)
export class PerioChartController {
  constructor(private readonly service: PerioChartService) {}

  @Post()
  @RequirePermissions('clinical:write')
  create(
    @Param('patientId') patientId: string,
    @Body() dto: CreatePerioChartDto,
    @GetCurrentUser() user: CurrentUser,
  ) {
    return this.service.create(
      patientId,
      dto,
      { tenantId: user.tenantId, organizationId: user.organizationId, clinicId: user.clinicId },
      user.userId,
    );
  }

  @Get()
  @RequirePermissions('clinical:read')
  findAll(
    @Param('patientId') patientId: string,
    @Query('limit') limit: string,
    @GetCurrentUser() user: CurrentUser,
  ) {
    return this.service.findByPatient(patientId, { tenantId: user.tenantId }, limit ? +limit : 10);
  }

  @Get(':chartId')
  @RequirePermissions('clinical:read')
  findOne(@Param('chartId') chartId: string, @GetCurrentUser() user: CurrentUser) {
    return this.service.findById(chartId, { tenantId: user.tenantId });
  }
}
