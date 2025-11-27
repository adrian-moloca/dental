/**
 * Timeline Controller
 *
 * REST API endpoints for patient timeline.
 *
 * @module modules/timeline
 */

import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TimelineService } from './timeline.service';
import {
  JwtAuthGuard,
  TenantIsolationGuard,
  PermissionsGuard,
  RequirePermissions,
} from '../../guards';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUser as ICurrentUser } from '@dentalos/shared-auth';

@ApiTags('timeline')
@ApiBearerAuth()
@Controller('patients/:patientId/timeline')
@UseGuards(JwtAuthGuard, TenantIsolationGuard, PermissionsGuard)
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) {}

  @Get()
  @RequirePermissions('patients:read')
  async getTimeline(
    @Param('patientId') patientId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
    @CurrentUser() user: ICurrentUser,
  ) {
    const result = await this.timelineService.getTimeline(
      patientId as any,
      user.organizationId,
      +page,
      +limit,
    );

    return {
      success: true,
      data: result.events,
      pagination: {
        total: result.total,
        page: +page,
        limit: +limit,
      },
    };
  }
}
