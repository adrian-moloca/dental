import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsTenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient();
    const data = context.switchToWs().getData();

    if (!client.user || !client.user.tenantId) {
      throw new WsException('Forbidden: Missing tenant context');
    }

    if (data && data.tenantId && data.tenantId !== client.user.tenantId) {
      throw new WsException('Forbidden: Tenant mismatch');
    }

    return true;
  }
}
