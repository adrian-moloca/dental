import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

/**
 * Day of week enumeration
 */
export enum DayOfWeek {
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
  SUNDAY = 'sunday',
}

/**
 * Time slot interface representing working hours for a day
 */
export interface TimeSlot {
  /** Start time in HH:mm format (24-hour) */
  start: string;
  /** End time in HH:mm format (24-hour) */
  end: string;
}

/**
 * Break period interface
 */
export interface BreakPeriod {
  /** Break name (e.g., "Lunch", "Break") */
  name: string;
  /** Start time in HH:mm format (24-hour) */
  start: string;
  /** End time in HH:mm format (24-hour) */
  end: string;
  /** Days when this break applies */
  days: DayOfWeek[];
}

/**
 * Weekly working hours configuration
 */
export interface WeeklyHours {
  monday?: TimeSlot[];
  tuesday?: TimeSlot[];
  wednesday?: TimeSlot[];
  thursday?: TimeSlot[];
  friday?: TimeSlot[];
  saturday?: TimeSlot[];
  sunday?: TimeSlot[];
}

export type ProviderScheduleDocument = HydratedDocument<ProviderSchedule>;

/**
 * Provider Schedule MongoDB Schema
 *
 * Represents a provider's weekly working schedule including
 * working hours, breaks, and assigned locations.
 *
 * MULTI-CLINIC SUPPORT:
 * - Each schedule is scoped to a specific clinic via clinicId
 * - A provider can have different schedules at different clinics
 * - effectiveFrom/effectiveTo define the validity period of this schedule
 *
 * TIMEZONE CONSIDERATIONS:
 * - Weekly hours are stored as time strings (HH:mm) in the clinic's local timezone
 * - Effective dates are stored as UTC timestamps
 * - All time comparisons should account for the clinic's timezone
 */
@Schema({
  collection: 'provider_schedules',
  timestamps: true,
  autoIndex: true,
})
export class ProviderSchedule extends Document {
  /**
   * Unique schedule identifier (UUID)
   */
  @Prop({ type: String, required: true, unique: true, index: true })
  id!: string;

  /**
   * Tenant identifier for multi-tenant isolation
   */
  @Prop({ type: String, required: true, index: true })
  tenantId!: string;

  /**
   * Organization identifier
   */
  @Prop({ type: String, required: true, index: true })
  organizationId!: string;

  /**
   * Provider identifier this schedule belongs to
   */
  @Prop({ type: String, required: true, index: true })
  providerId!: string;

  /**
   * Clinic identifier this schedule belongs to
   * Required for multi-clinic support
   */
  @Prop({ type: String, required: true, index: true })
  clinicId!: string;

  /**
   * Timezone for this schedule (IANA timezone identifier)
   * E.g., 'Europe/Bucharest', 'America/New_York'
   * Used to interpret weekly hours and calculate availability
   */
  @Prop({ type: String, required: false, default: 'Europe/Bucharest' })
  timezone!: string;

  /**
   * Weekly working hours configuration
   * Contains time slots for each day of the week
   */
  @Prop({ type: Object, required: true })
  weeklyHours!: WeeklyHours;

  /**
   * Break periods (lunch, coffee breaks, etc.)
   */
  @Prop({ type: Array, required: false, default: [] })
  breaks!: BreakPeriod[];

  /**
   * Location IDs where this provider works
   */
  @Prop({ type: [String], required: true, index: true })
  locationIds!: string[];

  /**
   * Default appointment duration in minutes
   */
  @Prop({ type: Number, required: false, default: 30 })
  defaultAppointmentDuration?: number;

  /**
   * Buffer time between appointments in minutes
   */
  @Prop({ type: Number, required: false, default: 0 })
  bufferTime?: number;

  /**
   * Maximum number of patients per day (0 = unlimited)
   */
  @Prop({ type: Number, required: false, default: 0 })
  maxPatientsPerDay?: number;

  /**
   * Whether this schedule is currently active
   */
  @Prop({ type: Boolean, required: true, default: true })
  isActive!: boolean;

  /**
   * Effective date range for this schedule
   */
  @Prop({ type: Date, required: false })
  effectiveFrom?: Date;

  @Prop({ type: Date, required: false })
  effectiveTo?: Date;

  /**
   * Notes about this schedule
   */
  @Prop({ type: String, required: false })
  notes?: string;

  /**
   * MongoDB timestamps
   */
  createdAt?: Date;
  updatedAt?: Date;
}

export const ProviderScheduleSchema = SchemaFactory.createForClass(ProviderSchedule);

/**
 * Compound indexes for performance optimization
 *
 * INDEX STRATEGY:
 * 1. Primary lookup: tenant + provider + clinic (unique schedule per provider/clinic)
 * 2. Clinic-based queries: find all providers at a clinic
 * 3. Provider-based queries: find all clinics for a provider
 * 4. Active schedule filtering
 * 5. Date range queries for effective schedules
 */
ProviderScheduleSchema.index({ tenantId: 1, providerId: 1, clinicId: 1 }, { unique: true });
ProviderScheduleSchema.index({ tenantId: 1, organizationId: 1 });
ProviderScheduleSchema.index({ tenantId: 1, clinicId: 1, isActive: 1 });
ProviderScheduleSchema.index({ tenantId: 1, providerId: 1, isActive: 1 });
ProviderScheduleSchema.index({ tenantId: 1, locationIds: 1 });
ProviderScheduleSchema.index({ tenantId: 1, isActive: 1 });
ProviderScheduleSchema.index({ tenantId: 1, effectiveFrom: 1, effectiveTo: 1 });
