/**
 * Provider Schedule Types
 *
 * Aligned with backend-provider-schedule DTOs
 */

export interface TimeSlotDto {
  dayOfWeek: number; // 0=Sunday, 1=Monday, etc.
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
}

export interface UpdateScheduleDto {
  workingHours: TimeSlotDto[];
}

export interface ScheduleDto {
  id: string;
  providerId: string;
  workingHours: TimeSlotDto[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAbsenceDto {
  startDate: Date;
  endDate: Date;
  reason: string;
  isAllDay: boolean;
}

export interface AbsenceDto {
  id: string;
  providerId: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  isAllDay: boolean;
  createdAt: Date;
  createdBy: string;
}

export interface ProviderScheduleResponse {
  schedule: ScheduleDto;
  absences: AbsenceDto[];
}

export interface AvailabilityDto {
  date: Date;
  availableSlots: Array<{
    start: string;
    end: string;
    isAvailable: boolean;
  }>;
}
