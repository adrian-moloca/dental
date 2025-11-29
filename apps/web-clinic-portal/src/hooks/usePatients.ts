/**
 * Patients React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { patientsClient } from '../api/patientsClient';
import { billingClient } from '../api/billingClient';
import type { CreatePatientDto, UpdatePatientDto, SearchPatientDto } from '../types/patient.types';

export const usePatients = (searchParams: SearchPatientDto = {}) => {
  return useQuery({
    queryKey: ['patients', searchParams],
    queryFn: () => patientsClient.search(searchParams),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const usePatient = (id: string | undefined) => {
  return useQuery({
    queryKey: ['patients', id],
    queryFn: async () => {
      const patient = await patientsClient.getById(id!);
      return { data: patient };
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreatePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePatientDto) => patientsClient.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success('Pacient creat cu succes');
    },
    onError: (error: any) => {
      // Error toast is already shown by axios interceptor for non-400 errors
      // For 400 validation errors, extract and show specific field errors
      if (error.response?.status === 400) {
        const message = error.response?.data?.message || 'Eroare la validarea datelor';
        toast.error(message);
      }
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
      toast.success('Pacient actualizat cu succes');
    },
    onError: (error: any) => {
      // Error toast is already shown by axios interceptor for non-400 errors
      if (error.response?.status === 400) {
        const message = error.response?.data?.message || 'Eroare la validarea datelor';
        toast.error(message);
      }
    },
  });
};

export const useDeletePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => patientsClient.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success('Pacient sters cu succes');
    },
    onError: () => {
      // Error toast is already shown by axios interceptor
      toast.error('Nu s-a putut sterge pacientul');
    },
  });
};

export const usePatientBalance = (patientId: string | undefined) => {
  return useQuery({
    queryKey: ['patient-balance', patientId],
    queryFn: () => billingClient.getPatientBalance(patientId!),
    enabled: !!patientId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
