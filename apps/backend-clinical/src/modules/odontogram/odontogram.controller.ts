/**
 * Odontogram Controller
 * Exposes REST API for odontogram operations
 */

import { Controller, Get, Put, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OdontogramService } from './odontogram.service';
import { UpdateOdontogramDto } from './dto/update-odontogram.dto';
import { JwtAuthGuard, PermissionsGuard, TenantIsolationGuard } from '../auth/guards';
import { GetCurrentUser, RequirePermissions } from '../auth/decorators';
import { CurrentUser } from '@dentalos/shared-auth';

@ApiTags('Clinical - Odontogram')
@ApiBearerAuth()
@Controller('api/v1/clinical/patients/:patientId/odontogram')
@UseGuards(JwtAuthGuard, TenantIsolationGuard, PermissionsGuard)
export class OdontogramController {
  constructor(private readonly odontogramService: OdontogramService) {}

  @Get()
  @RequirePermissions('clinical:read')
  @ApiOperation({ summary: 'Get patient odontogram' })
  @ApiResponse({ status: 200, description: 'Odontogram retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async getOdontogram(@Param('patientId') patientId: string, @GetCurrentUser() user: CurrentUser) {
    return this.odontogramService.getOdontogram(
      patientId,
      {
        tenantId: user.tenantId,
        organizationId: user.organizationId,
        clinicId: user.clinicId!,
      },
      user.userId,
    );
  }

  @Put()
  @RequirePermissions('clinical:write')
  @ApiOperation({ summary: 'Update patient odontogram' })
  @ApiResponse({ status: 200, description: 'Odontogram updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  async updateOdontogram(
    @Param('patientId') patientId: string,
    @Body() updateDto: UpdateOdontogramDto,
    @GetCurrentUser() user: CurrentUser,
  ) {
    return this.odontogramService.updateOdontogram(
      patientId,
      {
        tenantId: user.tenantId,
        organizationId: user.organizationId,
        clinicId: user.clinicId!,
      },
      updateDto,
      user.userId,
    );
  }
}
