/**
 * Treatment Plans Service
 *
 * Business logic layer for treatment plan management.
 * Handles status transitions, financial calculations, and domain event emission.
 *
 * CRITICAL BUSINESS RULES:
 * 1. Status transitions must follow the defined state machine
 * 2. Financial totals must be recalculated on any item change
 * 3. Domain events must be emitted for downstream systems (billing, inventory, scheduling)
 * 4. All changes must be audited
 *
 * @module treatment-plans/service
 */

import {
  Injectable,
  Logger,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  TreatmentPlansRepository,
  TenantContext,
  AuditContext,
  PaginatedResult,
} from './treatment-plans.repository';
import {
  TreatmentPlanDocument,
  TreatmentPlanStatus,
  VALID_STATUS_TRANSITIONS,
  TreatmentPhase,
  TreatmentPlanItem,
  TreatmentFinancials,
  TreatmentApproval,
} from './entities/treatment-plan.schema';
import {
  CreateTreatmentPlanDto,
  UpdateTreatmentPlanDto,
  PresentTreatmentPlanDto,
  AcceptTreatmentPlanDto,
  CompleteProcedureItemDto,
  CancelTreatmentPlanDto,
  TreatmentPlanQueryDto,
  DeclineTreatmentPlanDto,
  AddPhaseDto,
  AddItemToPhaseDto,
  ScheduleItemDto,
  ReviseTreatmentPlanDto,
  AddAlternativeDto,
  UpdateTreatmentPlanItemDto,
} from './dto/treatment-plan.dto';

// ============================================================================
// DOMAIN EVENT TYPES
// ============================================================================

/**
 * Event emitted when a treatment plan is created
 */
export interface TreatmentPlanCreatedEvent {
  treatmentPlanId: string;
  patientId: string;
  providerId: string;
  tenantId: string;
  clinicId: string;
  totalCents: number;
  procedureCount: number;
  phaseCount: number;
  timestamp: Date;
}

/**
 * Event emitted when a treatment plan is presented to patient
 */
export interface TreatmentPlanPresentedEvent {
  treatmentPlanId: string;
  patientId: string;
  providerId: string;
  tenantId: string;
  clinicId: string;
  presentedBy: string;
  totalCents: number;
  expiresAt?: Date;
  timestamp: Date;
}

/**
 * Event emitted when patient accepts a treatment plan
 */
export interface TreatmentPlanAcceptedEvent {
  treatmentPlanId: string;
  patientId: string;
  providerId: string;
  tenantId: string;
  clinicId: string;
  acceptedBy: string;
  approvalType: string;
  totalCents: number;
  patientResponsibilityCents?: number;
  insuranceCoverageCents?: number;
  selectedAlternativeId?: string;
  hasPaymentPlan: boolean;
  timestamp: Date;
}

/**
 * Event emitted when a procedure item is completed
 *
 * CRITICAL: This event triggers:
 * - Billing module: Create invoice line item
 * - Inventory module: Deduct materials
 * - Scheduling module: Update appointment status
 */
export interface TreatmentProcedureCompletedEvent {
  treatmentPlanId: string;
  phaseId: string;
  itemId: string;
  patientId: string;
  providerId: string;
  tenantId: string;
  clinicId: string;
  procedureCode: string;
  procedureName: string;
  teeth: string[];
  surfaces: string[];
  totalCents: number;
  materials: Array<{
    catalogItemId: string;
    itemName: string;
    quantity: number;
  }>;
  completedProcedureId?: string;
  completedBy: string;
  timestamp: Date;
}

/**
 * Event emitted when treatment plan is completed
 */
export interface TreatmentPlanCompletedEvent {
  treatmentPlanId: string;
  patientId: string;
  providerId: string;
  tenantId: string;
  clinicId: string;
  totalCents: number;
  totalProcedures: number;
  startedAt: Date;
  completedAt: Date;
  durationDays: number;
  timestamp: Date;
}

/**
 * Event emitted when treatment plan is cancelled
 */
export interface TreatmentPlanCancelledEvent {
  treatmentPlanId: string;
  patientId: string;
  tenantId: string;
  clinicId: string;
  previousStatus: string;
  cancelledBy: string;
  reason: string;
  completedItemsCount: number;
  pendingItemsCount: number;
  timestamp: Date;
}

/**
 * Event emitted when treatment plan is declined by patient
 */
export interface TreatmentPlanDeclinedEvent {
  treatmentPlanId: string;
  patientId: string;
  tenantId: string;
  clinicId: string;
  reason: string;
  requestAlternative: boolean;
  concerns: string[];
  timestamp: Date;
}

/**
 * Event emitted when a treatment item is scheduled
 */
export interface TreatmentItemScheduledEvent {
  treatmentPlanId: string;
  phaseId: string;
  itemId: string;
  patientId: string;
  tenantId: string;
  clinicId: string;
  procedureCode: string;
  procedureName: string;
  appointmentId: string;
  scheduledFor?: Date;
  providerId?: string;
  timestamp: Date;
}

// ============================================================================
// SERVICE IMPLEMENTATION
// ============================================================================

@Injectable()
export class TreatmentPlansService {
  private readonly logger = new Logger(TreatmentPlansService.name);

  constructor(
    private readonly repository: TreatmentPlansRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // ============================================================================
  // QUERY METHODS
  // ============================================================================

  /**
   * Get a treatment plan by ID
   */
  async getById(planId: string, context: TenantContext): Promise<TreatmentPlanDocument> {
    return this.repository.findByIdOrFail(planId, context);
  }

  /**
   * Get all treatment plans for a patient
   */
  async getByPatient(
    patientId: string,
    context: TenantContext,
    query: TreatmentPlanQueryDto,
  ): Promise<PaginatedResult<TreatmentPlanDocument>> {
    return this.repository.findByPatient(patientId, context, query);
  }

  /**
   * Get the current active treatment plan for a patient
   */
  async getActivePlan(
    patientId: string,
    context: TenantContext,
  ): Promise<TreatmentPlanDocument | null> {
    return this.repository.findCurrentActivePlan(patientId, context);
  }

  /**
   * Get all active plans for a patient (draft through in_progress)
   */
  async getAllActivePlans(
    patientId: string,
    context: TenantContext,
  ): Promise<TreatmentPlanDocument[]> {
    return this.repository.findActiveByPatient(patientId, context);
  }

  /**
   * Get treatment plan history
   */
  async getHistory(
    planId: string,
    context: TenantContext,
    options?: { limit?: number; offset?: number },
  ) {
    // Verify plan exists and user has access
    await this.repository.findByIdOrFail(planId, context);
    return this.repository.getHistory(planId, context, options);
  }

  /**
   * Get plan counts by status (for dashboard)
   */
  async getStatusCounts(context: TenantContext) {
    return this.repository.countByStatus(context);
  }

  // ============================================================================
  // CREATE / UPDATE METHODS
  // ============================================================================

  /**
   * Create a new treatment plan
   *
   * @param patientId Patient the plan is for
   * @param dto Creation data
   * @param auditContext Audit information
   */
  async createTreatmentPlan(
    patientId: string,
    dto: CreateTreatmentPlanDto,
    auditContext: AuditContext,
  ): Promise<TreatmentPlanDocument> {
    // Build phases with calculated financials
    const phases = this.buildPhases(dto.phases);

    // Calculate overall financials
    const financial = this.calculateFinancials(phases, dto.financialOverrides);

    // Build alternatives if provided
    const alternatives = dto.alternatives.map((alt) => ({
      name: alt.name,
      description: alt.description,
      phases: this.buildPhases(alt.phases),
      advantages: alt.advantages,
      disadvantages: alt.disadvantages,
      isRecommended: alt.isRecommended,
      totalCents: this.calculateAlternativeTotal(alt.phases),
    }));

    const plan = await this.repository.create(
      {
        patientId,
        providerId: auditContext.userId,
        title: dto.title,
        description: dto.description,
        status: 'draft',
        phases: phases as TreatmentPhase[],
        alternatives: alternatives as unknown as typeof plan.alternatives,
        financial,
        approvals: [],
        expiresAt: dto.expiresAt,
        preAuthorizationNumber: dto.preAuthorizationNumber,
        preAuthorizationStatus: dto.preAuthorizationStatus,
        clinicalNoteId: dto.clinicalNoteId,
        appointmentId: dto.appointmentId,
        providerNotes: dto.providerNotes,
        patientQuestions: [],
        tags: dto.tags,
        priority: dto.priority,
      },
      auditContext,
    );

    // Emit domain event
    const event: TreatmentPlanCreatedEvent = {
      treatmentPlanId: plan._id.toString(),
      patientId,
      providerId: auditContext.userId,
      tenantId: auditContext.tenantId,
      clinicId: auditContext.clinicId,
      totalCents: financial.totalCents,
      procedureCount: this.countProcedures(phases),
      phaseCount: phases.length,
      timestamp: new Date(),
    };

    this.eventEmitter.emit('treatment.plan.created', event);

    this.logger.log(
      `Created treatment plan ${plan._id} for patient ${patientId} with ${phases.length} phases`,
    );

    return plan;
  }

  /**
   * Update a draft treatment plan
   *
   * IMPORTANT: Only plans in 'draft' status can be updated.
   * Once presented, a new version must be created.
   */
  async updateTreatmentPlan(
    planId: string,
    dto: UpdateTreatmentPlanDto,
    expectedVersion: number,
    auditContext: AuditContext,
  ): Promise<TreatmentPlanDocument> {
    const plan = await this.repository.findByIdOrFail(planId, auditContext);

    // Validate status allows updates
    if (plan.status !== 'draft') {
      throw new ForbiddenException(
        `Cannot update treatment plan in '${plan.status}' status. Only draft plans can be modified.`,
      );
    }

    // Build update object
    const updates: Partial<TreatmentPlanDocument> = {};

    if (dto.title !== undefined) updates.title = dto.title;
    if (dto.description !== undefined) updates.description = dto.description;
    if (dto.providerNotes !== undefined) updates.providerNotes = dto.providerNotes;
    if (dto.tags !== undefined) updates.tags = dto.tags;
    if (dto.priority !== undefined) updates.priority = dto.priority;
    if (dto.expiresAt !== undefined) updates.expiresAt = dto.expiresAt;
    if (dto.preAuthorizationNumber !== undefined) {
      updates.preAuthorizationNumber = dto.preAuthorizationNumber;
    }
    if (dto.preAuthorizationStatus !== undefined) {
      updates.preAuthorizationStatus = dto.preAuthorizationStatus;
    }

    // If phases are being updated, recalculate everything
    if (dto.phases) {
      updates.phases = this.buildPhases(dto.phases) as TreatmentPhase[];
      updates.financial = this.calculateFinancials(updates.phases, dto.financialOverrides);
    } else if (dto.financialOverrides) {
      // Just updating financial overrides
      updates.financial = this.calculateFinancials(plan.phases, dto.financialOverrides);
    }

    // If alternatives are being updated
    if (dto.alternatives) {
      updates.alternatives = dto.alternatives.map((alt) => ({
        name: alt.name,
        description: alt.description,
        phases: this.buildPhases(alt.phases) as TreatmentPhase[],
        advantages: alt.advantages,
        disadvantages: alt.disadvantages,
        isRecommended: alt.isRecommended,
        totalCents: this.calculateAlternativeTotal(alt.phases),
      })) as typeof plan.alternatives;
    }

    return this.repository.update(
      planId,
      updates,
      expectedVersion,
      auditContext,
      'Treatment plan updated',
    );
  }

  // ============================================================================
  // STATUS TRANSITION METHODS
  // ============================================================================

  /**
   * Present treatment plan to patient
   *
   * Transitions: draft -> presented
   * Locks the plan for editing.
   */
  async presentTreatmentPlan(
    planId: string,
    dto: PresentTreatmentPlanDto,
    auditContext: AuditContext,
  ): Promise<TreatmentPlanDocument> {
    const plan = await this.repository.findByIdOrFail(planId, auditContext);

    // Validate transition
    this.validateStatusTransition(plan.status, 'presented');

    // Validate plan has at least one item
    const totalItems = this.countProcedures(plan.phases);
    if (totalItems === 0) {
      throw new BadRequestException('Cannot present a treatment plan with no procedures');
    }

    const updated = await this.repository.updateStatus(planId, 'presented', auditContext, {
      reason: 'Plan presented to patient',
      additionalUpdates: {
        presentedAt: new Date(),
        presentedBy: auditContext.userId,
        providerNotes: dto.presentationNotes
          ? `${plan.providerNotes || ''}\n\n--- Presentation Notes ---\n${dto.presentationNotes}`
          : plan.providerNotes,
        patientQuestions: dto.patientQuestions,
        expiresAt: dto.expiresAt || plan.expiresAt,
      },
    });

    // Emit event
    const event: TreatmentPlanPresentedEvent = {
      treatmentPlanId: planId,
      patientId: plan.patientId,
      providerId: plan.providerId,
      tenantId: auditContext.tenantId,
      clinicId: auditContext.clinicId,
      presentedBy: auditContext.userId,
      totalCents: plan.financial.totalCents,
      expiresAt: updated.expiresAt,
      timestamp: new Date(),
    };

    this.eventEmitter.emit('treatment.plan.presented', event);

    this.logger.log(`Presented treatment plan ${planId} to patient`);

    return updated;
  }

  /**
   * Patient accepts treatment plan
   *
   * Transitions: presented -> accepted
   *
   * HIPAA COMPLIANCE: Records full approval information including
   * signature reference, IP address, and consent form.
   */
  async acceptTreatmentPlan(
    planId: string,
    dto: AcceptTreatmentPlanDto,
    auditContext: AuditContext,
  ): Promise<TreatmentPlanDocument> {
    const plan = await this.repository.findByIdOrFail(planId, auditContext);

    // Validate transition
    this.validateStatusTransition(plan.status, 'accepted');

    // Check if plan has expired
    if (plan.expiresAt && new Date() > plan.expiresAt) {
      throw new BadRequestException(
        'This treatment plan proposal has expired. Please request a new proposal.',
      );
    }

    // Validate selected alternative if provided
    if (dto.selectedAlternativeId) {
      const alternativeExists = plan.alternatives.some(
        (alt) => alt._id.toString() === dto.selectedAlternativeId,
      );
      if (!alternativeExists) {
        throw new BadRequestException(
          `Alternative ${dto.selectedAlternativeId} not found in treatment plan`,
        );
      }
    }

    // Create approval record
    const approval: Partial<TreatmentApproval> = {
      approvedBy: dto.approvedBy,
      approverId: dto.approverId,
      approverName: dto.approverName,
      signatureRef: dto.signatureRef,
      consentFormId: dto.consentFormId,
      consentFormVersion: dto.consentFormVersion,
      approvedAt: new Date(),
      ipAddress: dto.ipAddress || auditContext.ipAddress,
      userAgent: dto.userAgent || auditContext.userAgent,
      approvalMethod: dto.approvalMethod,
      notes: dto.notes,
    };

    const updated = await this.repository.updateStatus(planId, 'accepted', auditContext, {
      reason: `Plan accepted by ${dto.approvedBy}`,
      additionalUpdates: {
        acceptedAt: new Date(),
        selectedAlternativeId: dto.selectedAlternativeId,
        approvals: [...plan.approvals, approval] as TreatmentApproval[],
      },
    });

    // Emit event
    const event: TreatmentPlanAcceptedEvent = {
      treatmentPlanId: planId,
      patientId: plan.patientId,
      providerId: plan.providerId,
      tenantId: auditContext.tenantId,
      clinicId: auditContext.clinicId,
      acceptedBy: dto.approverId,
      approvalType: dto.approvedBy,
      totalCents: plan.financial.totalCents,
      patientResponsibilityCents: plan.financial.patientResponsibilityCents,
      insuranceCoverageCents: plan.financial.insuranceCoverageCents,
      selectedAlternativeId: dto.selectedAlternativeId,
      hasPaymentPlan: !!plan.financial.paymentPlan,
      timestamp: new Date(),
    };

    this.eventEmitter.emit('treatment.plan.accepted', event);

    this.logger.log(`Treatment plan ${planId} accepted by ${dto.approvedBy} (${dto.approverId})`);

    return updated;
  }

  /**
   * Start treatment (begin executing procedures)
   *
   * Transitions: accepted -> in_progress
   */
  async startTreatment(planId: string, auditContext: AuditContext): Promise<TreatmentPlanDocument> {
    const plan = await this.repository.findByIdOrFail(planId, auditContext);

    // Validate transition
    this.validateStatusTransition(plan.status, 'in_progress');

    return this.repository.updateStatus(planId, 'in_progress', auditContext, {
      reason: 'Treatment started',
      additionalUpdates: {
        startedAt: new Date(),
      },
    });
  }

  /**
   * Complete a procedure item within the treatment plan
   *
   * CRITICAL: This is the most important method for downstream systems.
   * The emitted event triggers:
   * - Billing: Creates invoice line item for the procedure
   * - Inventory: Deducts materials used
   * - Scheduling: Updates related appointment status
   */
  async completeProcedureItem(
    planId: string,
    phaseId: string,
    itemId: string,
    dto: CompleteProcedureItemDto,
    auditContext: AuditContext,
  ): Promise<TreatmentPlanDocument> {
    const plan = await this.repository.findByIdOrFail(planId, auditContext);

    // Validate plan is in progress
    if (plan.status !== 'in_progress' && plan.status !== 'accepted') {
      throw new BadRequestException(`Cannot complete items in a plan with status '${plan.status}'`);
    }

    // Find the item
    const phase = plan.phases.find((p) => p._id.toString() === phaseId);
    if (!phase) {
      throw new BadRequestException(`Phase ${phaseId} not found`);
    }

    const item = phase.items.find((i) => i._id.toString() === itemId);
    if (!item) {
      throw new BadRequestException(`Item ${itemId} not found in phase`);
    }

    // Validate item can be completed
    if (item.status === 'completed') {
      throw new ConflictException('This procedure has already been completed');
    }

    if (item.status === 'cancelled') {
      throw new BadRequestException('Cannot complete a cancelled procedure');
    }

    // Check sequence requirements
    if (phase.sequenceRequired) {
      const itemIndex = phase.items.findIndex((i) => i._id.toString() === itemId);
      const previousItems = phase.items.slice(0, itemIndex);
      const hasPendingPredecessor = previousItems.some(
        (i) => i.status !== 'completed' && i.status !== 'cancelled',
      );
      if (hasPendingPredecessor) {
        throw new BadRequestException(
          'This phase requires sequential completion. Complete previous procedures first.',
        );
      }
    }

    // If plan is in accepted status, transition to in_progress
    if (plan.status === 'accepted') {
      await this.repository.updateStatus(planId, 'in_progress', auditContext, {
        reason: 'First procedure completed',
        additionalUpdates: { startedAt: new Date() },
      });
    }

    // Complete the item
    const updated = await this.repository.completeItem(
      planId,
      phaseId,
      itemId,
      {
        completedProcedureId: dto.completedProcedureId,
        completedBy: dto.performedBy || auditContext.userId,
        completedAt: new Date(),
      },
      auditContext,
    );

    // Emit procedure completed event
    const event: TreatmentProcedureCompletedEvent = {
      treatmentPlanId: planId,
      phaseId,
      itemId,
      patientId: plan.patientId,
      providerId: dto.performedBy || plan.providerId,
      tenantId: auditContext.tenantId,
      clinicId: auditContext.clinicId,
      procedureCode: item.procedureCode,
      procedureName: item.procedureName,
      teeth: item.teeth,
      surfaces: item.surfaces,
      totalCents: item.totalCents,
      materials:
        dto.materialsUsed.length > 0
          ? dto.materialsUsed
          : item.materials.map((m) => ({
              catalogItemId: m.catalogItemId,
              itemName: m.itemName,
              quantity: m.quantity,
            })),
      completedProcedureId: dto.completedProcedureId,
      completedBy: dto.performedBy || auditContext.userId,
      timestamp: new Date(),
    };

    this.eventEmitter.emit('treatment.procedure.completed', event);

    // If all items are now complete, emit plan completed event
    if (updated.status === 'completed') {
      const completedEvent: TreatmentPlanCompletedEvent = {
        treatmentPlanId: planId,
        patientId: plan.patientId,
        providerId: plan.providerId,
        tenantId: auditContext.tenantId,
        clinicId: auditContext.clinicId,
        totalCents: plan.financial.totalCents,
        totalProcedures: this.countProcedures(plan.phases),
        startedAt: plan.startedAt!,
        completedAt: updated.completedAt!,
        durationDays: Math.ceil(
          (updated.completedAt!.getTime() - plan.startedAt!.getTime()) / (1000 * 60 * 60 * 24),
        ),
        timestamp: new Date(),
      };

      this.eventEmitter.emit('treatment.plan.completed', completedEvent);
    }

    this.logger.log(`Completed procedure ${item.procedureCode} in treatment plan ${planId}`);

    return updated;
  }

  /**
   * Cancel a treatment plan
   *
   * Can cancel from any non-terminal status.
   */
  async cancelTreatmentPlan(
    planId: string,
    dto: CancelTreatmentPlanDto,
    auditContext: AuditContext,
  ): Promise<TreatmentPlanDocument> {
    const plan = await this.repository.findByIdOrFail(planId, auditContext);

    // Validate transition
    this.validateStatusTransition(plan.status, 'cancelled');

    // Count completed vs pending items
    let completedCount = 0;
    let pendingCount = 0;
    for (const phase of plan.phases) {
      for (const item of phase.items) {
        if (item.status === 'completed') {
          completedCount++;
        } else if (item.status !== 'cancelled') {
          pendingCount++;
        }
      }
    }

    const previousStatus = plan.status;

    const updated = await this.repository.updateStatus(planId, 'cancelled', auditContext, {
      reason: dto.reason,
      additionalUpdates: {
        cancelledAt: new Date(),
        cancelledBy: auditContext.userId,
        cancellationReason: dto.reason,
      },
    });

    // Emit event
    const event: TreatmentPlanCancelledEvent = {
      treatmentPlanId: planId,
      patientId: plan.patientId,
      tenantId: auditContext.tenantId,
      clinicId: auditContext.clinicId,
      previousStatus,
      cancelledBy: auditContext.userId,
      reason: dto.reason,
      completedItemsCount: completedCount,
      pendingItemsCount: pendingCount,
      timestamp: new Date(),
    };

    this.eventEmitter.emit('treatment.plan.cancelled', event);

    this.logger.warn(`Cancelled treatment plan ${planId}. Reason: ${dto.reason}`);

    return updated;
  }

  /**
   * Soft delete a treatment plan (admin only)
   */
  async deleteTreatmentPlan(
    planId: string,
    reason: string,
    auditContext: AuditContext,
  ): Promise<TreatmentPlanDocument> {
    const plan = await this.repository.findByIdOrFail(planId, auditContext);

    // Only draft or cancelled plans can be deleted
    if (plan.status !== 'draft' && plan.status !== 'cancelled') {
      throw new ForbiddenException(
        `Cannot delete a treatment plan in '${plan.status}' status. Cancel it first.`,
      );
    }

    return this.repository.softDelete(planId, auditContext, reason);
  }

  // ============================================================================
  // DECLINE / REVISE METHODS
  // ============================================================================

  /**
   * Patient declines a treatment plan
   *
   * Transitions: presented -> declined (using cancelled status with decline reason)
   */
  async declineTreatmentPlan(
    planId: string,
    dto: DeclineTreatmentPlanDto,
    auditContext: AuditContext,
  ): Promise<TreatmentPlanDocument> {
    const plan = await this.repository.findByIdOrFail(planId, auditContext);

    // Can only decline a presented plan
    if (plan.status !== 'presented') {
      throw new BadRequestException(
        `Cannot decline a plan in '${plan.status}' status. Only presented plans can be declined.`,
      );
    }

    const updated = await this.repository.updateStatus(planId, 'cancelled', auditContext, {
      reason: `Patient declined: ${dto.reason}`,
      additionalUpdates: {
        cancelledAt: new Date(),
        cancelledBy: auditContext.userId,
        cancellationReason: dto.reason,
        providerNotes: plan.providerNotes
          ? `${plan.providerNotes}\n\n--- Patient Declined ---\nReason: ${dto.reason}${dto.feedback ? '\nFeedback: ' + dto.feedback : ''}${dto.concerns.length > 0 ? '\nConcerns: ' + dto.concerns.join(', ') : ''}`
          : `Patient Declined\nReason: ${dto.reason}${dto.feedback ? '\nFeedback: ' + dto.feedback : ''}`,
        tags: [...plan.tags, 'declined'],
      },
    });

    // Emit event
    const event: TreatmentPlanDeclinedEvent = {
      treatmentPlanId: planId,
      patientId: plan.patientId,
      tenantId: auditContext.tenantId,
      clinicId: auditContext.clinicId,
      reason: dto.reason,
      requestAlternative: dto.requestAlternative,
      concerns: dto.concerns,
      timestamp: new Date(),
    };

    this.eventEmitter.emit('treatment.plan.declined', event);

    this.logger.log(`Treatment plan ${planId} declined by patient. Reason: ${dto.reason}`);

    return updated;
  }

  /**
   * Create a revision of an existing treatment plan
   *
   * Creates a new plan based on an existing one (declined or presented).
   * Links the new plan to the original as a revision.
   */
  async reviseTreatmentPlan(
    planId: string,
    dto: ReviseTreatmentPlanDto,
    auditContext: AuditContext,
  ): Promise<TreatmentPlanDocument> {
    const originalPlan = await this.repository.findByIdOrFail(planId, auditContext);

    // Can only revise presented, declined, or cancelled plans
    if (!['presented', 'cancelled'].includes(originalPlan.status)) {
      throw new BadRequestException(
        `Cannot revise a plan in '${originalPlan.status}' status. Plan must be presented or declined.`,
      );
    }

    // Build phases from DTO or copy from original
    const clonedPhaseDtos = dto.phases ?? this.clonePhases(originalPlan.phases);
    const phases = this.buildPhases(clonedPhaseDtos);

    // Calculate financials
    const financial = this.calculateFinancials(phases, dto.financialOverrides);

    // Build alternatives
    const alternatives = dto.alternatives
      ? dto.alternatives.map((alt) => ({
          name: alt.name,
          description: alt.description,
          phases: this.buildPhases(alt.phases),
          advantages: alt.advantages,
          disadvantages: alt.disadvantages,
          isRecommended: alt.isRecommended,
          totalCents: this.calculateAlternativeTotal(alt.phases),
        }))
      : originalPlan.alternatives;

    const revisedPlan = await this.repository.create(
      {
        patientId: originalPlan.patientId,
        providerId: auditContext.userId,
        title: originalPlan.title ? `${originalPlan.title} (Revised)` : 'Revised Treatment Plan',
        description: dto.notes || originalPlan.description,
        status: 'draft',
        phases: phases as TreatmentPhase[],
        alternatives: alternatives as unknown as typeof revisedPlan.alternatives,
        financial,
        approvals: [],
        previousVersionId: planId,
        revisionNumber: (originalPlan.revisionNumber || 0) + 1,
        revisionReason: dto.reason,
        expiresAt: originalPlan.expiresAt,
        preAuthorizationNumber: originalPlan.preAuthorizationNumber,
        preAuthorizationStatus: originalPlan.preAuthorizationStatus,
        clinicalNoteId: originalPlan.clinicalNoteId,
        providerNotes: `Revised from plan ${planId}.\nReason: ${dto.reason}`,
        patientQuestions: originalPlan.patientQuestions,
        tags: [...originalPlan.tags, 'revision'],
        priority: originalPlan.priority,
      },
      auditContext,
    );

    // Emit event
    const event: TreatmentPlanCreatedEvent = {
      treatmentPlanId: revisedPlan._id.toString(),
      patientId: originalPlan.patientId,
      providerId: auditContext.userId,
      tenantId: auditContext.tenantId,
      clinicId: auditContext.clinicId,
      totalCents: financial.totalCents,
      procedureCount: this.countProcedures(phases),
      phaseCount: phases.length,
      timestamp: new Date(),
    };

    this.eventEmitter.emit('treatment.plan.created', event);

    this.logger.log(`Created revision ${revisedPlan._id} of treatment plan ${planId}`);

    return revisedPlan;
  }

  // ============================================================================
  // PHASE / ITEM MANAGEMENT METHODS
  // ============================================================================

  /**
   * Add a new phase to a treatment plan
   */
  async addPhase(
    planId: string,
    dto: AddPhaseDto,
    auditContext: AuditContext,
  ): Promise<TreatmentPlanDocument> {
    const plan = await this.repository.findByIdOrFail(planId, auditContext);

    if (plan.status !== 'draft') {
      throw new ForbiddenException('Can only add phases to draft plans');
    }

    // Build the new phase
    const newPhase = this.buildPhases([dto])[0];

    // Add to existing phases
    const updatedPhases = [...plan.phases, newPhase as TreatmentPhase];

    // Recalculate financials
    const financial = this.calculateFinancials(updatedPhases, {
      insuranceCoverageCents: plan.financial.insuranceCoverageCents,
      currency: plan.financial.currency,
    });

    return this.repository.update(
      planId,
      { phases: updatedPhases, financial },
      plan.version,
      auditContext,
      `Added phase: ${dto.name}`,
    );
  }

  /**
   * Remove a phase from a treatment plan
   */
  async removePhase(
    planId: string,
    phaseId: string,
    auditContext: AuditContext,
  ): Promise<TreatmentPlanDocument> {
    const plan = await this.repository.findByIdOrFail(planId, auditContext);

    if (plan.status !== 'draft') {
      throw new ForbiddenException('Can only remove phases from draft plans');
    }

    const phaseIndex = plan.phases.findIndex((p) => p._id.toString() === phaseId);
    if (phaseIndex === -1) {
      throw new BadRequestException(`Phase ${phaseId} not found`);
    }

    // Remove the phase
    const updatedPhases = plan.phases.filter((_, i) => i !== phaseIndex);

    if (updatedPhases.length === 0) {
      throw new BadRequestException('Cannot remove the last phase. Delete the plan instead.');
    }

    // Recalculate financials
    const financial = this.calculateFinancials(updatedPhases, {
      insuranceCoverageCents: plan.financial.insuranceCoverageCents,
      currency: plan.financial.currency,
    });

    return this.repository.update(
      planId,
      { phases: updatedPhases, financial },
      plan.version,
      auditContext,
      `Removed phase: ${plan.phases[phaseIndex].name}`,
    );
  }

  /**
   * Add an item to a phase
   */
  async addItemToPhase(
    planId: string,
    phaseId: string,
    dto: AddItemToPhaseDto,
    auditContext: AuditContext,
  ): Promise<TreatmentPlanDocument> {
    const plan = await this.repository.findByIdOrFail(planId, auditContext);

    if (plan.status !== 'draft') {
      throw new ForbiddenException('Can only add items to draft plans');
    }

    const phaseIndex = plan.phases.findIndex((p) => p._id.toString() === phaseId);
    if (phaseIndex === -1) {
      throw new BadRequestException(`Phase ${phaseId} not found`);
    }

    // Build the new item
    const quantity = dto.quantity ?? 1;
    const unitPrice = dto.unitPriceCents;
    const discount = dto.discountCents ?? 0;
    const tax = dto.taxCents ?? 0;
    const total = quantity * unitPrice - discount + tax;

    const newItem: Partial<TreatmentPlanItem> = {
      procedureCode: dto.procedureCode,
      procedureName: dto.procedureName,
      teeth: dto.teeth ?? [],
      surfaces: dto.surfaces ?? [],
      quantity,
      unitPriceCents: unitPrice,
      discountCents: discount,
      discountPercent: dto.discountPercent ?? 0,
      taxCents: tax,
      totalCents: total,
      providerId: dto.providerId,
      providerName: dto.providerName,
      status: 'planned',
      materials: dto.materials ?? [],
      estimatedDurationMinutes: dto.estimatedDurationMinutes,
      notes: dto.notes,
      sortOrder: dto.sortOrder ?? plan.phases[phaseIndex].items.length,
    };

    // Add item to phase
    plan.phases[phaseIndex].items.push(newItem as TreatmentPlanItem);

    // Recalculate phase subtotal
    plan.phases[phaseIndex].subtotalCents = plan.phases[phaseIndex].items.reduce(
      (sum, item) => sum + item.totalCents,
      0,
    );

    // Recalculate overall financials
    const financial = this.calculateFinancials(plan.phases, {
      insuranceCoverageCents: plan.financial.insuranceCoverageCents,
      currency: plan.financial.currency,
    });

    return this.repository.update(
      planId,
      { phases: plan.phases, financial },
      plan.version,
      auditContext,
      `Added item: ${dto.procedureCode}`,
    );
  }

  /**
   * Update an item in a phase
   */
  async updateItem(
    planId: string,
    phaseId: string,
    itemId: string,
    dto: UpdateTreatmentPlanItemDto,
    auditContext: AuditContext,
  ): Promise<TreatmentPlanDocument> {
    const plan = await this.repository.findByIdOrFail(planId, auditContext);

    if (plan.status !== 'draft') {
      throw new ForbiddenException('Can only update items in draft plans');
    }

    const phase = plan.phases.find((p) => p._id.toString() === phaseId);
    if (!phase) {
      throw new BadRequestException(`Phase ${phaseId} not found`);
    }

    const itemIndex = phase.items.findIndex((i) => i._id.toString() === itemId);
    if (itemIndex === -1) {
      throw new BadRequestException(`Item ${itemId} not found in phase`);
    }

    // Update item fields
    const item = phase.items[itemIndex];
    if (dto.procedureCode !== undefined) item.procedureCode = dto.procedureCode;
    if (dto.procedureName !== undefined) item.procedureName = dto.procedureName;
    if (dto.teeth !== undefined) item.teeth = dto.teeth;
    if (dto.surfaces !== undefined) item.surfaces = dto.surfaces as string[];
    if (dto.quantity !== undefined) item.quantity = dto.quantity;
    if (dto.unitPriceCents !== undefined) item.unitPriceCents = dto.unitPriceCents;
    if (dto.discountCents !== undefined) item.discountCents = dto.discountCents;
    if (dto.discountPercent !== undefined) item.discountPercent = dto.discountPercent;
    if (dto.taxCents !== undefined) item.taxCents = dto.taxCents;
    if (dto.providerId !== undefined) item.providerId = dto.providerId;
    if (dto.providerName !== undefined) item.providerName = dto.providerName;
    if (dto.materials !== undefined) item.materials = dto.materials as typeof item.materials;
    if (dto.estimatedDurationMinutes !== undefined)
      item.estimatedDurationMinutes = dto.estimatedDurationMinutes;
    if (dto.notes !== undefined) item.notes = dto.notes;
    if (dto.sortOrder !== undefined) item.sortOrder = dto.sortOrder;

    // Recalculate item total
    item.totalCents = item.quantity * item.unitPriceCents - item.discountCents + item.taxCents;

    // Recalculate phase subtotal
    phase.subtotalCents = phase.items.reduce((sum, i) => sum + i.totalCents, 0);

    // Recalculate overall financials
    const financial = this.calculateFinancials(plan.phases, {
      insuranceCoverageCents: plan.financial.insuranceCoverageCents,
      currency: plan.financial.currency,
    });

    return this.repository.update(
      planId,
      { phases: plan.phases, financial },
      plan.version,
      auditContext,
      `Updated item: ${item.procedureCode}`,
    );
  }

  /**
   * Remove an item from a phase
   */
  async removeItem(
    planId: string,
    phaseId: string,
    itemId: string,
    auditContext: AuditContext,
  ): Promise<TreatmentPlanDocument> {
    const plan = await this.repository.findByIdOrFail(planId, auditContext);

    if (plan.status !== 'draft') {
      throw new ForbiddenException('Can only remove items from draft plans');
    }

    const phaseIndex = plan.phases.findIndex((p) => p._id.toString() === phaseId);
    if (phaseIndex === -1) {
      throw new BadRequestException(`Phase ${phaseId} not found`);
    }

    const itemIndex = plan.phases[phaseIndex].items.findIndex((i) => i._id.toString() === itemId);
    if (itemIndex === -1) {
      throw new BadRequestException(`Item ${itemId} not found in phase`);
    }

    const removedItem = plan.phases[phaseIndex].items[itemIndex];

    // Remove the item
    plan.phases[phaseIndex].items.splice(itemIndex, 1);

    // If phase is now empty, remove the phase (unless it's the last one)
    if (plan.phases[phaseIndex].items.length === 0 && plan.phases.length > 1) {
      plan.phases.splice(phaseIndex, 1);
    } else if (plan.phases[phaseIndex].items.length === 0) {
      throw new BadRequestException(
        'Cannot remove the last item from the last phase. Delete the plan instead.',
      );
    } else {
      // Recalculate phase subtotal
      plan.phases[phaseIndex].subtotalCents = plan.phases[phaseIndex].items.reduce(
        (sum, item) => sum + item.totalCents,
        0,
      );
    }

    // Recalculate overall financials
    const financial = this.calculateFinancials(plan.phases, {
      insuranceCoverageCents: plan.financial.insuranceCoverageCents,
      currency: plan.financial.currency,
    });

    return this.repository.update(
      planId,
      { phases: plan.phases, financial },
      plan.version,
      auditContext,
      `Removed item: ${removedItem.procedureCode}`,
    );
  }

  /**
   * Schedule an item as an appointment
   */
  async scheduleItem(
    planId: string,
    phaseId: string,
    itemId: string,
    dto: ScheduleItemDto,
    auditContext: AuditContext,
  ): Promise<TreatmentPlanDocument> {
    const plan = await this.repository.findByIdOrFail(planId, auditContext);

    // Must be accepted or in_progress to schedule
    if (!['accepted', 'in_progress'].includes(plan.status)) {
      throw new BadRequestException(`Cannot schedule items in a plan with status '${plan.status}'`);
    }

    const phase = plan.phases.find((p) => p._id.toString() === phaseId);
    if (!phase) {
      throw new BadRequestException(`Phase ${phaseId} not found`);
    }

    const item = phase.items.find((i) => i._id.toString() === itemId);
    if (!item) {
      throw new BadRequestException(`Item ${itemId} not found in phase`);
    }

    if (item.status === 'completed') {
      throw new BadRequestException('Cannot schedule a completed item');
    }

    if (item.status === 'cancelled') {
      throw new BadRequestException('Cannot schedule a cancelled item');
    }

    // Update item with appointment info
    item.status = 'scheduled';
    item.appointmentId = dto.appointmentId;
    item.scheduledFor = dto.proposedDateTime;
    if (dto.providerId) item.providerId = dto.providerId;

    // Save updates
    const updated = await this.repository.update(
      planId,
      { phases: plan.phases },
      plan.version,
      auditContext,
      `Scheduled item: ${item.procedureCode}`,
    );

    // Emit event
    const event: TreatmentItemScheduledEvent = {
      treatmentPlanId: planId,
      phaseId,
      itemId,
      patientId: plan.patientId,
      tenantId: auditContext.tenantId,
      clinicId: auditContext.clinicId,
      procedureCode: item.procedureCode,
      procedureName: item.procedureName,
      appointmentId: dto.appointmentId || '',
      scheduledFor: dto.proposedDateTime,
      providerId: dto.providerId,
      timestamp: new Date(),
    };

    this.eventEmitter.emit('treatment.item.scheduled', event);

    this.logger.log(`Scheduled item ${itemId} (${item.procedureCode}) in treatment plan ${planId}`);

    return updated;
  }

  // ============================================================================
  // ALTERNATIVES MANAGEMENT METHODS
  // ============================================================================

  /**
   * Add an alternative to a treatment plan
   */
  async addAlternative(
    planId: string,
    dto: AddAlternativeDto,
    auditContext: AuditContext,
  ): Promise<TreatmentPlanDocument> {
    const plan = await this.repository.findByIdOrFail(planId, auditContext);

    if (plan.status !== 'draft') {
      throw new ForbiddenException('Can only add alternatives to draft plans');
    }

    // If this is marked as recommended, unmark others
    if (dto.isRecommended) {
      for (const alt of plan.alternatives) {
        alt.isRecommended = false;
      }
    }

    // Build the new alternative
    const newAlternative = {
      name: dto.name,
      description: dto.description,
      phases: this.buildPhases(dto.phases) as TreatmentPhase[],
      advantages: dto.advantages,
      disadvantages: dto.disadvantages,
      isRecommended: dto.isRecommended,
      totalCents: this.calculateAlternativeTotal(dto.phases),
    };

    const updatedAlternatives = [...plan.alternatives, newAlternative];

    return this.repository.update(
      planId,
      { alternatives: updatedAlternatives as typeof plan.alternatives },
      plan.version,
      auditContext,
      `Added alternative: ${dto.name}`,
    );
  }

  /**
   * Remove an alternative from a treatment plan
   */
  async removeAlternative(
    planId: string,
    alternativeId: string,
    auditContext: AuditContext,
  ): Promise<TreatmentPlanDocument> {
    const plan = await this.repository.findByIdOrFail(planId, auditContext);

    if (plan.status !== 'draft') {
      throw new ForbiddenException('Can only remove alternatives from draft plans');
    }

    const altIndex = plan.alternatives.findIndex((a) => a._id.toString() === alternativeId);
    if (altIndex === -1) {
      throw new BadRequestException(`Alternative ${alternativeId} not found`);
    }

    const removedAlt = plan.alternatives[altIndex];
    const updatedAlternatives = plan.alternatives.filter((_, i) => i !== altIndex);

    return this.repository.update(
      planId,
      { alternatives: updatedAlternatives },
      plan.version,
      auditContext,
      `Removed alternative: ${removedAlt.name}`,
    );
  }

  // ============================================================================
  // FINANCIAL CALCULATION METHODS
  // ============================================================================

  /**
   * Calculate financials for a treatment plan
   */
  calculateFinancials(
    phases: TreatmentPhase[] | Partial<TreatmentPhase>[],
    overrides?: {
      insuranceCoverageCents?: number;
      patientResponsibilityCents?: number;
      currency?: string;
      paymentPlan?: {
        downPaymentCents: number;
        installments: number;
        frequency: 'weekly' | 'biweekly' | 'monthly';
        interestRatePercent?: number;
      };
    },
  ): TreatmentFinancials {
    let subtotalCents = 0;
    let discountTotalCents = 0;
    let taxTotalCents = 0;

    for (const phase of phases) {
      if (!phase.items) continue;
      for (const item of phase.items) {
        const itemSubtotal = (item.quantity || 1) * (item.unitPriceCents || 0);
        subtotalCents += itemSubtotal;
        discountTotalCents += item.discountCents || 0;
        taxTotalCents += item.taxCents || 0;
      }
    }

    const totalCents = subtotalCents - discountTotalCents + taxTotalCents;

    // Calculate patient responsibility
    const insuranceCoverageCents = overrides?.insuranceCoverageCents ?? 0;
    const patientResponsibilityCents =
      overrides?.patientResponsibilityCents ?? totalCents - insuranceCoverageCents;

    // Build payment plan if specified
    let paymentPlan = undefined;
    if (overrides?.paymentPlan) {
      const pp = overrides.paymentPlan;
      const amountToFinance = patientResponsibilityCents - pp.downPaymentCents;
      const interestRate = (pp.interestRatePercent ?? 0) / 100;
      const totalWithInterest = Math.round(amountToFinance * (1 + interestRate));
      const installmentAmount = Math.ceil(totalWithInterest / pp.installments);

      paymentPlan = {
        downPaymentCents: pp.downPaymentCents,
        installments: pp.installments,
        frequency: pp.frequency,
        installmentAmountCents: installmentAmount,
        interestRatePercent: pp.interestRatePercent ?? 0,
        totalAmountCents: pp.downPaymentCents + totalWithInterest,
      };
    }

    return {
      subtotalCents,
      discountTotalCents,
      taxTotalCents,
      totalCents,
      insuranceCoverageCents: insuranceCoverageCents || undefined,
      patientResponsibilityCents,
      currency: overrides?.currency ?? 'RON',
      paymentPlan,
    };
  }

  /**
   * Recalculate financials for an existing plan
   */
  async recalculateFinancials(
    planId: string,
    auditContext: AuditContext,
  ): Promise<TreatmentPlanDocument> {
    const plan = await this.repository.findByIdOrFail(planId, auditContext);

    if (plan.status !== 'draft') {
      throw new ForbiddenException('Can only recalculate financials for draft plans');
    }

    // Recalculate phase subtotals
    for (const phase of plan.phases) {
      phase.subtotalCents = phase.items.reduce((sum, item) => sum + item.totalCents, 0);
      phase.estimatedDurationMinutes = phase.items.reduce(
        (sum, item) => sum + (item.estimatedDurationMinutes || 0),
        0,
      );
    }

    // Recalculate overall financials
    const financial = this.calculateFinancials(plan.phases, {
      insuranceCoverageCents: plan.financial.insuranceCoverageCents,
      currency: plan.financial.currency,
      paymentPlan: plan.financial.paymentPlan
        ? {
            downPaymentCents: plan.financial.paymentPlan.downPaymentCents,
            installments: plan.financial.paymentPlan.installments,
            frequency: plan.financial.paymentPlan.frequency,
            interestRatePercent: plan.financial.paymentPlan.interestRatePercent,
          }
        : undefined,
    });

    return this.repository.update(
      planId,
      { phases: plan.phases, financial },
      plan.version,
      auditContext,
      'Financials recalculated',
    );
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Validate status transition is allowed
   */
  private validateStatusTransition(
    currentStatus: TreatmentPlanStatus,
    targetStatus: TreatmentPlanStatus,
  ): void {
    const allowedTransitions = VALID_STATUS_TRANSITIONS[currentStatus];

    if (!allowedTransitions.includes(targetStatus)) {
      throw new BadRequestException(
        `Invalid status transition from '${currentStatus}' to '${targetStatus}'. ` +
          `Allowed transitions: ${allowedTransitions.join(', ') || 'none'}`,
      );
    }
  }

  /**
   * Build phases from DTO input
   */
  private buildPhases(
    phaseDtos: Array<{
      phaseNumber: number;
      name: string;
      description?: string;
      sequenceRequired?: boolean;
      items: Array<{
        procedureCode: string;
        procedureName: string;
        teeth?: string[];
        surfaces?: string[];
        quantity?: number;
        unitPriceCents: number;
        discountCents?: number;
        discountPercent?: number;
        taxCents?: number;
        providerId?: string;
        providerName?: string;
        materials?: Array<{
          catalogItemId: string;
          itemName: string;
          quantity: number;
          unit?: string;
          estimatedCost?: number;
        }>;
        estimatedDurationMinutes?: number;
        notes?: string;
        sortOrder?: number;
      }>;
      sortOrder?: number;
    }>,
  ): Partial<TreatmentPhase>[] {
    return phaseDtos.map((phaseDto, phaseIndex) => {
      const items = phaseDto.items.map((itemDto, itemIndex) => {
        const quantity = itemDto.quantity ?? 1;
        const unitPrice = itemDto.unitPriceCents;
        const discount = itemDto.discountCents ?? 0;
        const tax = itemDto.taxCents ?? 0;
        const total = quantity * unitPrice - discount + tax;

        return {
          procedureCode: itemDto.procedureCode,
          procedureName: itemDto.procedureName,
          teeth: itemDto.teeth ?? [],
          surfaces: itemDto.surfaces ?? [],
          quantity,
          unitPriceCents: unitPrice,
          discountCents: discount,
          discountPercent: itemDto.discountPercent ?? 0,
          taxCents: tax,
          totalCents: total,
          providerId: itemDto.providerId,
          providerName: itemDto.providerName,
          status: 'planned' as const,
          materials: itemDto.materials ?? [],
          estimatedDurationMinutes: itemDto.estimatedDurationMinutes,
          notes: itemDto.notes,
          sortOrder: itemDto.sortOrder ?? itemIndex,
        };
      });

      const subtotalCents = items.reduce((sum, item) => sum + item.totalCents, 0);
      const estimatedDurationMinutes = items.reduce(
        (sum, item) => sum + (item.estimatedDurationMinutes || 0),
        0,
      );

      return {
        phaseNumber: phaseDto.phaseNumber,
        name: phaseDto.name,
        description: phaseDto.description,
        sequenceRequired: phaseDto.sequenceRequired ?? false,
        items: items as TreatmentPlanItem[],
        subtotalCents,
        estimatedDurationMinutes,
        sortOrder: phaseDto.sortOrder ?? phaseIndex,
      };
    });
  }

  /**
   * Calculate total for an alternative
   */
  private calculateAlternativeTotal(
    phases: Array<{
      items: Array<{
        quantity?: number;
        unitPriceCents: number;
        discountCents?: number;
        taxCents?: number;
      }>;
    }>,
  ): number {
    let total = 0;
    for (const phase of phases) {
      for (const item of phase.items) {
        const quantity = item.quantity ?? 1;
        const unitPrice = item.unitPriceCents;
        const discount = item.discountCents ?? 0;
        const tax = item.taxCents ?? 0;
        total += quantity * unitPrice - discount + tax;
      }
    }
    return total;
  }

  /**
   * Count total procedures across all phases
   */
  private countProcedures(phases: TreatmentPhase[] | Partial<TreatmentPhase>[]): number {
    return phases.reduce((count, phase) => count + (phase.items?.length ?? 0), 0);
  }

  /**
   * Clone phases for revision (deep copy without _id)
   * Returns data compatible with buildPhases input format
   */
  private clonePhases(phases: TreatmentPhase[]): Array<{
    phaseNumber: number;
    name: string;
    description?: string;
    sequenceRequired?: boolean;
    items: Array<{
      procedureCode: string;
      procedureName: string;
      teeth?: string[];
      surfaces?: string[];
      quantity?: number;
      unitPriceCents: number;
      discountCents?: number;
      discountPercent?: number;
      taxCents?: number;
      providerId?: string;
      providerName?: string;
      materials?: Array<{
        catalogItemId: string;
        itemName: string;
        quantity: number;
        unit?: string;
        estimatedCost?: number;
      }>;
      estimatedDurationMinutes?: number;
      notes?: string;
      sortOrder?: number;
    }>;
    sortOrder?: number;
  }> {
    return phases.map((phase) => ({
      phaseNumber: phase.phaseNumber,
      name: phase.name,
      description: phase.description,
      sequenceRequired: phase.sequenceRequired,
      items: phase.items.map((item) => ({
        procedureCode: item.procedureCode,
        procedureName: item.procedureName,
        teeth: [...item.teeth],
        surfaces: [...item.surfaces],
        quantity: item.quantity,
        unitPriceCents: item.unitPriceCents,
        discountCents: item.discountCents,
        discountPercent: item.discountPercent,
        taxCents: item.taxCents,
        providerId: item.providerId,
        providerName: item.providerName,
        materials: item.materials.map((m) => ({
          catalogItemId: m.catalogItemId,
          itemName: m.itemName,
          quantity: m.quantity,
          unit: m.unit,
          estimatedCost: m.estimatedCost,
        })),
        estimatedDurationMinutes: item.estimatedDurationMinutes,
        notes: item.notes,
        sortOrder: item.sortOrder,
      })),
      sortOrder: phase.sortOrder,
    }));
  }
}
