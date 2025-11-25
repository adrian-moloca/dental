/**
 * Appointment Types
 *
 * Aligned with backend-scheduling DTOs
 */

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
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

export interface QueryAppointmentsDto {
  patientId?: string;
  providerId?: string;
  locationId?: string;
  status?: AppointmentStatus;
  startDate?: Date;
  endDate?: Date;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface AppointmentListResponse {
  data: AppointmentDto[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
