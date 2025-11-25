/**
 * Merge Patients DTO
 *
 * Defines the structure for merging duplicate patient records.
 *
 * @module modules/patients/dto
 */

import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Merge Patients DTO
 *
 * Specifies which patient is the master record and which is the duplicate.
 * The duplicate will be soft-deleted and its data merged into the master.
 */
export class MergePatientsDto {
  @ApiProperty({ description: 'ID of the master patient (will retain this record)' })
  @IsUUID()
  @IsNotEmpty()
  masterId!: string;

  @ApiProperty({ description: 'ID of the duplicate patient (will be soft-deleted)' })
  @IsUUID()
  @IsNotEmpty()
  duplicateId!: string;
}
