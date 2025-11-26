import { Controller, Post, Body, Logger, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { SchedulesService } from './schedules.service';
import {
  ValidateAvailabilityDto,
  ValidateAvailabilitySchema,
  GetAvailableSlotsDto,
  GetAvailableSlotsSchema,
  AvailabilityResponseDto,
  AvailableSlotsResponseDto,
} from './dto';
import { ZodValidationPipe } from '@dentalos/shared-validation';
import { InternalApiGuard } from '../../guards';

/**
 * Internal API Controller
 *
 * Provides internal endpoints for service-to-service communication.
 * Used by appointment service to validate provider availability and
 * retrieve available slots for booking.
 *
 * SECURITY:
 * - Protected by InternalApiGuard (X-Internal-API-Key header validation)
 * - Tenant context is passed in request body (validated by caller)
 * - Should only be accessible from internal network in production
 *
 * USAGE:
 * Called by backend-scheduling service for:
 * - Validating provider availability before booking
 * - Getting available slots for appointment UI
 * - Bulk availability checks for search/filter
 */
@ApiTags('internal')
@ApiHeader({
  name: 'X-Internal-API-Key',
  description: 'Internal API key for service-to-service authentication',
  required: true,
})
@Controller('internal')
@UseGuards(InternalApiGuard)
export class InternalController {
  private readonly logger = new Logger(InternalController.name);

  constructor(private readonly schedulesService: SchedulesService) {}

  /**
   * POST /internal/validate-availability
   * Validate provider availability for appointment booking
   *
   * This endpoint is called by the appointment service before creating
   * or updating appointments to ensure the provider is available.
   *
   * SECURITY: Tenant isolation is enforced by passing tenantId in request body.
   * The calling service (backend-scheduling) is responsible for ensuring
   * the tenantId comes from the authenticated user's context.
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
  @ApiResponse({
    status: 401,
    description: 'Missing or invalid internal API key',
  })
  async validateAvailability(
    @Body(new ZodValidationPipe(ValidateAvailabilitySchema)) dto: ValidateAvailabilityDto,
  ): Promise<AvailabilityResponseDto> {
    this.logger.log(
      `POST /internal/validate-availability for provider ${dto.providerId} ` +
        `[tenant: ${dto.tenantId}]`,
    );

    const result = await this.schedulesService.validateAvailability(
      dto.tenantId,
      dto.organizationId,
      dto,
    );

    this.logger.log(
      `Availability validation for provider ${dto.providerId}: ` +
        `${result.isAvailable ? 'AVAILABLE' : 'UNAVAILABLE'}`,
    );

    return result;
  }

  /**
   * POST /internal/bulk-validate-availability
   * Validate availability for multiple providers at once
   *
   * Useful for appointment search/availability queries that need to check
   * multiple providers simultaneously.
   *
   * PERFORMANCE: Uses Promise.all for parallel processing.
   * Consider rate limiting if called with many providers.
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
  @ApiResponse({
    status: 401,
    description: 'Missing or invalid internal API key',
  })
  async bulkValidateAvailability(
    @Body() requests: ValidateAvailabilityDto[],
  ): Promise<{ providerId: string; result: AvailabilityResponseDto }[]> {
    this.logger.log(`POST /internal/bulk-validate-availability for ${requests.length} providers`);

    // Validate each request has tenant context
    const results = await Promise.all(
      requests.map(async (dto) => {
        // Parse and validate each request
        const validated = ValidateAvailabilitySchema.parse(dto);
        return {
          providerId: validated.providerId,
          result: await this.schedulesService.validateAvailability(
            validated.tenantId,
            validated.organizationId,
            validated,
          ),
        };
      }),
    );

    return results;
  }

  /**
   * POST /internal/get-available-slots
   * Get next N available slots for a provider
   *
   * This endpoint is used by the appointment booking UI to display
   * available time slots for a provider. It calculates slots based on:
   * - Provider's weekly schedule
   * - Breaks and lunch hours
   * - Existing absences (vacation, sick leave, etc.)
   * - Requested appointment duration
   *
   * SCHEDULING ALGORITHM:
   * 1. Start from the requested date
   * 2. For each day, check if provider works at the location
   * 3. Calculate available blocks (working hours minus breaks)
   * 4. Exclude blocks that overlap with absences
   * 5. Generate slots of requested duration within blocks
   * 6. Continue until N slots are found or 30 days searched
   *
   * @example Request:
   * {
   *   "providerId": "uuid",
   *   "locationId": "uuid",
   *   "date": "2024-01-15T00:00:00Z",
   *   "duration": 30,
   *   "count": 10,
   *   "tenantId": "uuid",
   *   "organizationId": "uuid"
   * }
   *
   * @example Response:
   * {
   *   "slots": [
   *     { "start": "2024-01-15T09:00:00Z", "end": "2024-01-15T09:30:00Z" },
   *     { "start": "2024-01-15T09:30:00Z", "end": "2024-01-15T10:00:00Z" }
   *   ],
   *   "hasMore": true,
   *   "provider": { "id": "uuid" }
   * }
   */
  @Post('get-available-slots')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get available slots for provider (internal)',
    description:
      'Get next N available time slots for a provider starting from a specific date. ' +
      'Used by appointment booking UI to display available slots.',
  })
  @ApiResponse({
    status: 200,
    description: 'Available slots retrieved successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
  })
  @ApiResponse({
    status: 401,
    description: 'Missing or invalid internal API key',
  })
  async getAvailableSlots(
    @Body(new ZodValidationPipe(GetAvailableSlotsSchema)) dto: GetAvailableSlotsDto,
  ): Promise<AvailableSlotsResponseDto> {
    this.logger.log(
      `POST /internal/get-available-slots for provider ${dto.providerId} ` +
        `[tenant: ${dto.tenantId}, duration: ${dto.duration}min, count: ${dto.count}]`,
    );

    const result = await this.schedulesService.getAvailableSlots(dto);

    this.logger.log(
      `Found ${result.slots.length} available slots for provider ${dto.providerId}`,
    );

    return result;
  }
}
