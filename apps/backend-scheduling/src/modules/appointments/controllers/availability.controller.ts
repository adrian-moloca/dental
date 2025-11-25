import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AvailabilityService } from '../../availability/availability.service';
import { SearchAvailabilityDto, AvailabilityResponse, SearchAvailabilitySchema } from '../dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { TenantIsolationGuard } from '../guards/tenant-isolation.guard';
import { CurrentUser, CurrentUserData } from '../decorators/current-user.decorator';
import { RequirePermissions } from '../decorators/require-permissions.decorator';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';

@ApiTags('Availability')
@ApiBearerAuth()
@Controller('appointments/availability')
@UseGuards(JwtAuthGuard, TenantIsolationGuard, PermissionsGuard)
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  /**
   * Search provider availability
   */
  @Get()
  @RequirePermissions('appointments:read')
  @ApiOperation({ summary: 'Search provider availability' })
  @ApiResponse({ status: 200, description: 'Availability retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  async searchAvailability(
    @CurrentUser() user: CurrentUserData,
    @Query(new ZodValidationPipe(SearchAvailabilitySchema)) query: SearchAvailabilityDto,
  ): Promise<AvailabilityResponse> {
    return this.availabilityService.searchAvailability(user.tenantId, query);
  }
}
