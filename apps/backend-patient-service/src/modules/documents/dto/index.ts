/**
 * Document DTOs exports
 * @module modules/documents/dto
 */

export { CreateDocumentDto } from './create-document.dto';
export { UpdateDocumentDto } from './update-document.dto';
export { SearchDocumentsDto } from './search-documents.dto';
export { SignDocumentDto, AddAdditionalSignatureDto } from './sign-document.dto';
export type { SignatureMethod, SignerRole } from './sign-document.dto';
export { GenerateDocumentDto } from './generate-document.dto';
export { BulkUploadDocumentsDto, BulkUploadFileMetadataDto } from './bulk-upload.dto';
export type { BulkUploadFileResult, BulkUploadResponse } from './bulk-upload.dto';
export {
  PatientDocumentResponse,
  FileInfoResponse,
  SignatureResponse,
  PaginatedDocumentsResponse,
  UploadUrlResponse,
  DownloadUrlResponse,
  CategoryCountResponse,
  DocumentsSummaryResponse,
} from './document-response.dto';
