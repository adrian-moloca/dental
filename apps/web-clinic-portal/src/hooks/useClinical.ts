/**
 * Clinical React Query Hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { clinicalClient } from '../api/clinicalClient';
import type {
  ClinicalNoteDto,
  ProcedureDto,
  SignNoteRequest,
  AmendNoteRequest,
  AddConditionDto,
  UpdateToothDto,
  RemoveConditionDto,
  BulkUpdateTeethDto,
  GetToothHistoryQueryDto,
  // Treatment Plan Types
  CreateTreatmentPlanDto,
  UpdateTreatmentPlanDto,
  PresentTreatmentPlanDto,
  AcceptTreatmentPlanDto,
  CompleteProcedureItemDto,
  CancelTreatmentPlanDto,
  TreatmentPlanQueryDto,
} from '../api/clinicalClient';
import { toast } from 'react-hot-toast';

// Query Keys
export const clinicalKeys = {
  all: ['clinical'] as const,
  notes: (patientId: string) => [...clinicalKeys.all, 'notes', patientId] as const,
  note: (id: string) => [...clinicalKeys.all, 'note', id] as const,
  treatmentPlans: (patientId: string) => [...clinicalKeys.all, 'treatment-plans', patientId] as const,
  treatmentPlan: (patientId: string, planId: string) =>
    [...clinicalKeys.all, 'treatment-plan', patientId, planId] as const,
  activeTreatmentPlan: (patientId: string) =>
    [...clinicalKeys.all, 'treatment-plan-active', patientId] as const,
  treatmentPlanHistory: (patientId: string, planId: string) =>
    [...clinicalKeys.all, 'treatment-plan', patientId, planId, 'history'] as const,
  treatmentPlanStatusCounts: () => [...clinicalKeys.all, 'treatment-plans-stats'] as const,
  procedures: (patientId: string) => [...clinicalKeys.all, 'procedures', patientId] as const,
  odontogram: (patientId: string) => [...clinicalKeys.all, 'odontogram', patientId] as const,
  tooth: (patientId: string, toothNumber: string) =>
    [...clinicalKeys.all, 'odontogram', patientId, 'tooth', toothNumber] as const,
  toothHistory: (patientId: string, toothNumber: string) =>
    [...clinicalKeys.all, 'odontogram', patientId, 'tooth', toothNumber, 'history'] as const,
  procedureCatalog: (search?: string, category?: string) =>
    [...clinicalKeys.all, 'catalog', search, category] as const,
};

// Clinical Notes
export function useClinicalNotes(patientId: string) {
  return useQuery({
    queryKey: clinicalKeys.notes(patientId),
    queryFn: () => clinicalClient.getNotes(patientId),
    enabled: !!patientId,
  });
}

export function useClinicalNote(id: string | undefined, patientId?: string) {
  return useQuery({
    queryKey: clinicalKeys.note(id!),
    queryFn: () => clinicalClient.getNote(patientId || '', id!),
    enabled: !!id && !!patientId,
  });
}

export function useCreateClinicalNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<ClinicalNoteDto>) => clinicalClient.createNote(data),
    onSuccess: (_, variables) => {
      if (variables.patientId) {
        queryClient.invalidateQueries({ queryKey: clinicalKeys.notes(variables.patientId) });
      }
      toast.success('Clinical note created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create clinical note');
    },
  });
}

export function useSignNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noteId, patientId, data }: { noteId: string; patientId: string; data: any }) =>
      clinicalClient.signNote(patientId, noteId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: clinicalKeys.all });
      if (response.data?.note?.id) {
        queryClient.invalidateQueries({ queryKey: clinicalKeys.note(response.data.note.id) });
      }
      toast.success('Clinical note signed successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to sign clinical note';
      if (error?.response?.status === 401) {
        toast.error('Invalid password. Please try again.');
      } else {
        toast.error(message);
      }
    },
  });
}

export function useAmendNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noteId, patientId, data }: { noteId: string; patientId: string; data: any }) =>
      clinicalClient.amendNote(patientId, noteId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: clinicalKeys.all });
      if (response.data?.note?.id) {
        queryClient.invalidateQueries({ queryKey: clinicalKeys.note(response.data.note.id) });
      }
      toast.success('Amendment created and signed successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to create amendment';
      if (error?.response?.status === 401) {
        toast.error('Invalid password. Please try again.');
      } else {
        toast.error(message);
      }
    },
  });
}

// ============================================================================
// TREATMENT PLANS HOOKS - Full API surface
// ============================================================================

/**
 * Hook to list all treatment plans for a patient
 */
export function useTreatmentPlans(patientId: string, query?: TreatmentPlanQueryDto) {
  return useQuery({
    queryKey: clinicalKeys.treatmentPlans(patientId),
    queryFn: async () => {
      const response = await clinicalClient.getTreatmentPlans(patientId, query);
      return response.data;
    },
    enabled: !!patientId,
  });
}

/**
 * Hook to get a single treatment plan
 */
export function useTreatmentPlan(patientId: string | undefined, planId: string | undefined) {
  return useQuery({
    queryKey: clinicalKeys.treatmentPlan(patientId!, planId!),
    queryFn: async () => {
      const response = await clinicalClient.getTreatmentPlan(patientId!, planId!);
      return response.data;
    },
    enabled: !!patientId && !!planId,
  });
}

/**
 * Hook to get patient's active treatment plan
 */
export function useActiveTreatmentPlan(patientId: string | undefined) {
  return useQuery({
    queryKey: clinicalKeys.activeTreatmentPlan(patientId!),
    queryFn: async () => {
      const response = await clinicalClient.getActiveTreatmentPlan(patientId!);
      return response.data;
    },
    enabled: !!patientId,
  });
}

/**
 * Hook to get treatment plan history
 */
export function useTreatmentPlanHistory(
  patientId: string | undefined,
  planId: string | undefined,
  params?: { limit?: number; offset?: number }
) {
  return useQuery({
    queryKey: clinicalKeys.treatmentPlanHistory(patientId!, planId!),
    queryFn: async () => {
      const response = await clinicalClient.getTreatmentPlanHistory(patientId!, planId!, params);
      return response.data;
    },
    enabled: !!patientId && !!planId,
  });
}

/**
 * Hook to get treatment plan status counts (dashboard)
 */
export function useTreatmentPlanStatusCounts() {
  return useQuery({
    queryKey: clinicalKeys.treatmentPlanStatusCounts(),
    queryFn: async () => {
      const response = await clinicalClient.getTreatmentPlanStatusCounts();
      return response.data;
    },
  });
}

/**
 * Hook to create a new treatment plan
 */
export function useCreateTreatmentPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId, data }: { patientId: string; data: CreateTreatmentPlanDto }) =>
      clinicalClient.createTreatmentPlan(patientId, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: clinicalKeys.treatmentPlans(variables.patientId) });
      queryClient.invalidateQueries({
        queryKey: clinicalKeys.activeTreatmentPlan(variables.patientId),
      });
      toast.success('Plan de tratament creat cu succes');
      return response.data;
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Eroare la crearea planului de tratament');
    },
  });
}

/**
 * Hook to update a treatment plan (draft only)
 */
export function useUpdateTreatmentPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      patientId,
      planId,
      data,
      expectedVersion,
    }: {
      patientId: string;
      planId: string;
      data: UpdateTreatmentPlanDto;
      expectedVersion?: number;
    }) => clinicalClient.updateTreatmentPlan(patientId, planId, data, expectedVersion),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: clinicalKeys.treatmentPlans(variables.patientId) });
      queryClient.invalidateQueries({
        queryKey: clinicalKeys.treatmentPlan(variables.patientId, variables.planId),
      });
      toast.success('Plan de tratament actualizat cu succes');
      return response.data;
    },
    onError: (error: any) => {
      if (error?.response?.status === 409) {
        toast.error('Planul a fost modificat de altcineva. Reincarca pagina.');
      } else {
        toast.error(error?.response?.data?.message || 'Eroare la actualizarea planului');
      }
    },
  });
}

/**
 * Hook to present treatment plan to patient
 */
export function usePresentTreatmentPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      patientId,
      planId,
      data,
    }: {
      patientId: string;
      planId: string;
      data: PresentTreatmentPlanDto;
    }) => clinicalClient.presentTreatmentPlan(patientId, planId, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: clinicalKeys.treatmentPlans(variables.patientId) });
      queryClient.invalidateQueries({
        queryKey: clinicalKeys.treatmentPlan(variables.patientId, variables.planId),
      });
      queryClient.invalidateQueries({
        queryKey: clinicalKeys.treatmentPlanHistory(variables.patientId, variables.planId),
      });
      toast.success('Plan de tratament prezentat pacientului');
      return response.data;
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Eroare la prezentarea planului');
    },
  });
}

/**
 * Hook to accept treatment plan (patient consent)
 */
export function useAcceptTreatmentPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      patientId,
      planId,
      data,
    }: {
      patientId: string;
      planId: string;
      data: AcceptTreatmentPlanDto;
    }) => clinicalClient.acceptTreatmentPlan(patientId, planId, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: clinicalKeys.treatmentPlans(variables.patientId) });
      queryClient.invalidateQueries({
        queryKey: clinicalKeys.treatmentPlan(variables.patientId, variables.planId),
      });
      queryClient.invalidateQueries({
        queryKey: clinicalKeys.activeTreatmentPlan(variables.patientId),
      });
      queryClient.invalidateQueries({
        queryKey: clinicalKeys.treatmentPlanHistory(variables.patientId, variables.planId),
      });
      toast.success('Plan de tratament acceptat de pacient');
      return response.data;
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Eroare la acceptarea planului');
    },
  });
}

/**
 * Hook to start treatment (transition to in_progress)
 */
export function useStartTreatment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId, planId }: { patientId: string; planId: string }) =>
      clinicalClient.startTreatment(patientId, planId),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: clinicalKeys.treatmentPlans(variables.patientId) });
      queryClient.invalidateQueries({
        queryKey: clinicalKeys.treatmentPlan(variables.patientId, variables.planId),
      });
      queryClient.invalidateQueries({
        queryKey: clinicalKeys.treatmentPlanHistory(variables.patientId, variables.planId),
      });
      toast.success('Tratament inceput');
      return response.data;
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Eroare la inceperea tratamentului');
    },
  });
}

/**
 * Hook to complete a procedure item within a treatment plan
 */
export function useCompleteProcedureItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      patientId,
      planId,
      phaseId,
      itemId,
      data,
    }: {
      patientId: string;
      planId: string;
      phaseId: string;
      itemId: string;
      data: CompleteProcedureItemDto;
    }) => clinicalClient.completeProcedureItem(patientId, planId, phaseId, itemId, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: clinicalKeys.treatmentPlans(variables.patientId) });
      queryClient.invalidateQueries({
        queryKey: clinicalKeys.treatmentPlan(variables.patientId, variables.planId),
      });
      queryClient.invalidateQueries({
        queryKey: clinicalKeys.treatmentPlanHistory(variables.patientId, variables.planId),
      });
      queryClient.invalidateQueries({ queryKey: clinicalKeys.procedures(variables.patientId) });
      toast.success('Procedura finalizata cu succes');
      return response.data;
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Eroare la finalizarea procedurii');
    },
  });
}

/**
 * Hook to cancel a treatment plan
 */
export function useCancelTreatmentPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      patientId,
      planId,
      data,
    }: {
      patientId: string;
      planId: string;
      data: CancelTreatmentPlanDto;
    }) => clinicalClient.cancelTreatmentPlan(patientId, planId, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: clinicalKeys.treatmentPlans(variables.patientId) });
      queryClient.invalidateQueries({
        queryKey: clinicalKeys.treatmentPlan(variables.patientId, variables.planId),
      });
      queryClient.invalidateQueries({
        queryKey: clinicalKeys.activeTreatmentPlan(variables.patientId),
      });
      queryClient.invalidateQueries({
        queryKey: clinicalKeys.treatmentPlanHistory(variables.patientId, variables.planId),
      });
      toast.success('Plan de tratament anulat');
      return response.data;
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Eroare la anularea planului');
    },
  });
}

/**
 * Hook to delete a treatment plan (soft delete)
 */
export function useDeleteTreatmentPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      patientId,
      planId,
      reason,
    }: {
      patientId: string;
      planId: string;
      reason: string;
    }) => clinicalClient.deleteTreatmentPlan(patientId, planId, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: clinicalKeys.treatmentPlans(variables.patientId) });
      queryClient.invalidateQueries({
        queryKey: clinicalKeys.activeTreatmentPlan(variables.patientId),
      });
      toast.success('Plan de tratament sters');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Eroare la stergerea planului');
    },
  });
}

/**
 * Hook to recalculate treatment plan financials
 */
export function useRecalculateTreatmentPlanFinancials() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId, planId }: { patientId: string; planId: string }) =>
      clinicalClient.recalculateTreatmentPlanFinancials(patientId, planId),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({
        queryKey: clinicalKeys.treatmentPlan(variables.patientId, variables.planId),
      });
      toast.success('Financiar recalculat');
      return response.data;
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Eroare la recalculare');
    },
  });
}

// Procedures
export function useProcedures(patientId: string) {
  return useQuery({
    queryKey: clinicalKeys.procedures(patientId),
    queryFn: () => clinicalClient.getProcedures(patientId),
    enabled: !!patientId,
  });
}

export function useCreateProcedure() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId, data }: { patientId: string; data: Partial<ProcedureDto> }) =>
      clinicalClient.createProcedure(patientId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: clinicalKeys.procedures(variables.patientId) });
      toast.success('Procedure created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create procedure');
    },
  });
}

export function useCompleteProcedure() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (procedureId: string) => clinicalClient.completeProcedure(procedureId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clinicalKeys.all });
      toast.success('Procedure marked as completed');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to complete procedure');
    },
  });
}

// ============================================================================
// ODONTOGRAM HOOKS - Full API surface
// ============================================================================

/**
 * Hook to get a patient's complete odontogram
 */
export function useOdontogram(patientId: string | undefined) {
  return useQuery({
    queryKey: clinicalKeys.odontogram(patientId!),
    queryFn: async () => {
      const response = await clinicalClient.getOdontogram(patientId!);
      return response.data;
    },
    enabled: !!patientId,
  });
}

/**
 * Hook to get a single tooth's data
 */
export function useTooth(patientId: string | undefined, toothNumber: string | undefined) {
  return useQuery({
    queryKey: clinicalKeys.tooth(patientId!, toothNumber!),
    queryFn: async () => {
      const response = await clinicalClient.getTooth(patientId!, toothNumber!);
      return response.data;
    },
    enabled: !!patientId && !!toothNumber,
  });
}

/**
 * Hook to get tooth history
 */
export function useToothHistory(
  patientId: string | undefined,
  toothNumber: string | undefined,
  query?: GetToothHistoryQueryDto
) {
  return useQuery({
    queryKey: clinicalKeys.toothHistory(patientId!, toothNumber!),
    queryFn: async () => {
      const response = await clinicalClient.getToothHistory(patientId!, toothNumber!, query);
      return response.data;
    },
    enabled: !!patientId && !!toothNumber,
  });
}

/**
 * Hook to update a single tooth's properties
 */
export function useUpdateTooth() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      patientId,
      toothNumber,
      data,
    }: {
      patientId: string;
      toothNumber: string;
      data: UpdateToothDto;
    }) => clinicalClient.updateTooth(patientId, toothNumber, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: clinicalKeys.odontogram(variables.patientId) });
      queryClient.invalidateQueries({
        queryKey: clinicalKeys.tooth(variables.patientId, variables.toothNumber),
      });
      toast.success('Dinte actualizat cu succes');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Eroare la actualizarea dintelui');
    },
  });
}

/**
 * Hook to add a condition to a tooth
 */
export function useAddCondition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      patientId,
      toothNumber,
      data,
    }: {
      patientId: string;
      toothNumber: string;
      data: AddConditionDto;
    }) => clinicalClient.addCondition(patientId, toothNumber, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: clinicalKeys.odontogram(variables.patientId) });
      queryClient.invalidateQueries({
        queryKey: clinicalKeys.tooth(variables.patientId, variables.toothNumber),
      });
      queryClient.invalidateQueries({
        queryKey: clinicalKeys.toothHistory(variables.patientId, variables.toothNumber),
      });
      toast.success('Conditie adaugata cu succes');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Eroare la adaugarea conditiei');
    },
  });
}

/**
 * Hook to remove a condition from a tooth
 */
export function useRemoveCondition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      patientId,
      toothNumber,
      conditionId,
      data,
    }: {
      patientId: string;
      toothNumber: string;
      conditionId: string;
      data: RemoveConditionDto;
    }) => clinicalClient.removeCondition(patientId, toothNumber, conditionId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: clinicalKeys.odontogram(variables.patientId) });
      queryClient.invalidateQueries({
        queryKey: clinicalKeys.tooth(variables.patientId, variables.toothNumber),
      });
      queryClient.invalidateQueries({
        queryKey: clinicalKeys.toothHistory(variables.patientId, variables.toothNumber),
      });
      toast.success('Conditie eliminata cu succes');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Eroare la eliminarea conditiei');
    },
  });
}

/**
 * Hook to bulk update multiple teeth
 */
export function useBulkUpdateTeeth() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId, data }: { patientId: string; data: BulkUpdateTeethDto }) =>
      clinicalClient.bulkUpdateTeeth(patientId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: clinicalKeys.odontogram(variables.patientId) });
      toast.success('Odontograma actualizata cu succes');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Eroare la actualizarea odontogramei');
    },
  });
}

// Procedure Catalog
export function useProcedureCatalog(search?: string, category?: string) {
  return useQuery({
    queryKey: clinicalKeys.procedureCatalog(search, category),
    queryFn: async () => {
      const response = await clinicalClient.getProcedureCatalog({ search, category, limit: 50 });
      return response.data; // Unwrap axios response to get ProcedureCatalogResponse
    },
    enabled: search !== undefined && search.length >= 2,
    staleTime: 5 * 60 * 1000,
  });
}
