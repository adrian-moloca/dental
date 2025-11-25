import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import {
  Appointment,
  AppointmentDocument,
  AppointmentStatus,
} from '../entities/appointment.schema';
import { QueryAppointmentsDto } from '../dto';
import { NotFoundError } from '@dentalos/shared-errors';

/**
 * Repository for appointment data access
 *
 * Implements the repository pattern to abstract MongoDB operations
 * and enforce multi-tenant isolation at the data access layer.
 */
@Injectable()
export class AppointmentsRepository {
  private readonly logger = new Logger(AppointmentsRepository.name);

  constructor(
    @InjectModel(Appointment.name)
    private readonly appointmentModel: Model<AppointmentDocument>,
  ) {}

  /**
   * Create a new appointment
   */
  async create(appointment: Partial<Appointment>): Promise<AppointmentDocument> {
    try {
      const created = new this.appointmentModel(appointment);
      return await created.save();
    } catch (error) {
      this.logger.error('Failed to create appointment', {
        error,
        tenantId: appointment.tenantId,
      });
      throw error;
    }
  }

  /**
   * Find appointment by ID with tenant isolation
   */
  async findById(id: string, tenantId: string): Promise<AppointmentDocument | null> {
    return this.appointmentModel.findOne({ id, tenantId }).exec();
  }

  /**
   * Find appointment by ID or throw error
   */
  async findByIdOrFail(id: string, tenantId: string): Promise<AppointmentDocument> {
    const appointment = await this.findById(id, tenantId);

    if (!appointment) {
      throw new NotFoundError(`Appointment with ID ${id} not found`, {
        resourceType: 'appointment',
        resourceId: id,
      });
    }

    return appointment;
  }

  /**
   * Find appointments with filters and pagination
   */
  async findMany(
    tenantId: string,
    query: QueryAppointmentsDto,
  ): Promise<{ data: AppointmentDocument[]; total: number }> {
    const filter: FilterQuery<Appointment> = { tenantId };

    // Apply filters
    if (query.patientId) {
      filter.patientId = query.patientId;
    }
    if (query.providerId) {
      filter.providerId = query.providerId;
    }
    if (query.locationId) {
      filter.locationId = query.locationId;
    }
    if (query.status) {
      filter.status = query.status;
    }
    if (query.startDate || query.endDate) {
      filter.start = {};
      if (query.startDate) {
        filter.start.$gte = query.startDate;
      }
      if (query.endDate) {
        filter.start.$lte = query.endDate;
      }
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.appointmentModel.find(filter).sort({ start: -1 }).skip(skip).limit(limit).exec(),
      this.appointmentModel.countDocuments(filter).exec(),
    ]);

    return { data, total };
  }

  /**
   * Find appointments for a provider within a date range
   * Used for conflict detection and availability calculation
   */
  async findByProviderAndDateRange(
    tenantId: string,
    providerId: string,
    startDate: Date,
    endDate: Date,
    excludeStatuses: AppointmentStatus[] = [AppointmentStatus.CANCELLED],
  ): Promise<AppointmentDocument[]> {
    const filter: FilterQuery<Appointment> = {
      tenantId,
      providerId,
      start: { $gte: startDate, $lt: endDate },
      status: { $nin: excludeStatuses },
    };

    return this.appointmentModel.find(filter).sort({ start: 1 }).exec();
  }

  /**
   * Find appointments for a patient within a date range
   */
  async findByPatientAndDateRange(
    tenantId: string,
    patientId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<AppointmentDocument[]> {
    const filter: FilterQuery<Appointment> = {
      tenantId,
      patientId,
      start: { $gte: startDate, $lt: endDate },
      status: { $ne: AppointmentStatus.CANCELLED },
    };

    return this.appointmentModel.find(filter).sort({ start: 1 }).exec();
  }

  /**
   * Check for appointment conflicts
   * Returns appointments that overlap with the given time range
   */
  async findConflicts(
    tenantId: string,
    providerId: string,
    start: Date,
    end: Date,
    excludeId?: string,
  ): Promise<AppointmentDocument[]> {
    const filter: FilterQuery<Appointment> = {
      tenantId,
      providerId,
      status: { $nin: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW] },
      $or: [
        // New appointment starts during existing appointment
        { start: { $lte: start }, end: { $gt: start } },
        // New appointment ends during existing appointment
        { start: { $lt: end }, end: { $gte: end } },
        // New appointment completely contains existing appointment
        { start: { $gte: start }, end: { $lte: end } },
      ],
    };

    if (excludeId) {
      filter.id = { $ne: excludeId };
    }

    return this.appointmentModel.find(filter).exec();
  }

  /**
   * Update appointment
   */
  async update(
    id: string,
    tenantId: string,
    update: Partial<Appointment>,
  ): Promise<AppointmentDocument> {
    const appointment = await this.appointmentModel
      .findOneAndUpdate({ id, tenantId }, { $set: update }, { new: true, runValidators: true })
      .exec();

    if (!appointment) {
      throw new NotFoundError(`Appointment with ID ${id} not found`, {
        resourceType: 'appointment',
        resourceId: id,
      });
    }

    return appointment;
  }

  /**
   * Update appointment status
   */
  async updateStatus(
    id: string,
    tenantId: string,
    status: AppointmentStatus,
    metadata?: Record<string, unknown>,
  ): Promise<AppointmentDocument> {
    const update: Partial<Appointment> = { status };

    if (metadata) {
      update.bookingMetadata = {
        ...(await this.findByIdOrFail(id, tenantId)).bookingMetadata,
        ...metadata,
      };
    }

    return this.update(id, tenantId, update);
  }

  /**
   * Delete appointment (soft delete by setting status to cancelled)
   */
  async delete(id: string, tenantId: string): Promise<void> {
    await this.updateStatus(id, tenantId, AppointmentStatus.CANCELLED);
  }

  /**
   * Count appointments by status
   */
  async countByStatus(
    tenantId: string,
    status: AppointmentStatus,
    startDate?: Date,
    endDate?: Date,
  ): Promise<number> {
    const filter: FilterQuery<Appointment> = { tenantId, status };

    if (startDate || endDate) {
      filter.start = {};
      if (startDate) {
        filter.start.$gte = startDate;
      }
      if (endDate) {
        filter.start.$lte = endDate;
      }
    }

    return this.appointmentModel.countDocuments(filter).exec();
  }

  /**
   * Get patient no-show count
   * Used for risk scoring
   */
  async getPatientNoShowCount(
    tenantId: string,
    patientId: string,
    sinceDate?: Date,
  ): Promise<number> {
    const filter: FilterQuery<Appointment> = {
      tenantId,
      patientId,
      status: AppointmentStatus.NO_SHOW,
    };

    if (sinceDate) {
      filter.start = { $gte: sinceDate };
    }

    return this.appointmentModel.countDocuments(filter).exec();
  }
}
