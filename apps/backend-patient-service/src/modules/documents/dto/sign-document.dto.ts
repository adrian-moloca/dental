/**
 * Sign Document DTO
 *
 * Validates document signature requests.
 * Captures all legally required signature information.
 *
 * @module modules/documents/dto
 */

import { IsString, IsOptional, IsEnum, IsUUID, MaxLength, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

/**
 * Signature methods that are legally valid
 */
export type SignatureMethod = 'electronic' | 'drawn' | 'biometric' | 'qualified';

/**
 * Signer role in relation to the document
 */
export type SignerRole = 'patient' | 'guardian' | 'provider' | 'witness' | 'other';

/**
 * DTO for adding a signature to a document
 *
 * LEGAL COMPLIANCE:
 * - Electronic signatures must meet e-IDAS requirements for Romania
 * - All signature events are logged for audit trail
 * - IP address and user agent are captured automatically by the server
 */
export class SignDocumentDto {
  /**
   * Method used to capture the signature
   */
  @ApiProperty({
    description: 'Signature capture method',
    enum: ['electronic', 'drawn', 'biometric', 'qualified'],
    example: 'electronic',
  })
  @IsEnum(['electronic', 'drawn', 'biometric', 'qualified'], {
    message: 'Signature method must be: electronic, drawn, biometric, or qualified',
  })
  signatureMethod!: SignatureMethod;

  /**
   * URL to signature image (for drawn signatures)
   */
  @ApiPropertyOptional({
    description: 'URL to signature image (for drawn signatures)',
    example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000000, { message: 'Signature image data too large' })
  signatureImageUrl?: string;

  /**
   * Device fingerprint for additional verification
   */
  @ApiPropertyOptional({
    description: 'Device fingerprint for verification',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  deviceFingerprint?: string;

  /**
   * Legal attestation text that was accepted
   */
  @ApiPropertyOptional({
    description: 'Attestation text accepted by signer',
    example: 'I have read and understood the contents of this document.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  attestationText?: string;

  /**
   * Name of signer as entered
   */
  @ApiPropertyOptional({
    description: 'Name of signer as they typed it',
    example: 'Ion Popescu',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  signerName?: string;

  /**
   * Relationship of signer to the document/patient
   */
  @ApiPropertyOptional({
    description: 'Role of the signer',
    enum: ['patient', 'guardian', 'provider', 'witness', 'other'],
    default: 'patient',
  })
  @IsOptional()
  @IsEnum(['patient', 'guardian', 'provider', 'witness', 'other'], {
    message: 'Signer role must be: patient, guardian, provider, witness, or other',
  })
  signerRole?: SignerRole;
}

/**
 * DTO for adding an additional signature to a document
 * (e.g., guardian co-signature, witness signature)
 */
export class AddAdditionalSignatureDto extends SignDocumentDto {
  /**
   * User ID of the signer (required for additional signatures)
   */
  @ApiProperty({
    description: 'User ID of the additional signer',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID(4, { message: 'Signer user ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Signer user ID is required' })
  signerUserId!: string;
}
