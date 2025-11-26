/**
 * Medical Records Retention Module
 *
 * Enforces Romanian 10-year medical records retention law.
 * Prevents premature deletion and supports legal holds.
 */

export { RetentionModule } from './retention.module';
export { RetentionService } from './retention.service';
export { RetentionMetadata, RetentionMetadataSchema, RetentionStatus } from './retention.schema';
export {
  RetentionPolicyConfig,
  RecordType,
  RetentionExpiryAction,
  ROMANIAN_RETENTION_POLICY,
  RETENTION_POLICIES_BY_COUNTRY,
  getRetentionPolicy,
  calculateRetentionExpiry,
  isWithinRetentionPeriod,
  getDaysUntilRetentionExpiry,
} from './retention-policy.config';
