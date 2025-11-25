import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { ChangeLogDoc, ChangeLogDocument } from './schemas/changelog.schema';
import { OfflineChange } from '@dentalos/shared-domain';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ChangeLogCreatedEvent } from '@dentalos/shared-events';

@Injectable()
export class ChangeLogService {
  private readonly logger = new Logger(ChangeLogService.name);
  private sequenceCounter = 0;

  constructor(
    @InjectModel(ChangeLogDoc.name)
    private readonly changeLogModel: Model<ChangeLogDocument>,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.initializeSequenceCounter();
  }

  private async initializeSequenceCounter(): Promise<void> {
    const lastChange = await this.changeLogModel
      .findOne()
      .sort({ sequenceNumber: -1 })
      .select('sequenceNumber')
      .exec();

    this.sequenceCounter = lastChange ? lastChange.sequenceNumber : 0;
    this.logger.log(`Initialized sequence counter at ${this.sequenceCounter}`);
  }

  private getNextSequence(): number {
    return ++this.sequenceCounter;
  }

  async createChangeLog(change: Omit<OfflineChange, 'changeId' | 'sequenceNumber'>): Promise<OfflineChange> {
    const changeId = uuidv4();
    const sequenceNumber = this.getNextSequence();

    const changeLog = new this.changeLogModel({
      changeId,
      sequenceNumber,
      tenantId: change.tenantId,
      organizationId: change.organizationId,
      clinicId: change.clinicId,
      entityType: change.entityType,
      entityId: change.entityId,
      operation: change.operation,
      data: change.data,
      previousData: change.previousData,
      timestamp: change.timestamp || new Date(),
      sourceDeviceId: change.sourceDeviceId,
      eventId: change.eventId,
      eventType: change.eventType,
    });

    await changeLog.save();

    // Emit changelog created event
    const event: ChangeLogCreatedEvent = {
      eventType: 'offline-sync.changelog.created',
      changeId,
      sequenceNumber,
      tenantId: change.tenantId,
      organizationId: change.organizationId,
      clinicId: change.clinicId,
      entityType: change.entityType,
      entityId: change.entityId,
      operation: change.operation,
      sourceDeviceId: change.sourceDeviceId,
      eventId: change.eventId,
      createdAt: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      correlationId: uuidv4(),
    };

    this.eventEmitter.emit('offline-sync.changelog.created', event);

    this.logger.debug(
      `Created changelog ${changeId} with sequence ${sequenceNumber} for ${change.entityType}:${change.entityId}`,
    );

    return {
      changeId,
      sequenceNumber,
      tenantId: change.tenantId,
      organizationId: change.organizationId,
      clinicId: change.clinicId,
      entityType: change.entityType,
      entityId: change.entityId,
      operation: change.operation,
      data: change.data,
      previousData: change.previousData,
      timestamp: changeLog.timestamp,
      sourceDeviceId: change.sourceDeviceId,
      eventId: change.eventId,
      eventType: change.eventType,
    };
  }

  async getChangesSince(
    tenantId: string,
    organizationId: string,
    clinicId: string | undefined,
    sinceSequence: number,
    limit: number = 100,
    entityType?: string,
  ): Promise<OfflineChange[]> {
    const query: any = {
      tenantId,
      organizationId,
      sequenceNumber: { $gt: sinceSequence },
    };

    if (clinicId) {
      query.$or = [{ clinicId }, { clinicId: { $exists: false } }];
    }

    if (entityType) {
      query.entityType = entityType;
    }

    const changes = await this.changeLogModel
      .find(query)
      .sort({ sequenceNumber: 1 })
      .limit(limit)
      .select('-_id -__v -createdAt -updatedAt')
      .lean()
      .exec();

    return changes.map((change) => ({
      changeId: change.changeId,
      sequenceNumber: change.sequenceNumber,
      tenantId: change.tenantId,
      organizationId: change.organizationId,
      clinicId: change.clinicId,
      entityType: change.entityType,
      entityId: change.entityId,
      operation: change.operation,
      data: change.data,
      previousData: change.previousData,
      timestamp: change.timestamp,
      sourceDeviceId: change.sourceDeviceId,
      eventId: change.eventId,
      eventType: change.eventType,
    }));
  }

  async getCurrentSequence(tenantId: string): Promise<number> {
    const lastChange = await this.changeLogModel
      .findOne({ tenantId })
      .sort({ sequenceNumber: -1 })
      .select('sequenceNumber')
      .exec();

    return lastChange ? lastChange.sequenceNumber : 0;
  }

  async getChangesByEntity(
    tenantId: string,
    entityType: string,
    entityId: string,
    limit: number = 10,
  ): Promise<OfflineChange[]> {
    const changes = await this.changeLogModel
      .find({
        tenantId,
        entityType,
        entityId,
      })
      .sort({ sequenceNumber: -1 })
      .limit(limit)
      .select('-_id -__v -createdAt -updatedAt')
      .lean()
      .exec();

    return changes.map((change) => ({
      changeId: change.changeId,
      sequenceNumber: change.sequenceNumber,
      tenantId: change.tenantId,
      organizationId: change.organizationId,
      clinicId: change.clinicId,
      entityType: change.entityType,
      entityId: change.entityId,
      operation: change.operation,
      data: change.data,
      previousData: change.previousData,
      timestamp: change.timestamp,
      sourceDeviceId: change.sourceDeviceId,
      eventId: change.eventId,
      eventType: change.eventType,
    }));
  }
}
