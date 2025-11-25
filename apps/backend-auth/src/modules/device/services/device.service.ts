import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { DeviceLoginDto } from '../dto/device-login.dto';
import { DeviceAuthResponseDto } from '../dto/device-auth-response.dto';

@Injectable()
export class DeviceService {
  private readonly logger = new Logger(DeviceService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async deviceLogin(dto: DeviceLoginDto): Promise<DeviceAuthResponseDto> {
    // Verify device access token
    try {
      const deviceTokenSecret = this.configService.get<string>('device.tokenSecret');
      const decoded = this.jwtService.verify(dto.deviceAccessToken, {
        secret: deviceTokenSecret,
      });

      // Validate token contents match request
      if (
        decoded.deviceId !== dto.deviceId ||
        decoded.tenantId !== dto.tenantId ||
        decoded.organizationId !== dto.organizationId
      ) {
        throw new UnauthorizedException('Device token does not match request parameters');
      }

      if (dto.clinicId && decoded.clinicId !== dto.clinicId) {
        throw new UnauthorizedException('Device token does not match clinic ID');
      }

      // Generate standard access and refresh tokens
      const jwtSecret = this.configService.get<string>('jwt.secret');
      const accessTokenExpiry = this.configService.get<string>('jwt.accessTokenExpiry', '1h');
      const refreshTokenExpiry = this.configService.get<string>('jwt.refreshTokenExpiry', '7d');

      const payload = {
        sub: decoded.userId,
        deviceId: decoded.deviceId,
        tenantId: decoded.tenantId,
        organizationId: decoded.organizationId,
        clinicId: decoded.clinicId,
        type: 'device',
      };

      const accessToken = this.jwtService.sign(payload, {
        secret: jwtSecret,
        expiresIn: accessTokenExpiry as any,
      });

      const refreshToken = this.jwtService.sign(
        { ...payload, tokenType: 'refresh' },
        {
          secret: jwtSecret,
          expiresIn: refreshTokenExpiry as any,
        }
      );

      this.logger.log(`Device ${dto.deviceId} logged in for user ${decoded.userId}`);

      return {
        accessToken,
        refreshToken,
        expiresIn: this.parseExpiryToSeconds(accessTokenExpiry),
        tokenType: 'Bearer',
        deviceId: dto.deviceId,
        userId: decoded.userId,
      };
    } catch (error) {
      this.logger.error(
        `Device login failed: ${error instanceof Error ? error.message : String(error)}`
      );
      throw new UnauthorizedException('Invalid device access token');
    }
  }

  private parseExpiryToSeconds(expiry: string): number {
    const unit = expiry.slice(-1);
    const value = parseInt(expiry.slice(0, -1), 10);

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      default:
        return 3600; // default 1 hour
    }
  }
}
