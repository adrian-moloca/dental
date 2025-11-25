import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app-optimized.module';
import type { AppConfig } from './config/configuration';
import { defaultPerformanceConfig } from './config/performance.config';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { PerformanceInterceptor } from './common/interceptors/performance.interceptor';
import { ETagInterceptor } from './common/interceptors/etag.interceptor';
import { TimeoutInterceptor } from './common/resilience/timeout.interceptor';
import { CacheService } from './common/cache/cache.service';

/**
 * Optimized Bootstrap with Performance Features
 * - Connection pooling
 * - Response compression
 * - ETags for cache validation
 * - Performance monitoring
 * - Circuit breakers
 * - Request timeouts
 * - Memory optimization
 */

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // Load performance configuration
  const perfConfig = defaultPerformanceConfig();

  // Memory optimization
  if (perfConfig.memory.enableGarbageCollection) {
    if (global.gc !== undefined) {
      setInterval(() => {
        global.gc?.();
        logger.debug('Manual garbage collection triggered');
      }, perfConfig.memory.gcInterval);
    }
  }

  // Create NestJS application
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    abortOnError: false, // Graceful degradation
  });

  const configService = app.get(ConfigService<AppConfig>);
  const cacheService = app.get(CacheService);

  // Security
  app.use(helmet());

  // Response Compression (if enabled)
  if (perfConfig.response.enableCompression) {
    app.use(
      compression({
        threshold: perfConfig.response.compressionMinSize,
        level: 6, // Balanced compression
        filter: (req, res) => {
          if (req.headers['x-no-compression']) {
            return false;
          }
          return compression.filter(req, res);
        },
      }),
    );
  }

  // CORS
  const corsOrigin = configService.get('cors.origin', { infer: true })!;
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Correlation-ID',
      'X-Organization-ID',
      'X-Clinic-ID',
      'If-None-Match', // ETag support
      'Cache-Control',
    ],
    exposedHeaders: ['X-Correlation-ID', 'ETag', 'Cache-Control'],
  });

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global interceptors
  // Order matters for performance:
  // 1. Timeout - enforce request deadlines
  // 2. Performance - track metrics
  // 3. Logging - capture events
  // 4. ETag - cache validation
  // 5. Transform - format response
  const interceptors: any[] = [
    new TimeoutInterceptor(perfConfig.timeouts.default),
    new PerformanceInterceptor(cacheService),
    new LoggingInterceptor(),
  ];

  if (perfConfig.response.enableETag) {
    interceptors.push(new ETagInterceptor());
  }

  interceptors.push(new TransformInterceptor());

  app.useGlobalInterceptors(...interceptors);

  // Global validation pipe with performance optimizations
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true, // Faster conversion
      },
      // Disable detailed errors in production for performance
      disableErrorMessages: process.env.NODE_ENV === 'production',
    }),
  );

  // API prefix
  app.setGlobalPrefix('api/v1');

  // Swagger/OpenAPI
  const swaggerConfig = new DocumentBuilder()
    .setTitle('DentalOS Multi-Clinic & Enterprise Management API (Optimized)')
    .setDescription(
      'High-performance Organizations, Clinics, Provider-Clinic Assignments, and RBAC API\n\n' +
        'Performance Features:\n' +
        '- Redis caching with intelligent TTL strategies\n' +
        '- Connection pooling and query optimization\n' +
        '- Response compression and ETags\n' +
        '- DataLoader pattern for N+1 prevention\n' +
        '- Circuit breakers and graceful degradation\n' +
        '- Field selection for partial responses\n' +
        '- Cursor-based pagination for large datasets\n\n' +
        'Query Parameters:\n' +
        '- fields: Comma-separated list of fields to return\n' +
        '- cursor: Cursor for pagination (more efficient than offset)\n' +
        '- limit: Page size (max 100)\n' +
        '- offset: Skip items (use cursor for better performance)',
    )
    .setVersion('1.0')
    .addTag('Organizations', 'Multi-tenant organization management')
    .addTag('Clinics', 'Clinic creation and management')
    .addTag('Provider-Clinic Assignments', 'Provider to clinic linking')
    .addTag('RBAC', 'Enterprise roles and permissions')
    .addTag('Performance', 'Performance monitoring and metrics')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document);

  const port = configService.get('port', { infer: true })!;

  // Enable graceful shutdown
  app.enableShutdownHooks();

  // Graceful shutdown handler
  process.on('SIGTERM', async () => {
    logger.log('SIGTERM signal received: closing HTTP server');
    await app.close();
    logger.log('HTTP server closed');
  });

  process.on('SIGINT', async () => {
    logger.log('SIGINT signal received: closing HTTP server');
    await app.close();
    logger.log('HTTP server closed');
  });

  await app.listen(port);

  logger.log(`🚀 Enterprise Service (OPTIMIZED) running on http://localhost:${port}`);
  logger.log(`📚 API Documentation: http://localhost:${port}/api-docs`);
  logger.log(`🏢 Organizations, Clinics, Assignments & RBAC endpoints ready`);
  logger.log('');
  logger.log('Performance Features Enabled:');
  logger.log(`  ✓ Redis Caching (${perfConfig.cache.enabled ? 'ON' : 'OFF'})`);
  logger.log(`  ✓ Response Compression (${perfConfig.response.enableCompression ? 'ON' : 'OFF'})`);
  logger.log(`  ✓ ETag Support (${perfConfig.response.enableETag ? 'ON' : 'OFF'})`);
  logger.log(`  ✓ Circuit Breaker (${perfConfig.circuitBreaker.enabled ? 'ON' : 'OFF'})`);
  logger.log(`  ✓ Performance Monitoring (${perfConfig.monitoring.enabled ? 'ON' : 'OFF'})`);
  logger.log(`  ✓ DataLoader Batching (${perfConfig.query.enableBatchLoading ? 'ON' : 'OFF'})`);
  logger.log(`  ✓ Lean Queries (${perfConfig.query.enableLeanQueries ? 'ON' : 'OFF'})`);
  logger.log(
    `  ✓ Connection Pool (${perfConfig.database.minPoolSize}-${perfConfig.database.maxPoolSize} connections)`,
  );
  logger.log('');
  logger.log('Performance Budgets (P95 Targets):');
  logger.log('  • Organization CRUD: 150ms');
  logger.log('  • Clinic CRUD: 150ms');
  logger.log('  • Assignment operations: 200ms');
  logger.log('  • List queries: 200ms');
  logger.log('  • Search: 300ms');
  logger.log('');

  // Health check for cache
  const cacheHealth = await cacheService.healthCheck();
  logger.log(
    `Redis: ${cacheHealth.status === 'ok' ? '✓' : '✗'} (latency: ${cacheHealth.latency || 'N/A'}ms)`,
  );
}

bootstrap();
