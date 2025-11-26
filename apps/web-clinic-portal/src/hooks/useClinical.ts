/**
 * Clinical React Query Hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { clinicalClient } from '../api/clinicalClient';
import type {
  ClinicalNoteDto,
  TreatmentPlanDto,
  ProcedureDto,
  OdontogramDto,
  SignNoteRequest,
  AmendNoteRequest,
} from '../api/clinicalClient';
import { toast } from 'react-hot-toast';

// Query Keys
export const clinicalKeys = {
  all: ['clinical'] as const,
  notes: (patientId: string) => [...clinicalKeys.all, 'notes', patientId] as const,
  note: (id: string) => [...clinicalKeys.all, 'note', id] as const,
  treatmentPlans: (patientId: string) => [...clinicalKeys.all, 'treatment-plans', patientId] as const,
  procedures: (patientId: string) => [...clinicalKeys.all, 'procedures', patientId] as const,
  odontogram: (patientId: string) => [...clinicalKeys.all, 'odontogram', patientId] as const,
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

export function useClinicalNote(id: string) {
  return useQuery({
    queryKey: clinicalKeys.note(id),
    queryFn: () => clinicalClient.getNote(id),
    enabled: !!id,
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
    mutationFn: ({ noteId, data }: { noteId: string; data: SignNoteRequest }) =>
      clinicalClient.signNote(noteId, data),
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
    mutationFn: ({ noteId, data }: { noteId: string; data: AmendNoteRequest }) =>
      clinicalClient.amendNote(noteId, data),
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

// Treatment Plans
export function useTreatmentPlans(patientId: string) {
  return useQuery({
    queryKey: clinicalKeys.treatmentPlans(patientId),
    queryFn: () => clinicalClient.getTreatmentPlans(patientId),
    enabled: !!patientId,
  });
}

export function useCreateTreatmentPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId, data }: { patientId: string; data: Partial<TreatmentPlanDto> }) =>
      clinicalClient.createTreatmentPlan(patientId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: clinicalKeys.treatmentPlans(variables.patientId) });
      toast.success('Treatment plan created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create treatment plan');
    },
  });
}

export function useAcceptTreatmentOption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ planId, optionId }: { planId: string; optionId: string }) =>
      clinicalClient.acceptOption(planId, optionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clinicalKeys.all });
      toast.success('Treatment option accepted');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to accept treatment option');
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

// Odontogram
export function useOdontogram(patientId: string) {
  return useQuery({
    queryKey: clinicalKeys.odontogram(patientId),
    queryFn: () => clinicalClient.getOdontogram(patientId),
    enabled: !!patientId,
  });
}

export function useUpdateOdontogram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId, data }: { patientId: string; data: Partial<OdontogramDto> }) =>
      clinicalClient.updateOdontogram(patientId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: clinicalKeys.odontogram(variables.patientId) });
      toast.success('Odontogram updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update odontogram');
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
