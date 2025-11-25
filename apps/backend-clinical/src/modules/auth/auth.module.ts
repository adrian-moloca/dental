/**
 * Auth Module
 * Provides authentication and authorization infrastructure
 */

import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard, PermissionsGuard, TenantIsolationGuard } from './guards';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET') || 'dev-secret-key',
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_EXPIRATION') || '15m',
        },
      }),
    }),
  ],
  providers: [JwtStrategy, JwtAuthGuard, PermissionsGuard, TenantIsolationGuard],
  exports: [JwtAuthGuard, PermissionsGuard, TenantIsolationGuard, PassportModule, JwtModule],
})
export class AuthModule {}
