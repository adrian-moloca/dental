/**
 * Update Patient DTO
 *
 * Defines the data structure for updating an existing patient.
 * All fields are optional to support partial updates.
 *
 * @module modules/patients/dto
 */

import { PartialType } from '@nestjs/swagger';
import { CreatePatientDto } from './create-patient.dto';

/**
 * Update Patient DTO
 *
 * Extends CreatePatientDto but makes all fields optional.
 * Supports partial updates of patient information.
 */
export class UpdatePatientDto extends PartialType(CreatePatientDto) {}
