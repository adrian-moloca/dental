import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as crypto from 'crypto';

import {
  EFacturaConfig,
  EFacturaConfigStatus,
  EFacturaConfigDocument,
  StoredOAuthTokens,
  AutoSubmitConfig,
  NotificationSettings,
} from '../entities/e-factura-config.schema';
import { TenantContext } from '../interfaces/anaf-config.interface';
import {
  EFACTURA_EVENTS,
  createEFacturaAuthRequiredEvent,
  createEFacturaTokenRefreshedEvent,
} from '../events/e-factura.events';

/**
 * DTO for creating E-Factura configuration
 */
export interface CreateEFacturaConfigDto {
  /** CUI (Cod Unic de Identificare) */
  cui: string;
  /** Company legal name */
  companyName: string;
  /** Trade name (optional) */
  tradeName?: string;
  /** Registration number (J number) */
  registrationNumber?: string;
  /** Company address */
  address: {
    streetName: string;
    additionalStreetName?: string;
    city: string;
    county?: string;
    postalCode?: string;
    countryCode?: string;
  };
  /** Contact information */
  contact?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  /** Bank account */
  bankAccount?: {
    iban?: string;
    bankName?: string;
    swift?: string;
  };
  /** OAuth client ID */
  oauthClientId?: string;
  /** OAuth client secret */
  oauthClientSecret?: string;
  /** OAuth redirect URI */
  oauthRedirectUri?: string;
  /** Use test environment */
  useTestEnvironment?: boolean;
  /** Auto-submit settings */
  autoSubmit?: Partial<AutoSubmitConfig>;
  /** Notification settings */
  notifications?: Partial<NotificationSettings>;
}

/**
 * DTO for updating E-Factura configuration
 */
export interface UpdateEFacturaConfigDto extends Partial<CreateEFacturaConfigDto> {
  /** Enable or disable the integration */
  enabled?: boolean;
  /** Rate limiting settings */
  maxSubmissionsPerMinute?: number;
  maxStatusChecksPerMinute?: number;
  /** Retry settings */
  maxRetries?: number;
  retryBaseDelayMs?: number;
  retryMaxDelayMs?: number;
}

/**
 * E-Factura Configuration Service
 *
 * Manages per-tenant E-Factura configuration including:
 * - Company fiscal information
 * - OAuth credentials and token management
 * - Auto-submit settings
 * - Notification preferences
 *
 * Security:
 * - OAuth secrets are encrypted at rest
 * - Tokens are never exposed in API responses
 * - Access requires admin permissions
 */
@Injectable()
export class EFacturaConfigService {
  private readonly logger = new Logger(EFacturaConfigService.name);
  private readonly encryptionKey: Buffer;
  private readonly encryptionAlgorithm = 'aes-256-gcm';

  constructor(
    @InjectModel(EFacturaConfig.name)
    private configModel: Model<EFacturaConfigDocument>,
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
  ) {
    // Get encryption key from environment (should be 32 bytes for AES-256)
    const keyBase64 = this.configService.get<string>('EFACTURA_ENCRYPTION_KEY');
    if (keyBase64) {
      this.encryptionKey = Buffer.from(keyBase64, 'base64');
    } else {
      // Generate a deterministic key for development (NOT for production!)
      this.logger.warn('EFACTURA_ENCRYPTION_KEY not set. Using development key.');
      this.encryptionKey = crypto.scryptSync('development-key-not-for-production', 'salt', 32);
    }
  }

  /**
   * Create a new E-Factura configuration for a tenant
   */
  async create(dto: CreateEFacturaConfigDto, context: TenantContext): Promise<EFacturaConfig> {
    this.logger.log(`Creating E-Factura config for tenant ${context.tenantId}, CUI: ${dto.cui}`);

    // Validate CUI format
    this.validateCui(dto.cui);

    // Check for existing config
    const existingConfig = await this.configModel.findOne({
      tenantId: context.tenantId,
      organizationId: context.organizationId,
      clinicId: context.clinicId || null,
    });

    if (existingConfig) {
      throw new ConflictException(
        `E-Factura configuration already exists for this ${context.clinicId ? 'clinic' : 'organization'}`,
      );
    }

    // Encrypt sensitive fields
    const encryptedClientSecret = dto.oauthClientSecret
      ? this.encrypt(dto.oauthClientSecret)
      : undefined;

    const config = new this.configModel({
      tenantId: context.tenantId,
      organizationId: context.organizationId,
      clinicId: context.clinicId || null,
      cui: this.normalizeCui(dto.cui),
      companyName: dto.companyName,
      tradeName: dto.tradeName,
      registrationNumber: dto.registrationNumber,
      address: {
        ...dto.address,
        countryCode: dto.address.countryCode || 'RO',
      },
      contact: dto.contact,
      bankAccount: dto.bankAccount,
      oauthClientId: dto.oauthClientId,
      oauthClientSecret: encryptedClientSecret,
      oauthRedirectUri: dto.oauthRedirectUri,
      useTestEnvironment: dto.useTestEnvironment ?? true,
      autoSubmit: {
        enabled: dto.autoSubmit?.enabled ?? false,
        b2bOnly: dto.autoSubmit?.b2bOnly ?? true,
        delayMinutes: dto.autoSubmit?.delayMinutes ?? 0,
        maxRetries: dto.autoSubmit?.maxRetries ?? 3,
        minAmount: dto.autoSubmit?.minAmount,
      },
      notifications: {
        notifyOnAccepted: dto.notifications?.notifyOnAccepted || [],
        notifyOnRejected: dto.notifications?.notifyOnRejected || [],
        notifyOnError: dto.notifications?.notifyOnError || [],
        dailyDigest: dto.notifications?.dailyDigest ?? false,
      },
      status: EFacturaConfigStatus.PENDING_AUTHORIZATION,
      enabled: false,
      createdBy: context.userId,
    });

    await config.save();
    this.logger.log(`Created E-Factura config ${config._id} for CUI ${config.cui}`);

    return config;
  }

  /**
   * Get configuration for a tenant/organization/clinic
   */
  async findOne(context: TenantContext): Promise<EFacturaConfig | null> {
    // First try clinic-specific config, then fall back to org-level
    if (context.clinicId) {
      const clinicConfig = await this.configModel.findOne({
        tenantId: context.tenantId,
        organizationId: context.organizationId,
        clinicId: context.clinicId,
      });
      if (clinicConfig) return clinicConfig;
    }

    // Fall back to organization-level config
    return this.configModel.findOne({
      tenantId: context.tenantId,
      organizationId: context.organizationId,
      clinicId: null,
    });
  }

  /**
   * Get configuration or throw if not found
   */
  async findOneOrFail(context: TenantContext): Promise<EFacturaConfig> {
    const config = await this.findOne(context);
    if (!config) {
      throw new NotFoundException(
        `E-Factura configuration not found for ${context.clinicId ? 'clinic' : 'organization'}`,
      );
    }
    return config;
  }

  /**
   * Get configuration by CUI (for ANAF callbacks)
   */
  async findByCui(cui: string): Promise<EFacturaConfig | null> {
    const normalizedCui = this.normalizeCui(cui);
    return this.configModel.findOne({ cui: normalizedCui });
  }

  /**
   * Update E-Factura configuration
   */
  async update(dto: UpdateEFacturaConfigDto, context: TenantContext): Promise<EFacturaConfig> {
    const config = await this.findOneOrFail(context);

    // Validate CUI if being updated
    if (dto.cui) {
      this.validateCui(dto.cui);
      config.cui = this.normalizeCui(dto.cui);
    }

    // Update basic fields
    if (dto.companyName !== undefined) config.companyName = dto.companyName;
    if (dto.tradeName !== undefined) config.tradeName = dto.tradeName;
    if (dto.registrationNumber !== undefined) config.registrationNumber = dto.registrationNumber;
    if (dto.address) {
      config.address = {
        ...config.address,
        ...dto.address,
        countryCode: dto.address.countryCode || config.address.countryCode || 'RO',
      };
    }
    if (dto.contact !== undefined) config.contact = dto.contact;
    if (dto.bankAccount !== undefined) config.bankAccount = dto.bankAccount;

    // Update OAuth settings
    if (dto.oauthClientId !== undefined) config.oauthClientId = dto.oauthClientId;
    if (dto.oauthClientSecret !== undefined) {
      config.oauthClientSecret = this.encrypt(dto.oauthClientSecret);
    }
    if (dto.oauthRedirectUri !== undefined) config.oauthRedirectUri = dto.oauthRedirectUri;

    // Update environment setting
    if (dto.useTestEnvironment !== undefined) config.useTestEnvironment = dto.useTestEnvironment;

    // Update auto-submit settings
    if (dto.autoSubmit) {
      config.autoSubmit = {
        ...config.autoSubmit,
        ...dto.autoSubmit,
      };
    }

    // Update notification settings
    if (dto.notifications) {
      config.notifications = {
        notifyOnAccepted:
          dto.notifications.notifyOnAccepted || config.notifications?.notifyOnAccepted || [],
        notifyOnRejected:
          dto.notifications.notifyOnRejected || config.notifications?.notifyOnRejected || [],
        notifyOnError: dto.notifications.notifyOnError || config.notifications?.notifyOnError || [],
        dailyDigest: dto.notifications.dailyDigest ?? config.notifications?.dailyDigest ?? false,
      };
    }

    // Update rate limiting
    if (dto.maxSubmissionsPerMinute !== undefined) {
      config.maxSubmissionsPerMinute = dto.maxSubmissionsPerMinute;
    }
    if (dto.maxStatusChecksPerMinute !== undefined) {
      config.maxStatusChecksPerMinute = dto.maxStatusChecksPerMinute;
    }

    // Update retry settings
    if (dto.maxRetries !== undefined) config.maxRetries = dto.maxRetries;
    if (dto.retryBaseDelayMs !== undefined) config.retryBaseDelayMs = dto.retryBaseDelayMs;
    if (dto.retryMaxDelayMs !== undefined) config.retryMaxDelayMs = dto.retryMaxDelayMs;

    // Handle enable/disable
    if (dto.enabled !== undefined) {
      if (dto.enabled && !config.enabled) {
        // Enabling - check if ready
        const needsReauth = this.checkNeedsReauthorization(config);
        if (needsReauth) {
          throw new BadRequestException(
            'Cannot enable E-Factura: OAuth authorization required. Please complete the authorization flow.',
          );
        }
      }
      config.enabled = dto.enabled;
    }

    config.updatedBy = context.userId;
    await config.save();

    this.logger.log(`Updated E-Factura config ${config._id}`);
    return config;
  }

  /**
   * Store OAuth tokens after successful authorization
   */
  async storeOAuthTokens(
    _cui: string,
    tokens: {
      accessToken: string;
      refreshToken?: string;
      tokenType: string;
      expiresIn: number;
      scope?: string;
    },
    context: TenantContext,
  ): Promise<EFacturaConfig> {
    const config = await this.findOneOrFail(context);

    // Encrypt tokens
    const storedTokens: StoredOAuthTokens = {
      accessToken: this.encrypt(tokens.accessToken),
      refreshToken: tokens.refreshToken ? this.encrypt(tokens.refreshToken) : undefined,
      tokenType: tokens.tokenType,
      expiresAt: new Date(Date.now() + tokens.expiresIn * 1000),
      scope: tokens.scope,
      obtainedAt: new Date(),
    };

    config.oauthTokens = storedTokens;
    config.status = EFacturaConfigStatus.ACTIVE;
    config.lastOAuthVerifiedAt = new Date();
    config.errorMessage = undefined;
    config.updatedBy = context.userId;

    await config.save();

    // Emit event
    this.eventEmitter.emit(
      EFACTURA_EVENTS.TOKEN_REFRESHED,
      createEFacturaTokenRefreshedEvent({
        tenantId: context.tenantId,
        organizationId: context.organizationId,
        clinicId: context.clinicId,
        userId: context.userId,
        cui: config.cui,
        expiresAt: storedTokens.expiresAt,
        refreshType: 'manual',
      }),
    );

    this.logger.log(`Stored OAuth tokens for CUI ${config.cui}`);
    return config;
  }

  /**
   * Get decrypted OAuth access token
   */
  async getAccessToken(context: TenantContext): Promise<string | null> {
    const config = await this.findOne(context);
    if (!config?.oauthTokens?.accessToken) return null;

    // Check expiry
    if (this.checkTokenExpired(config)) {
      // Emit auth required event
      this.eventEmitter.emit(
        EFACTURA_EVENTS.AUTH_REQUIRED,
        createEFacturaAuthRequiredEvent({
          tenantId: context.tenantId,
          organizationId: context.organizationId,
          clinicId: context.clinicId,
          cui: config.cui,
          reason: 'token_expired',
        }),
      );
      return null;
    }

    return this.decrypt(config.oauthTokens.accessToken);
  }

  /**
   * Get decrypted refresh token
   */
  async getRefreshToken(context: TenantContext): Promise<string | null> {
    const config = await this.findOne(context);
    if (!config?.oauthTokens?.refreshToken) return null;
    return this.decrypt(config.oauthTokens.refreshToken);
  }

  /**
   * Update token expiry status
   */
  async markTokenExpired(context: TenantContext): Promise<void> {
    const config = await this.findOneOrFail(context);
    config.status = EFacturaConfigStatus.TOKEN_EXPIRED;
    config.errorMessage = 'OAuth token has expired. Please re-authorize.';
    await config.save();

    this.eventEmitter.emit(
      EFACTURA_EVENTS.AUTH_REQUIRED,
      createEFacturaAuthRequiredEvent({
        tenantId: context.tenantId,
        organizationId: context.organizationId,
        clinicId: context.clinicId,
        cui: config.cui,
        reason: 'token_expired',
      }),
    );
  }

  /**
   * Record a successful submission
   */
  async recordSubmission(context: TenantContext): Promise<void> {
    await this.configModel.updateOne(
      {
        tenantId: context.tenantId,
        organizationId: context.organizationId,
        clinicId: context.clinicId || null,
      },
      {
        $inc: { totalSubmissions: 1 },
        $set: { lastSubmissionAt: new Date() },
      },
    );
  }

  /**
   * Record an accepted invoice
   */
  async recordAccepted(context: TenantContext): Promise<void> {
    await this.configModel.updateOne(
      {
        tenantId: context.tenantId,
        organizationId: context.organizationId,
        clinicId: context.clinicId || null,
      },
      {
        $inc: { totalAccepted: 1 },
      },
    );
  }

  /**
   * Record a rejected invoice
   */
  async recordRejected(context: TenantContext): Promise<void> {
    await this.configModel.updateOne(
      {
        tenantId: context.tenantId,
        organizationId: context.organizationId,
        clinicId: context.clinicId || null,
      },
      {
        $inc: { totalRejected: 1 },
      },
    );
  }

  /**
   * Record an error
   */
  async recordError(context: TenantContext, errorMessage: string): Promise<void> {
    await this.configModel.updateOne(
      {
        tenantId: context.tenantId,
        organizationId: context.organizationId,
        clinicId: context.clinicId || null,
      },
      {
        $set: {
          lastErrorAt: new Date(),
          errorMessage,
        },
      },
    );
  }

  /**
   * Get all configs that need token refresh (expiring within 24 hours)
   */
  async findExpiringTokens(): Promise<EFacturaConfig[]> {
    const expiryThreshold = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return this.configModel.find({
      enabled: true,
      status: EFacturaConfigStatus.ACTIVE,
      'oauthTokens.expiresAt': { $lt: expiryThreshold },
    });
  }

  /**
   * Get all configs with auto-submit enabled
   */
  async findAutoSubmitEnabled(): Promise<EFacturaConfig[]> {
    return this.configModel.find({
      enabled: true,
      status: EFacturaConfigStatus.ACTIVE,
      'autoSubmit.enabled': true,
    });
  }

  /**
   * Delete E-Factura configuration
   */
  async delete(context: TenantContext): Promise<void> {
    const config = await this.findOneOrFail(context);
    await this.configModel.deleteOne({ _id: config._id });
    this.logger.log(`Deleted E-Factura config ${config._id}`);
  }

  // ============================================
  // Private Helper Methods
  // ============================================

  /**
   * Check if OAuth token is expired
   * Returns true if token is expired or will expire within 5 minutes
   */
  private checkTokenExpired(config: EFacturaConfig): boolean {
    if (!config.oauthTokens?.expiresAt) return true;
    // Add 5 minute buffer for safety
    const bufferMs = 5 * 60 * 1000;
    return new Date(config.oauthTokens.expiresAt).getTime() - bufferMs < Date.now();
  }

  /**
   * Check if configuration needs OAuth re-authorization
   */
  private checkNeedsReauthorization(config: EFacturaConfig): boolean {
    return (
      config.status === EFacturaConfigStatus.PENDING_AUTHORIZATION ||
      config.status === EFacturaConfigStatus.TOKEN_EXPIRED ||
      this.checkTokenExpired(config)
    );
  }

  /**
   * Validate CUI format
   */
  private validateCui(cui: string): void {
    const normalized = this.normalizeCui(cui);
    // Romanian CUI format: RO followed by 2-10 digits
    if (!/^RO\d{2,10}$/.test(normalized)) {
      throw new BadRequestException(
        `Invalid CUI format: ${cui}. Expected RO followed by 2-10 digits (e.g., RO12345678)`,
      );
    }
  }

  /**
   * Normalize CUI to include RO prefix
   */
  private normalizeCui(cui: string): string {
    const cleaned = cui.trim().toUpperCase();
    return cleaned.startsWith('RO') ? cleaned : `RO${cleaned}`;
  }

  /**
   * Encrypt sensitive data
   */
  private encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.encryptionAlgorithm, this.encryptionKey, iv);
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    // Format: iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypt sensitive data
   */
  private decrypt(ciphertext: string): string {
    const parts = ciphertext.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }
    const [ivHex, authTagHex, encrypted] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(this.encryptionAlgorithm, this.encryptionKey, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
