/**
 * Shared TypeScript types for Dental OS monorepo
 * @module shared-types
 * @packageDocumentation
 */

// ============================================================================
// Common Types
// ============================================================================
export type {
  Brand,
  UUID,
  ISODateString,
  Email,
  PhoneNumber,
  URL,
  PositiveInt,
  DeepPartial,
  DeepRequired,
  RequireKeys,
  OptionalKeys,
  Nullable,
  Maybe,
  ValueOf,
  AtLeastOne,
  ExactlyOne,
  DeepReadonly,
  StrictOmit,
  StrictPick,
  JSONValue,
  JSONObject,
  Metadata,
  SortOrder,
  SortConfig,
} from './common.types';

// ============================================================================
// Multi-Tenant Types
// ============================================================================
export type {
  OrganizationId,
  ClinicId,
  TenantId,
  TenantScoped,
  TenantContext,
  Organization,
  Clinic,
  TenantScopeFilter,
  MultiTenantQueryOptions,
} from './multi-tenant.types';

export { TenantType, TenantIsolationPolicy } from './multi-tenant.types';

// ============================================================================
// Entity Types
// ============================================================================
export type {
  BaseEntity,
  SoftDeletable,
  Auditable,
  Versionable,
  FullBaseEntity,
  TenantEntity,
  FullTenantEntity,
  EntityMetadata,
  EntityWithMetadata,
  EntityLifecycle,
  TimestampedEntity,
  EntityReference,
  EntityChange,
  EntityWithHistory,
  EntityTag,
  Taggable,
} from './entity.types';

export { EntityStatus } from './entity.types';

// ============================================================================
// User and Role Types
// ============================================================================
export type {
  Permission,
  Role,
  UserProfile,
  UserAuth,
  User,
  UserSession,
  UserDTO,
  UserInvitation,
} from './user.types';

export {
  UserRole,
  PermissionAction,
  ResourceType,
  UserStatus,
} from './user.types';

// ============================================================================
// Enumeration Types
// ============================================================================
export {
  Status,
  ApprovalStatus,
  PaymentStatus,
  AppointmentStatus,
  TreatmentStatus,
  Priority,
  Gender,
  MaritalStatus,
  ContactMethod,
  NotificationType,
  NotificationChannel,
  DocumentType,
  MimeTypeCategory,
  RecurrencePattern,
  DayOfWeek,
  CurrencyCode,
  LanguageCode,
  TimeZone,
  HttpStatusCode,
  LogLevel,
  Environment,
  // Inventory & Procurement Enums
  ProductCategory,
  UnitOfMeasure,
  ProductStatus,
  StockStatus,
  MovementType,
  PurchaseOrderStatus,
  SupplierStatus,
  LocationType,
  GoodsReceiptStatus,
} from './enums';

// ============================================================================
// Audit Types
// ============================================================================
export type {
  AuditActor,
  AuditTarget,
  AuditMetadata,
  AuditFieldChange,
  AuditLogEntry,
  AuditLogFilter,
  AuditStatistics,
  CreateAuditLogEntry,
} from './audit.types';

export { AuditAction, AuditSeverity } from './audit.types';

// ============================================================================
// Pagination Types
// ============================================================================
export type {
  BasePaginationParams,
  OffsetPaginationParams,
  CursorPaginationParams,
  PaginationParams,
  OffsetPaginationMeta,
  CursorPaginationMeta,
  PaginationMeta,
  PaginatedResponse,
  PaginatedList,
  Cursor,
  InfiniteScrollResponse,
} from './pagination.types';

export {
  PaginationStrategy,
  PAGINATION_DEFAULTS,
  isOffsetPagination,
  isCursorPagination,
  isOffsetPaginationMeta,
  isCursorPaginationMeta,
} from './pagination.types';

// ============================================================================
// API Types
// ============================================================================
export type {
  ValidationError,
  ApiError,
  ApiResponse,
  SuccessResponse,
  ErrorResponse,
  PaginatedApiResponse,
  BatchRequest,
  BatchItemResult,
  BatchResponse,
  HealthCheck,
  HealthCheckResponse,
  RequestContext,
  HttpMethod,
  ApiEndpoint,
  RateLimitInfo,
  ApiVersion,
} from './api.types';

export {
  ApiResponseStatus,
  ErrorSeverity,
  ErrorCode,
  HealthStatus,
} from './api.types';
