import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { createHelmetConfig } from '@dentalos/shared-security';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // Apply security headers with Helmet (using shared-security)
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  app.use(
    helmet(
      createHelmetConfig({
        enableCSP: nodeEnv === 'production',
        enableHSTS: nodeEnv === 'production',
      }),
    ),
  );

  // Configure CORS
  const corsOriginConfig = configService.get<string>(
    'CORS_ORIGINS',
    'http://localhost:3000,http://localhost:5173',
  );
  const corsOrigins =
    typeof corsOriginConfig === 'string'
      ? corsOriginConfig.split(',').map((o) => o.trim())
      : corsOriginConfig;

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Correlation-ID',
      'X-Organization-ID',
      'X-Clinic-ID',
      'X-Tenant-ID',
    ],
    exposedHeaders: ['X-Correlation-ID'],
  });

  // Global prefix
  // All endpoints including health are under /api/v1
  const apiPrefix = configService.get<string>('API_PREFIX', 'api/v1');
  app.setGlobalPrefix(apiPrefix);

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('DentalOS Billing Service')
    .setDescription('Billing, Invoicing, Payments & Finance Management API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('invoices', 'Invoice management')
    .addTag('payments', 'Payment processing')
    .addTag('ledger', 'Ledger and accounting')
    .addTag('patient-balances', 'Patient balance tracking')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get<number>('PORT', 3010);
  await app.listen(port);

  logger.log(`Billing Service is running on port ${port}`);
  logger.log(`Health endpoint available at http://localhost:${port}/api/v1/health`);
  logger.log(`API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
