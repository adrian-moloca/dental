/**
 * S3 Storage Service
 *
 * Handles all S3 interactions for patient document storage.
 * Provides tenant-isolated storage with pre-signed URLs for secure access.
 *
 * SECURITY:
 * - All files are stored with tenant isolation: {tenantId}/patients/{patientId}/documents/{documentId}/
 * - Pre-signed URLs expire quickly (15 minutes for download, 1 hour for upload)
 * - Content-Type validation on upload
 * - S3 server-side encryption enabled
 *
 * @module modules/documents/services
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';

/**
 * Allowed MIME types for document uploads
 */
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/dicom',
  'application/octet-stream', // For DICOM files
] as const;

/**
 * Maximum file size in bytes (25MB)
 */
export const MAX_FILE_SIZE = 25 * 1024 * 1024;

/**
 * Pre-signed URL expiration times in seconds
 */
export const URL_EXPIRY = {
  DOWNLOAD: 15 * 60, // 15 minutes
  UPLOAD: 60 * 60, // 1 hour
  THUMBNAIL: 60 * 60, // 1 hour (thumbnails are less sensitive)
};

/**
 * S3 storage configuration
 */
export interface S3Config {
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  endpoint?: string; // For MinIO or other S3-compatible storage
}

/**
 * Upload result
 */
export interface UploadResult {
  storageKey: string;
  bucket: string;
  contentHash: string;
  fileSize: number;
}

/**
 * Pre-signed upload URL response
 */
export interface PresignedUploadUrl {
  url: string;
  fields: Record<string, string>;
  expiresAt: Date;
  storageKey: string;
}

/**
 * Pre-signed download URL response
 */
export interface PresignedDownloadUrl {
  url: string;
  expiresAt: Date;
}

/**
 * S3 Storage Service
 *
 * NOTE: This is a stub implementation. In production, you would use @aws-sdk/client-s3
 * and @aws-sdk/s3-request-presigner. The interface is designed to be drop-in compatible.
 */
@Injectable()
export class S3StorageService {
  private readonly logger = new Logger(S3StorageService.name);
  private readonly bucket: string;
  private readonly region: string;
  private readonly endpoint?: string;

  constructor(private readonly configService: ConfigService) {
    this.bucket = this.configService.get<string>('S3_BUCKET', 'dentalos-documents');
    this.region = this.configService.get<string>('S3_REGION', 'eu-central-1');
    this.endpoint = this.configService.get<string>('S3_ENDPOINT');

    this.logger.log(`S3 Storage Service initialized: bucket=${this.bucket}, region=${this.region}`);
  }

  /**
   * Generate storage key for a document
   *
   * Format: {tenantId}/patients/{patientId}/documents/{documentId}/{filename}
   * This ensures complete tenant isolation at the storage level.
   *
   * @param tenantId - Tenant ID
   * @param patientId - Patient ID
   * @param documentId - Document ID
   * @param filename - Original filename (sanitized)
   * @returns Storage key
   */
  generateStorageKey(
    tenantId: string,
    patientId: string,
    documentId: string,
    filename: string,
  ): string {
    // Sanitize filename to prevent path traversal
    const sanitizedFilename = this.sanitizeFilename(filename);
    return `${tenantId}/patients/${patientId}/documents/${documentId}/${sanitizedFilename}`;
  }

  /**
   * Generate storage key for a thumbnail
   *
   * @param documentStorageKey - Main document storage key
   * @returns Thumbnail storage key
   */
  generateThumbnailKey(documentStorageKey: string): string {
    const parts = documentStorageKey.split('/');
    const filename = parts.pop();
    return `${parts.join('/')}/thumbnails/${filename}_thumb.png`;
  }

  /**
   * Upload file to S3
   *
   * @param buffer - File content buffer
   * @param storageKey - S3 object key
   * @param mimeType - Content type
   * @param metadata - Additional metadata
   * @returns Upload result
   */
  async uploadFile(
    buffer: Buffer,
    storageKey: string,
    mimeType: string,
    _metadata?: Record<string, string>,
  ): Promise<UploadResult> {
    this.logger.debug(`Uploading file: ${storageKey}, size: ${buffer.length}, type: ${mimeType}`);

    // Validate file size
    if (buffer.length > MAX_FILE_SIZE) {
      throw new Error(`File size ${buffer.length} exceeds maximum allowed size ${MAX_FILE_SIZE}`);
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(mimeType as (typeof ALLOWED_MIME_TYPES)[number])) {
      throw new Error(`MIME type ${mimeType} is not allowed`);
    }

    // Calculate content hash for integrity verification
    const contentHash = createHash('sha256').update(buffer).digest('hex');

    // In production, this would use AWS SDK:
    // const command = new PutObjectCommand({
    //   Bucket: this.bucket,
    //   Key: storageKey,
    //   Body: buffer,
    //   ContentType: mimeType,
    //   ServerSideEncryption: 'AES256',
    //   Metadata: {
    //     ...metadata,
    //     'x-content-hash': contentHash,
    //   },
    // });
    // await this.s3Client.send(command);

    // Stub: Log the upload
    this.logger.log(
      `[STUB] File uploaded: ${storageKey}, hash: ${contentHash.substring(0, 16)}...`,
    );

    return {
      storageKey,
      bucket: this.bucket,
      contentHash,
      fileSize: buffer.length,
    };
  }

  /**
   * Generate pre-signed URL for file download
   *
   * @param storageKey - S3 object key
   * @param expirySeconds - URL expiration in seconds
   * @returns Pre-signed URL
   */
  async getDownloadUrl(
    storageKey: string,
    expirySeconds: number = URL_EXPIRY.DOWNLOAD,
  ): Promise<PresignedDownloadUrl> {
    // In production, this would use AWS SDK:
    // const command = new GetObjectCommand({
    //   Bucket: this.bucket,
    //   Key: storageKey,
    // });
    // const url = await getSignedUrl(this.s3Client, command, { expiresIn: expirySeconds });

    // Stub: Generate a placeholder URL
    const expiresAt = new Date(Date.now() + expirySeconds * 1000);
    const endpoint = this.endpoint || `https://${this.bucket}.s3.${this.region}.amazonaws.com`;
    const url = `${endpoint}/${storageKey}?X-Amz-Expires=${expirySeconds}&X-Amz-Signature=stub`;

    this.logger.debug(`[STUB] Generated download URL for: ${storageKey}`);

    return {
      url,
      expiresAt,
    };
  }

  /**
   * Generate pre-signed URL for file upload
   *
   * @param storageKey - S3 object key
   * @param mimeType - Expected content type
   * @param maxSize - Maximum file size
   * @param expirySeconds - URL expiration in seconds
   * @returns Pre-signed upload URL with form fields
   */
  async getUploadUrl(
    storageKey: string,
    mimeType: string,
    _maxSize: number = MAX_FILE_SIZE,
    expirySeconds: number = URL_EXPIRY.UPLOAD,
  ): Promise<PresignedUploadUrl> {
    // In production, this would use createPresignedPost:
    // const { url, fields } = await createPresignedPost(this.s3Client, {
    //   Bucket: this.bucket,
    //   Key: storageKey,
    //   Conditions: [
    //     ['content-length-range', 0, maxSize],
    //     ['eq', '$Content-Type', mimeType],
    //   ],
    //   Fields: {
    //     'Content-Type': mimeType,
    //   },
    //   Expires: expirySeconds,
    // });

    // Stub: Generate placeholder URL and fields
    const expiresAt = new Date(Date.now() + expirySeconds * 1000);
    const endpoint = this.endpoint || `https://${this.bucket}.s3.${this.region}.amazonaws.com`;

    this.logger.debug(`[STUB] Generated upload URL for: ${storageKey}`);

    return {
      url: endpoint,
      fields: {
        key: storageKey,
        'Content-Type': mimeType,
        'x-amz-server-side-encryption': 'AES256',
        policy: 'stub-policy',
        'x-amz-signature': 'stub-signature',
      },
      expiresAt,
      storageKey,
    };
  }

  /**
   * Delete file from S3
   *
   * Note: In a clinical context, we typically DON'T delete files.
   * Instead, we move them to a "deleted" prefix for retention.
   *
   * @param storageKey - S3 object key
   */
  async deleteFile(storageKey: string): Promise<void> {
    // In production, move to deleted prefix instead of actual deletion:
    // const newKey = `deleted/${storageKey}`;
    // await this.copyObject(storageKey, newKey);
    // await this.deleteObject(storageKey);

    this.logger.log(`[STUB] File marked for deletion: ${storageKey}`);
  }

  /**
   * Check if file exists
   *
   * @param storageKey - S3 object key
   * @returns Whether file exists
   */
  async fileExists(storageKey: string): Promise<boolean> {
    // In production:
    // const command = new HeadObjectCommand({
    //   Bucket: this.bucket,
    //   Key: storageKey,
    // });
    // try {
    //   await this.s3Client.send(command);
    //   return true;
    // } catch (error) {
    //   return false;
    // }

    this.logger.debug(`[STUB] Checking file existence: ${storageKey}`);
    return true; // Stub always returns true
  }

  /**
   * Get file metadata
   *
   * @param storageKey - S3 object key
   * @returns File metadata
   */
  async getFileMetadata(storageKey: string): Promise<{
    contentType: string;
    contentLength: number;
    lastModified: Date;
    metadata: Record<string, string>;
  }> {
    // In production, use HeadObjectCommand
    this.logger.debug(`[STUB] Getting file metadata: ${storageKey}`);

    return {
      contentType: 'application/pdf',
      contentLength: 0,
      lastModified: new Date(),
      metadata: {},
    };
  }

  /**
   * Sanitize filename to prevent path traversal and other issues
   *
   * @param filename - Original filename
   * @returns Sanitized filename
   */
  private sanitizeFilename(filename: string): string {
    // Remove path components
    let sanitized = filename.replace(/^.*[\\/]/, '');

    // Remove dangerous characters
    sanitized = sanitized.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_');

    // Limit length
    if (sanitized.length > 200) {
      const ext = sanitized.slice(sanitized.lastIndexOf('.'));
      sanitized = sanitized.slice(0, 200 - ext.length) + ext;
    }

    return sanitized || 'document';
  }

  /**
   * Get bucket name
   */
  getBucket(): string {
    return this.bucket;
  }

  /**
   * Validate MIME type is allowed
   *
   * @param mimeType - MIME type to validate
   * @returns Whether MIME type is allowed
   */
  isAllowedMimeType(mimeType: string): boolean {
    return ALLOWED_MIME_TYPES.includes(mimeType as (typeof ALLOWED_MIME_TYPES)[number]);
  }

  /**
   * Get file extension for MIME type
   *
   * @param mimeType - MIME type
   * @returns File extension
   */
  getExtensionForMimeType(mimeType: string): string {
    const extensions: Record<string, string> = {
      'application/pdf': '.pdf',
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'application/dicom': '.dcm',
      'application/octet-stream': '.dcm',
    };
    return extensions[mimeType] || '';
  }
}
