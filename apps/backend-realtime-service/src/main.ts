import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('server.port', 3020);
  const corsOrigins = configService.get<string[]>('cors.allowedOrigins', []);

  app.use(helmet());

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-tenant-id',
      'x-organization-id',
      'x-clinic-id',
      'x-device-id',
    ],
  });

  app.setGlobalPrefix('api/v1');

  await app.listen(port);
  console.log(`Backend Realtime Service running on port ${port}`);
  console.log(`Health endpoint available at http://localhost:${port}/api/v1/health`);
}

bootstrap();
