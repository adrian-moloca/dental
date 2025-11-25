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
  @Prop({ required: true, unique: true, index: true })
  id!: string;

  /**
   * Tenant identifier for multi-tenant isolation
   */
  @Prop({ required: true, index: true })
  tenantId!: string;

  /**
   * Organization identifier
   */
  @Prop({ required: true, index: true })
  organizationId!: string;

  /**
   * Provider identifier this schedule belongs to
   */
  @Prop({ required: true, index: true })
  providerId!: string;

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
  @Prop({ required: false, default: 30 })
  defaultAppointmentDuration?: number;

  /**
   * Buffer time between appointments in minutes
   */
  @Prop({ required: false, default: 0 })
  bufferTime?: number;

  /**
   * Maximum number of patients per day (0 = unlimited)
   */
  @Prop({ required: false, default: 0 })
  maxPatientsPerDay?: number;

  /**
   * Whether this schedule is currently active
   */
  @Prop({ required: true, default: true })
  isActive!: boolean;

  /**
   * Effective date range for this schedule
   */
  @Prop({ required: false })
  effectiveFrom?: Date;

  @Prop({ required: false })
  effectiveTo?: Date;

  /**
   * Notes about this schedule
   */
  @Prop({ required: false })
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
 */
ProviderScheduleSchema.index({ tenantId: 1, providerId: 1 }, { unique: true });
ProviderScheduleSchema.index({ tenantId: 1, organizationId: 1 });
ProviderScheduleSchema.index({ tenantId: 1, locationIds: 1 });
ProviderScheduleSchema.index({ tenantId: 1, isActive: 1 });
