import { Controller, Get, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CacheService } from '../../common/cache/cache.service';
import { CircuitBreakerService } from '../../common/resilience/circuit-breaker.service';
import { GracefulDegradationService } from '../../common/resilience/graceful-degradation.service';

/**
 * Performance Monitoring Controller
 * Provides endpoints for monitoring cache, circuit breakers, and metrics
 */

@ApiTags('Performance')
@Controller('performance')
export class PerformanceController {
  constructor(
    private readonly cacheService: CacheService,
    private readonly circuitBreakerService: CircuitBreakerService,
    private readonly degradationService: GracefulDegradationService,
  ) {}

  @Get('health')
  @ApiOperation({ summary: 'Performance health check' })
  @ApiResponse({ status: 200, description: 'Performance systems health status' })
  async healthCheck() {
    const cacheHealth = await this.cacheService.healthCheck();

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      components: {
        cache: {
          status: cacheHealth.status,
          latency: cacheHealth.latency,
        },
        circuitBreaker: {
          status: 'ok',
          circuits: this.circuitBreakerService.getAllStats(),
        },
        degradation: {
          status: 'ok',
          degradedFeatures: this.degradationService.getDegradedFeatures(),
        },
      },
    };
  }

  @Get('cache/stats')
  @ApiOperation({ summary: 'Get cache statistics' })
  @ApiResponse({ status: 200, description: 'Cache hit/miss rates and metrics' })
  getCacheStats() {
    return this.cacheService.getStats();
  }

  @Post('cache/clear')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Clear all cache (use with caution)' })
  @ApiResponse({ status: 204, description: 'Cache cleared successfully' })
  async clearCache() {
    await this.cacheService.clear();
  }

  @Post('cache/stats/reset')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Reset cache statistics' })
  @ApiResponse({ status: 204, description: 'Cache stats reset' })
  resetCacheStats() {
    this.cacheService.resetStats();
  }

  @Get('circuit-breakers')
  @ApiOperation({ summary: 'Get circuit breaker status' })
  @ApiResponse({ status: 200, description: 'Circuit breaker states and statistics' })
  getCircuitBreakers() {
    return this.circuitBreakerService.getAllStats();
  }

  @Post('circuit-breakers/:name/reset')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Reset specific circuit breaker' })
  @ApiResponse({ status: 204, description: 'Circuit breaker reset' })
  resetCircuitBreaker(name: string) {
    this.circuitBreakerService.reset(name);
  }

  @Post('circuit-breakers/reset-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Reset all circuit breakers' })
  @ApiResponse({ status: 204, description: 'All circuit breakers reset' })
  resetAllCircuitBreakers() {
    this.circuitBreakerService.resetAll();
  }

  @Get('degradation')
  @ApiOperation({ summary: 'Get degraded features' })
  @ApiResponse({ status: 200, description: 'List of currently degraded features' })
  getDegradedFeatures() {
    return {
      degradedFeatures: this.degradationService.getDegradedFeatures(),
      timestamp: new Date().toISOString(),
    };
  }

  @Post('degradation/reset')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Reset all degradations' })
  @ApiResponse({ status: 204, description: 'All degradations cleared' })
  resetDegradations() {
    this.degradationService.resetAll();
  }

  @Get('metrics/summary')
  @ApiOperation({ summary: 'Get performance metrics summary' })
  @ApiResponse({ status: 200, description: 'Aggregated performance metrics' })
  getMetricsSummary() {
    const cacheStats = this.cacheService.getStats();
    const circuitStats = this.circuitBreakerService.getAllStats();
    const degradedFeatures = this.degradationService.getDegradedFeatures();

    return {
      timestamp: new Date().toISOString(),
      cache: {
        hitRate: `${(cacheStats.hitRate * 100).toFixed(2)}%`,
        hits: cacheStats.hits,
        misses: cacheStats.misses,
        sets: cacheStats.sets,
        deletes: cacheStats.deletes,
        errors: cacheStats.errors,
      },
      circuitBreakers: {
        total: Object.keys(circuitStats).length,
        open: Object.values(circuitStats).filter((s) => s.state === 'OPEN').length,
        halfOpen: Object.values(circuitStats).filter((s) => s.state === 'HALF_OPEN').length,
        closed: Object.values(circuitStats).filter((s) => s.state === 'CLOSED').length,
        details: circuitStats,
      },
      degradation: {
        degradedFeaturesCount: degradedFeatures.length,
        degradedFeatures,
      },
    };
  }
}
