import { Injectable } from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class LamportClockService {
  private readonly CLOCK_KEY_PREFIX = 'lamport:clock:';

  constructor(private redisService: RedisService) {}

  async getTime(tenantId: string, resourceType: string, resourceId: string): Promise<number> {
    const key = this.buildKey(tenantId, resourceType, resourceId);
    const value = await this.redisService.get(key);
    return value ? parseInt(value, 10) : 0;
  }

  async incrementAndGet(
    tenantId: string,
    resourceType: string,
    resourceId: string,
  ): Promise<number> {
    const key = this.buildKey(tenantId, resourceType, resourceId);
    const client = this.redisService.getClient();
    const newValue = await client.incr(key);
    await this.redisService.expire(key, 3600 * 24);
    return newValue;
  }

  async updateIfGreater(
    tenantId: string,
    resourceType: string,
    resourceId: string,
    incomingTime: number,
  ): Promise<number> {
    const currentTime = await this.getTime(tenantId, resourceType, resourceId);

    if (incomingTime > currentTime) {
      const key = this.buildKey(tenantId, resourceType, resourceId);
      await this.redisService.set(key, incomingTime.toString());
      await this.redisService.expire(key, 3600 * 24);
      return incomingTime;
    }

    return currentTime;
  }

  private buildKey(tenantId: string, resourceType: string, resourceId: string): string {
    return `${this.CLOCK_KEY_PREFIX}${tenantId}:${resourceType}:${resourceId}`;
  }
}
