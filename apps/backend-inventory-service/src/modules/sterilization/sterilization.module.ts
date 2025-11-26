import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  SterilizationCycle,
  SterilizationCycleSchema,
  Instrument,
  InstrumentSchema,
} from './schemas';
import { SterilizationService } from './services';
import { SterilizationController } from './controllers';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SterilizationCycle.name, schema: SterilizationCycleSchema },
      { name: Instrument.name, schema: InstrumentSchema },
    ]),
  ],
  controllers: [SterilizationController],
  providers: [SterilizationService],
  exports: [SterilizationService],
})
export class SterilizationModule {}
