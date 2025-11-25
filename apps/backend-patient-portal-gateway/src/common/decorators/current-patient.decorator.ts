/**
 * Current Patient Decorator
 *
 * Extracts the current authenticated patient from the request.
 *
 * @module common/decorators/current-patient
 */

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentPatientPayload {
  patientId: string;
  userId: string;
  email: string;
  tenantId: string;
  organizationId?: string;
  clinicId?: string;
}

/**
 * Extract current patient from JWT payload
 *
 * @example
 * ```typescript
 * @Get('profile')
 * async getProfile(@CurrentPatient() patient: CurrentPatientPayload) {
 *   return this.profileService.getProfile(patient.patientId);
 * }
 * ```
 */
export const CurrentPatient = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CurrentPatientPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
