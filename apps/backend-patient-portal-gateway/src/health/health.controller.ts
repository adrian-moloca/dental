import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';
import { Public } from '@/common/decorators/public.decorator';
import type { AppConfig } from '@/config/configuration';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private memory: MemoryHealthIndicator,
    private configService: ConfigService<AppConfig, true>,
  ) {}

  @Get('liveness')
  @Public()
  @ApiOperation({ summary: 'Liveness probe' })
  @HealthCheck()
  liveness() {
    return this.health.check([]);
  }

  @Get('readiness')
  @Public()
  @ApiOperation({ summary: 'Readiness probe' })
  @HealthCheck()
  readiness() {
    return this.health.check([() => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024)]);
  }

  @Get('detailed')
  @Public()
  @ApiOperation({ summary: 'Detailed health check' })
  @HealthCheck()
  detailed() {
    const authUrl = this.configService.get('microservices.authServiceUrl', { infer: true });

    return this.health.check([
      () => this.http.pingCheck('auth-service', `${authUrl}/health/liveness`),
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),
    ]);
  }
}
