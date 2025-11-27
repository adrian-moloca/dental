/**
 * Relationships Controller
 *
 * REST API endpoints for patient relationships.
 *
 * @module modules/relationships
 */

import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RelationshipsService } from './relationships.service';
import { CreateRelationshipDto } from './dto/create-relationship.dto';
import {
  JwtAuthGuard,
  TenantIsolationGuard,
  PermissionsGuard,
  RequirePermissions,
} from '../../guards';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUser as ICurrentUser } from '@dentalos/shared-auth';

@ApiTags('relationships')
@ApiBearerAuth()
@Controller('patients/:patientId/relationships')
@UseGuards(JwtAuthGuard, TenantIsolationGuard, PermissionsGuard)
export class RelationshipsController {
  constructor(private readonly relationshipsService: RelationshipsService) {}

  @Post()
  @RequirePermissions('patients:write')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('patientId') patientId: string,
    @Body() dto: CreateRelationshipDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    const relationship = await this.relationshipsService.create(
      patientId as any,
      dto,
      user.organizationId,
      user.organizationId,
      user.userId,
    );

    return {
      success: true,
      data: relationship,
    };
  }

  @Get()
  @RequirePermissions('patients:read')
  async findAll(@Param('patientId') patientId: string, @CurrentUser() user: ICurrentUser) {
    const relationships = await this.relationshipsService.findByPatientId(
      patientId as any,
      user.organizationId,
    );

    return {
      success: true,
      data: relationships,
    };
  }

  @Delete(':relatedPatientId')
  @RequirePermissions('patients:write')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('patientId') patientId: string,
    @Param('relatedPatientId') relatedPatientId: string,
    @CurrentUser() user: ICurrentUser,
  ) {
    await this.relationshipsService.remove(
      patientId as any,
      relatedPatientId as any,
      user.organizationId,
    );

    return {
      success: true,
      message: 'Relationship removed',
    };
  }
}
