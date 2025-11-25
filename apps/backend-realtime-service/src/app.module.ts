import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import {
  serverConfig,
  databaseConfig,
  redisConfig,
  jwtConfig,
  corsConfig,
} from './config/configuration';
import { RedisModule } from './redis/redis.module';
import { RealtimeModule } from './modules/realtime/realtime.module';
import { PresenceModule } from './modules/presence/presence.module';
import { CrdtModule } from './modules/crdt/crdt.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [serverConfig, databaseConfig, redisConfig, jwtConfig, corsConfig],
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiresIn'),
        },
      }),
      inject: [ConfigService],
    }),
    RedisModule,
    CrdtModule,
    PresenceModule,
    RealtimeModule,
    MetricsModule,
    HealthModule,
  ],
})
export class AppModule {}
