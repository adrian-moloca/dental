import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface WsUser {
  userId?: string;
  deviceId?: string;
  actorId: string;
  tenantId: string;
  organizationId: string;
  clinicId?: string;
  role: string;
}

export const WsCurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): WsUser => {
    const client = ctx.switchToWs().getClient();
    return client.user;
  },
);
