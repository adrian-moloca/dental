/**
 * Enterprise React Query Hooks
 */

import { useQuery } from '@tanstack/react-query';
import { enterpriseClient } from '../api/enterpriseClient';

/**
 * Hook to fetch clinics for an organization
 */
export const useClinics = (orgId: string | undefined) => {
  return useQuery({
    queryKey: ['clinics', orgId],
    queryFn: () => enterpriseClient.getClinics(orgId!),
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch a single clinic
 */
export const useClinic = (clinicId: string | undefined) => {
  return useQuery({
    queryKey: ['clinics', clinicId],
    queryFn: () => enterpriseClient.getClinic(clinicId!),
    enabled: !!clinicId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch locations for a clinic
 */
export const useLocations = (clinicId: string | undefined) => {
  return useQuery({
    queryKey: ['locations', clinicId],
    queryFn: () => enterpriseClient.getLocations(clinicId!),
    enabled: !!clinicId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch staff for a clinic
 */
export const useClinicStaff = (clinicId: string | undefined) => {
  return useQuery({
    queryKey: ['providers', 'clinic', clinicId],
    queryFn: () => enterpriseClient.getClinicStaff(clinicId!),
    enabled: !!clinicId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
