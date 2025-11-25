import { Module } from '@nestjs/common';
import { EngagementController } from './controllers/engagement.controller';
import { EngagementService } from './services/engagement.service';

@Module({
  controllers: [EngagementController],
  providers: [EngagementService],
})
export class EngagementModule {}
