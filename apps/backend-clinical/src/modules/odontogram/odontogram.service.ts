/**
 * Odontogram Service
 *
 * Business logic for odontogram (tooth charting) operations.
 * Implements FDI numbering system with comprehensive audit trail.
 *
 * CLINICAL SAFETY NOTES:
 * - All modifications are logged to the history collection
 * - Conditions are never hard-deleted, only soft-deleted
 * - Version checking prevents concurrent modification conflicts
 * - Domain events are emitted for downstream systems (billing, inventory)
 *
 * @module odontogram/service
 */

import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OdontogramRepository } from './odontogram.repository';
import {
  OdontogramDocument,
  ToothData,
  ToothConditionRecord,
  FDIToothNumber,
  ALL_TEETH,
  PERMANENT_TEETH,
  DECIDUOUS_TEETH,
  ToothCondition,
} from './entities/odontogram.schema';
import {
  AddConditionInput,
  UpdateToothInput,
  RemoveConditionInput,
  GetToothHistoryQuery,
  BulkUpdateTeethInput,
  AddConditionSchema,
  UpdateToothSchema,
  RemoveConditionSchema,
  BulkUpdateTeethSchema,
} from './dto';
import { TOOTH_STATUS_UPDATED_EVENT } from '@dentalos/shared-events';

/**
 * Tenant context for multi-tenant operations
 */
export interface TenantContext {
  tenantId: string;
  organizationId: string;
  clinicId: string;
}

/**
 * Request context for audit logging
 */
export interface RequestContext {
  userId: string;
  ipAddress?: string;
  userAgent?: string;
  appointmentId?: string;
}

/**
 * Event payload for tooth status updates
 */
interface ToothStatusUpdatedEventPayload {
  patientId: string;
  toothNumber: string;
  previousCondition: string | null;
  newCondition: string;
  surfaces: string[];
  providerId: string;
  tenantId: string;
  organizationId: string;
  clinicId: string;
  timestamp: Date;
  procedureId?: string;
  conditionId?: string;
}

@Injectable()
export class OdontogramService {
  private readonly logger = new Logger(OdontogramService.name);

  constructor(
    private readonly repository: OdontogramRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Gets the patient's odontogram, creating one if it doesn't exist.
   *
   * For new patients, initializes all permanent teeth (11-48) as healthy.
   * For pediatric patients, set isAdultDentition to false to include deciduous teeth.
   */
  async getPatientOdontogram(
    patientId: string,
    tenantContext: TenantContext,
    userId: string,
  ): Promise<OdontogramDocument> {
    const startTime = Date.now();

    let odontogram = await this.repository.findByPatientId(patientId, tenantContext);

    if (!odontogram) {
      this.logger.log(`Creating new odontogram for patient ${patientId}`);
      odontogram = await this.initializeOdontogram(patientId, tenantContext, userId);
    }

    const duration = Date.now() - startTime;
    this.logger.log(`Retrieved odontogram for patient ${patientId} in ${duration}ms`);

    // Performance budget check
    if (duration > 150) {
      this.logger.warn(`Odontogram retrieval exceeded performance budget: ${duration}ms > 150ms`);
    }

    return odontogram;
  }

  /**
   * Updates tooth properties (not conditions).
   *
   * Use this for updating mobility, furcation, notes, presence status.
   * To add/remove conditions, use addToothCondition/removeToothCondition.
   */
  async updateToothStatus(
    patientId: string,
    toothNumber: string,
    updateDto: UpdateToothInput,
    tenantContext: TenantContext,
    requestContext: RequestContext,
  ): Promise<OdontogramDocument> {
    // Validate input
    this.validateToothNumber(toothNumber);
    const validatedInput = UpdateToothSchema.parse(updateDto);

    const odontogram = await this.getPatientOdontogram(
      patientId,
      tenantContext,
      requestContext.userId,
    );

    const tooth = odontogram.teeth.get(toothNumber);
    if (!tooth) {
      throw new NotFoundException(`Tooth ${toothNumber} not found in odontogram`);
    }

    // Capture previous state for audit
    const previousState = this.serializeToothForAudit(tooth);

    // Apply updates
    if (validatedInput.isPresent !== undefined) tooth.isPresent = validatedInput.isPresent;
    if (validatedInput.isPrimary !== undefined) tooth.isPrimary = validatedInput.isPrimary;
    if (validatedInput.isSupernumerary !== undefined) tooth.isSupernumerary = validatedInput.isSupernumerary;
    if (validatedInput.isImplant !== undefined) tooth.isImplant = validatedInput.isImplant;
    if (validatedInput.mobility !== undefined) tooth.mobility = validatedInput.mobility as 0 | 1 | 2 | 3;
    if (validatedInput.furcation !== undefined) tooth.furcation = validatedInput.furcation as any;
    if (validatedInput.notes !== undefined) tooth.notes = validatedInput.notes;

    tooth.updatedAt = new Date();
    tooth.updatedBy = requestContext.userId;

    // Save with optimistic locking
    const updatedOdontogram = await this.repository.updateTooth(
      patientId,
      toothNumber,
      tooth,
      tenantContext,
      requestContext.userId,
      odontogram.version,
    );

    // Record audit history
    await this.repository.recordHistory({
      patientId,
      tenantId: tenantContext.tenantId,
      organizationId: tenantContext.organizationId,
      clinicId: tenantContext.clinicId,
      toothNumber: toothNumber as FDIToothNumber,
      changeType: 'tooth_updated',
      previousState,
      newState: this.serializeToothForAudit(tooth),
      changedBy: requestContext.userId,
      appointmentId: requestContext.appointmentId,
      ipAddress: requestContext.ipAddress,
      userAgent: requestContext.userAgent,
    });

    this.logger.log(
      `Updated tooth ${toothNumber} for patient ${patientId} by user ${requestContext.userId}`,
    );

    return updatedOdontogram;
  }

  /**
   * Adds a new condition to a tooth.
   *
   * CLINICAL NOTE: A tooth can have multiple conditions (e.g., filling + caries on different surfaces).
   * The condition is added to the conditions array and a history record is created.
   */
  async addToothCondition(
    patientId: string,
    toothNumber: string,
    conditionDto: AddConditionInput,
    tenantContext: TenantContext,
    requestContext: RequestContext,
  ): Promise<{ odontogram: OdontogramDocument; conditionId: string }> {
    // Validate inputs
    this.validateToothNumber(toothNumber);
    const validatedInput = AddConditionSchema.parse(conditionDto);

    const odontogram = await this.getPatientOdontogram(
      patientId,
      tenantContext,
      requestContext.userId,
    );

    const tooth = odontogram.teeth.get(toothNumber);
    if (!tooth) {
      throw new NotFoundException(`Tooth ${toothNumber} not found in odontogram`);
    }

    // Validate surface compatibility with tooth type
    this.validateSurfacesForTooth(toothNumber, validatedInput.surfaces || []);

    // Capture previous condition state for event
    const previousPrimaryCondition = this.getPrimaryCondition(tooth);

    // Create the new condition record
    const newCondition: Partial<ToothConditionRecord> = {
      condition: validatedInput.condition as ToothCondition,
      surfaces: (validatedInput.surfaces || []) as any[],
      severity: validatedInput.severity as any,
      material: validatedInput.material as any,
      notes: validatedInput.notes,
      procedureId: validatedInput.procedureId,
      cdtCode: validatedInput.cdtCode,
      recordedAt: validatedInput.recordedAt ? new Date(validatedInput.recordedAt) : new Date(),
      recordedBy: requestContext.userId,
    };

    // Add condition and save
    const result = await this.repository.addConditionToTooth(
      patientId,
      toothNumber,
      newCondition,
      tenantContext,
      requestContext.userId,
      odontogram.version,
    );

    const conditionId = result.conditionId;

    // Record audit history
    await this.repository.recordHistory({
      patientId,
      tenantId: tenantContext.tenantId,
      organizationId: tenantContext.organizationId,
      clinicId: tenantContext.clinicId,
      toothNumber: toothNumber as FDIToothNumber,
      changeType: 'condition_added',
      conditionId,
      newState: { ...newCondition, _id: conditionId },
      changedBy: requestContext.userId,
      appointmentId: requestContext.appointmentId,
      procedureId: validatedInput.procedureId,
      ipAddress: requestContext.ipAddress,
      userAgent: requestContext.userAgent,
    });

    // Emit domain event for downstream systems
    await this.emitToothStatusUpdatedEvent({
      patientId,
      toothNumber,
      previousCondition: previousPrimaryCondition,
      newCondition: validatedInput.condition,
      surfaces: validatedInput.surfaces || [],
      providerId: requestContext.userId,
      tenantId: tenantContext.tenantId,
      organizationId: tenantContext.organizationId,
      clinicId: tenantContext.clinicId,
      timestamp: new Date(),
      procedureId: validatedInput.procedureId,
      conditionId,
    });

    this.logger.log(
      `Added condition ${validatedInput.condition} to tooth ${toothNumber} for patient ${patientId}`,
    );

    return { odontogram: result.odontogram, conditionId };
  }

  /**
   * Removes a condition from a tooth (soft delete).
   *
   * CLINICAL SAFETY: Conditions are never hard-deleted. They are marked with
   * deletedAt, deletedBy, and deleteReason for audit trail compliance.
   */
  async removeToothCondition(
    patientId: string,
    toothNumber: string,
    conditionId: string,
    removeDto: RemoveConditionInput,
    tenantContext: TenantContext,
    requestContext: RequestContext,
  ): Promise<OdontogramDocument> {
    // Validate inputs
    this.validateToothNumber(toothNumber);
    const validatedInput = RemoveConditionSchema.parse(removeDto);

    const odontogram = await this.repository.findByPatientId(patientId, tenantContext);
    if (!odontogram) {
      throw new NotFoundException(`Odontogram not found for patient ${patientId}`);
    }

    const tooth = odontogram.teeth.get(toothNumber);
    if (!tooth) {
      throw new NotFoundException(`Tooth ${toothNumber} not found in odontogram`);
    }

    // Find the condition
    const condition = tooth.conditions.find((c) => c._id?.toString() === conditionId);
    if (!condition) {
      throw new NotFoundException(`Condition ${conditionId} not found on tooth ${toothNumber}`);
    }

    if (condition.deletedAt) {
      throw new ConflictException(`Condition ${conditionId} has already been removed`);
    }

    // Capture state for audit
    const previousState = { ...condition };

    // Soft delete with optimistic locking
    const updatedOdontogram = await this.repository.softDeleteCondition(
      patientId,
      toothNumber,
      conditionId,
      validatedInput.reason,
      tenantContext,
      requestContext.userId,
      odontogram.version,
    );

    // Record audit history
    await this.repository.recordHistory({
      patientId,
      tenantId: tenantContext.tenantId,
      organizationId: tenantContext.organizationId,
      clinicId: tenantContext.clinicId,
      toothNumber: toothNumber as FDIToothNumber,
      changeType: 'condition_removed',
      conditionId,
      previousState: this.serializeConditionForAudit(previousState),
      newState: {
        ...this.serializeConditionForAudit(previousState),
        deletedAt: new Date(),
        deletedBy: requestContext.userId,
        deleteReason: validatedInput.reason,
      },
      changedBy: requestContext.userId,
      reason: validatedInput.reason,
      appointmentId: requestContext.appointmentId,
      ipAddress: requestContext.ipAddress,
      userAgent: requestContext.userAgent,
    });

    this.logger.log(
      `Removed condition ${conditionId} from tooth ${toothNumber} for patient ${patientId}. Reason: ${validatedInput.reason}`,
    );

    return updatedOdontogram;
  }

  /**
   * Gets the history of changes for a specific tooth.
   *
   * Returns paginated audit trail entries for compliance and clinical review.
   */
  async getToothHistory(
    patientId: string,
    toothNumber: string,
    query: GetToothHistoryQuery,
    tenantContext: TenantContext,
  ) {
    this.validateToothNumber(toothNumber);

    const { data, total } = await this.repository.getToothHistory(
      patientId,
      toothNumber as FDIToothNumber,
      tenantContext.tenantId,
      {
        limit: query.limit || 50,
        offset: query.offset || 0,
        startDate: query.startDate ? new Date(query.startDate) : undefined,
        endDate: query.endDate ? new Date(query.endDate) : undefined,
      },
    );

    return {
      data,
      total,
      offset: query.offset || 0,
      limit: query.limit || 50,
      hasMore: (query.offset || 0) + data.length < total,
    };
  }

  /**
   * Bulk updates multiple teeth at once.
   *
   * Useful for initial charting or comprehensive updates.
   * Each tooth update is validated and recorded separately.
   */
  async bulkUpdateTeeth(
    patientId: string,
    bulkDto: BulkUpdateTeethInput,
    tenantContext: TenantContext,
    requestContext: RequestContext,
  ): Promise<OdontogramDocument> {
    const validatedInput = BulkUpdateTeethSchema.parse(bulkDto);

    let odontogram = await this.getPatientOdontogram(
      patientId,
      tenantContext,
      requestContext.userId,
    );

    // Process each tooth update
    for (const toothUpdate of validatedInput.teeth) {
      const { toothNumber, conditions, ...toothProps } = toothUpdate;

      // Update tooth properties if any provided
      if (Object.keys(toothProps).length > 0) {
        odontogram = await this.updateToothStatus(
          patientId,
          toothNumber,
          toothProps,
          tenantContext,
          requestContext,
        );
      }

      // Add conditions if provided
      if (conditions && conditions.length > 0) {
        for (const condition of conditions) {
          const result = await this.addToothCondition(
            patientId,
            toothNumber,
            condition,
            tenantContext,
            requestContext,
          );
          odontogram = result.odontogram;
        }
      }
    }

    this.logger.log(
      `Bulk updated ${validatedInput.teeth.length} teeth for patient ${patientId}`,
    );

    return odontogram;
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Initializes a new odontogram with all permanent teeth set to healthy
   */
  private async initializeOdontogram(
    patientId: string,
    tenantContext: TenantContext,
    userId: string,
  ): Promise<OdontogramDocument> {
    const teeth = new Map<string, ToothData>();

    // Initialize all permanent teeth as healthy
    for (const toothNumber of PERMANENT_TEETH) {
      teeth.set(toothNumber, this.createInitialToothData(toothNumber, false));
    }

    return this.repository.create({
      patientId,
      tenantId: tenantContext.tenantId,
      organizationId: tenantContext.organizationId,
      clinicId: tenantContext.clinicId,
      teeth,
      numberingSystem: 'FDI',
      isAdultDentition: true,
      updatedBy: userId,
      version: 1,
      schemaVersion: 2,
    });
  }

  /**
   * Creates initial tooth data for a new tooth
   */
  private createInitialToothData(toothNumber: string, isPrimary: boolean): ToothData {
    return {
      toothNumber: toothNumber as FDIToothNumber,
      isPresent: true,
      isPrimary,
      isSupernumerary: false,
      isImplant: false,
      conditions: [],
      updatedAt: new Date(),
    };
  }

  /**
   * Validates that the tooth number is a valid FDI number
   */
  private validateToothNumber(toothNumber: string): void {
    if (!ALL_TEETH.includes(toothNumber as any)) {
      throw new BadRequestException(
        `Invalid FDI tooth number: ${toothNumber}. Valid permanent teeth: ${PERMANENT_TEETH.join(', ')}. Valid deciduous teeth: ${DECIDUOUS_TEETH.join(', ')}`,
      );
    }
  }

  /**
   * Validates that surfaces are appropriate for the tooth type
   *
   * CLINICAL NOTE:
   * - Anterior teeth (incisors, canines: x1-x3) use I (incisal) not O (occlusal)
   * - Posterior teeth (premolars, molars: x4-x8) use O (occlusal) not I (incisal)
   */
  private validateSurfacesForTooth(toothNumber: string, surfaces: string[]): void {
    if (surfaces.length === 0) return;

    const toothPosition = parseInt(toothNumber.charAt(1), 10);
    const isAnterior = toothPosition >= 1 && toothPosition <= 3;

    for (const surface of surfaces) {
      if (isAnterior && surface === 'O') {
        throw new BadRequestException(
          `Surface 'O' (Occlusal) is not valid for anterior tooth ${toothNumber}. Use 'I' (Incisal) instead.`,
        );
      }
      if (!isAnterior && surface === 'I') {
        throw new BadRequestException(
          `Surface 'I' (Incisal) is not valid for posterior tooth ${toothNumber}. Use 'O' (Occlusal) instead.`,
        );
      }
    }
  }

  /**
   * Gets the primary (most significant) condition for a tooth
   */
  private getPrimaryCondition(tooth: ToothData): string | null {
    const activeConditions = tooth.conditions.filter((c) => !c.deletedAt);
    if (activeConditions.length === 0) {
      return tooth.isPresent ? 'healthy' : 'missing';
    }

    // Priority: missing > implant > extraction > crown > root_canal > bridge > filling > caries > healthy
    const priorityOrder = [
      'missing', 'implant', 'extraction', 'crown', 'root_canal', 'bridge',
      'veneer', 'filling', 'caries', 'fractured', 'abscess', 'watch', 'healthy',
    ];

    for (const condition of priorityOrder) {
      if (activeConditions.some((c) => c.condition === condition)) {
        return condition;
      }
    }

    return activeConditions[0]?.condition || 'healthy';
  }

  /**
   * Serializes tooth data for audit logging
   */
  private serializeToothForAudit(tooth: ToothData): Record<string, unknown> {
    return {
      toothNumber: tooth.toothNumber,
      isPresent: tooth.isPresent,
      isPrimary: tooth.isPrimary,
      isSupernumerary: tooth.isSupernumerary,
      isImplant: tooth.isImplant,
      mobility: tooth.mobility,
      furcation: tooth.furcation,
      notes: tooth.notes,
      conditionCount: tooth.conditions.filter((c) => !c.deletedAt).length,
    };
  }

  /**
   * Serializes condition for audit logging
   */
  private serializeConditionForAudit(condition: Partial<ToothConditionRecord>): Record<string, unknown> {
    return {
      _id: condition._id?.toString(),
      condition: condition.condition,
      surfaces: condition.surfaces,
      severity: condition.severity,
      material: condition.material,
      notes: condition.notes,
      procedureId: condition.procedureId,
      cdtCode: condition.cdtCode,
      recordedAt: condition.recordedAt,
      recordedBy: condition.recordedBy,
    };
  }

  /**
   * Emits domain event for tooth status updates
   *
   * This event is consumed by:
   * - Billing service (for procedure-related updates)
   * - Inventory service (for material deduction)
   * - Analytics platform (for clinical reporting)
   */
  private async emitToothStatusUpdatedEvent(payload: ToothStatusUpdatedEventPayload): Promise<void> {
    try {
      this.eventEmitter.emit(TOOTH_STATUS_UPDATED_EVENT, {
        patientId: payload.patientId,
        toothNumber: payload.toothNumber,
        toothNumberingSystem: 'FDI',
        previousCondition: payload.previousCondition?.toUpperCase() || 'HEALTHY',
        newCondition: payload.newCondition.toUpperCase(),
        surfaces: payload.surfaces,
        updatedBy: payload.providerId,
        tenantId: payload.tenantId,
        organizationId: payload.organizationId,
        clinicId: payload.clinicId,
        timestamp: payload.timestamp.toISOString(),
        procedureId: payload.procedureId,
        requiresImmediateAction: this.requiresImmediateAction(payload.newCondition),
      });

      this.logger.debug(
        `Emitted ${TOOTH_STATUS_UPDATED_EVENT} for tooth ${payload.toothNumber}`,
      );
    } catch (error) {
      // Log but don't throw - event emission failure shouldn't fail the operation
      this.logger.error(
        `Failed to emit ${TOOTH_STATUS_UPDATED_EVENT}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Determines if a condition requires immediate clinical action
   */
  private requiresImmediateAction(condition: string): boolean {
    const urgentConditions = ['abscess', 'fractured', 'mobile'];
    return urgentConditions.includes(condition.toLowerCase());
  }
}
