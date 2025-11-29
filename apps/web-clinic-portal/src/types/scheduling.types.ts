/**
 * Scheduling UI Types
 */

export interface TimeSlot {
  start: Date;
  end: Date;
  isAvailable: boolean;
  reason?: string; // Reason if not available
}

export interface AppointmentType {
  id: string;
  name: string;
  duration: number; // minutes
  color?: string;
  description?: string;
  bufferBefore?: number;
  bufferAfter?: number;
}

export interface ProviderInfo {
  id: string;
  firstName: string;
  lastName: string;
  specialty?: string;
  photo?: string;
  isAvailable?: boolean;
}

export interface AvailabilityCalendarProps {
  providerId?: string;
  appointmentTypeId?: string;
  duration?: number;
  onSlotSelect: (slot: TimeSlot) => void;
  selectedSlot?: TimeSlot;
  minDate?: Date;
  maxDate?: Date;
}

export interface TimeSlotsGridProps {
  date: Date;
  providerId: string;
  duration: number;
  onSelect: (slot: TimeSlot) => void;
  selected?: TimeSlot;
}

export type CancellationReason =
  | 'patient_request'
  | 'patient_illness'
  | 'patient_no_show'
  | 'clinic_provider_unavailable'
  | 'clinic_emergency'
  | 'other';

export interface CancellationReasonOption {
  value: CancellationReason;
  label: string;
  requiresNotes: boolean;
}
