import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChangeLogController } from './changelog.controller';
import { ChangeLogService } from './changelog.service';
import { ChangeLogDoc, ChangeLogSchema } from './schemas/changelog.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: ChangeLogDoc.name, schema: ChangeLogSchema }])],
  controllers: [ChangeLogController],
  providers: [ChangeLogService],
  exports: [ChangeLogService],
})
export class ChangeLogModule {}
