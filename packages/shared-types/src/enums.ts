/**
 * Common enumerations and constants
 * @module shared-types/enums
 */

/**
 * Generic status enumeration
 */
export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  ARCHIVED = 'ARCHIVED',
}

/**
 * Approval status
 */
export enum ApprovalStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

/**
 * Payment status
 */
export enum PaymentStatus {
  UNPAID = 'UNPAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED',
}

/**
 * Appointment status
 */
export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  CHECKED_IN = 'CHECKED_IN',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
  RESCHEDULED = 'RESCHEDULED',
}

/**
 * Treatment status
 */
export enum TreatmentStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  ON_HOLD = 'ON_HOLD',
}

/**
 * Priority levels
 */
export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

/**
 * Gender options
 */
export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY',
}

/**
 * Marital status
 */
export enum MaritalStatus {
  SINGLE = 'SINGLE',
  MARRIED = 'MARRIED',
  DIVORCED = 'DIVORCED',
  WIDOWED = 'WIDOWED',
  SEPARATED = 'SEPARATED',
  OTHER = 'OTHER',
}

/**
 * Contact method preference
 */
export enum ContactMethod {
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  SMS = 'SMS',
  POSTAL_MAIL = 'POSTAL_MAIL',
}

/**
 * Notification type
 */
export enum NotificationType {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  REMINDER = 'REMINDER',
}

/**
 * Notification channel
 */
export enum NotificationChannel {
  IN_APP = 'IN_APP',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
}

/**
 * Document type
 */
export enum DocumentType {
  MEDICAL_RECORD = 'MEDICAL_RECORD',
  CONSENT_FORM = 'CONSENT_FORM',
  INSURANCE_CARD = 'INSURANCE_CARD',
  PRESCRIPTION = 'PRESCRIPTION',
  LAB_RESULT = 'LAB_RESULT',
  XRAY = 'XRAY',
  PHOTO = 'PHOTO',
  INVOICE = 'INVOICE',
  RECEIPT = 'RECEIPT',
  OTHER = 'OTHER',
}

/**
 * File MIME type categories
 */
export enum MimeTypeCategory {
  IMAGE = 'IMAGE',
  DOCUMENT = 'DOCUMENT',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  ARCHIVE = 'ARCHIVE',
  OTHER = 'OTHER',
}

/**
 * Recurrence pattern
 */
export enum RecurrencePattern {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  BIWEEKLY = 'BIWEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
  CUSTOM = 'CUSTOM',
}

/**
 * Day of week
 */
export enum DayOfWeek {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
}

/**
 * Currency codes (ISO 4217)
 */
export enum CurrencyCode {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  CAD = 'CAD',
  AUD = 'AUD',
  JPY = 'JPY',
  CNY = 'CNY',
  INR = 'INR',
}

/**
 * Language codes (ISO 639-1)
 */
export enum LanguageCode {
  EN = 'en',
  ES = 'es',
  FR = 'fr',
  DE = 'de',
  IT = 'it',
  PT = 'pt',
  ZH = 'zh',
  JA = 'ja',
  KO = 'ko',
  AR = 'ar',
}

/**
 * Time zone identifiers (IANA)
 */
export enum TimeZone {
  UTC = 'UTC',
  AMERICA_NEW_YORK = 'America/New_York',
  AMERICA_CHICAGO = 'America/Chicago',
  AMERICA_DENVER = 'America/Denver',
  AMERICA_LOS_ANGELES = 'America/Los_Angeles',
  EUROPE_LONDON = 'Europe/London',
  EUROPE_PARIS = 'Europe/Paris',
  ASIA_TOKYO = 'Asia/Tokyo',
  AUSTRALIA_SYDNEY = 'Australia/Sydney',
}

/**
 * HTTP status codes (subset)
 */
export enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

/**
 * Log level
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL',
}

/**
 * Environment type
 */
export enum Environment {
  DEVELOPMENT = 'DEVELOPMENT',
  STAGING = 'STAGING',
  PRODUCTION = 'PRODUCTION',
  TEST = 'TEST',
}

// ============================================================================
// Inventory & Procurement Enums
// ============================================================================

/**
 * Product category enumeration
 */
export enum ProductCategory {
  CONSUMABLE = 'CONSUMABLE',
  INSTRUMENT = 'INSTRUMENT',
  EQUIPMENT = 'EQUIPMENT',
  MEDICATION = 'MEDICATION',
  IMPLANT = 'IMPLANT',
  ORTHODONTIC = 'ORTHODONTIC',
  PROSTHETIC = 'PROSTHETIC',
  ENDODONTIC = 'ENDODONTIC',
  PERIODONTIC = 'PERIODONTIC',
  SURGICAL = 'SURGICAL',
  PREVENTIVE = 'PREVENTIVE',
  RESTORATIVE = 'RESTORATIVE',
  LABORATORY = 'LABORATORY',
  STERILIZATION = 'STERILIZATION',
  PPE = 'PPE', // Personal Protective Equipment
  OFFICE_SUPPLIES = 'OFFICE_SUPPLIES',
  OTHER = 'OTHER',
}

/**
 * Unit of measure enumeration
 */
export enum UnitOfMeasure {
  PIECE = 'PIECE',
  BOX = 'BOX',
  PACK = 'PACK',
  CASE = 'CASE',
  KIT = 'KIT',
  BOTTLE = 'BOTTLE',
  TUBE = 'TUBE',
  VIAL = 'VIAL',
  SYRINGE = 'SYRINGE',
  CARTRIDGE = 'CARTRIDGE',
  ROLL = 'ROLL',
  SHEET = 'SHEET',
  LITER = 'LITER',
  MILLILITER = 'MILLILITER',
  GRAM = 'GRAM',
  KILOGRAM = 'KILOGRAM',
  MILLIGRAM = 'MILLIGRAM',
  METER = 'METER',
  CENTIMETER = 'CENTIMETER',
  EACH = 'EACH',
}

/**
 * Product status enumeration
 */
export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DISCONTINUED = 'DISCONTINUED',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
}

/**
 * Stock status enumeration
 */
export enum StockStatus {
  AVAILABLE = 'AVAILABLE',
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  RESERVED = 'RESERVED',
  QUARANTINED = 'QUARANTINED',
  EXPIRED = 'EXPIRED',
  DAMAGED = 'DAMAGED',
  IN_TRANSIT = 'IN_TRANSIT',
}

/**
 * Stock movement type enumeration
 */
export enum MovementType {
  RECEIPT = 'RECEIPT', // Goods received
  CONSUMPTION = 'CONSUMPTION', // Used in procedure/treatment
  ADJUSTMENT_INCREASE = 'ADJUSTMENT_INCREASE', // Manual increase
  ADJUSTMENT_DECREASE = 'ADJUSTMENT_DECREASE', // Manual decrease
  TRANSFER_OUT = 'TRANSFER_OUT', // Transfer to another location
  TRANSFER_IN = 'TRANSFER_IN', // Received from another location
  RETURN_TO_SUPPLIER = 'RETURN_TO_SUPPLIER',
  DISPOSAL = 'DISPOSAL', // Expired/damaged disposal
  QUARANTINE = 'QUARANTINE', // Move to quarantine
  RELEASE_FROM_QUARANTINE = 'RELEASE_FROM_QUARANTINE',
  STOCKTAKE_INCREASE = 'STOCKTAKE_INCREASE', // Physical count adjustment
  STOCKTAKE_DECREASE = 'STOCKTAKE_DECREASE',
  DAMAGE = 'DAMAGE', // Damaged in storage
  THEFT_LOSS = 'THEFT_LOSS',
}

/**
 * Purchase order status enumeration
 */
export enum PurchaseOrderStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SENT_TO_SUPPLIER = 'SENT_TO_SUPPLIER',
  PARTIALLY_RECEIVED = 'PARTIALLY_RECEIVED',
  FULLY_RECEIVED = 'FULLY_RECEIVED',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
}

/**
 * Supplier status enumeration
 */
export enum SupplierStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING_QUALIFICATION = 'PENDING_QUALIFICATION',
  QUALIFIED = 'QUALIFIED',
  DISQUALIFIED = 'DISQUALIFIED',
  SUSPENDED = 'SUSPENDED',
}

/**
 * Stock location type enumeration
 */
export enum LocationType {
  WAREHOUSE = 'WAREHOUSE',
  CLINIC = 'CLINIC',
  TREATMENT_ROOM = 'TREATMENT_ROOM',
  STERILIZATION_ROOM = 'STERILIZATION_ROOM',
  STORAGE_ROOM = 'STORAGE_ROOM',
  QUARANTINE_AREA = 'QUARANTINE_AREA',
  DISPOSAL_AREA = 'DISPOSAL_AREA',
  RECEIVING_AREA = 'RECEIVING_AREA',
  MOBILE_UNIT = 'MOBILE_UNIT',
}

/**
 * Goods receipt status enumeration
 */
export enum GoodsReceiptStatus {
  DRAFT = 'DRAFT',
  RECEIVED = 'RECEIVED',
  PARTIALLY_ACCEPTED = 'PARTIALLY_ACCEPTED',
  FULLY_ACCEPTED = 'FULLY_ACCEPTED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}
