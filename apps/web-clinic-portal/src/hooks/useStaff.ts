/**
 * Staff React Query Hooks
 *
 * Provides data fetching and mutation hooks for staff management.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffClient } from '../api/staffClient';
import type {
  ListStaffQueryDto,
  CreateStaffDto,
  UpdateStaffDto,
} from '../types/staff.types';

/**
 * Query key factory for staff queries
 */
export const staffKeys = {
  all: ['staff'] as const,
  lists: () => [...staffKeys.all, 'list'] as const,
  list: (query: ListStaffQueryDto) => [...staffKeys.lists(), query] as const,
  details: () => [...staffKeys.all, 'detail'] as const,
  detail: (id: string) => [...staffKeys.details(), id] as const,
  stats: () => [...staffKeys.all, 'stats'] as const,
};

/**
 * Hook to list staff members with pagination and filtering
 */
export const useStaff = (query: ListStaffQueryDto = {}) => {
  return useQuery({
    queryKey: staffKeys.list(query),
    queryFn: () => staffClient.list(query),
  });
};

/**
 * Hook to get a single staff member by ID
 */
export const useStaffMember = (id: string | undefined) => {
  return useQuery({
    queryKey: staffKeys.detail(id!),
    queryFn: () => staffClient.getById(id!),
    enabled: !!id,
  });
};

/**
 * Hook to get staff statistics
 */
export const useStaffStats = () => {
  return useQuery({
    queryKey: staffKeys.stats(),
    queryFn: () => staffClient.getStats(),
  });
};

/**
 * Hook to create a new staff member
 */
export const useCreateStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStaffDto) => staffClient.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
      queryClient.invalidateQueries({ queryKey: staffKeys.stats() });
    },
  });
};

/**
 * Hook to update a staff member
 */
export const useUpdateStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStaffDto }) =>
      staffClient.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
    },
  });
};

/**
 * Hook to activate a staff member
 */
export const useActivateStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => staffClient.activate(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
      queryClient.invalidateQueries({ queryKey: staffKeys.stats() });
    },
  });
};

/**
 * Hook to deactivate a staff member
 */
export const useDeactivateStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => staffClient.deactivate(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
      queryClient.invalidateQueries({ queryKey: staffKeys.stats() });
    },
  });
};

/**
 * Hook to delete a staff member
 */
export const useDeleteStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => staffClient.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
      queryClient.invalidateQueries({ queryKey: staffKeys.stats() });
    },
  });
};

/**
 * Hook to bulk activate staff members
 */
export const useBulkActivateStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map((id) => staffClient.activate(id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
      queryClient.invalidateQueries({ queryKey: staffKeys.stats() });
    },
  });
};

/**
 * Hook to bulk deactivate staff members
 */
export const useBulkDeactivateStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map((id) => staffClient.deactivate(id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
      queryClient.invalidateQueries({ queryKey: staffKeys.stats() });
    },
  });
};
