/**
 * Patient Ownership Guard
 *
 * Ensures that the authenticated patient can only access their own resources.
 * Prevents cross-patient data access.
 *
 * @module common/guards/patient-ownership-guard
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';

/**
 * Patient ownership guard
 *
 * Validates that the resource being accessed belongs to the authenticated patient.
 * Checks if patientId in route params matches authenticated patient's ID.
 */
@Injectable()
export class PatientOwnershipGuard implements CanActivate {
  private readonly logger = new Logger(PatientOwnershipGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const params = request.params;

    // Extract patient ID from authenticated user
    const authenticatedPatientId = user?.patientId;

    if (!authenticatedPatientId) {
      this.logger.error({
        message: 'No patientId found in authenticated user',
        user,
      });
      throw new ForbiddenException('Invalid authentication state.');
    }

    // Check if route has a patientId parameter
    // This guard should only be used on routes that have :patientId in params
    const routePatientId = params.patientId;

    // If no patientId in route, allow (not applicable for this guard)
    if (!routePatientId) {
      return true;
    }

    // Verify that the patient is accessing their own resource
    if (authenticatedPatientId !== routePatientId) {
      this.logger.warn({
        message: 'Patient attempted to access another patient\'s resource',
        authenticatedPatientId,
        requestedPatientId: routePatientId,
        path: request.url,
      });
      throw new ForbiddenException('You do not have permission to access this resource.');
    }

    this.logger.debug({
      message: 'Patient ownership validated',
      patientId: authenticatedPatientId,
      path: request.url,
    });

    return true;
  }
}
