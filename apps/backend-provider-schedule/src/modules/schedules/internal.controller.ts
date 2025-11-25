import { Controller, Post, Body, Logger, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { SchedulesService } from './schedules.service';
import {
  ValidateAvailabilityDto,
  ValidateAvailabilitySchema,
  AvailabilityResponseDto,
} from './dto';
import { ZodValidationPipe } from '@dentalos/shared-validation';

/**
 * Internal API Controller
 *
 * Provides internal endpoints for service-to-service communication.
 * Used by appointment service to validate provider availability.
 *
 * Security: These endpoints should be protected by API keys or internal network rules.
 */
@ApiTags('internal')
@ApiHeader({
  name: 'X-Internal-API-Key',
  description: 'Internal API key for service-to-service authentication',
  required: true,
})
@Controller('internal')
// @UseGuards(InternalApiGuard) // Uncomment when guard is implemented
export class InternalController {
  private readonly logger = new Logger(InternalController.name);

  constructor(private readonly schedulesService: SchedulesService) {}

  /**
   * POST /internal/validate-availability
   * Validate provider availability for appointment booking
   *
   * This endpoint is called by the appointment service before creating
   * or updating appointments to ensure the provider is available.
   */
  @Post('validate-availability')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Validate provider availability (internal)',
    description:
      'Internal endpoint for appointment service to validate provider availability before booking',
  })
  @ApiResponse({
    status: 200,
    description: 'Availability validation result',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
  })
  async validateAvailability(
    @Body(new ZodValidationPipe(ValidateAvailabilitySchema)) dto: ValidateAvailabilityDto,
  ): Promise<AvailabilityResponseDto> {
    this.logger.log(`POST /internal/validate-availability for provider ${dto.providerId}`);

    // TODO: Extract tenant context from internal API headers or JWT
    // For now, we'll need to pass tenantId in the request body
    // In production, this should come from a secure internal authentication mechanism
    const tenantId = 'mock-tenant-id';
    const organizationId = 'mock-org-id';

    const result = await this.schedulesService.validateAvailability(tenantId, organizationId, dto);

    this.logger.log(
      `Availability validation for provider ${dto.providerId}: ${result.isAvailable ? 'AVAILABLE' : 'UNAVAILABLE'}`,
    );

    return result;
  }

  /**
   * POST /internal/bulk-validate-availability
   * Validate availability for multiple providers at once
   *
   * Useful for appointment search/availability queries that need to check
   * multiple providers simultaneously.
   */
  @Post('bulk-validate-availability')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Bulk validate provider availability (internal)',
    description: 'Check availability for multiple providers at once',
  })
  @ApiResponse({
    status: 200,
    description: 'Bulk availability validation results',
  })
  async bulkValidateAvailability(
    @Body() requests: ValidateAvailabilityDto[],
  ): Promise<{ providerId: string; result: AvailabilityResponseDto }[]> {
    this.logger.log(`POST /internal/bulk-validate-availability for ${requests.length} providers`);

    // TODO: Extract tenant context from internal API headers
    const tenantId = 'mock-tenant-id';
    const organizationId = 'mock-org-id';

    const results = await Promise.all(
      requests.map(async (dto) => ({
        providerId: dto.providerId,
        result: await this.schedulesService.validateAvailability(tenantId, organizationId, dto),
      })),
    );

    return results;
  }
}
