/**
 * Application Bootstrap for Backend Auth Service
 *
 * Initializes the NestJS application with security middleware,
 * global validation, error handling, and graceful shutdown.
 *
 * @module main
 */

import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { createHelmetConfig, createCorsConfigFromEnv } from '@dentalos/shared-security';
import { AppModule } from './app.module';
import type { AppConfig } from './configuration';
import { validateProductionConfig } from './validators/production-config.validator';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { TenantContextInterceptor } from './interceptors/tenant-context.interceptor';
import { AuditLogInterceptor } from './modules/audit/interceptors/audit-log.interceptor';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { CompressionInterceptor } from './common/interceptors/compression.interceptor';
import { ETagInterceptor } from './common/interceptors/etag.interceptor';
import { TenantContextService } from './context/tenant-context.service';
import { AuditLoggerService } from './modules/audit/services/audit-logger.service';
import { ClassSerializerInterceptor } from '@nestjs/common';

/**
 * Bootstrap the NestJS application
 */
async function bootstrap(): Promise<void> {
  // Create NestJS application instance
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    cors: false, // We'll configure CORS manually below
  });

  // Explicit interceptor registration (include neutral ClassSerializerInterceptor to prevent stripping)
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {
      strategy: 'exposeAll',
      excludeExtraneousValues: false,
      exposeUnsetFields: true,
    }),
    new LoggingInterceptor(),
    new TenantContextInterceptor(app.get(TenantContextService), app.get(Reflector)),
    new AuditLogInterceptor(app.get(AuditLoggerService), app.get(Reflector)),
    new TransformInterceptor(),
    new CompressionInterceptor(),
    new ETagInterceptor()
  );
  console.log(
    'Interceptors registered: Logging, TenantContext, AuditLog, Transform, Compression, ETag'
  );
  const configService = app.get(ConfigService<AppConfig, true>);
  const port = configService.get('port', { infer: true }) || 3001;
  const nodeEnv = configService.get('nodeEnv', { infer: true }) || 'development';
  const corsOrigins = configService.get('cors.origins', { infer: true }) || [
    'http://localhost:5173',
  ];
  const corsCredentials = configService.get('cors.credentials', { infer: true }) || true;
  const swaggerEnabled = configService.get('swaggerEnabled', { infer: true }) || true;
  const shutdownTimeout = configService.get('shutdownTimeout', { infer: true }) || 10000;

  // Apply security headers with Helmet (using shared-security)
  app.use(
    helmet(
      createHelmetConfig({
        enableCSP: nodeEnv === 'production',
        enableHSTS: nodeEnv === 'production',
      })
    )
  );

  // Configure CORS (using shared-security)
  app.enableCors(
    createCorsConfigFromEnv({
      CORS_ALLOWED_ORIGINS: corsOrigins.join(','),
      CORS_ALLOW_CREDENTIALS: corsCredentials.toString(),
    })
  );

  // LOG ACTIVE GLOBAL INTERCEPTORS (v11 diagnostic)
  console.log('=== v11 DIAGNOSTICS - CHECKING GLOBAL INTERCEPTORS ===');
  try {
    const httpAdapter = app.getHttpAdapter();
    const instance = httpAdapter?.getInstance?.();
    console.log('HTTP Adapter instance:', !!instance);

    // Try to access global interceptors through various methods
    if (instance && typeof instance.getGlobalInterceptors === 'function') {
      const globalInterceptors = instance.getGlobalInterceptors();
      console.log(
        'Global interceptors found:',
        globalInterceptors.map((i: any) => i.constructor?.name)
      );
    } else {
      console.log('getGlobalInterceptors not available on adapter');
    }
  } catch (error) {
    console.log('Error checking interceptors:', error);
  }
  console.log('=== END v11 DIAGNOSTICS ===');

  // Apply global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      disableErrorMessages: nodeEnv === 'production',
      validationError: {
        target: false,
        value: false,
      },
    })
  );

  // Set global API prefix
  // All endpoints including health are under /api/v1
  app.setGlobalPrefix('api/v1');

  // Setup Swagger documentation
  if (swaggerEnabled) {
    const config = new DocumentBuilder()
      .setTitle('DentalOS Auth API')
      .setDescription('Authentication and Authorization Microservice')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Authentication endpoints')
      .addTag('users', 'User management')
      .addTag('sessions', 'Session management')
      .addTag('health', 'Health check endpoints')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  // Validate production configuration before starting server
  // This prevents insecure deployments and ensures HIPAA/GDPR compliance
  validateProductionConfig(configService);

  // Enable graceful shutdown hooks
  app.enableShutdownHooks();

  // Listen for shutdown signals
  const signals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT'];
  signals.forEach((signal) => {
    process.on(signal, async () => {
      console.log(`Received ${signal}, starting graceful shutdown...`);

      // Set timeout for forced shutdown
      const forceShutdownTimer = setTimeout(() => {
        console.error('Graceful shutdown timeout exceeded, forcing exit');
        process.exit(1);
      }, shutdownTimeout);

      try {
        await app.close();
        clearTimeout(forceShutdownTimer);
        console.log('Application closed successfully');
        process.exit(0);
      } catch (error) {
        console.error('Error during shutdown:', error);
        clearTimeout(forceShutdownTimer);
        process.exit(1);
      }
    });
  });

  // Start listening
  await app.listen(port.toString());

  console.log(`Backend Auth Service running on port ${port} in ${nodeEnv} mode`);
  console.log(`Health endpoint available at http://localhost:${port}/api/v1/health`);
  if (swaggerEnabled) {
    console.log(`API Documentation available at http://localhost:${port}/api/docs`);
  }
}

// Start the application
bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
