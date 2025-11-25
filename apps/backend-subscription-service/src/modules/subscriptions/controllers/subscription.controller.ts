/**
 * Subscription Controller
 *
 * REST API endpoints for subscription management.
 *
 * Endpoints:
 * - POST   /subscriptions              - Create subscription
 * - GET    /subscriptions              - List organization subscriptions
 * - GET    /subscriptions/:id          - Get subscription by ID
 * - GET    /subscriptions/cabinet/:id  - Get subscription by cabinet
 * - PATCH  /subscriptions/:id          - Update subscription
 * - POST   /subscriptions/:id/modules  - Add modules
 * - DELETE /subscriptions/:id/modules  - Remove modules
 * - POST   /subscriptions/:id/activate - Activate subscription
 * - POST   /subscriptions/:id/cancel   - Cancel subscription
 * - GET    /subscriptions/:id/license/:moduleCode - Validate license
 *
 * Authentication: Required (JWT)
 * Authorization: Organization-scoped (tenant isolation)
 *
 * Security:
 * - All endpoints filtered by organizationId from auth context
 * - Input validation using Zod schemas
 * - Error responses sanitized (no stack traces in production)
 * - Rate limiting applied (configured in API gateway)
 *
 * @module modules/subscriptions/controllers
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  HttpStatus,
  HttpCode,
  ParseUUIDPipe,
  NotFoundException,
} from '@nestjs/common';
import type { OrganizationId, UUID } from '@dentalos/shared-types';
import { ValidationError } from '@dentalos/shared-errors';
import type { ZodIssue } from 'zod';
import { SubscriptionService } from '../services/subscription.service';
import { LicenseValidationService } from '../services/license-validation.service';
import { StructuredLogger } from '@dentalos/shared-infra';
import { PrometheusMetricsService } from '@dentalos/shared-infra';
import {
  CreateSubscriptionDto,
  createSubscriptionSchema,
  UpdateSubscriptionDto,
  updateSubscriptionSchema,
  AddModulesDto,
  addModulesSchema,
  RemoveModulesDto,
  removeModulesSchema,
  SubscriptionResponseDto,
  SubscriptionListResponseDto,
} from '../dto';
import { SubscriptionRepository } from '../repositories/subscription.repository';
import { SubscriptionStatus } from '../entities/subscription.entity';

/**
 * Subscription controller
 *
 * Note: Authentication and authorization guards would be applied here
 * Example: @UseGuards(JwtAuthGuard, OrganizationGuard)
 */
@Controller('subscriptions')
export class SubscriptionController {
  private readonly logger: StructuredLogger;

  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly licenseValidationService: LicenseValidationService,
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly metricsService: PrometheusMetricsService,
  ) {
    this.logger = new StructuredLogger('SubscriptionController');
  }

  /**
   * Helper method to enrich subscription response with module metadata from catalog
   * Maps moduleId to moduleCode and moduleName from the MODULE_CATALOG
   *
   * Note: Since modules are stored in a separate MongoDB collection with UUIDs,
   * and we're using a constant catalog for module definitions, we would need
   * to either:
   * 1. Query the modules collection to get the code for each moduleId
   * 2. Store moduleCode directly in subscription_modules table
   * 3. Use a hardcoded UUID-to-code mapping
   *
   * For now, moduleCode and moduleName are optional in the response DTO.
   * The auth service can function without them, but they provide additional context.
   */
  private enrichSubscriptionWithModuleMetadata(subscription: any): SubscriptionResponseDto {
    const dto = SubscriptionResponseDto.fromEntity(subscription);

    // TODO: Implement module metadata enrichment
    // This would require either:
    // - Querying the modules table (PostgreSQL) to get code/name by moduleId
    // - Or storing moduleCode directly in subscription_modules table
    // For now, these fields will be undefined (optional in DTO)

    return dto;
  }

  /**
   * Create new subscription
   *
   * POST /subscriptions
   *
   * Request body:
   * {
   *   "cabinetId": "uuid",
   *   "billingCycle": "MONTHLY" | "YEARLY",
   *   "autoStartTrial": true,
   *   "currency": "USD"
   * }
   *
   * Response: 201 Created
   * {
   *   "id": "uuid",
   *   "status": "TRIAL",
   *   "modules": [...],
   *   ...
   * }
   *
   * Errors:
   * - 400 Bad Request: Validation error
   * - 409 Conflict: Cabinet already has subscription
   * - 401 Unauthorized: Not authenticated
   * - 403 Forbidden: Not authorized for organization
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createSubscription(
    @Body() body: any,
    // @CurrentUser() user: User, // From auth guard
    // @OrganizationId() organizationId: OrganizationId, // From auth context
  ): Promise<SubscriptionResponseDto> {
    // Mock organization ID - replace with actual from auth context
    const organizationId = 'org-123' as OrganizationId;

    // Validate request body
    const parseResult = createSubscriptionSchema.safeParse(body);

    if (!parseResult.success) {
      throw new ValidationError('Invalid request body', {
        errors: this.formatZodErrors(parseResult.error.errors),
      });
    }

    const dto: CreateSubscriptionDto = parseResult.data;

    this.logger.log(
      `Creating subscription for cabinet ${dto.cabinetId} in organization ${organizationId}`,
    );

    // Create subscription
    const subscription = await this.subscriptionService.createSubscription(organizationId, dto);

    // Return response DTO
    return SubscriptionResponseDto.fromEntity(subscription);
  }

  /**
   * List organization subscriptions
   *
   * GET /subscriptions?status=ACTIVE
   *
   * Query params:
   * - status: Filter by status (optional)
   *
   * Response: 200 OK
   * [
   *   {
   *     "id": "uuid",
   *     "cabinetId": "uuid",
   *     "status": "ACTIVE",
   *     ...
   *   }
   * ]
   */
  @Get()
  async listSubscriptions(
    @Query('status') status?: SubscriptionStatus,
    // @OrganizationId() organizationId: OrganizationId,
  ): Promise<SubscriptionListResponseDto[]> {
    // Mock organization ID
    const organizationId = 'org-123' as OrganizationId;

    this.logger.log(`Listing subscriptions for organization ${organizationId}`);

    // Fetch subscriptions
    const subscriptions = await this.subscriptionRepository.findAll(organizationId, status, false);

    // Return list response DTOs
    return subscriptions.map((s) => SubscriptionListResponseDto.fromEntity(s));
  }

  /**
   * Get subscription by ID
   *
   * GET /subscriptions/:id
   *
   * Response: 200 OK
   * {
   *   "id": "uuid",
   *   "status": "ACTIVE",
   *   "modules": [...],
   *   ...
   * }
   *
   * Errors:
   * - 404 Not Found: Subscription not found
   */
  @Get(':id')
  async getSubscription(
    @Param('id', ParseUUIDPipe) id: UUID,
    // @OrganizationId() organizationId: OrganizationId,
  ): Promise<SubscriptionResponseDto> {
    // Mock organization ID
    const organizationId = 'org-123' as OrganizationId;

    this.logger.log(`Getting subscription ${id}`);

    // Fetch subscription
    const subscription = await this.subscriptionRepository.findById(id, organizationId, true);

    if (!subscription) {
      throw new ValidationError('Subscription not found', {
        errors: [
          {
            field: 'id',
            message: 'Subscription not found',
            value: id,
          },
        ],
      });
    }

    // Return response DTO
    return SubscriptionResponseDto.fromEntity(subscription);
  }

  /**
   * Get subscription by cabinet ID
   *
   * GET /subscriptions/cabinet/:cabinetId
   *
   * Headers:
   * - X-Organization-Id: Organization UUID (required for service-to-service calls)
   *
   * Response: 200 OK
   * {
   *   "id": "uuid",
   *   "status": "ACTIVE",
   *   "modules": [...],
   *   ...
   * }
   *
   * Errors:
   * - 404 Not Found: No subscription for cabinet
   */
  @Get('cabinet/:cabinetId')
  async getSubscriptionByCabinet(
    @Param('cabinetId', ParseUUIDPipe) cabinetId: UUID,
    @Headers('x-organization-id') organizationIdHeader?: string,
    // @OrganizationId() organizationId: OrganizationId,
  ): Promise<SubscriptionResponseDto> {
    // Extract organizationId from header (service-to-service) or tenant context (user auth)
    const organizationId = (organizationIdHeader || 'org-123') as OrganizationId;

    if (!organizationId || organizationId === 'org-123') {
      this.logger.warn('No organization ID provided in header or context');
    }

    this.logger.log(`Getting subscription for cabinet ${cabinetId} in org ${organizationId}`);

    // Fetch subscription
    const subscription = await this.subscriptionRepository.findByCabinetId(
      cabinetId,
      organizationId,
      true,
    );

    if (!subscription) {
      this.logger.debug(`No subscription found for cabinet ${cabinetId}`);
      throw new NotFoundException(`No subscription found for cabinet ${cabinetId}`);
    }

    // Return response DTO (with module enrichment if available)
    return this.enrichSubscriptionWithModuleMetadata(subscription);
  }

  /**
   * Update subscription
   *
   * PATCH /subscriptions/:id
   *
   * Request body:
   * {
   *   "billingCycle": "YEARLY",
   *   "cancelAtPeriodEnd": true,
   *   "cancellationReason": "Too expensive"
   * }
   *
   * Response: 200 OK
   * {
   *   "id": "uuid",
   *   "billingCycle": "YEARLY",
   *   ...
   * }
   *
   * Errors:
   * - 400 Bad Request: Validation error
   * - 404 Not Found: Subscription not found
   */
  @Patch(':id')
  async updateSubscription(
    @Param('id', ParseUUIDPipe) id: UUID,
    @Body() body: any,
    // @OrganizationId() organizationId: OrganizationId,
  ): Promise<SubscriptionResponseDto> {
    // Mock organization ID
    const organizationId = 'org-123' as OrganizationId;

    // Validate request body
    const parseResult = updateSubscriptionSchema.safeParse(body);

    if (!parseResult.success) {
      throw new ValidationError('Invalid request body', {
        errors: this.formatZodErrors(parseResult.error.errors),
      });
    }

    const dto: UpdateSubscriptionDto = parseResult.data;

    this.logger.log(`Updating subscription ${id}`);

    // Update subscription
    const subscription = await this.subscriptionService.updateSubscription(id, organizationId, dto);

    // Return response DTO
    return SubscriptionResponseDto.fromEntity(subscription);
  }

  /**
   * Add modules to subscription
   *
   * POST /subscriptions/:id/modules
   *
   * Request body:
   * {
   *   "moduleIds": ["uuid1", "uuid2"]
   * }
   *
   * Response: 200 OK
   * {
   *   "id": "uuid",
   *   "modules": [...],
   *   "totalPrice": 199.99,
   *   ...
   * }
   *
   * Errors:
   * - 400 Bad Request: Validation error
   * - 404 Not Found: Subscription or modules not found
   */
  @Post(':id/modules')
  async addModules(
    @Param('id', ParseUUIDPipe) id: UUID,
    @Body() body: any,
    // @OrganizationId() organizationId: OrganizationId,
  ): Promise<SubscriptionResponseDto> {
    // Mock organization ID
    const organizationId = 'org-123' as OrganizationId;

    // Validate request body
    const parseResult = addModulesSchema.safeParse(body);

    if (!parseResult.success) {
      throw new ValidationError('Invalid request body', {
        errors: this.formatZodErrors(parseResult.error.errors),
      });
    }

    const dto: AddModulesDto = parseResult.data;

    this.logger.log(`Adding ${dto.moduleIds.length} modules to subscription ${id}`);

    // Add modules
    const subscription = await this.subscriptionService.addModules(id, organizationId, dto);

    // Return response DTO
    return SubscriptionResponseDto.fromEntity(subscription);
  }

  /**
   * Remove modules from subscription
   *
   * DELETE /subscriptions/:id/modules
   *
   * Request body:
   * {
   *   "moduleIds": ["uuid1", "uuid2"],
   *   "reason": "No longer needed"
   * }
   *
   * Response: 200 OK
   * {
   *   "id": "uuid",
   *   "modules": [...],
   *   "totalPrice": 99.99,
   *   ...
   * }
   *
   * Errors:
   * - 400 Bad Request: Validation error (e.g., trying to remove core modules)
   * - 404 Not Found: Subscription not found
   */
  @Delete(':id/modules')
  async removeModules(
    @Param('id', ParseUUIDPipe) id: UUID,
    @Body() body: any,
    // @OrganizationId() organizationId: OrganizationId,
  ): Promise<SubscriptionResponseDto> {
    // Mock organization ID
    const organizationId = 'org-123' as OrganizationId;

    // Validate request body
    const parseResult = removeModulesSchema.safeParse(body);

    if (!parseResult.success) {
      throw new ValidationError('Invalid request body', {
        errors: this.formatZodErrors(parseResult.error.errors),
      });
    }

    const dto: RemoveModulesDto = parseResult.data;

    this.logger.log(`Removing ${dto.moduleIds.length} modules from subscription ${id}`);

    // Remove modules
    const subscription = await this.subscriptionService.removeModules(id, organizationId, dto);

    // Return response DTO
    return SubscriptionResponseDto.fromEntity(subscription);
  }

  /**
   * Activate subscription (TRIAL → ACTIVE)
   *
   * POST /subscriptions/:id/activate
   *
   * Request body:
   * {
   *   "stripeSubscriptionId": "sub_xxxxx",
   *   "stripeCustomerId": "cus_xxxxx"
   * }
   *
   * Response: 200 OK
   * {
   *   "id": "uuid",
   *   "status": "ACTIVE",
   *   "activeAt": "2025-11-22T10:00:00Z",
   *   ...
   * }
   *
   * Errors:
   * - 400 Bad Request: Subscription not in TRIAL status
   * - 404 Not Found: Subscription not found
   */
  @Post(':id/activate')
  async activateSubscription(
    @Param('id', ParseUUIDPipe) id: UUID,
    @Body() body: { stripeSubscriptionId?: string; stripeCustomerId?: string },
    // @OrganizationId() organizationId: OrganizationId,
  ): Promise<SubscriptionResponseDto> {
    // Mock organization ID
    const organizationId = 'org-123' as OrganizationId;

    this.logger.log(`Activating subscription ${id}`);

    // Activate subscription
    const subscription = await this.subscriptionService.activateSubscription(
      id,
      organizationId,
      body.stripeSubscriptionId,
      body.stripeCustomerId,
    );

    // Return response DTO
    return SubscriptionResponseDto.fromEntity(subscription);
  }

  /**
   * Cancel subscription
   *
   * POST /subscriptions/:id/cancel
   *
   * Request body:
   * {
   *   "reason": "Switching to competitor",
   *   "immediate": false
   * }
   *
   * Response: 200 OK
   * {
   *   "id": "uuid",
   *   "status": "CANCELLED",
   *   "cancelledAt": "2025-11-22T10:00:00Z",
   *   "cancellationReason": "Switching to competitor",
   *   ...
   * }
   *
   * Errors:
   * - 400 Bad Request: Cannot cancel subscription
   * - 404 Not Found: Subscription not found
   */
  @Post(':id/cancel')
  async cancelSubscription(
    @Param('id', ParseUUIDPipe) id: UUID,
    @Body() body: { reason: string; immediate?: boolean },
    // @OrganizationId() organizationId: OrganizationId,
  ): Promise<SubscriptionResponseDto> {
    // Mock organization ID
    const organizationId = 'org-123' as OrganizationId;

    if (!body.reason || body.reason.length < 10) {
      throw new ValidationError('Cancellation reason is required (min 10 characters)');
    }

    this.logger.log(`Cancelling subscription ${id}`);

    // Cancel subscription
    const subscription = await this.subscriptionService.cancelSubscription(
      id,
      organizationId,
      body.reason,
      body.immediate || false,
    );

    // Return response DTO
    return SubscriptionResponseDto.fromEntity(subscription);
  }

  /**
   * Validate license for module
   *
   * GET /subscriptions/cabinet/:cabinetId/license/:moduleCode
   *
   * Response: 200 OK
   * {
   *   "hasAccess": true,
   *   "subscriptionStatus": "ACTIVE",
   *   "moduleActive": true,
   *   "isTrial": false
   * }
   */
  @Get('cabinet/:cabinetId/license/:moduleCode')
  async validateLicense(
    @Param('cabinetId', ParseUUIDPipe) cabinetId: UUID,
    @Param('moduleCode') moduleCode: string,
    @Headers('x-correlation-id') correlationId?: string,
    // @OrganizationId() organizationId: OrganizationId,
  ) {
    const startTime = Date.now();
    // Mock organization ID
    const organizationId = 'org-123' as OrganizationId;

    // Set logging context
    this.logger.setContext({
      correlationId: correlationId || this.logger.ensureCorrelationId(),
      organizationId,
      cabinetId: this.hashId(cabinetId),
      operation: 'validateLicense',
      moduleCode,
    });

    this.logger.log('License validation request received', {
      moduleCode,
    });

    try {
      // Validate license
      const result = await this.licenseValidationService.validateLicense(
        cabinetId,
        organizationId,
        moduleCode,
      );

      const duration = Date.now() - startTime;

      // Log validation result
      this.logger.log('License validation completed', {
        hasAccess: result.hasAccess,
        subscriptionStatus: result.subscriptionStatus,
        moduleActive: result.moduleActive,
        isTrial: result.isTrial,
        duration_ms: duration,
      });

      // Record metrics based on result
      if (result.hasAccess) {
        this.metricsService.incrementCounter('module_access_check_total', {
          module: moduleCode,
          allowed: 'true',
        });
      } else {
        this.metricsService.incrementCounter('module_access_check_total', {
          module: moduleCode,
          allowed: 'false',
        });

        // Categorize denial reason
        let denialReason = 'unknown';
        const status = result.subscriptionStatus as SubscriptionStatus | string | undefined;
        if (!result.moduleActive) {
          denialReason = 'module_inactive';
        } else if (status === SubscriptionStatus.EXPIRED) {
          denialReason = 'subscription_expired';
        } else if (status === SubscriptionStatus.CANCELLED) {
          denialReason = 'subscription_cancelled';
        } else if (status === 'PAST_DUE') {
          denialReason = 'subscription_past_due';
        }

        this.logger.log('License validation denied', {
          reason: denialReason,
          duration_ms: duration,
        });
      }

      // Record latency
      this.metricsService.recordHistogram('subscription_service_call_duration_ms', duration, {
        endpoint: 'license_check',
        status: 'success',
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error('License validation failed', error as Error, {
        duration_ms: duration,
      });

      // Record error metrics
      this.metricsService.incrementCounter('subscription_service_errors_total', {
        type: 'validation_error',
        endpoint: 'license_check',
      });

      throw error;
    }
  }

  /**
   * Hash ID for logging (PHI protection)
   */
  private hashId(id: string): string {
    return id.substring(0, 8) + '...';
  }

  private formatZodErrors(
    issues: ZodIssue[],
  ): Array<{ field: string; message: string; value?: unknown }> {
    return issues.map((issue) => ({
      field: issue.path && issue.path.length > 0 ? issue.path.join('.') : issue.code,
      message: issue.message,
      value:
        (issue as any).received ?? (issue as any).expected ?? (issue as any).actual ?? undefined,
    }));
  }
}
