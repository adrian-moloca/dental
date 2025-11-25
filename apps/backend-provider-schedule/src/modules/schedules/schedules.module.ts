import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SchedulesController } from './schedules.controller';
import { InternalController } from './internal.controller';
import { SchedulesService } from './schedules.service';
import { ProviderSchedule, ProviderScheduleSchema } from './entities/provider-schedule.schema';
import { ProviderAbsence, ProviderAbsenceSchema } from './entities/provider-absence.schema';

/**
 * Schedules Module
 *
 * Encapsulates provider schedule and absence management functionality.
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProviderSchedule.name, schema: ProviderScheduleSchema },
      { name: ProviderAbsence.name, schema: ProviderAbsenceSchema },
    ]),
  ],
  controllers: [SchedulesController, InternalController],
  providers: [SchedulesService],
  exports: [SchedulesService],
})
export class SchedulesModule {}
