/**
 * Clinical Interventions Service
 *
 * Business logic for clinical intervention operations.
 * Implements quick clinical actions that don't require full SOAP notes.
 *
 * CLINICAL SAFETY NOTES:
 * - All modifications are logged to the history collection
 * - Interventions are never hard-deleted, only soft-deleted
 * - Version checking prevents concurrent modification conflicts
 * - Domain events are emitted for downstream systems (billing, odontogram)
 * - performedAt cannot be in the future (clinical data integrity)
 *
 * @module interventions/service
 */

import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  InterventionsRepository,
  TenantContext,
  InterventionQueryOptions,
} from './interventions.repository';
import { OdontogramService } from '../odontogram/odontogram.service';
import {
  ClinicalIntervention,
  ClinicalInterventionDocument,
  InterventionType,
  INTERVENTION_CDT_CODES,
  INTERVENTION_TYPE_LABELS,
} from './entities/intervention.schema';
import {
  CreateInterventionInput,
  QuickInterventionInput,
  UpdateInterventionInput,
  CancelInterventionInput,
  DeleteInterventionInput,
  BatchCreateInterventionsInput,
  ListInterventionsQuery,
  CreateInterventionSchema,
  QuickInterventionSchema,
  UpdateInterventionSchema,
  CancelInterventionSchema,
  DeleteInterventionSchema,
  BatchCreateInterventionsSchema,
  ListInterventionsQuerySchema,
  getInterventionTypesMetadata,
  InterventionTypeMetadataDto,
} from './dto';
import {
  INTERVENTION_EVENTS,
  createInterventionCreatedEvent,
  createInterventionUpdatedEvent,
  createInterventionCancelledEvent,
  createInterventionDeletedEvent,
  createInterventionFollowUpRequiredEvent,
  createInterventionBatchCreatedEvent,
  EventContext,
} from './events';

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * Request context for audit logging
 */
export interface RequestContext {
  userId: string;
  userName?: string;
  ipAddress?: string;
  userAgent?: string;
  correlationId?: string;
}

/**
 * Result of creating an intervention
 */
export interface CreateInterventionResult {
  intervention: ClinicalInterventionDocument;
  /** ID of condition added to odontogram (if teeth were involved) */
  odontogramConditionId?: string;
}

// ============================================================================
// SERVICE
// ============================================================================

@Injectable()
export class InterventionsService {
  private readonly logger = new Logger(InterventionsService.name);

  constructor(
    private readonly repository: InterventionsRepository,
    private readonly odontogramService: OdontogramService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // --------------------------------------------------------------------------
  // CREATE OPERATIONS
  // --------------------------------------------------------------------------

  /**
   * Creates a new clinical intervention
   *
   * CLINICAL NOTE: This creates a lightweight clinical record for quick procedures.
   * If teeth are involved, the intervention is linked to the patient's odontogram.
   */
  async createIntervention(
    patientId: string,
    input: CreateInterventionInput,
    tenantContext: TenantContext,
    requestContext: RequestContext,
  ): Promise<CreateInterventionResult> {
    // Validate input
    const validatedInput = CreateInterventionSchema.parse(input);

    // Set defaults
    const performedAt = validatedInput.performedAt
      ? new Date(validatedInput.performedAt)
      : new Date();

    // Validate performedAt is not in future (clinical safety)
    if (performedAt > new Date()) {
      throw new BadRequestException(
        'performedAt cannot be in the future - clinical records must reflect actual events',
      );
    }

    // Get default CDT code if not provided
    const procedureCode =
      validatedInput.procedureCode ||
      INTERVENTION_CDT_CODES[validatedInput.type as InterventionType];

    // Create intervention
    const intervention = await this.repository.create({
      tenantId: tenantContext.tenantId,
      patientId,
      organizationId: tenantContext.organizationId,
      clinicId: tenantContext.clinicId,
      appointmentId: validatedInput.appointmentId,
      performedAt,
      duration: validatedInput.duration,
      providerId: requestContext.userId,
      providerName: requestContext.userName || 'Unknown Provider',
      type: validatedInput.type as InterventionType,
      procedureCode,
      teeth: validatedInput.teeth,
      surfaces: validatedInput.surfaces,
      quadrant: validatedInput.quadrant as any,
      title: validatedInput.title,
      description: validatedInput.description,
      findings: validatedInput.findings,
      actionTaken: validatedInput.actionTaken,
      attachments: validatedInput.attachments.map((a) => ({
        fileId: a.fileId,
        type: a.type,
        description: a.description,
        addedAt: new Date(),
        addedBy: requestContext.userId,
      })) as any,
      followUpRequired: validatedInput.followUpRequired,
      followUpDate: validatedInput.followUpDate ? new Date(validatedInput.followUpDate) : undefined,
      followUpNotes: validatedInput.followUpNotes,
      status: 'completed',
      isBillable: validatedInput.isBillable,
      billedAmount: validatedInput.billedAmount,
      currency: 'RON', // Default for Romanian clinics
      createdBy: requestContext.userId,
    });

    // Record history
    await this.repository.recordHistory({
      interventionId: intervention._id.toString(),
      tenantId: tenantContext.tenantId,
      patientId,
      organizationId: tenantContext.organizationId,
      clinicId: tenantContext.clinicId,
      changeType: 'created',
      newState: this.serializeInterventionForAudit(intervention),
      changedBy: requestContext.userId,
      ipAddress: requestContext.ipAddress,
      userAgent: requestContext.userAgent,
    });

    // Update odontogram if teeth are involved
    let odontogramConditionId: string | undefined;
    if (validatedInput.teeth.length > 0) {
      odontogramConditionId = await this.updateOdontogramForIntervention(
        patientId,
        validatedInput.teeth,
        validatedInput.type,
        intervention._id.toString(),
        tenantContext,
        requestContext,
      );
    }

    // Emit created event
    const eventContext = this.createEventContext(tenantContext, requestContext);
    this.emitEvent(
      INTERVENTION_EVENTS.CREATED,
      createInterventionCreatedEvent(
        {
          interventionId: intervention._id.toString(),
          patientId,
          type: validatedInput.type,
          title: validatedInput.title,
          providerId: requestContext.userId,
          providerName: requestContext.userName || 'Unknown Provider',
          appointmentId: validatedInput.appointmentId,
          teeth: validatedInput.teeth,
          surfaces: validatedInput.surfaces,
          procedureCode,
          performedAt,
          isBillable: validatedInput.isBillable,
          billedAmount: validatedInput.billedAmount,
          followUpRequired: validatedInput.followUpRequired,
          followUpDate: validatedInput.followUpDate
            ? new Date(validatedInput.followUpDate)
            : undefined,
          isQuickIntervention: false,
        },
        eventContext,
      ),
    );

    // Emit follow-up event if required
    if (validatedInput.followUpRequired && validatedInput.followUpDate) {
      this.emitEvent(
        INTERVENTION_EVENTS.FOLLOW_UP_REQUIRED,
        createInterventionFollowUpRequiredEvent(
          {
            interventionId: intervention._id.toString(),
            patientId,
            type: validatedInput.type,
            followUpDate: new Date(validatedInput.followUpDate),
            followUpNotes: validatedInput.followUpNotes,
            providerId: requestContext.userId,
            providerName: requestContext.userName || 'Unknown Provider',
          },
          eventContext,
        ),
      );
    }

    this.logger.log(
      `Created intervention ${intervention._id} (${validatedInput.type}) for patient ${patientId}`,
    );

    return { intervention, odontogramConditionId };
  }

  /**
   * Creates a quick intervention with minimal data
   *
   * CLINICAL NOTE: Quick interventions auto-fill provider from context,
   * performedAt = now, and status = completed. Used for rapid documentation
   * during appointments.
   */
  async createQuickIntervention(
    patientId: string,
    input: QuickInterventionInput,
    tenantContext: TenantContext,
    requestContext: RequestContext,
  ): Promise<CreateInterventionResult> {
    // Validate input
    const validatedInput = QuickInterventionSchema.parse(input);

    // Get default CDT code and title
    const procedureCode = INTERVENTION_CDT_CODES[validatedInput.type as InterventionType];
    const typeLabels = INTERVENTION_TYPE_LABELS[validatedInput.type as InterventionType];
    const title = typeLabels.en;

    const performedAt = new Date();

    // Create intervention with defaults
    const intervention = await this.repository.create({
      tenantId: tenantContext.tenantId,
      patientId,
      organizationId: tenantContext.organizationId,
      clinicId: tenantContext.clinicId,
      appointmentId: validatedInput.appointmentId,
      performedAt,
      providerId: requestContext.userId,
      providerName: requestContext.userName || 'Unknown Provider',
      type: validatedInput.type as InterventionType,
      procedureCode,
      teeth: validatedInput.teeth,
      surfaces: [],
      title,
      description: validatedInput.notes,
      attachments: [],
      followUpRequired: false,
      status: 'completed',
      isBillable: false,
      currency: 'RON',
      createdBy: requestContext.userId,
    });

    // Record history
    await this.repository.recordHistory({
      interventionId: intervention._id.toString(),
      tenantId: tenantContext.tenantId,
      patientId,
      organizationId: tenantContext.organizationId,
      clinicId: tenantContext.clinicId,
      changeType: 'created',
      newState: this.serializeInterventionForAudit(intervention),
      changedBy: requestContext.userId,
      reason: 'Quick intervention',
      ipAddress: requestContext.ipAddress,
      userAgent: requestContext.userAgent,
    });

    // Update odontogram if teeth are involved
    let odontogramConditionId: string | undefined;
    if (validatedInput.teeth.length > 0) {
      odontogramConditionId = await this.updateOdontogramForIntervention(
        patientId,
        validatedInput.teeth,
        validatedInput.type,
        intervention._id.toString(),
        tenantContext,
        requestContext,
      );
    }

    // Emit created event
    const eventContext = this.createEventContext(tenantContext, requestContext);
    this.emitEvent(
      INTERVENTION_EVENTS.CREATED,
      createInterventionCreatedEvent(
        {
          interventionId: intervention._id.toString(),
          patientId,
          type: validatedInput.type,
          title,
          providerId: requestContext.userId,
          providerName: requestContext.userName || 'Unknown Provider',
          appointmentId: validatedInput.appointmentId,
          teeth: validatedInput.teeth,
          surfaces: [],
          procedureCode,
          performedAt,
          isBillable: false,
          followUpRequired: false,
          isQuickIntervention: true,
        },
        eventContext,
      ),
    );

    this.logger.log(
      `Created quick intervention ${intervention._id} (${validatedInput.type}) for patient ${patientId}`,
    );

    return { intervention, odontogramConditionId };
  }

  /**
   * Creates multiple interventions for an appointment in batch
   *
   * CLINICAL NOTE: Used to record multiple quick procedures performed
   * during a single appointment. All interventions are linked to the same
   * appointmentId.
   */
  async createBatchInterventions(
    appointmentId: string,
    input: BatchCreateInterventionsInput,
    tenantContext: TenantContext,
    requestContext: RequestContext,
  ): Promise<ClinicalInterventionDocument[]> {
    // Validate input
    const validatedInput = BatchCreateInterventionsSchema.parse(input);

    // Get patientId from first intervention (all should be same patient)
    // In real scenario, this would come from appointment lookup
    const results: ClinicalInterventionDocument[] = [];
    let patientId: string | undefined;

    for (const interventionInput of validatedInput.interventions) {
      const result = await this.createIntervention(
        patientId || 'batch-patient', // Would be fetched from appointment
        {
          ...interventionInput,
          appointmentId,
        },
        tenantContext,
        requestContext,
      );
      results.push(result.intervention);
      patientId = result.intervention.patientId;
    }

    // Calculate billable summary
    const billableInterventions = results.filter((i) => i.isBillable);
    const totalAmount = billableInterventions.reduce((sum, i) => sum + (i.billedAmount || 0), 0);

    // Emit batch created event
    const eventContext = this.createEventContext(tenantContext, requestContext);
    this.emitEvent(
      INTERVENTION_EVENTS.BATCH_CREATED,
      createInterventionBatchCreatedEvent(
        {
          appointmentId,
          patientId: patientId || 'unknown',
          interventionIds: results.map((i) => i._id.toString()),
          interventionCount: results.length,
          types: [...new Set(results.map((i) => i.type))],
          billableSummary: {
            count: billableInterventions.length,
            totalAmount,
          },
        },
        eventContext,
      ),
    );

    this.logger.log(
      `Created batch of ${results.length} interventions for appointment ${appointmentId}`,
    );

    return results;
  }

  // --------------------------------------------------------------------------
  // READ OPERATIONS
  // --------------------------------------------------------------------------

  /**
   * Gets an intervention by ID
   */
  async getIntervention(
    id: string,
    tenantContext: TenantContext,
    includeDeleted = false,
  ): Promise<ClinicalInterventionDocument> {
    const intervention = await this.repository.findById(id, tenantContext, includeDeleted);

    if (!intervention) {
      throw new NotFoundException(`Intervention ${id} not found`);
    }

    return intervention;
  }

  /**
   * Lists interventions for a patient with filtering and pagination
   */
  async listPatientInterventions(
    patientId: string,
    query: ListInterventionsQuery,
    tenantContext: TenantContext,
  ) {
    const validatedQuery = ListInterventionsQuerySchema.parse(query);

    const options: InterventionQueryOptions = {
      limit: validatedQuery.limit,
      offset: validatedQuery.offset,
      startDate: validatedQuery.startDate ? new Date(validatedQuery.startDate) : undefined,
      endDate: validatedQuery.endDate ? new Date(validatedQuery.endDate) : undefined,
      type: validatedQuery.type as InterventionType | undefined,
      status: validatedQuery.status as any,
      providerId: validatedQuery.providerId,
      appointmentId: validatedQuery.appointmentId,
      toothNumber: validatedQuery.toothNumber,
      isBillable: validatedQuery.isBillable,
      followUpRequired: validatedQuery.followUpRequired,
      includeDeleted: validatedQuery.includeDeleted,
    };

    return this.repository.findByPatientId(patientId, tenantContext, options);
  }

  /**
   * Gets interventions for a specific appointment
   */
  async getAppointmentInterventions(
    appointmentId: string,
    tenantContext: TenantContext,
  ): Promise<ClinicalInterventionDocument[]> {
    return this.repository.findByAppointmentId(appointmentId, tenantContext);
  }

  /**
   * Gets interventions for a specific tooth
   */
  async getToothInterventions(
    patientId: string,
    toothNumber: string,
    query: ListInterventionsQuery,
    tenantContext: TenantContext,
  ) {
    const validatedQuery = ListInterventionsQuerySchema.parse(query);

    return this.repository.findByToothNumber(patientId, toothNumber, tenantContext, {
      limit: validatedQuery.limit,
      offset: validatedQuery.offset,
      startDate: validatedQuery.startDate ? new Date(validatedQuery.startDate) : undefined,
      endDate: validatedQuery.endDate ? new Date(validatedQuery.endDate) : undefined,
      includeDeleted: validatedQuery.includeDeleted,
    });
  }

  /**
   * Gets intervention type metadata for UI
   */
  getInterventionTypes(): InterventionTypeMetadataDto[] {
    return getInterventionTypesMetadata();
  }

  // --------------------------------------------------------------------------
  // UPDATE OPERATIONS
  // --------------------------------------------------------------------------

  /**
   * Updates an intervention
   */
  async updateIntervention(
    id: string,
    input: UpdateInterventionInput,
    tenantContext: TenantContext,
    requestContext: RequestContext,
  ): Promise<ClinicalInterventionDocument> {
    const validatedInput = UpdateInterventionSchema.parse(input);

    // Get current state
    const current = await this.getIntervention(id, tenantContext);
    const previousState = this.serializeInterventionForAudit(current);

    // Build update object
    const { version, ...updateFields } = validatedInput;
    const changedFields: string[] = [];

    // Track what changed for events
    let billingChanged = false;
    let followUpChanged = false;
    let teethChanged = false;

    for (const [key, value] of Object.entries(updateFields)) {
      if (value !== undefined) {
        changedFields.push(key);
        if (key === 'isBillable' || key === 'billedAmount') {
          billingChanged = true;
        }
        if (key === 'followUpRequired' || key === 'followUpDate' || key === 'followUpNotes') {
          followUpChanged = true;
        }
        if (key === 'teeth') {
          teethChanged = true;
        }
      }
    }

    // Build sanitized update data with proper type handling
    const updateData: Partial<ClinicalIntervention> = {};

    if (updateFields.title !== undefined) updateData.title = updateFields.title;
    if (updateFields.description !== undefined)
      updateData.description = updateFields.description ?? undefined;
    if (updateFields.findings !== undefined)
      updateData.findings = updateFields.findings ?? undefined;
    if (updateFields.actionTaken !== undefined)
      updateData.actionTaken = updateFields.actionTaken ?? undefined;
    if (updateFields.teeth !== undefined) updateData.teeth = updateFields.teeth;
    if (updateFields.surfaces !== undefined) updateData.surfaces = updateFields.surfaces;
    if (updateFields.quadrant !== undefined)
      updateData.quadrant = (updateFields.quadrant ?? undefined) as any;
    if (updateFields.duration !== undefined) updateData.duration = updateFields.duration;
    if (updateFields.procedureCode !== undefined)
      updateData.procedureCode = updateFields.procedureCode;
    if (updateFields.appointmentId !== undefined)
      updateData.appointmentId = updateFields.appointmentId;
    if (updateFields.followUpRequired !== undefined)
      updateData.followUpRequired = updateFields.followUpRequired;
    if (updateFields.followUpNotes !== undefined)
      updateData.followUpNotes = updateFields.followUpNotes ?? undefined;
    if (updateFields.isBillable !== undefined) updateData.isBillable = updateFields.isBillable;
    if (updateFields.billedAmount !== undefined)
      updateData.billedAmount = updateFields.billedAmount;
    if (updateFields.status !== undefined) updateData.status = updateFields.status;
    if (updateFields.followUpDate !== undefined) {
      updateData.followUpDate = updateFields.followUpDate
        ? new Date(updateFields.followUpDate)
        : undefined;
    }

    // Perform update with optimistic locking
    const updated = await this.repository.update(
      id,
      updateData,
      tenantContext,
      requestContext.userId,
      version,
    );

    // Record history
    await this.repository.recordHistory({
      interventionId: id,
      tenantId: tenantContext.tenantId,
      patientId: current.patientId,
      organizationId: tenantContext.organizationId,
      clinicId: tenantContext.clinicId,
      changeType: 'updated',
      previousState,
      newState: this.serializeInterventionForAudit(updated),
      changedFields,
      changedBy: requestContext.userId,
      ipAddress: requestContext.ipAddress,
      userAgent: requestContext.userAgent,
    });

    // Emit updated event
    const eventContext = this.createEventContext(tenantContext, requestContext);
    this.emitEvent(
      INTERVENTION_EVENTS.UPDATED,
      createInterventionUpdatedEvent(
        {
          interventionId: id,
          patientId: current.patientId,
          type: current.type,
          version: updated.version,
          previousVersion: version,
          fieldsChanged: changedFields,
          changesSummary: {
            billingChanged,
            followUpChanged,
            teethChanged,
          },
        },
        eventContext,
      ),
    );

    // Emit follow-up event if follow-up was enabled
    if (followUpChanged && updated.followUpRequired && updated.followUpDate) {
      this.emitEvent(
        INTERVENTION_EVENTS.FOLLOW_UP_REQUIRED,
        createInterventionFollowUpRequiredEvent(
          {
            interventionId: id,
            patientId: current.patientId,
            type: current.type,
            followUpDate: updated.followUpDate,
            followUpNotes: updated.followUpNotes,
            providerId: current.providerId,
            providerName: current.providerName,
          },
          eventContext,
        ),
      );
    }

    this.logger.log(`Updated intervention ${id}, changed fields: ${changedFields.join(', ')}`);

    return updated;
  }

  /**
   * Cancels an intervention
   */
  async cancelIntervention(
    id: string,
    input: CancelInterventionInput,
    tenantContext: TenantContext,
    requestContext: RequestContext,
  ): Promise<ClinicalInterventionDocument> {
    const validatedInput = CancelInterventionSchema.parse(input);

    // Get current state
    const current = await this.getIntervention(id, tenantContext);
    const previousState = this.serializeInterventionForAudit(current);

    // Cancel with optimistic locking
    const cancelled = await this.repository.cancel(
      id,
      validatedInput.reason,
      tenantContext,
      requestContext.userId,
      validatedInput.version,
    );

    // Record history
    await this.repository.recordHistory({
      interventionId: id,
      tenantId: tenantContext.tenantId,
      patientId: current.patientId,
      organizationId: tenantContext.organizationId,
      clinicId: tenantContext.clinicId,
      changeType: 'cancelled',
      previousState,
      newState: this.serializeInterventionForAudit(cancelled),
      changedFields: ['status', 'cancellationReason', 'cancelledAt', 'cancelledBy'],
      changedBy: requestContext.userId,
      reason: validatedInput.reason,
      ipAddress: requestContext.ipAddress,
      userAgent: requestContext.userAgent,
    });

    // Emit cancelled event
    const eventContext = this.createEventContext(tenantContext, requestContext);
    this.emitEvent(
      INTERVENTION_EVENTS.CANCELLED,
      createInterventionCancelledEvent(
        {
          interventionId: id,
          patientId: current.patientId,
          type: current.type,
          appointmentId: current.appointmentId,
          cancellationReason: validatedInput.reason,
          cancelledBy: requestContext.userId,
          wasBilled: !!current.invoiceId,
          invoiceId: current.invoiceId,
        },
        eventContext,
      ),
    );

    this.logger.log(`Cancelled intervention ${id}. Reason: ${validatedInput.reason}`);

    return cancelled;
  }

  /**
   * Soft deletes an intervention
   *
   * CLINICAL SAFETY: Never hard-delete clinical data.
   * The record remains for audit/compliance purposes.
   */
  async deleteIntervention(
    id: string,
    input: DeleteInterventionInput,
    tenantContext: TenantContext,
    requestContext: RequestContext,
  ): Promise<ClinicalInterventionDocument> {
    const validatedInput = DeleteInterventionSchema.parse(input);

    // Get current state
    const current = await this.getIntervention(id, tenantContext);
    const previousState = this.serializeInterventionForAudit(current);

    // Soft delete with optimistic locking
    const deleted = await this.repository.softDelete(
      id,
      validatedInput.reason,
      tenantContext,
      requestContext.userId,
      validatedInput.version,
    );

    // Record history
    await this.repository.recordHistory({
      interventionId: id,
      tenantId: tenantContext.tenantId,
      patientId: current.patientId,
      organizationId: tenantContext.organizationId,
      clinicId: tenantContext.clinicId,
      changeType: 'deleted',
      previousState,
      newState: this.serializeInterventionForAudit(deleted),
      changedFields: ['deletedAt', 'deletedBy', 'deleteReason'],
      changedBy: requestContext.userId,
      reason: validatedInput.reason,
      ipAddress: requestContext.ipAddress,
      userAgent: requestContext.userAgent,
    });

    // Emit deleted event
    const eventContext = this.createEventContext(tenantContext, requestContext);
    this.emitEvent(
      INTERVENTION_EVENTS.DELETED,
      createInterventionDeletedEvent(
        {
          interventionId: id,
          patientId: current.patientId,
          type: current.type,
          deleteReason: validatedInput.reason,
          deletedBy: requestContext.userId,
          appointmentId: current.appointmentId,
        },
        eventContext,
      ),
    );

    this.logger.log(`Soft-deleted intervention ${id}. Reason: ${validatedInput.reason}`);

    return deleted;
  }

  // --------------------------------------------------------------------------
  // PRIVATE HELPERS
  // --------------------------------------------------------------------------

  /**
   * Updates odontogram when intervention involves teeth
   *
   * Maps certain intervention types to odontogram conditions.
   */
  private async updateOdontogramForIntervention(
    patientId: string,
    teeth: string[],
    interventionType: string,
    interventionId: string,
    tenantContext: TenantContext,
    requestContext: RequestContext,
  ): Promise<string | undefined> {
    // Map intervention types to odontogram conditions
    const conditionMapping: Record<string, string> = {
      fluoride: 'watch', // Fluoride treated teeth are being watched
      sealant: 'sealant',
      scaling: 'healthy', // Scaled teeth are cleaned
      polishing: 'healthy',
    };

    const condition = conditionMapping[interventionType];
    if (!condition) {
      return undefined;
    }

    try {
      // Add condition to each tooth involved
      for (const toothNumber of teeth) {
        const result = await this.odontogramService.addToothCondition(
          patientId,
          toothNumber,
          {
            condition,
            surfaces: [],
            notes: `Added via intervention ${interventionId} (${interventionType})`,
            procedureId: interventionId,
          },
          tenantContext,
          {
            userId: requestContext.userId,
            ipAddress: requestContext.ipAddress,
            userAgent: requestContext.userAgent,
          },
        );

        // Return first condition ID for reference
        if (result.conditionId) {
          return result.conditionId;
        }
      }
    } catch (error) {
      // Log but don't fail - odontogram update is secondary
      this.logger.warn(
        `Failed to update odontogram for intervention ${interventionId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }

    return undefined;
  }

  /**
   * Serializes intervention for audit logging
   */
  private serializeInterventionForAudit(
    intervention: ClinicalInterventionDocument,
  ): Record<string, unknown> {
    return {
      id: intervention._id?.toString(),
      type: intervention.type,
      title: intervention.title,
      status: intervention.status,
      performedAt: intervention.performedAt,
      providerId: intervention.providerId,
      teeth: intervention.teeth,
      surfaces: intervention.surfaces,
      isBillable: intervention.isBillable,
      billedAmount: intervention.billedAmount,
      followUpRequired: intervention.followUpRequired,
      followUpDate: intervention.followUpDate,
      version: intervention.version,
    };
  }

  /**
   * Creates event context from tenant and request context
   */
  private createEventContext(
    tenantContext: TenantContext,
    requestContext: RequestContext,
  ): EventContext {
    return {
      tenantId: tenantContext.tenantId,
      organizationId: tenantContext.organizationId,
      clinicId: tenantContext.clinicId,
      triggeredBy: requestContext.userId,
      triggeredByName: requestContext.userName,
      correlationId: requestContext.correlationId,
      ipAddress: requestContext.ipAddress,
    };
  }

  /**
   * Emits an event via EventEmitter2
   */
  private emitEvent(eventName: string, payload: unknown): void {
    try {
      this.eventEmitter.emit(eventName, payload);
      this.logger.debug(`Emitted event: ${eventName}`);
    } catch (error) {
      // Log but don't throw - event emission failure shouldn't fail the operation
      this.logger.error(
        `Failed to emit event ${eventName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
