import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  name: 'DentalOS Scheduling Service',
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3002', 10),
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  cors: {
    enabled: process.env.CORS_ENABLED === 'true',
    origins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  },
  swagger: {
    enabled: process.env.SWAGGER_ENABLED !== 'false',
    title: 'DentalOS Scheduling API',
    description: 'Appointment scheduling and availability management',
    version: '1.0',
  },
}));
