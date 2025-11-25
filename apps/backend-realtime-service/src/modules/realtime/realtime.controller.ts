import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { RealtimeService } from './realtime.service';
import { PublishEventDto, PublishEventDtoSchema } from './dto/publish-event.dto';

@Controller('realtime')
export class RealtimeController {
  constructor(private realtimeService: RealtimeService) {}

  @Post('publish')
  @HttpCode(HttpStatus.OK)
  async publishEvent(@Body() body: unknown) {
    const dto = PublishEventDtoSchema.parse(body) as PublishEventDto;
    const result = await this.realtimeService.publishEvent(dto);
    return {
      success: true,
      eventId: result.eventId,
      delivered: result.delivered,
    };
  }
}
