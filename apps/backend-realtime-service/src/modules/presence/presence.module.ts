import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { PresenceGateway } from './presence.gateway';
import { PresenceService } from './presence.service';
import { PresenceController } from './presence.controller';

@Module({
  imports: [ConfigModule, JwtModule],
  providers: [PresenceGateway, PresenceService],
  controllers: [PresenceController],
  exports: [PresenceService],
})
export class PresenceModule {}
