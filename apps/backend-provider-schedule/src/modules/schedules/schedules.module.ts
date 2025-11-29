import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SchedulesController, AbsencesController } from './schedules.controller';
import { InternalController } from './internal.controller';
import { SchedulesService } from './schedules.service';
import { ProviderSchedule, ProviderScheduleSchema } from './entities/provider-schedule.schema';
import { ProviderAbsence, ProviderAbsenceSchema } from './entities/provider-absence.schema';
import { ScheduleException, ScheduleExceptionSchema } from './entities/schedule-exception.schema';
import { CacheModule } from '../../common/cache/cache.module';

/**
 * Schedules Module
 *
 * Encapsulates provider schedule, absence, and exception management functionality.
 *
 * FEATURES:
 * - Provider schedule CRUD (weekly hours, breaks, effective dates)
 * - Schedule exceptions (holidays, vacation, sick, custom hours)
 * - Absence workflow (request, approve, reject, cancel)
 * - Availability calculation with caching
 *
 * CONTROLLERS:
 * - SchedulesController: Provider schedule management (/providers/:id/...)
 * - AbsencesController: Absence approval workflow (/absences/...)
 * - InternalController: Service-to-service APIs (/internal/...)
 *
 * DEPENDENCIES:
 * - CacheModule: Redis caching for availability queries
 * - EventEmitter: Domain events for schedule changes
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProviderSchedule.name, schema: ProviderScheduleSchema },
      { name: ProviderAbsence.name, schema: ProviderAbsenceSchema },
      { name: ScheduleException.name, schema: ScheduleExceptionSchema },
    ]),
    CacheModule,
  ],
  controllers: [SchedulesController, AbsencesController, InternalController],
  providers: [SchedulesService],
  exports: [SchedulesService],
})
export class SchedulesModule {}
