/**
 * Patient Documents Module exports
 * @module modules/documents
 */

// Module
export { DocumentsModule } from './documents.module';

// Service
export { DocumentsService } from './documents.service';
export type { UploadedFile, TenantContext } from './documents.service';

// Repository
export { DocumentsRepository } from './documents.repository';
export type {
  DocumentSearchCriteria,
  PaginationOptions,
  PaginatedResult,
} from './documents.repository';

// Entities
export {
  PatientDocument,
  PatientDocumentDocument,
  PatientDocumentSchema,
  DocumentCategory,
  DocumentSource,
  SignatureInfo,
  FileMetadata,
} from './entities';

// DTOs
export {
  CreateDocumentDto,
  UpdateDocumentDto,
  SearchDocumentsDto,
  SignDocumentDto,
  AddAdditionalSignatureDto,
  GenerateDocumentDto,
  BulkUploadDocumentsDto,
  BulkUploadFileMetadataDto,
  PatientDocumentResponse,
  FileInfoResponse,
  SignatureResponse,
  PaginatedDocumentsResponse,
  UploadUrlResponse,
  DownloadUrlResponse,
  CategoryCountResponse,
  DocumentsSummaryResponse,
} from './dto';
export type { SignatureMethod, SignerRole, BulkUploadFileResult, BulkUploadResponse } from './dto';

// Events
export {
  DocumentUploadedEvent,
  DocumentSignedEvent,
  DocumentDeletedEvent,
  DocumentGeneratedEvent,
  DocumentUpdatedEvent,
  DocumentAccessedEvent,
  DocumentExpiringEvent,
} from './events';

// Services
export {
  S3StorageService,
  ThumbnailService,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
  URL_EXPIRY,
  THUMBNAIL_CONFIG,
} from './services';
export type { S3Config, UploadResult, PresignedUploadUrl, PresignedDownloadUrl } from './services';
