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
  async getById(
    planId: string,
    context: TenantContext,
  ): Promise<TreatmentPlanDocument> {
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
      updates.financial = this.calculateFinancials(
        updates.phases,
        dto.financialOverrides,
      );
    } else if (dto.financialOverrides) {
      // Just updating financial overrides
      updates.financial = this.calculateFinancials(
        plan.phases,
        dto.financialOverrides,
      );
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
      throw new BadRequestException(
        'Cannot present a treatment plan with no procedures',
      );
    }

    const updated = await this.repository.updateStatus(
      planId,
      'presented',
      auditContext,
      {
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
      },
    );

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

    const updated = await this.repository.updateStatus(
      planId,
      'accepted',
      auditContext,
      {
        reason: `Plan accepted by ${dto.approvedBy}`,
        additionalUpdates: {
          acceptedAt: new Date(),
          selectedAlternativeId: dto.selectedAlternativeId,
          approvals: [...plan.approvals, approval] as TreatmentApproval[],
        },
      },
    );

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

    this.logger.log(
      `Treatment plan ${planId} accepted by ${dto.approvedBy} (${dto.approverId})`,
    );

    return updated;
  }

  /**
   * Start treatment (begin executing procedures)
   *
   * Transitions: accepted -> in_progress
   */
  async startTreatment(
    planId: string,
    auditContext: AuditContext,
  ): Promise<TreatmentPlanDocument> {
    const plan = await this.repository.findByIdOrFail(planId, auditContext);

    // Validate transition
    this.validateStatusTransition(plan.status, 'in_progress');

    return this.repository.updateStatus(
      planId,
      'in_progress',
      auditContext,
      {
        reason: 'Treatment started',
        additionalUpdates: {
          startedAt: new Date(),
        },
      },
    );
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
      throw new BadRequestException(
        `Cannot complete items in a plan with status '${plan.status}'`,
      );
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
      materials: dto.materialsUsed.length > 0
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
          (updated.completedAt!.getTime() - plan.startedAt!.getTime()) /
            (1000 * 60 * 60 * 24),
        ),
        timestamp: new Date(),
      };

      this.eventEmitter.emit('treatment.plan.completed', completedEvent);
    }

    this.logger.log(
      `Completed procedure ${item.procedureCode} in treatment plan ${planId}`,
    );

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

    const updated = await this.repository.updateStatus(
      planId,
      'cancelled',
      auditContext,
      {
        reason: dto.reason,
        additionalUpdates: {
          cancelledAt: new Date(),
          cancelledBy: auditContext.userId,
          cancellationReason: dto.reason,
        },
      },
    );

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

    this.logger.warn(
      `Cancelled treatment plan ${planId}. Reason: ${dto.reason}`,
    );

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
      throw new ForbiddenException(
        'Can only recalculate financials for draft plans',
      );
    }

    // Recalculate phase subtotals
    for (const phase of plan.phases) {
      phase.subtotalCents = phase.items.reduce(
        (sum, item) => sum + item.totalCents,
        0,
      );
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
    return phases.reduce(
      (count, phase) => count + (phase.items?.length ?? 0),
      0,
    );
  }
}
