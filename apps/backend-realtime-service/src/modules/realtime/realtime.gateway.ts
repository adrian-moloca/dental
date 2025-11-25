import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { WsJwtAuthGuard } from '../../guards/ws-jwt-auth.guard';
import { WsTenantGuard } from '../../guards/ws-tenant.guard';
import { WsCurrentUser, WsUser } from '../../decorators/ws-user.decorator';
import { RealtimeService } from './realtime.service';
import { RedisService } from '../../redis/redis.service';

@WebSocketGateway({
  namespace: '/ws',
  cors: {
    origin: process.env.CORS_ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  },
})
export class RealtimeGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(
    private realtimeService: RealtimeService,
    private redisService: RedisService,
  ) {}

  afterInit(server: Server) {
    const pubClient = this.redisService.getPublisher();
    const subClient = this.redisService.getSubscriber();
    server.adapter(createAdapter(pubClient, subClient));
    this.realtimeService.setServer(server);
    console.log('WebSocket Gateway initialized with Redis adapter');
  }

  @UseGuards(WsJwtAuthGuard)
  async handleConnection(client: Socket) {
    const user = (client as any).user as WsUser;

    if (!user) {
      client.disconnect();
      return;
    }

    client.data.user = user;

    const tenantRoom = this.realtimeService.buildTenantRoom(user.tenantId);
    const orgRoom = this.realtimeService.buildOrganizationRoom(user.organizationId);

    await client.join(tenantRoom);
    await client.join(orgRoom);

    if (user.clinicId) {
      const clinicRoom = this.realtimeService.buildClinicRoom(user.clinicId);
      await client.join(clinicRoom);
    }

    console.log(`Client ${client.id} connected: ${user.actorId} (tenant: ${user.tenantId})`);

    client.emit('connection:established', {
      socketId: client.id,
      tenantId: user.tenantId,
      organizationId: user.organizationId,
      clinicId: user.clinicId,
    });
  }

  handleDisconnect(client: Socket) {
    const user = client.data.user as WsUser;
    if (user) {
      console.log(`Client ${client.id} disconnected: ${user.actorId}`);
    }
  }

  @UseGuards(WsJwtAuthGuard, WsTenantGuard)
  @SubscribeMessage('subscribe')
  async handleSubscribe(
    @MessageBody() data: { channels: string[] },
    @ConnectedSocket() client: Socket,
    @WsCurrentUser() user: WsUser,
  ) {
    if (!data.channels || !Array.isArray(data.channels)) {
      throw new WsException('Invalid channels array');
    }

    for (const channel of data.channels) {
      if (this.isValidChannelForUser(channel, user)) {
        await client.join(channel);
      } else {
        throw new WsException(`Forbidden: Cannot subscribe to channel ${channel}`);
      }
    }

    return { success: true, subscribedTo: data.channels };
  }

  @UseGuards(WsJwtAuthGuard, WsTenantGuard)
  @SubscribeMessage('unsubscribe')
  async handleUnsubscribe(
    @MessageBody() data: { channels: string[] },
    @ConnectedSocket() client: Socket,
  ) {
    if (!data.channels || !Array.isArray(data.channels)) {
      throw new WsException('Invalid channels array');
    }

    for (const channel of data.channels) {
      await client.leave(channel);
    }

    return { success: true, unsubscribedFrom: data.channels };
  }

  @UseGuards(WsJwtAuthGuard, WsTenantGuard)
  @SubscribeMessage('ping')
  handlePing(@WsCurrentUser() user: WsUser) {
    return { pong: true, timestamp: new Date(), actorId: user.actorId };
  }

  private isValidChannelForUser(channel: string, user: WsUser): boolean {
    if (channel.startsWith(`tenant:${user.tenantId}`)) return true;
    if (channel.startsWith(`org:${user.organizationId}`)) return true;
    if (user.clinicId && channel.startsWith(`clinic:${user.clinicId}`)) return true;
    if (channel.startsWith('resource:') || channel.startsWith('patient:')) {
      return true;
    }
    return false;
  }
}
