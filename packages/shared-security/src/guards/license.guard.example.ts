/**
 * LicenseGuard Integration Examples
 * @module shared-security/guards/examples
 *
 * This file demonstrates various ways to integrate LicenseGuard into your NestJS application
 */

import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { LicenseGuard, RequiresModule } from './license.guard';
import { ModuleCode } from '@dentalos/shared-auth';

/**
 * EXAMPLE 1: Controller-Level Protection
 * All routes in this controller require the IMAGING module
 */
@Controller('imaging')
@UseGuards(LicenseGuard)
@RequiresModule(ModuleCode.IMAGING)
export class ImagingControllerExample {
  @Get('xrays')
  async getXrays() {
    // Requires IMAGING module
    return { xrays: [] };
  }

  @Post('xrays')
  async uploadXray(@Body() data: any) {
    // Requires IMAGING module
    return { id: 'xray-123' };
  }

  @Delete('xrays/:id')
  async deleteXray(@Param('id') id: string) {
    // Requires IMAGING module
    return { deleted: true };
  }
}

/**
 * EXAMPLE 2: Route-Level Protection
 * Different routes require different modules
 */
@Controller('analytics')
@UseGuards(LicenseGuard)
export class AnalyticsControllerExample {
  @Get('basic')
  async getBasicAnalytics() {
    // No module required - available to all authenticated users
    return { revenue: 10000, patients: 50 };
  }

  @Get('advanced')
  @RequiresModule(ModuleCode.ANALYTICS_ADVANCED)
  async getAdvancedAnalytics() {
    // Requires ANALYTICS_ADVANCED module
    return {
      revenue: 10000,
      patients: 50,
      predictedRevenue: 12000,
      patientRetention: 0.85,
      treatmentConversion: 0.72,
    };
  }

  @Get('reports/advanced')
  @RequiresModule(ModuleCode.ANALYTICS_ADVANCED)
  async generateAdvancedReport() {
    // Requires ANALYTICS_ADVANCED module
    return { reportId: 'report-123' };
  }
}

/**
 * EXAMPLE 3: Mixed Module Requirements
 * Controller with multiple module requirements
 */
@Controller('practice')
@UseGuards(LicenseGuard)
export class PracticeControllerExample {
  @Get('locations')
  @RequiresModule(ModuleCode.MULTI_LOCATION)
  async getLocations() {
    // Requires MULTI_LOCATION module
    return [
      { id: 'loc-1', name: 'Main Office' },
      { id: 'loc-2', name: 'Branch Office' },
    ];
  }

  @Get('inventory')
  @RequiresModule(ModuleCode.INVENTORY)
  async getInventory() {
    // Requires INVENTORY module
    return { items: [] };
  }

  @Post('inventory')
  @RequiresModule(ModuleCode.INVENTORY)
  async addInventoryItem(@Body() item: any) {
    // Requires INVENTORY module
    return { id: 'item-123' };
  }

  @Get('marketing/campaigns')
  @RequiresModule(ModuleCode.MARKETING)
  async getCampaigns() {
    // Requires MARKETING module
    return { campaigns: [] };
  }
}

/**
 * EXAMPLE 4: Service Layer Validation
 * Programmatic module access checks in services
 */
import { Injectable, ForbiddenException, Inject } from '@nestjs/common';
import { hasModuleAccess, isSubscriptionActive } from './license.guard';
import type { CurrentUser } from '@dentalos/shared-auth';

@Injectable()
export class ReportServiceExample {
  async generateReport(currentUser: CurrentUser, reportType: 'basic' | 'advanced') {
    // Check if subscription is active
    if (!isSubscriptionActive(currentUser)) {
      throw new ForbiddenException('Active subscription required to generate reports');
    }

    // For advanced reports, check module access
    if (reportType === 'advanced') {
      if (!hasModuleAccess(currentUser, ModuleCode.ANALYTICS_ADVANCED)) {
        throw new ForbiddenException(
          'Advanced Analytics module required for advanced reports. Please upgrade your subscription.',
        );
      }
    }

    // Generate report...
    return { reportId: 'report-123', type: reportType };
  }

  async exportData(currentUser: CurrentUser, format: 'csv' | 'pdf') {
    // Check subscription status
    if (!isSubscriptionActive(currentUser)) {
      throw new ForbiddenException('Active subscription required for data export');
    }

    // PDF export requires advanced analytics
    if (format === 'pdf' && !hasModuleAccess(currentUser, ModuleCode.ANALYTICS_ADVANCED)) {
      throw new ForbiddenException('PDF export requires Advanced Analytics module');
    }

    // Export data...
    return { exportId: 'export-123', format };
  }
}

/**
 * EXAMPLE 5: Global Guard Configuration
 * Apply LicenseGuard globally to all routes
 */
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

@Module({
  providers: [
    // Apply LicenseGuard globally
    {
      provide: APP_GUARD,
      useClass: LicenseGuard,
    },
  ],
})
export class AppModuleExample {}

/**
 * EXAMPLE 6: Guard Order Configuration
 * Correct order: Authentication → License → Permission
 */
@Module({
  providers: [
    // 1. Authentication guard (validates JWT)
    // {
    //   provide: APP_GUARD,
    //   useClass: JwtAuthGuard,
    // },
    // 2. License guard (validates subscription/modules)
    {
      provide: APP_GUARD,
      useClass: LicenseGuard,
    },
    // 3. Permission guard (validates fine-grained permissions)
    // {
    //   provide: APP_GUARD,
    //   useClass: PermissionGuard,
    // },
  ],
})
export class SecurityOrderExample {}

/**
 * EXAMPLE 7: Custom Error Handling
 * Handle license validation errors with custom responses
 */
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { PaymentRequiredException } from './license.guard';
import { Response } from 'express';

@Catch(PaymentRequiredException, ForbiddenException)
export class LicenseExceptionFilterExample implements ExceptionFilter {
  private readonly logger = new Logger('LicenseAudit');

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();
    const status = exception.getStatus();
    const message = exception.message;

    // Audit log license check failure
    this.logger.warn({
      event: 'LICENSE_CHECK_FAILED',
      userId: request.user?.userId,
      organizationId: request.user?.organizationId,
      subscriptionStatus: request.user?.subscription?.status,
      modules: request.user?.subscription?.modules,
      path: request.path,
      method: request.method,
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });

    // Return user-friendly error response
    response.status(status).json({
      statusCode: status,
      message,
      error: status === 402 ? 'Payment Required' : 'Forbidden',
      timestamp: new Date().toISOString(),
      path: request.url,
      // Include helpful context for frontend
      context: {
        subscriptionRequired: status === 402,
        upgradeRequired: status === 403 && message.includes('module'),
        supportRequired: message.includes('suspended'),
      },
    });
  }
}

/**
 * EXAMPLE 8: Conditional Module Access
 * Different module requirements based on request parameters
 */
@Controller('patients')
@UseGuards(LicenseGuard)
export class PatientControllerExample {
  @Get(':id')
  async getPatient(@Param('id') id: string) {
    // Basic patient management - no special module required
    return { id, name: 'John Doe' };
  }

  @Get(':id/images')
  @RequiresModule(ModuleCode.IMAGING)
  async getPatientImages(@Param('id') id: string) {
    // Requires IMAGING module
    return { patientId: id, images: [] };
  }

  @Get(':id/teledentistry')
  @RequiresModule(ModuleCode.TELEDENTISTRY)
  async scheduleTeledentistry(@Param('id') id: string) {
    // Requires TELEDENTISTRY module
    return { patientId: id, sessionId: 'session-123' };
  }

  @Get(':id/insurance')
  @RequiresModule(ModuleCode.INSURANCE)
  async getInsuranceInfo(@Param('id') id: string) {
    // Requires INSURANCE module
    return { patientId: id, insuranceProvider: 'Provider ABC' };
  }
}

/**
 * EXAMPLE 9: Feature Toggle Pattern
 * Combine with feature flags for gradual rollout
 */
@Injectable()
export class FeatureServiceExample {
  isFeatureEnabled(currentUser: CurrentUser, feature: string): boolean {
    // Check subscription module access first
    const moduleMap: Record<string, ModuleCode> = {
      'advanced-analytics': ModuleCode.ANALYTICS_ADVANCED,
      'imaging': ModuleCode.IMAGING,
      'teledentistry': ModuleCode.TELEDENTISTRY,
      'multi-location': ModuleCode.MULTI_LOCATION,
    };

    const requiredModule = moduleMap[feature];
    if (!requiredModule) {
      return false; // Unknown feature
    }

    // Check if user has module access
    if (!hasModuleAccess(currentUser, requiredModule)) {
      return false;
    }

    // Additional feature flag checks could go here
    // (e.g., check LaunchDarkly, Unleash, etc.)

    return true;
  }
}

/**
 * EXAMPLE 10: Usage Tracking
 * Track module usage for analytics and billing
 */
@Injectable()
export class UsageTrackingServiceExample {
  private readonly logger = new Logger('UsageTracking');

  async trackModuleUsage(currentUser: CurrentUser, moduleCode: ModuleCode, endpoint: string) {
    // Log module usage
    this.logger.log({
      event: 'MODULE_USAGE',
      userId: currentUser.userId,
      organizationId: currentUser.organizationId,
      moduleCode,
      endpoint,
      subscriptionStatus: currentUser.subscription.status,
      timestamp: new Date().toISOString(),
    });

    // Could also:
    // - Increment usage counter in database
    // - Send event to analytics service
    // - Check usage quotas
    // - Trigger billing events
  }
}
