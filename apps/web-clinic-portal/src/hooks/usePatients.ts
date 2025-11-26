/**
 * Patients React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientsClient } from '../api/patientsClient';
import { billingClient } from '../api/billingClient';
import type { CreatePatientDto, UpdatePatientDto, SearchPatientDto } from '../types/patient.types';

export const usePatients = (searchParams: SearchPatientDto = {}) => {
  return useQuery({
    queryKey: ['patients', searchParams],
    queryFn: () => patientsClient.search(searchParams),
  });
};

export const usePatient = (id: string | undefined) => {
  return useQuery({
    queryKey: ['patients', id],
    queryFn: () => patientsClient.getById(id!),
    enabled: !!id,
  });
};

export const useCreatePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePatientDto) => patientsClient.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
};

export const useUpdatePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePatientDto }) =>
      patientsClient.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['patients', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
};

export const useDeletePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => patientsClient.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
};

export const usePatientBalance = (patientId: string | undefined) => {
  return useQuery({
    queryKey: ['patient-balance', patientId],
    queryFn: () => billingClient.getPatientBalance(patientId!),
    enabled: !!patientId,
  });
};
