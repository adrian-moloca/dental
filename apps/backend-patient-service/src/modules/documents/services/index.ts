/**
 * Document services exports
 * @module modules/documents/services
 */

export {
  S3StorageService,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
  URL_EXPIRY,
} from './s3-storage.service';
export type {
  S3Config,
  UploadResult,
  PresignedUploadUrl,
  PresignedDownloadUrl,
} from './s3-storage.service';

export { ThumbnailService, THUMBNAIL_CONFIG } from './thumbnail.service';
