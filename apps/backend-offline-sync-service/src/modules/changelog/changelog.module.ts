import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ChangeLogController } from './changelog.controller';
import { ChangeLogService } from './changelog.service';
import { ChangeLogDoc, ChangeLogSchema } from './schemas/changelog.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ChangeLogDoc.name, schema: ChangeLogSchema }]),
    EventEmitterModule.forRoot(),
  ],
  controllers: [ChangeLogController],
  providers: [ChangeLogService],
  exports: [ChangeLogService],
})
export class ChangeLogModule {}
