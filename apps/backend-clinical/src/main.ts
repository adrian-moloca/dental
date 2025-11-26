/**
 * Bootstrap file for Clinical EHR Microservice
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { createHelmetConfig, createCorsConfigFromEnv } from '@dentalos/shared-security';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters';
import { LoggingInterceptor } from './common/interceptors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Apply security headers with Helmet (using shared-security)
  app.use(
    helmet(
      createHelmetConfig({
        enableCSP: process.env.NODE_ENV === 'production',
        enableHSTS: process.env.NODE_ENV === 'production',
      }),
    ),
  );

  // Configure CORS (using shared-security)
  app.enableCors(
    createCorsConfigFromEnv({
      CORS_ALLOWED_ORIGINS:
        process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5173',
      CORS_ALLOW_CREDENTIALS: 'true',
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Set global API prefix
  // All endpoints including health are under /api/v1
  app.setGlobalPrefix('api/v1');

  const config = new DocumentBuilder()
    .setTitle('Clinical EHR API')
    .setDescription('Dental OS Clinical EHR Microservice')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3005;
  await app.listen(port);
  console.log(`Clinical EHR Microservice started on port ${port}`);
  console.log(`Health endpoint available at http://localhost:${port}/api/v1/health`);
}

bootstrap();
