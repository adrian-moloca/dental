/**
 * Provider Schedule React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { providersClient } from '../api/providersClient';
import type { UpdateScheduleDto, CreateAbsenceDto } from '../types/provider.types';

export const useProviderSchedule = (providerId: string | undefined) => {
  return useQuery({
    queryKey: ['provider-schedule', providerId],
    queryFn: () => providersClient.getSchedule(providerId!),
    enabled: !!providerId,
  });
};

export const useProviderAvailability = (providerId: string | undefined, date: string | undefined) => {
  return useQuery({
    queryKey: ['provider-availability', providerId, date],
    queryFn: () => providersClient.getAvailability(providerId!, date!),
    enabled: !!providerId && !!date,
  });
};

export const useUpdateProviderSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ providerId, data }: { providerId: string; data: UpdateScheduleDto }) =>
      providersClient.updateSchedule(providerId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['provider-schedule', variables.providerId] });
    },
  });
};

export const useCreateAbsence = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ providerId, data }: { providerId: string; data: CreateAbsenceDto }) =>
      providersClient.createAbsence(providerId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['provider-schedule', variables.providerId] });
    },
  });
};

export const useDeleteAbsence = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ providerId, absenceId }: { providerId: string; absenceId: string }) =>
      providersClient.deleteAbsence(providerId, absenceId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['provider-schedule', variables.providerId] });
    },
  });
};
