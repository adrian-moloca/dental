import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ProceduresService } from './procedures.service';
import { CreateProcedureDto, CompleteProcedureDto } from './dto/procedure.dto';
import { JwtAuthGuard, PermissionsGuard, TenantIsolationGuard } from '../auth/guards';
import { GetCurrentUser, RequirePermissions } from '../auth/decorators';
import { CurrentUser } from '@dentalos/shared-auth';

@Controller()
@ApiTags('Clinical - Procedures')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantIsolationGuard, PermissionsGuard)
export class ProceduresController {
  constructor(private readonly service: ProceduresService) {}

  @Post('clinical/patients/:patientId/procedures')
  @RequirePermissions('clinical:procedures')
  create(
    @Param('patientId') pid: string,
    @Body() dto: CreateProcedureDto,
    @GetCurrentUser() user: CurrentUser,
  ) {
    return this.service.create(
      pid,
      dto,
      { tenantId: user.tenantId, organizationId: user.organizationId, clinicId: user.clinicId },
      user.userId,
    );
  }

  @Get('clinical/patients/:patientId/procedures')
  @RequirePermissions('clinical:read')
  findAll(
    @Param('patientId') pid: string,
    @Query() query: any,
    @GetCurrentUser() user: CurrentUser,
  ) {
    return this.service.findByPatient(pid, { tenantId: user.tenantId }, query);
  }

  @Post('clinical/procedures/:procedureId/complete')
  @RequirePermissions('clinical:procedures')
  complete(
    @Param('procedureId') id: string,
    @Body() dto: CompleteProcedureDto,
    @GetCurrentUser() user: CurrentUser,
  ) {
    return this.service.complete(id, dto, { tenantId: user.tenantId }, user.userId);
  }
}
