/**
 * Imaging React Query Hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { imagingClient } from '../api/imagingClient';
import type { ImagingStudyDto } from '../api/imagingClient';
import { toast } from 'react-hot-toast';

// Query Keys
export const imagingKeys = {
  all: ['imaging'] as const,
  studies: (params?: any) => [...imagingKeys.all, 'studies', params] as const,
  study: (id: string) => [...imagingKeys.all, 'study', id] as const,
  aiResults: (studyId: string) => [...imagingKeys.all, 'ai-results', studyId] as const,
  patientImaging: (patientId: string) => [...imagingKeys.all, 'patient-imaging', patientId] as const,
};

// Studies
export function useImagingStudies(params?: { patientId?: string; modality?: string }) {
  return useQuery({
    queryKey: imagingKeys.studies(params),
    queryFn: () => imagingClient.getStudies(params),
    staleTime: 30_000,
  });
}

export function useImagingStudy(id: string) {
  return useQuery({
    queryKey: imagingKeys.study(id),
    queryFn: () => imagingClient.getStudy(id),
    enabled: !!id,
  });
}

export function useCreateStudy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<ImagingStudyDto>) => imagingClient.createStudy(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: imagingKeys.studies() });
      toast.success('Imaging study created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create study');
    },
  });
}

// File Upload
export function useUploadImagingFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ studyId, file }: { studyId: string; file: File }) =>
      imagingClient.uploadFile(studyId, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: imagingKeys.study(variables.studyId) });
      toast.success('File uploaded successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to upload file');
    },
  });
}

export function useDownloadImagingFile() {
  return useMutation({
    mutationFn: async (fileId: string) => {
      const response = await imagingClient.getFile(fileId);
      const blob = response.data as Blob;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `imaging-file-${fileId}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
    onSuccess: () => {
      toast.success('File downloaded successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to download file');
    },
  });
}

// AI Analysis
export function useAIResults(studyId: string) {
  return useQuery({
    queryKey: imagingKeys.aiResults(studyId),
    queryFn: () => imagingClient.getAIResults(studyId),
    enabled: !!studyId,
  });
}

export function useRequestAIAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ studyId, analysisType }: { studyId: string; analysisType: string }) =>
      imagingClient.requestAIAnalysis(studyId, analysisType),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: imagingKeys.aiResults(variables.studyId) });
      toast.success('AI analysis requested successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to request AI analysis');
    },
  });
}

// Patient Imaging
export function usePatientImaging(patientId: string) {
  return useQuery({
    queryKey: imagingKeys.patientImaging(patientId),
    queryFn: () => imagingClient.getPatientImaging(patientId),
    enabled: !!patientId,
  });
}
