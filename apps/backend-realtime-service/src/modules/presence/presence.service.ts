import { Injectable } from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';
import { PresenceRecord } from './presence.schema';
import { WsUser } from '../../decorators/ws-user.decorator';

@Injectable()
export class PresenceService {
  private readonly PRESENCE_KEY_PREFIX = 'presence:user:';
  private readonly RESOURCE_PRESENCE_KEY_PREFIX = 'presence:resource:';
  private readonly PRESENCE_TTL = 300;

  constructor(private redisService: RedisService) {}

  async setUserOnline(user: WsUser, socketId: string, name: string): Promise<void> {
    const presence: PresenceRecord = {
      actorId: user.actorId,
      userId: user.userId,
      deviceId: user.deviceId,
      tenantId: user.tenantId,
      organizationId: user.organizationId,
      clinicId: user.clinicId,
      role: user.role,
      name,
      status: 'ONLINE',
      lastHeartbeat: new Date(),
      connectedAt: new Date(),
      socketId,
    };

    const key = this.buildUserKey(user.tenantId, user.actorId);
    await this.redisService.set(key, JSON.stringify(presence), this.PRESENCE_TTL);
  }

  async setUserOffline(tenantId: string, actorId: string): Promise<void> {
    const key = this.buildUserKey(tenantId, actorId);
    await this.redisService.del(key);
  }

  async updatePresence(
    tenantId: string,
    actorId: string,
    updates: Partial<PresenceRecord>,
  ): Promise<void> {
    const key = this.buildUserKey(tenantId, actorId);
    const existing = await this.redisService.get(key);

    if (!existing) {
      return;
    }

    const presence: PresenceRecord = JSON.parse(existing);
    const updated: PresenceRecord = {
      ...presence,
      ...updates,
      lastHeartbeat: new Date(),
    };

    await this.redisService.set(key, JSON.stringify(updated), this.PRESENCE_TTL);

    if (updated.activeResource) {
      const resourceKey = this.buildResourceKey(
        tenantId,
        updated.activeResource.type,
        updated.activeResource.id,
      );
      await this.redisService.sadd(resourceKey, actorId);
      await this.redisService.expire(resourceKey, this.PRESENCE_TTL);
    }
  }

  async getUsersOnline(tenantId: string): Promise<PresenceRecord[]> {
    const pattern = this.buildUserKey(tenantId, '*');
    const client = this.redisService.getClient();
    const keys = await client.keys(pattern);

    const users: PresenceRecord[] = [];
    for (const key of keys) {
      const data = await this.redisService.get(key);
      if (data) {
        users.push(JSON.parse(data));
      }
    }

    return users;
  }

  async getUsersViewingResource(
    tenantId: string,
    resourceType: string,
    resourceId: string,
  ): Promise<PresenceRecord[]> {
    const resourceKey = this.buildResourceKey(tenantId, resourceType, resourceId);
    const actorIds = await this.redisService.smembers(resourceKey);

    const users: PresenceRecord[] = [];
    for (const actorId of actorIds) {
      const userKey = this.buildUserKey(tenantId, actorId);
      const data = await this.redisService.get(userKey);
      if (data) {
        const presence: PresenceRecord = JSON.parse(data);
        if (
          presence.activeResource?.type === resourceType &&
          presence.activeResource?.id === resourceId
        ) {
          users.push(presence);
        }
      }
    }

    return users;
  }

  async heartbeat(tenantId: string, actorId: string): Promise<void> {
    const key = this.buildUserKey(tenantId, actorId);
    const existing = await this.redisService.get(key);

    if (existing) {
      const presence: PresenceRecord = JSON.parse(existing);
      presence.lastHeartbeat = new Date();
      await this.redisService.set(key, JSON.stringify(presence), this.PRESENCE_TTL);
    }
  }

  private buildUserKey(tenantId: string, actorId: string): string {
    return `${this.PRESENCE_KEY_PREFIX}${tenantId}:${actorId}`;
  }

  private buildResourceKey(tenantId: string, resourceType: string, resourceId: string): string {
    return `${this.RESOURCE_PRESENCE_KEY_PREFIX}${tenantId}:${resourceType}:${resourceId}`;
  }
}
