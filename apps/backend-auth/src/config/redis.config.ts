import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { AppConfig } from '../configuration';

@Injectable()
export class RedisService {
  private readonly client: Redis;

  constructor(private readonly configService: ConfigService<AppConfig, true>) {
    const redisConfig = this.configService.get('redis', { infer: true });

    this.client = new Redis({
      host: redisConfig.host,
      port: redisConfig.port,
      password: redisConfig.password,
      db: redisConfig.db || 0,
      keyPrefix: redisConfig.keyPrefix || 'dentalos:',
    });
  }

  getClient(): Redis {
    return this.client;
  }

  async setMfaChallenge(
    organizationId: string,
    challengeId: string,
    data: Record<string, any>,
    ttlSeconds: number
  ): Promise<void> {
    const key = `mfa:challenge:${organizationId}:${challengeId}`;
    await this.client.setex(key, ttlSeconds, JSON.stringify(data));
  }

  async getMfaChallenge(
    organizationId: string,
    challengeId: string
  ): Promise<Record<string, any> | null> {
    const key = `mfa:challenge:${organizationId}:${challengeId}`;
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async deleteMfaChallenge(organizationId: string, challengeId: string): Promise<void> {
    const key = `mfa:challenge:${organizationId}:${challengeId}`;
    await this.client.del(key);
  }

  async incrementAttempts(organizationId: string, challengeId: string): Promise<number> {
    const key = `mfa:attempts:${organizationId}:${challengeId}`;
    const attempts = await this.client.incr(key);

    if (attempts === 1) {
      await this.client.expire(key, 600);
    }

    return attempts;
  }

  async getAttempts(organizationId: string, challengeId: string): Promise<number> {
    const key = `mfa:attempts:${organizationId}:${challengeId}`;
    const attempts = await this.client.get(key);
    return attempts ? parseInt(attempts, 10) : 0;
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
  }
}
