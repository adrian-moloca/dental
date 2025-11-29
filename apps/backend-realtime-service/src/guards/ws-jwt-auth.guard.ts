import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient();
    const token =
      client.handshake?.auth?.token ||
      client.handshake?.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new WsException('Unauthorized: No token provided');
    }

    try {
      const secret = this.configService.get<string>('jwt.secret');
      const payload = this.jwtService.verify(token, { secret });

      const user = {
        userId: payload.sub || payload.userId,
        deviceId: payload.deviceId,
        actorId: payload.deviceId || payload.sub || payload.userId,
        tenantId: payload.tenantId,
        organizationId: payload.organizationId,
        clinicId: payload.clinicId,
        role: payload.role || 'USER',
      };

      client.user = user;
      client.tenantId = user.tenantId;
      client.organizationId = user.organizationId;
      client.clinicId = user.clinicId;

      return true;
    } catch (error) {
      throw new WsException('Unauthorized: Invalid token');
    }
  }
}
