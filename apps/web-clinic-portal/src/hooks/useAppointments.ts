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

export const useCheckInAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => schedulingClient.checkIn(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['appointments', id] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};

export const useStartAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => schedulingClient.start(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['appointments', id] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};

export const useCompleteAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      procedures,
    }: {
      id: string;
      procedures?: Array<{
        procedureId: string;
        quantity: number;
        price: number;
        tooth?: string;
        surfaces?: string[];
      }>;
    }) => schedulingClient.complete(id, procedures ? { procedures } : undefined),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointments', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};

export const useNoShowAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => schedulingClient.recordNoShow(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['appointments', id] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};

export const useConfirmAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, method }: { id: string; method: 'phone' | 'sms' | 'email' | 'portal' }) =>
      schedulingClient.confirm(id, method),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointments', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'appointments'] });
    },
  });
};

export const useBulkConfirmAppointments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, method }: { ids: string[]; method: 'phone' | 'sms' | 'email' | 'portal' }) =>
      schedulingClient.bulkConfirm(ids, method),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'appointments'] });
    },
  });
};
