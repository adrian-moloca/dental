import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WsJwtAuthGuard } from '../../guards/ws-jwt-auth.guard';
import { WsTenantGuard } from '../../guards/ws-tenant.guard';
import { WsCurrentUser, WsUser } from '../../decorators/ws-user.decorator';
import { PresenceService } from './presence.service';
import { PresenceUpdateDto, PresenceUpdateDtoSchema } from './dto/presence-update.dto';

@WebSocketGateway({
  namespace: '/ws',
  cors: {
    origin: process.env.CORS_ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
    credentials: true,
  },
})
export class PresenceGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(private presenceService: PresenceService) {}

  @UseGuards(WsJwtAuthGuard)
  async handleConnection(client: Socket) {
    const user = (client as any).user as WsUser;
    if (!user) {
      client.disconnect();
      return;
    }

    const name = user.userId || user.deviceId || user.actorId;
    await this.presenceService.setUserOnline(user, client.id, name);

    this.server.to(`tenant:${user.tenantId}`).emit('presence:user_joined', {
      actorId: user.actorId,
      tenantId: user.tenantId,
      organizationId: user.organizationId,
      clinicId: user.clinicId,
      role: user.role,
      name,
      timestamp: new Date(),
    });
  }

  async handleDisconnect(client: Socket) {
    const user = client.data.user as WsUser;
    if (user) {
      await this.presenceService.setUserOffline(user.tenantId, user.actorId);

      this.server.to(`tenant:${user.tenantId}`).emit('presence:user_left', {
        actorId: user.actorId,
        tenantId: user.tenantId,
        timestamp: new Date(),
      });
    }
  }

  @UseGuards(WsJwtAuthGuard, WsTenantGuard)
  @SubscribeMessage('presence:update')
  async handlePresenceUpdate(
    @MessageBody() data: unknown,
    @ConnectedSocket() _client: Socket,
    @WsCurrentUser() user: WsUser,
  ) {
    const dto = PresenceUpdateDtoSchema.parse(data) as PresenceUpdateDto;

    await this.presenceService.updatePresence(user.tenantId, user.actorId, {
      status: dto.status as any,
      activeResource: dto.activeResource || undefined,
    });

    this.server.to(`tenant:${user.tenantId}`).emit('presence:user_updated', {
      actorId: user.actorId,
      status: dto.status,
      activeResource: dto.activeResource,
      timestamp: new Date(),
    });

    return { success: true };
  }

  @UseGuards(WsJwtAuthGuard, WsTenantGuard)
  @SubscribeMessage('presence:heartbeat')
  async handleHeartbeat(@WsCurrentUser() user: WsUser) {
    await this.presenceService.heartbeat(user.tenantId, user.actorId);
    return { success: true, timestamp: new Date() };
  }
}
