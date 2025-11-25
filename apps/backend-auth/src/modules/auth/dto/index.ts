/**
 * Authentication DTOs barrel export
 *
 * Exports all authentication-related data transfer objects.
 *
 * @module modules/auth/dto
 */

export * from './register.dto';
export * from './login.dto';
export * from './login-smart.dto';
export { LoginSmartResponseDto, OrganizationSummaryDto } from './login-smart-response.dto';
export * from './select-org.dto';
export * from './auth-response.dto';
export * from './refresh-token-payload.dto';
export * from './refresh-token.dto';
export * from './logout.dto';
export * from './session.dto';
export * from './select-cabinet.dto';

// Export cabinet-related DTOs
// Note: CabinetSummaryDto exists in two forms:
// - cabinet-summary.dto: class-validator version (primary)
// - enhanced-auth-response.dto: zod version
// We export the class-validator version as primary and avoid re-exporting the zod version
export { CabinetSummaryDto } from './cabinet-summary.dto';
export * from './cabinet-list-response.dto';

// Export enhanced-auth-response.dto selectively to avoid CabinetSummaryDto conflict
export {
  CabinetSummarySchema,
  SubscriptionModuleSummarySchema,
  SubscriptionModuleSummaryDto,
  SubscriptionSummarySchema,
  SubscriptionSummaryDto,
  EnhancedAuthResponseDto,
} from './enhanced-auth-response.dto';

// Export types that were previously only available in cabinet-list-response.dto
export {
  CabinetSelectionResponseDto,
  CabinetInfoDto,
  CabinetSubscriptionDto,
  SubscriptionStatus,
  ModuleCode,
} from './cabinet-list-response.dto';
