"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IMAGING_AI_RESULT_CREATED_VERSION = exports.IMAGING_REPORT_CREATED_VERSION = exports.IMAGING_STUDY_UPDATED_VERSION = exports.IMAGING_STUDY_CREATED_VERSION = exports.IMAGING_AI_RESULT_CREATED_EVENT = exports.IMAGING_REPORT_CREATED_EVENT = exports.IMAGING_STUDY_UPDATED_EVENT = exports.IMAGING_STUDY_CREATED_EVENT = void 0;
exports.isImagingStudyCreatedEvent = isImagingStudyCreatedEvent;
exports.createImagingStudyCreatedEvent = createImagingStudyCreatedEvent;
exports.isImagingStudyUpdatedEvent = isImagingStudyUpdatedEvent;
exports.createImagingStudyUpdatedEvent = createImagingStudyUpdatedEvent;
exports.isImagingReportCreatedEvent = isImagingReportCreatedEvent;
exports.createImagingReportCreatedEvent = createImagingReportCreatedEvent;
exports.isImagingAIResultCreatedEvent = isImagingAIResultCreatedEvent;
exports.createImagingAIResultCreatedEvent = createImagingAIResultCreatedEvent;
exports.IMAGING_STUDY_CREATED_EVENT = 'dental.imaging.study.created';
exports.IMAGING_STUDY_UPDATED_EVENT = 'dental.imaging.study.updated';
exports.IMAGING_REPORT_CREATED_EVENT = 'dental.imaging.report.created';
exports.IMAGING_AI_RESULT_CREATED_EVENT = 'dental.imaging.ai-result.created';
exports.IMAGING_STUDY_CREATED_VERSION = 1;
exports.IMAGING_STUDY_UPDATED_VERSION = 1;
exports.IMAGING_REPORT_CREATED_VERSION = 1;
exports.IMAGING_AI_RESULT_CREATED_VERSION = 1;
function isImagingStudyCreatedEvent(event) {
    return event.type === exports.IMAGING_STUDY_CREATED_EVENT;
}
function createImagingStudyCreatedEvent(payload, metadata, tenantContext) {
    if (!payload.studyId) {
        throw new Error('ImagingStudyCreatedEvent: studyId is required');
    }
    if (!payload.patientId) {
        throw new Error('ImagingStudyCreatedEvent: patientId is required');
    }
    if (!payload.organizationId) {
        throw new Error('ImagingStudyCreatedEvent: organizationId is required');
    }
    if (!payload.clinicId) {
        throw new Error('ImagingStudyCreatedEvent: clinicId is required');
    }
    if (!payload.tenantId) {
        throw new Error('ImagingStudyCreatedEvent: tenantId is required');
    }
    if (!payload.modality) {
        throw new Error('ImagingStudyCreatedEvent: modality is required');
    }
    if (!payload.region) {
        throw new Error('ImagingStudyCreatedEvent: region is required');
    }
    if (!payload.studyDate) {
        throw new Error('ImagingStudyCreatedEvent: studyDate is required');
    }
    if (!payload.referringProviderId) {
        throw new Error('ImagingStudyCreatedEvent: referringProviderId is required');
    }
    if (!payload.status) {
        throw new Error('ImagingStudyCreatedEvent: status is required');
    }
    if (payload.fileCount === undefined || payload.fileCount === null) {
        throw new Error('ImagingStudyCreatedEvent: fileCount is required');
    }
    if (payload.fileCount < 0) {
        throw new Error('ImagingStudyCreatedEvent: fileCount cannot be negative');
    }
    if (!payload.timestamp) {
        throw new Error('ImagingStudyCreatedEvent: timestamp is required');
    }
    return {
        id: crypto.randomUUID(),
        type: exports.IMAGING_STUDY_CREATED_EVENT,
        version: exports.IMAGING_STUDY_CREATED_VERSION,
        occurredAt: new Date(),
        payload,
        metadata,
        tenantContext,
    };
}
function isImagingStudyUpdatedEvent(event) {
    return event.type === exports.IMAGING_STUDY_UPDATED_EVENT;
}
function createImagingStudyUpdatedEvent(payload, metadata, tenantContext) {
    if (!payload.studyId) {
        throw new Error('ImagingStudyUpdatedEvent: studyId is required');
    }
    if (!payload.patientId) {
        throw new Error('ImagingStudyUpdatedEvent: patientId is required');
    }
    if (!payload.organizationId) {
        throw new Error('ImagingStudyUpdatedEvent: organizationId is required');
    }
    if (!payload.clinicId) {
        throw new Error('ImagingStudyUpdatedEvent: clinicId is required');
    }
    if (!payload.tenantId) {
        throw new Error('ImagingStudyUpdatedEvent: tenantId is required');
    }
    if (!payload.changes) {
        throw new Error('ImagingStudyUpdatedEvent: changes object is required');
    }
    if (Object.keys(payload.changes).length === 0) {
        throw new Error('ImagingStudyUpdatedEvent: changes object cannot be empty');
    }
    if (!payload.updatedBy) {
        throw new Error('ImagingStudyUpdatedEvent: updatedBy is required');
    }
    if (!payload.timestamp) {
        throw new Error('ImagingStudyUpdatedEvent: timestamp is required');
    }
    return {
        id: crypto.randomUUID(),
        type: exports.IMAGING_STUDY_UPDATED_EVENT,
        version: exports.IMAGING_STUDY_UPDATED_VERSION,
        occurredAt: new Date(),
        payload,
        metadata,
        tenantContext,
    };
}
function isImagingReportCreatedEvent(event) {
    return event.type === exports.IMAGING_REPORT_CREATED_EVENT;
}
function createImagingReportCreatedEvent(payload, metadata, tenantContext) {
    if (!payload.reportId) {
        throw new Error('ImagingReportCreatedEvent: reportId is required');
    }
    if (!payload.studyId) {
        throw new Error('ImagingReportCreatedEvent: studyId is required');
    }
    if (!payload.patientId) {
        throw new Error('ImagingReportCreatedEvent: patientId is required');
    }
    if (!payload.organizationId) {
        throw new Error('ImagingReportCreatedEvent: organizationId is required');
    }
    if (!payload.clinicId) {
        throw new Error('ImagingReportCreatedEvent: clinicId is required');
    }
    if (!payload.tenantId) {
        throw new Error('ImagingReportCreatedEvent: tenantId is required');
    }
    if (!payload.reportType) {
        throw new Error('ImagingReportCreatedEvent: reportType is required');
    }
    if (!payload.generatedBy) {
        throw new Error('ImagingReportCreatedEvent: generatedBy is required');
    }
    if (!payload.findingsSummary || payload.findingsSummary.trim().length === 0) {
        throw new Error('ImagingReportCreatedEvent: findingsSummary is required and cannot be empty');
    }
    if (!payload.status) {
        throw new Error('ImagingReportCreatedEvent: status is required');
    }
    if (!payload.version || payload.version < 1) {
        throw new Error('ImagingReportCreatedEvent: version is required and must be >= 1');
    }
    if (!payload.timestamp) {
        throw new Error('ImagingReportCreatedEvent: timestamp is required');
    }
    return {
        id: crypto.randomUUID(),
        type: exports.IMAGING_REPORT_CREATED_EVENT,
        version: exports.IMAGING_REPORT_CREATED_VERSION,
        occurredAt: new Date(),
        payload,
        metadata,
        tenantContext,
    };
}
function isImagingAIResultCreatedEvent(event) {
    return event.type === exports.IMAGING_AI_RESULT_CREATED_EVENT;
}
function createImagingAIResultCreatedEvent(payload, metadata, tenantContext) {
    if (!payload.aiResultId) {
        throw new Error('ImagingAIResultCreatedEvent: aiResultId is required');
    }
    if (!payload.studyId) {
        throw new Error('ImagingAIResultCreatedEvent: studyId is required');
    }
    if (!payload.patientId) {
        throw new Error('ImagingAIResultCreatedEvent: patientId is required');
    }
    if (!payload.organizationId) {
        throw new Error('ImagingAIResultCreatedEvent: organizationId is required');
    }
    if (!payload.clinicId) {
        throw new Error('ImagingAIResultCreatedEvent: clinicId is required');
    }
    if (!payload.tenantId) {
        throw new Error('ImagingAIResultCreatedEvent: tenantId is required');
    }
    if (!payload.aiModelName || payload.aiModelName.trim().length === 0) {
        throw new Error('ImagingAIResultCreatedEvent: aiModelName is required and cannot be empty');
    }
    if (payload.findingsCount === undefined || payload.findingsCount === null) {
        throw new Error('ImagingAIResultCreatedEvent: findingsCount is required');
    }
    if (payload.findingsCount < 0) {
        throw new Error('ImagingAIResultCreatedEvent: findingsCount cannot be negative');
    }
    if (!Array.isArray(payload.criticalFindings)) {
        throw new Error('ImagingAIResultCreatedEvent: criticalFindings must be an array');
    }
    if (payload.overallConfidence === undefined || payload.overallConfidence === null) {
        throw new Error('ImagingAIResultCreatedEvent: overallConfidence is required');
    }
    if (payload.overallConfidence < 0 || payload.overallConfidence > 1) {
        throw new Error('ImagingAIResultCreatedEvent: overallConfidence must be between 0 and 1');
    }
    if (!payload.timestamp) {
        throw new Error('ImagingAIResultCreatedEvent: timestamp is required');
    }
    return {
        id: crypto.randomUUID(),
        type: exports.IMAGING_AI_RESULT_CREATED_EVENT,
        version: exports.IMAGING_AI_RESULT_CREATED_VERSION,
        occurredAt: new Date(),
        payload,
        metadata,
        tenantContext,
    };
}
//# sourceMappingURL=imaging.events.js.map