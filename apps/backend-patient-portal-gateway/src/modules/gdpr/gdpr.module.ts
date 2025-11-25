import { Module } from '@nestjs/common';
import { GdprController } from './controllers/gdpr.controller';
import { GdprService } from './services/gdpr.service';

@Module({
  controllers: [GdprController],
  providers: [GdprService],
})
export class GdprModule {}
