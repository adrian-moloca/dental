/**
 * Search Controller
 *
 * REST API endpoints for advanced patient search.
 *
 * @module modules/search
 */

import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SearchService } from './search.service';
import {
  JwtAuthGuard,
  TenantIsolationGuard,
  PermissionsGuard,
  RequirePermissions,
} from '../../guards';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUser as ICurrentUser } from '@dentalos/shared-auth';

@ApiTags('search')
@ApiBearerAuth()
@Controller('search/patients')
@UseGuards(JwtAuthGuard, TenantIsolationGuard, PermissionsGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('by-phone')
  @RequirePermissions('patients:read')
  async searchByPhone(
    @Query('phoneNumber') phoneNumber: string,
    @CurrentUser() user: ICurrentUser,
  ) {
    const patients = await this.searchService.searchByPhone(phoneNumber, user.organizationId);

    return {
      success: true,
      data: patients,
    };
  }

  @Get('by-email')
  @RequirePermissions('patients:read')
  async searchByEmail(@Query('email') email: string, @CurrentUser() user: ICurrentUser) {
    const patients = await this.searchService.searchByEmail(email, user.organizationId);

    return {
      success: true,
      data: patients,
    };
  }
}
