import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProviderClinicAssignmentDocument } from '../../schemas/provider-clinic-assignment.schema';
import type { AssignProviderDto } from '@dentalos/shared-validation';

@Injectable()
export class AssignmentsService {
  private readonly logger = new Logger(AssignmentsService.name);

  constructor(
    @InjectModel(ProviderClinicAssignmentDocument.name)
    private assignmentModel: Model<ProviderClinicAssignmentDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

  async assignProvider(
    providerId: string,
    dto: AssignProviderDto,
    context: { userId: string; organizationId: string },
  ) {
    const assignment = new this.assignmentModel({
      providerId,
      clinicId: dto.clinicId,
      organizationId: context.organizationId,
      roles: dto.roles,
      workingHoursOverride: dto.workingHoursOverride,
      isActive: true,
      isPrimaryClinic: dto.isPrimaryClinic || false,
      assignedAt: new Date(),
      assignedBy: context.userId,
    });

    await assignment.save();
    this.logger.log(`Assigned provider ${providerId} to clinic ${dto.clinicId}`);

    this.eventEmitter.emit('enterprise.staff.assigned', {
      assignmentId: assignment._id.toString(),
      providerId,
      clinicId: dto.clinicId,
      organizationId: context.organizationId,
      roles: dto.roles,
      isPrimaryClinic: assignment.isPrimaryClinic,
      assignedAt: assignment.assignedAt.toISOString(),
      assignedBy: context.userId,
    });

    return assignment;
  }

  async getProviderClinics(providerId: string, options?: { limit?: number; offset?: number }) {
    const limit = options?.limit || 20;
    const offset = options?.offset || 0;

    const query = { providerId, isActive: true };

    const [results, total] = await Promise.all([
      this.assignmentModel.find(query).limit(limit).skip(offset).sort({ assignedAt: -1 }).exec(),
      this.assignmentModel.countDocuments(query).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);
    const page = Math.floor(offset / limit) + 1;
    const hasNextPage = offset + limit < total;
    const hasPreviousPage = offset > 0;

    return {
      data: results,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    };
  }

  async getClinicStaff(clinicId: string, options?: { limit?: number; offset?: number }) {
    const limit = options?.limit || 20;
    const offset = options?.offset || 0;

    const query = { clinicId, isActive: true };

    const [results, total] = await Promise.all([
      this.assignmentModel.find(query).limit(limit).skip(offset).sort({ assignedAt: -1 }).exec(),
      this.assignmentModel.countDocuments(query).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);
    const page = Math.floor(offset / limit) + 1;
    const hasNextPage = offset + limit < total;
    const hasPreviousPage = offset > 0;

    return {
      data: results,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    };
  }
}
