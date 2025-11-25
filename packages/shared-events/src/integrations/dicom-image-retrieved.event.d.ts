export interface DicomImageRetrievedEvent {
    eventType: 'integrations.dicom.image.retrieved';
    tenantId: string;
    organizationId: string;
    clinicId?: string;
    studyInstanceUID: string;
    seriesInstanceUID?: string;
    sopInstanceUID?: string;
    patientId: string;
    modality: string;
    fileUrl: string;
    fileSize: number;
    retrievedAt: string;
    correlationId: string;
    metadata?: Record<string, any>;
    timestamp: string;
}
export interface DicomImageStoredEvent {
    eventType: 'integrations.dicom.image.stored';
    tenantId: string;
    organizationId: string;
    clinicId?: string;
    studyInstanceUID: string;
    seriesInstanceUID: string;
    sopInstanceUID: string;
    patientId: string;
    modality: string;
    storedAt: string;
    correlationId: string;
    timestamp: string;
}
export interface DicomQueryCompletedEvent {
    eventType: 'integrations.dicom.query.completed';
    tenantId: string;
    organizationId: string;
    clinicId?: string;
    queryLevel: string;
    patientId?: string;
    studyInstanceUID?: string;
    resultCount: number;
    queriedAt: string;
    correlationId: string;
    timestamp: string;
}
export interface DicomFailedEvent {
    eventType: 'integrations.dicom.failed';
    tenantId: string;
    organizationId: string;
    clinicId?: string;
    operation: string;
    studyInstanceUID?: string;
    errorCode: string;
    errorMessage: string;
    correlationId: string;
    timestamp: string;
}
