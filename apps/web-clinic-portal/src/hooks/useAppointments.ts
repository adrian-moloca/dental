/**
 * Appointments React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
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
    staleTime: 2 * 60 * 1000, // 2 minutes (appointments change frequently)
  });
};

export const useAppointment = (id: string | undefined) => {
  return useQuery({
    queryKey: ['appointments', id],
    queryFn: () => schedulingClient.getById(id!),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAppointmentDto) => schedulingClient.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Programare creata cu succes');
    },
    onError: (error: any) => {
      if (error.response?.status === 400) {
        const message = error.response?.data?.message || 'Eroare la validarea datelor';
        toast.error(message);
      }
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
      toast.success('Programare actualizata cu succes');
    },
    onError: (error: any) => {
      if (error.response?.status === 400) {
        const message = error.response?.data?.message || 'Eroare la validarea datelor';
        toast.error(message);
      }
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
      toast.success('Programare anulata cu succes');
    },
    onError: () => {
      toast.error('Nu s-a putut anula programarea');
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
      toast.success('Pacient inregistrat cu succes');
    },
    onError: () => {
      toast.error('Eroare la inregistrarea pacientului');
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
      toast.success('Programare pornita cu succes');
    },
    onError: () => {
      toast.error('Eroare la pornirea programarii');
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
      toast.success('Programare finalizata cu succes');
    },
    onError: () => {
      toast.error('Eroare la finalizarea programarii');
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
      toast.success('Programare marcata ca neprezentat');
    },
    onError: () => {
      toast.error('Eroare la marcarea ca neprezentat');
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
      toast.success('Programare confirmata cu succes');
    },
    onError: () => {
      toast.error('Eroare la confirmarea programarii');
    },
  });
};

export const useBulkConfirmAppointments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, method }: { ids: string[]; method: 'phone' | 'sms' | 'email' | 'portal' }) =>
      schedulingClient.bulkConfirm(ids, method),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'appointments'] });
      const confirmed = data?.confirmed?.length || 0;
      const failed = data?.failed?.length || 0;
      if (failed === 0) {
        toast.success(`${confirmed} programari confirmate cu succes`);
      } else {
        toast.warning(`${confirmed} confirmate, ${failed} esuate`);
      }
    },
    onError: () => {
      toast.error('Eroare la confirmarea programarilor');
    },
  });
};
