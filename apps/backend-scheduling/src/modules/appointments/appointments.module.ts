import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-ioredis-yet';
import type { RedisOptions } from 'ioredis';

import { Appointment, AppointmentSchema } from './entities/appointment.schema';
import { AppointmentsRepository } from './repositories/appointments.repository';
import { AppointmentsService } from './services/appointments.service';
import { AvailabilityService } from '../availability/availability.service';
import { AppointmentsController } from './controllers/appointments.controller';
import { AvailabilityController } from './controllers/availability.controller';
import { WaitlistController } from './controllers/waitlist.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PermissionsGuard } from './guards/permissions.guard';
import { TenantIsolationGuard } from './guards/tenant-isolation.guard';
import { ProcedureCompletedHandler } from './handlers/procedure-completed.handler';

@Module({
  imports: [
    // MongoDB
    MongooseModule.forFeature([{ name: Appointment.name, schema: AppointmentSchema }]),

    // JWT Authentication
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const expiresIn = configService.get<string>('JWT_EXPIRATION') || '1h';
        return {
          secret: configService.get<string>('JWT_SECRET') || 'your-secret-key-change-in-production',
          signOptions: {
            expiresIn: expiresIn as `${number}h` | `${number}d` | `${number}m` | `${number}s`,
          },
        };
      },
      inject: [ConfigService],
    }),

    // Redis Cache
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const redisConfig: RedisOptions = {
          host: configService.get<string>('redis.host') || 'localhost',
          port: configService.get<number>('redis.port') || 6379,
          password: configService.get<string>('redis.password'),
          db: configService.get<number>('redis.db') || 0,
        };

        return {
          store: await redisStore(redisConfig),
          ttl: (configService.get<number>('redis.ttl') || 60) * 1000,
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AppointmentsController, AvailabilityController, WaitlistController],
  providers: [
    AppointmentsRepository,
    AppointmentsService,
    AvailabilityService,
    JwtStrategy,
    PermissionsGuard,
    TenantIsolationGuard,
    ProcedureCompletedHandler,
  ],
  exports: [AppointmentsService, AppointmentsRepository],
})
export class AppointmentsModule {}
