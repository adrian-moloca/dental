/**
 * Auth Module
 *
 * Handles patient authentication and authorization.
 *
 * @module modules/auth/auth-module
 */

import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { JwtStrategy } from '@/common/guards/jwt.strategy';
import type { AppConfig } from '@/config/configuration';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<AppConfig, true>) => {
        const jwtConfig = configService.get('jwt', { infer: true });
        return {
          // RS256 requires public key for verification
          publicKey: jwtConfig.accessPublicKey,
          verifyOptions: {
            algorithms: ['RS256'],
            issuer: jwtConfig.issuer,
            audience: jwtConfig.audience,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtStrategy],
})
export class AuthModule {}
