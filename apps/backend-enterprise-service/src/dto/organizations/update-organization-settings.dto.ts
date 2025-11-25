import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsBoolean,
  IsInt,
  IsPositive,
  IsOptional,
  Min,
  Max,
  Matches,
  IsArray,
} from 'class-validator';

/**
 * DTO for updating organization-wide settings
 * Controls branding, features, security, compliance, and notification preferences
 */
export class UpdateOrganizationSettingsDto {
  // ===== Branding Settings =====

  @ApiProperty({
    description: 'Primary brand color in hexadecimal format',
    example: '#0066CC',
    pattern: '^#[0-9A-Fa-f]{6}$',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'Brand color must be a valid hex color (e.g., #0066CC)',
  })
  brandPrimaryColor?: string;

  @ApiProperty({
    description: 'Secondary brand color in hexadecimal format',
    example: '#FF6600',
    pattern: '^#[0-9A-Fa-f]{6}$',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'Brand color must be a valid hex color (e.g., #FF6600)',
  })
  brandSecondaryColor?: string;

  @ApiProperty({
    description: 'Custom domain for white-label deployments',
    example: 'portal.smiledental.com',
    required: false,
  })
  @IsOptional()
  @IsString()
  customDomain?: string;

  // ===== Feature Toggles =====

  @ApiProperty({
    description: 'Enable multi-clinic management features',
    example: true,
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  enableMultiClinic?: boolean;

  @ApiProperty({
    description: 'Enable advanced analytics and reporting dashboards',
    example: true,
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  enableAdvancedAnalytics?: boolean;

  @ApiProperty({
    description: 'Enable AI-powered predictions (no-shows, churn risk, etc.)',
    example: true,
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  enableAIPredictions?: boolean;

  @ApiProperty({
    description: 'Enable marketing automation campaigns',
    example: true,
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  enableMarketingAutomation?: boolean;

  @ApiProperty({
    description: 'Enable inventory management and stock tracking',
    example: true,
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  enableInventoryManagement?: boolean;

  @ApiProperty({
    description: 'Enable sterilization cycle tracking and compliance',
    example: true,
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  enableSterilizationTracking?: boolean;

  @ApiProperty({
    description: 'Enable dental lab integration for prosthetics and appliances',
    example: false,
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  enableLabIntegration?: boolean;

  // ===== Security Settings =====

  @ApiProperty({
    description: 'Require multi-factor authentication for all users',
    example: true,
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  requireMFA?: boolean;

  @ApiProperty({
    description: 'Minimum password length requirement',
    example: 12,
    minimum: 8,
    maximum: 128,
    default: 8,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(8)
  @Max(128)
  passwordMinLength?: number;

  @ApiProperty({
    description: 'User session timeout in minutes (auto-logout after inactivity)',
    example: 30,
    minimum: 5,
    default: 60,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Min(5)
  sessionTimeoutMinutes?: number;

  @ApiProperty({
    description: 'Array of allowed IP address ranges in CIDR notation (leave empty to allow all)',
    example: ['203.0.113.0/24', '198.51.100.0/24'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedIPRanges?: string[];

  // ===== Compliance Settings =====

  @ApiProperty({
    description: 'Enable HIPAA compliance mode with enhanced audit logging',
    example: true,
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  enableHIPAAMode?: boolean;

  @ApiProperty({
    description: 'Enable GDPR compliance mode with data privacy controls',
    example: true,
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  enableGDPRMode?: boolean;

  @ApiProperty({
    description: 'Number of days to retain patient data before automatic deletion',
    example: 2555,
    minimum: 365,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Min(365)
  dataRetentionDays?: number;

  @ApiProperty({
    description: 'Require explicit patient consent before sending marketing communications',
    example: true,
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  requireConsentForMarketing?: boolean;

  // ===== Notification Settings =====

  @ApiProperty({
    description: 'Default timezone for the organization (IANA timezone format)',
    example: 'America/New_York',
    required: false,
  })
  @IsOptional()
  @IsString()
  defaultTimezone?: string;

  @ApiProperty({
    description: 'Default language/locale (ISO 639-1 language code)',
    example: 'en-US',
    required: false,
  })
  @IsOptional()
  @IsString()
  defaultLanguage?: string;

  @ApiProperty({
    description: 'Email address to receive system notifications and alerts',
    example: 'admin@smiledental.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  notificationEmail?: string;
}
