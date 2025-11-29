/**
 * Patient Documents React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  documentsClient,
  type DocumentFilters,
  type UploadDocumentDto,
  type GenerateDocumentDto,
} from '../api/documentsClient';

/**
 * Hook for fetching patient documents
 */
export function usePatientDocuments(patientId: string, filters: DocumentFilters = {}) {
  return useQuery({
    queryKey: ['patient-documents', patientId, filters],
    queryFn: () => documentsClient.getDocuments(patientId, filters),
    enabled: !!patientId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook for fetching single document
 */
export function usePatientDocument(patientId: string, documentId: string) {
  return useQuery({
    queryKey: ['patient-document', patientId, documentId],
    queryFn: () => documentsClient.getDocument(patientId, documentId),
    enabled: !!patientId && !!documentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for uploading document
 */
export function useUploadDocument(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, data }: { file: File; data: UploadDocumentDto }) =>
      documentsClient.uploadDocument(patientId, file, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-documents', patientId] });
      queryClient.invalidateQueries({ queryKey: ['patient-timeline', patientId] });
      toast.success('Document incarcat cu succes');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Eroare la incarcarea documentului';
      toast.error(message);
    },
  });
}

/**
 * Hook for generating document from template
 */
export function useGenerateDocument(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GenerateDocumentDto) =>
      documentsClient.generateDocument(patientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-documents', patientId] });
      queryClient.invalidateQueries({ queryKey: ['patient-timeline', patientId] });
      toast.success('Document generat cu succes');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Eroare la generarea documentului';
      toast.error(message);
    },
  });
}

/**
 * Hook for deleting document
 */
export function useDeleteDocument(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId: string) =>
      documentsClient.deleteDocument(patientId, documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-documents', patientId] });
      queryClient.invalidateQueries({ queryKey: ['patient-timeline', patientId] });
      toast.success('Document sters cu succes');
    },
    onError: () => {
      toast.error('Eroare la stergerea documentului');
    },
  });
}

/**
 * Hook for fetching document templates
 */
export function useDocumentTemplates() {
  return useQuery({
    queryKey: ['document-templates'],
    queryFn: () => documentsClient.getTemplates(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook for generating share link
 */
export function useGenerateShareLink(patientId: string) {
  return useMutation({
    mutationFn: ({ documentId, expiresIn }: { documentId: string; expiresIn?: number }) =>
      documentsClient.generateShareLink(patientId, documentId, expiresIn),
    onSuccess: (data) => {
      navigator.clipboard.writeText(data.url);
      toast.success('Link copiat in clipboard');
    },
    onError: () => {
      toast.error('Eroare la generarea link-ului');
    },
  });
}
