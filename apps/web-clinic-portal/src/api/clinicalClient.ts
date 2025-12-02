/**
 * Clinical API Client - Notes, Procedures, Treatment Plans
 */

import { createApiClient } from './axiosInstance';
import { env } from '../config/env';

const client = createApiClient(env.CLINICAL_API_URL);

export type NoteStatus = 'draft' | 'signed' | 'amended';

export interface NoteSignature {
  signedBy: string;
  signedByName: string;
  signedByCredentials: string;
  signedAt: string;
}

export interface NoteAmendment {
  id: string;
  version: number;
  amendedBy: string;
  amendedByName: string;
  amendedAt: string;
  reason: string;
  soap?: {
    subjective?: string;
    objective?: string;
    assessment?: string;
    plan?: string;
  };
  content?: string;
  signature?: NoteSignature;
}

export interface ClinicalNoteDto {
  id: string;
  patientId: string;
  providerId: string;
  providerName?: string;
  providerCredentials?: string;
  type: 'soap' | 'progress' | 'consult' | 'emergency' | 'operative';
  title: string;
  encounterDate: string;
  soap?: {
    subjective?: string;
    objective?: string;
    assessment?: string;
    plan?: string;
  };
  content?: string;
  isFinalized: boolean;
  isSigned: boolean;
  status: NoteStatus;
  signature?: NoteSignature;
  amendments?: NoteAmendment[];
  version: number;
  attachments: Array<{
    fileId: string;
    filename: string;
    category: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface SignNoteRequest {
  password: string;
}

export interface SignNoteResponse {
  success: boolean;
  note: ClinicalNoteDto;
  message: string;
}

export interface AmendNoteRequest {
  password: string;
  reason: string;
  soap?: {
    subjective?: string;
    objective?: string;
    assessment?: string;
    plan?: string;
  };
  content?: string;
}

export interface AmendNoteResponse {
  success: boolean;
  note: ClinicalNoteDto;
  amendment: NoteAmendment;
  message: string;
}

// ============================================================================
// TREATMENT PLAN TYPES - Aligned with backend API
// ============================================================================

/**
 * Treatment plan statuses with defined transitions
 */
export type TreatmentPlanStatus =
  | 'draft'
  | 'presented'
  | 'accepted'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

/**
 * Procedure item statuses
 */
export type ProcedureItemStatus = 'planned' | 'scheduled' | 'completed' | 'cancelled';

/**
 * Payment plan frequencies
 */
export type PaymentFrequency = 'weekly' | 'biweekly' | 'monthly';

/**
 * Approval types
 */
export type ApprovalType = 'patient' | 'provider' | 'insurance' | 'guardian';

/**
 * Material requirement for a procedure
 */
export interface MaterialRequirementDto {
  catalogItemId: string;
  itemName: string;
  quantity: number;
  unit?: string;
  estimatedCost?: number;
}

/**
 * Individual procedure item within a treatment phase
 */
export interface TreatmentPlanItemDto {
  id?: string;
  procedureCode: string;
  procedureName: string;
  teeth: string[];
  surfaces: string[];
  quantity: number;
  unitPriceCents: number;
  discountCents: number;
  discountPercent: number;
  taxCents: number;
  totalCents?: number;
  providerId?: string;
  providerName?: string;
  status?: ProcedureItemStatus;
  materials: MaterialRequirementDto[];
  estimatedDurationMinutes?: number;
  notes?: string;
  appointmentId?: string;
  completedProcedureId?: string;
  completedAt?: string;
  completedBy?: string;
  sortOrder: number;
}

/**
 * Treatment phase grouping related procedures
 */
export interface TreatmentPhaseDto {
  id?: string;
  phaseNumber: number;
  name: string;
  description?: string;
  sequenceRequired: boolean;
  items: TreatmentPlanItemDto[];
  subtotalCents?: number;
  estimatedDurationMinutes?: number;
  sortOrder: number;
}

/**
 * Alternative treatment plan option
 */
export interface TreatmentAlternativeDto {
  id?: string;
  name: string;
  description?: string;
  phases: TreatmentPhaseDto[];
  advantages: string[];
  disadvantages: string[];
  isRecommended: boolean;
  totalCents?: number;
}

/**
 * Payment plan configuration
 */
export interface PaymentPlanDto {
  downPaymentCents: number;
  installments: number;
  frequency: PaymentFrequency;
  installmentAmountCents?: number;
  interestRatePercent: number;
  totalAmountCents?: number;
}

/**
 * Financial summary for the treatment plan
 */
export interface TreatmentFinancialsDto {
  subtotalCents: number;
  discountTotalCents: number;
  taxTotalCents: number;
  totalCents: number;
  insuranceCoverageCents?: number;
  patientResponsibilityCents?: number;
  currency: string;
  paymentPlan?: PaymentPlanDto;
}

/**
 * Approval record for treatment plan acceptance
 */
export interface TreatmentApprovalDto {
  id?: string;
  approvedBy: ApprovalType;
  approverId: string;
  approverName: string;
  signatureRef?: string;
  consentFormId?: string;
  consentFormVersion?: string;
  approvedAt?: string;
  ipAddress?: string;
  userAgent?: string;
  approvalMethod?: 'electronic' | 'in-person' | 'verbal' | 'written';
  notes?: string;
}

/**
 * Complete treatment plan response from backend
 */
export interface TreatmentPlanDto {
  id: string;
  patientId: string;
  providerId: string;
  providerName?: string;
  tenantId: string;
  organizationId: string;
  clinicId: string;
  title?: string;
  description?: string;
  status: TreatmentPlanStatus;
  phases: TreatmentPhaseDto[];
  alternatives: TreatmentAlternativeDto[];
  selectedAlternativeId?: string;
  financial: TreatmentFinancialsDto;
  approvals: TreatmentApprovalDto[];
  presentedAt?: string;
  presentedBy?: string;
  acceptedAt?: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  cancellationReason?: string;
  expiresAt?: string;
  preAuthorizationNumber?: string;
  preAuthorizationStatus?: 'pending' | 'approved' | 'denied' | 'not_required';
  clinicalNoteId?: string;
  appointmentId?: string;
  providerNotes?: string;
  patientQuestions?: string[];
  tags: string[];
  priority: 'low' | 'normal' | 'high' | 'urgent';
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

/**
 * DTO for creating a treatment plan
 */
export interface CreateTreatmentPlanDto {
  title?: string;
  description?: string;
  phases: Omit<TreatmentPhaseDto, 'id' | 'subtotalCents' | 'estimatedDurationMinutes'>[];
  alternatives?: Omit<TreatmentAlternativeDto, 'id' | 'totalCents'>[];
  financialOverrides?: {
    insuranceCoverageCents?: number;
    patientResponsibilityCents?: number;
    currency?: string;
    paymentPlan?: Omit<PaymentPlanDto, 'installmentAmountCents' | 'totalAmountCents'>;
  };
  expiresAt?: string;
  preAuthorizationNumber?: string;
  preAuthorizationStatus?: 'pending' | 'approved' | 'denied' | 'not_required';
  clinicalNoteId?: string;
  appointmentId?: string;
  providerNotes?: string;
  tags?: string[];
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

/**
 * DTO for updating a treatment plan
 */
export interface UpdateTreatmentPlanDto {
  title?: string;
  description?: string;
  phases?: TreatmentPhaseDto[];
  alternatives?: TreatmentAlternativeDto[];
  financialOverrides?: {
    insuranceCoverageCents?: number;
    patientResponsibilityCents?: number;
    currency?: string;
    paymentPlan?: PaymentPlanDto;
  };
  expiresAt?: string;
  preAuthorizationNumber?: string;
  preAuthorizationStatus?: 'pending' | 'approved' | 'denied' | 'not_required';
  providerNotes?: string;
  tags?: string[];
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

/**
 * DTO for presenting a treatment plan
 */
export interface PresentTreatmentPlanDto {
  presentationNotes?: string;
  patientQuestions?: string[];
  expiresAt?: string;
}

/**
 * DTO for accepting a treatment plan
 */
export interface AcceptTreatmentPlanDto {
  approvedBy: ApprovalType;
  approverId: string;
  approverName: string;
  signatureRef?: string;
  consentFormId?: string;
  consentFormVersion?: string;
  ipAddress?: string;
  userAgent?: string;
  approvalMethod?: 'electronic' | 'in-person' | 'verbal' | 'written';
  notes?: string;
  selectedAlternativeId?: string;
}

/**
 * DTO for completing a procedure item
 */
export interface CompleteProcedureItemDto {
  completedProcedureId?: string;
  materialsUsed?: Array<{
    catalogItemId: string;
    itemName: string;
    quantity: number;
    batchNumber?: string;
    lotNumber?: string;
  }>;
  notes?: string;
  actualDurationMinutes?: number;
  performedBy?: string;
  outcome?: 'successful' | 'partial' | 'failed' | 'complicated';
}

/**
 * DTO for cancelling a treatment plan
 */
export interface CancelTreatmentPlanDto {
  reason: string;
  notes?: string;
}

/**
 * Query parameters for listing treatment plans
 */
export interface TreatmentPlanQueryDto {
  status?: TreatmentPlanStatus;
  providerId?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  fromDate?: string;
  toDate?: string;
  includeDeleted?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'presentedAt' | 'acceptedAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated treatment plans response
 */
export interface PaginatedTreatmentPlansDto {
  data: TreatmentPlanDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Treatment plan history entry
 */
export interface TreatmentPlanHistoryEntry {
  id: string;
  treatmentPlanId: string;
  patientId: string;
  changeType:
    | 'created'
    | 'updated'
    | 'status_changed'
    | 'presented'
    | 'accepted'
    | 'item_completed'
    | 'item_scheduled'
    | 'cancelled'
    | 'deleted'
    | 'approval_added'
    | 'financial_updated';
  previousStatus?: string;
  newStatus?: string;
  changes?: Record<string, unknown>;
  documentSnapshot?: Record<string, unknown>;
  changedBy: string;
  reason?: string;
  itemId?: string;
  createdAt: string;
}

/**
 * Treatment plan history response
 */
export interface TreatmentPlanHistoryResponse {
  data: TreatmentPlanHistoryEntry[];
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
}

/**
 * Status counts response (for dashboard)
 */
export interface TreatmentPlanStatusCountsDto {
  draft: number;
  presented: number;
  accepted: number;
  in_progress: number;
  completed: number;
  cancelled: number;
  total: number;
}

export interface ProcedureDto {
  id: string;
  patientId: string;
  providerId: string;
  code: string;
  description: string;
  procedureDate: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  teeth: number[];
  fee: number;
}

// ============================================================================
// ODONTOGRAM TYPES - Aligned with backend API
// ============================================================================

/**
 * Tooth surfaces (FDI standard)
 */
export type ToothSurface = 'M' | 'O' | 'D' | 'B' | 'L' | 'I';

/**
 * Tooth conditions (clinical terminology)
 */
export type ToothConditionType =
  | 'healthy'
  | 'caries'
  | 'filling'
  | 'crown'
  | 'root_canal'
  | 'extraction'
  | 'implant'
  | 'bridge'
  | 'veneer'
  | 'missing'
  | 'impacted'
  | 'fractured'
  | 'watch'
  | 'sealant'
  | 'temporary'
  | 'post_and_core'
  | 'onlay_inlay'
  | 'abscess'
  | 'mobile'
  | 'root_remnants';

/**
 * Condition severity levels
 */
export type ConditionSeverity = 'mild' | 'moderate' | 'severe';

/**
 * Restoration materials
 */
export type RestorationMaterial =
  | 'amalgam'
  | 'composite'
  | 'glass_ionomer'
  | 'ceramic'
  | 'porcelain'
  | 'gold'
  | 'titanium'
  | 'zirconia'
  | 'emax'
  | 'pfm'
  | 'temporary'
  | 'other';

/**
 * Furcation classes
 */
export type FurcationClass = 'none' | 'class_1' | 'class_2' | 'class_3';

/**
 * Condition record from backend
 */
export interface ToothConditionRecord {
  id: string;
  condition: ToothConditionType;
  surfaces: ToothSurface[];
  severity?: ConditionSeverity;
  material?: RestorationMaterial;
  recordedAt: string;
  recordedBy: string;
  notes?: string;
  procedureId?: string;
  cdtCode?: string;
  deletedAt?: string;
}

/**
 * Single tooth data
 */
export interface ToothDataDto {
  toothNumber: string;
  isPresent: boolean;
  isPrimary: boolean;
  isSupernumerary: boolean;
  isImplant: boolean;
  conditions: ToothConditionRecord[];
  mobility?: number;
  furcation?: FurcationClass;
  notes?: string;
  updatedAt: string;
  updatedBy?: string;
}

/**
 * Complete odontogram response from backend
 */
export interface OdontogramDto {
  id: string;
  patientId: string;
  tenantId: string;
  organizationId: string;
  clinicId: string;
  teeth: Record<string, ToothDataDto>;
  numberingSystem: string;
  isAdultDentition: boolean;
  generalNotes?: string;
  updatedBy: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO for adding a condition to a tooth
 */
export interface AddConditionDto {
  condition: ToothConditionType;
  surfaces?: ToothSurface[];
  severity?: ConditionSeverity;
  material?: RestorationMaterial;
  notes?: string;
  procedureId?: string;
  cdtCode?: string;
  recordedAt?: string;
}

/**
 * DTO for updating a tooth
 */
export interface UpdateToothDto {
  isPresent?: boolean;
  isPrimary?: boolean;
  isSupernumerary?: boolean;
  isImplant?: boolean;
  mobility?: number;
  furcation?: FurcationClass;
  notes?: string;
}

/**
 * DTO for removing a condition
 */
export interface RemoveConditionDto {
  reason: string;
}

/**
 * Single tooth update for bulk operations
 */
export interface BulkToothUpdateDto extends UpdateToothDto {
  toothNumber: string;
  conditions?: AddConditionDto[];
}

/**
 * DTO for bulk updating teeth
 */
export interface BulkUpdateTeethDto {
  teeth: BulkToothUpdateDto[];
}

/**
 * Query parameters for tooth history
 */
export interface GetToothHistoryQueryDto {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
}

/**
 * Tooth history entry
 */
export interface ToothHistoryEntry {
  id: string;
  toothNumber: string;
  changeType: 'condition_added' | 'condition_removed' | 'condition_updated' | 'tooth_updated';
  conditionId?: string;
  previousState?: Record<string, unknown>;
  newState?: Record<string, unknown>;
  changedBy: string;
  reason?: string;
  appointmentId?: string;
  procedureId?: string;
  createdAt: string;
}

/**
 * Paginated tooth history response
 */
export interface ToothHistoryResponse {
  data: ToothHistoryEntry[];
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
}

export interface ProcedureCatalogItem {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  defaultPrice: number;
  estimatedDuration?: number;
}

export interface ProcedureCatalogResponse {
  data: ProcedureCatalogItem[];
  total: number;
}

export const clinicalClient = {
  // Clinical Notes
  createNote: (data: Partial<ClinicalNoteDto>) =>
    client.post<ClinicalNoteDto>(`/clinical/patients/${data.patientId}/notes`, data),

  getNotes: (patientId: string) =>
    client.get<ClinicalNoteDto[]>(`/clinical/patients/${patientId}/notes`),

  getNote: (patientId: string, noteId: string) =>
    client.get<ClinicalNoteDto>(`/clinical/patients/${patientId}/notes/${noteId}`),

  signNote: (patientId: string, noteId: string, data: SignNoteRequest) =>
    client.post<SignNoteResponse>(`/clinical/patients/${patientId}/notes/${noteId}/sign`, data),

  amendNote: (patientId: string, noteId: string, data: AmendNoteRequest) =>
    client.post<AmendNoteResponse>(`/clinical/patients/${patientId}/notes/${noteId}/amend`, data),

  // ============================================================================
  // TREATMENT PLANS - Full API surface aligned with backend
  // ============================================================================

  // Create a new treatment plan
  createTreatmentPlan: (patientId: string, data: CreateTreatmentPlanDto) =>
    client.post<TreatmentPlanDto>(
      `/clinical/patients/${patientId}/treatment-plans`,
      data
    ),

  // List all treatment plans for a patient
  getTreatmentPlans: (patientId: string, query?: TreatmentPlanQueryDto) =>
    client.get<PaginatedTreatmentPlansDto>(
      `/clinical/patients/${patientId}/treatment-plans`,
      { params: query }
    ),

  // Get patient's active treatment plan
  getActiveTreatmentPlan: (patientId: string) =>
    client.get<TreatmentPlanDto | null>(
      `/clinical/patients/${patientId}/treatment-plans/active`
    ),

  // Get a specific treatment plan
  getTreatmentPlan: (patientId: string, planId: string) =>
    client.get<TreatmentPlanDto>(
      `/clinical/patients/${patientId}/treatment-plans/${planId}`
    ),

  // Update a treatment plan (draft status only)
  updateTreatmentPlan: (
    patientId: string,
    planId: string,
    data: UpdateTreatmentPlanDto,
    expectedVersion?: number
  ) =>
    client.put<TreatmentPlanDto>(
      `/clinical/patients/${patientId}/treatment-plans/${planId}`,
      data,
      {
        headers: expectedVersion
          ? { 'x-expected-version': expectedVersion.toString() }
          : undefined,
      }
    ),

  // Present treatment plan to patient
  presentTreatmentPlan: (patientId: string, planId: string, data: PresentTreatmentPlanDto) =>
    client.post<TreatmentPlanDto>(
      `/clinical/patients/${patientId}/treatment-plans/${planId}/present`,
      data
    ),

  // Accept treatment plan (patient consent)
  acceptTreatmentPlan: (patientId: string, planId: string, data: AcceptTreatmentPlanDto) =>
    client.post<TreatmentPlanDto>(
      `/clinical/patients/${patientId}/treatment-plans/${planId}/accept`,
      data
    ),

  // Start treatment (transition to in_progress)
  startTreatment: (patientId: string, planId: string) =>
    client.post<TreatmentPlanDto>(
      `/clinical/patients/${patientId}/treatment-plans/${planId}/start`
    ),

  // Complete a procedure item
  completeProcedureItem: (
    patientId: string,
    planId: string,
    phaseId: string,
    itemId: string,
    data: CompleteProcedureItemDto
  ) =>
    client.post<TreatmentPlanDto>(
      `/clinical/patients/${patientId}/treatment-plans/${planId}/phases/${phaseId}/items/${itemId}/complete`,
      data
    ),

  // Cancel a treatment plan
  cancelTreatmentPlan: (patientId: string, planId: string, data: CancelTreatmentPlanDto) =>
    client.post<TreatmentPlanDto>(
      `/clinical/patients/${patientId}/treatment-plans/${planId}/cancel`,
      data
    ),

  // Delete a treatment plan (soft delete)
  deleteTreatmentPlan: (patientId: string, planId: string, reason: string) =>
    client.delete<void>(
      `/clinical/patients/${patientId}/treatment-plans/${planId}`,
      { data: { reason } }
    ),

  // Get treatment plan history
  getTreatmentPlanHistory: (
    patientId: string,
    planId: string,
    params?: { limit?: number; offset?: number }
  ) =>
    client.get<TreatmentPlanHistoryResponse>(
      `/clinical/patients/${patientId}/treatment-plans/${planId}/history`,
      { params }
    ),

  // Recalculate financials
  recalculateTreatmentPlanFinancials: (patientId: string, planId: string) =>
    client.post<TreatmentPlanDto>(
      `/clinical/patients/${patientId}/treatment-plans/${planId}/recalculate`
    ),

  // Get treatment plan status counts (dashboard)
  getTreatmentPlanStatusCounts: () =>
    client.get<TreatmentPlanStatusCountsDto>(
      `/clinical/treatment-plans/stats/by-status`
    ),

  // Procedures
  createProcedure: (patientId: string, data: Partial<ProcedureDto>) =>
    client.post<ProcedureDto>(`/clinical/patients/${patientId}/procedures`, data),

  getProcedures: (patientId: string) =>
    client.get<ProcedureDto[]>(`/clinical/patients/${patientId}/procedures`),

  completeProcedure: (procedureId: string) =>
    client.post(`/clinical/procedures/${procedureId}/complete`),

  // Procedure Catalog
  getProcedureCatalog: (params?: { search?: string; category?: string; limit?: number }) =>
    client.get<ProcedureCatalogResponse>('/clinical/procedures/catalog', { params }),

  // Odontogram - Full API surface aligned with backend
  getOdontogram: (patientId: string) =>
    client.get<OdontogramDto>(`/clinical/patients/${patientId}/odontogram`),

  getTooth: (patientId: string, toothNumber: string) =>
    client.get<ToothDataDto>(`/clinical/patients/${patientId}/odontogram/teeth/${toothNumber}`),

  updateTooth: (patientId: string, toothNumber: string, data: UpdateToothDto) =>
    client.put<OdontogramDto>(
      `/clinical/patients/${patientId}/odontogram/teeth/${toothNumber}`,
      data
    ),

  addCondition: (patientId: string, toothNumber: string, data: AddConditionDto) =>
    client.post<{ odontogram: OdontogramDto; conditionId: string }>(
      `/clinical/patients/${patientId}/odontogram/teeth/${toothNumber}/conditions`,
      data
    ),

  removeCondition: (
    patientId: string,
    toothNumber: string,
    conditionId: string,
    data: RemoveConditionDto
  ) =>
    client.delete<OdontogramDto>(
      `/clinical/patients/${patientId}/odontogram/teeth/${toothNumber}/conditions/${conditionId}`,
      { data }
    ),

  getToothHistory: (
    patientId: string,
    toothNumber: string,
    query?: GetToothHistoryQueryDto
  ) =>
    client.get<ToothHistoryResponse>(
      `/clinical/patients/${patientId}/odontogram/teeth/${toothNumber}/history`,
      { params: query }
    ),

  bulkUpdateTeeth: (patientId: string, data: BulkUpdateTeethDto) =>
    client.put<OdontogramDto>(
      `/clinical/patients/${patientId}/odontogram/bulk`,
      data
    ),
};
