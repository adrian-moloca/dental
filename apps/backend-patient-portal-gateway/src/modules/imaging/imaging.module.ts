import { Module } from '@nestjs/common';
import { ImagingController } from './controllers/imaging.controller';
import { ImagingService } from './services/imaging.service';

@Module({
  controllers: [ImagingController],
  providers: [ImagingService],
})
export class ImagingModule {}
