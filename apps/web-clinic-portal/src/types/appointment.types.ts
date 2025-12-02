/**
 * Appointment Types
 *
 * Aligned with backend-scheduling DTOs
 */

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type BookingSource = 'online' | 'phone' | 'walk_in' | 'referral';

export interface CreateAppointmentDto {
  patientId: string;
  providerId: string;
  locationId: string;
  chairId?: string;
  serviceCode: string;
  start: Date;
  end: Date;
  notes?: string;
  bookingSource?: BookingSource;
  emergencyVisit?: boolean;
}

export interface UpdateAppointmentDto {
  start?: Date;
  end?: Date;
  providerId?: string;
  chairId?: string;
  notes?: string;
}

export interface CancelAppointmentDto {
  reason: string;
  cancelledBy: string;
}

export type ConfirmationMethod = 'phone' | 'sms' | 'email' | 'patient_portal';

export interface QueryAppointmentsDto {
  patientId?: string;
  providerId?: string;
  locationId?: string;
  status?: AppointmentStatus;
  startDate?: Date;
  endDate?: Date;
  confirmed?: boolean;
  page?: number;
  limit?: number;
}

export interface AppointmentDto {
  id: string;
  tenantId: string;
  organizationId: string;
  locationId: string;
  patientId: string;
  providerId: string;
  chairId?: string;
  serviceCode: string;
  start: Date;
  end: Date;
  status: AppointmentStatus;
  riskScore?: number;
  bookingMetadata?: any;
  confirmed?: boolean;
  confirmedAt?: Date;
  confirmationMethod?: ConfirmationMethod;
  confirmedBy?: string;
  createdAt: Date;
  updatedAt: Date;

  // Additional fields for UI/pages
  startTime: string; // ISO date string
  endTime: string; // ISO date string
  notes?: string;
  reasonForVisit?: string;
  providerName?: string;
  appointmentType?: {
    name: string;
  };
  provider?: {
    firstName?: string;
    lastName?: string;
  };
}

export interface AppointmentListResponse {
  data: AppointmentDto[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
