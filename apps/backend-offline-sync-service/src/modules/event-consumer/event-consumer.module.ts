import { Module } from '@nestjs/common';
import { EventConsumerService } from './event-consumer.service';
import { ChangeLogModule } from '../changelog/changelog.module';

@Module({
  imports: [ChangeLogModule],
  providers: [EventConsumerService],
  exports: [EventConsumerService],
})
export class EventConsumerModule {}
