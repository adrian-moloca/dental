/**
 * Appointments React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { schedulingClient } from '../api/schedulingClient';
import type {
  CreateAppointmentDto,
  UpdateAppointmentDto,
  CancelAppointmentDto,
  QueryAppointmentsDto,
} from '../types/appointment.types';

export const useAppointments = (queryParams: QueryAppointmentsDto = {}) => {
  return useQuery({
    queryKey: ['appointments', queryParams],
    queryFn: () => schedulingClient.list(queryParams),
  });
};

export const useAppointment = (id: string | undefined) => {
  return useQuery({
    queryKey: ['appointments', id],
    queryFn: () => schedulingClient.getById(id!),
    enabled: !!id,
  });
};

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAppointmentDto) => schedulingClient.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};

export const useUpdateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAppointmentDto }) =>
      schedulingClient.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointments', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};

export const useCancelAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CancelAppointmentDto }) =>
      schedulingClient.cancel(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};
