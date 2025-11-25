import { AppointmentStatus, BookingMetadata } from '../entities/appointment.schema';

/**
 * Appointment response DTO
 * Used for API responses to clients
 */
export interface AppointmentResponseDto {
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
  bookingMetadata?: BookingMetadata;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Paginated appointment list response
 */
export interface AppointmentListResponseDto {
  data: AppointmentResponseDto[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
