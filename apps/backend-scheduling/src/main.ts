import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // Security
  app.use(helmet());

  // CORS
  if (configService.get('app.cors.enabled')) {
    app.enableCors({
      origin: configService.get('app.cors.origins'),
      credentials: true,
    });
  }

  // Global prefix
  // All endpoints including health are under /api/v1
  const apiPrefix = configService.get<string>('app.apiPrefix') ?? 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger documentation
  if (configService.get('app.swagger.enabled')) {
    const config = new DocumentBuilder()
      .setTitle(configService.get<string>('app.swagger.title') ?? 'DentalOS Scheduling API')
      .setDescription(
        configService.get<string>('app.swagger.description') ??
          'Appointment scheduling and management API',
      )
      .setVersion(configService.get<string>('app.swagger.version') ?? '1.0')
      .addBearerAuth()
      .addTag('Appointments')
      .addTag('Availability')
      .addTag('Waitlist')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/v1/docs', app, document);
  }

  const port = configService.get('app.port');
  await app.listen(port);

  console.log(`
    🚀 DentalOS Scheduling Service is running on: http://localhost:${port}
    📚 API Documentation: http://localhost:${port}/api/v1/docs
    🏥 Health Check: http://localhost:${port}/api/v1/health
  `);
}

bootstrap();
