import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

import { EFacturaConfigType } from '../config/e-factura.config';
import { AnafOAuthToken, AnafOAuthCredentials } from '../interfaces/anaf-config.interface';

/**
 * Stored OAuth tokens structure
 */
export interface StoredOAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number; // Unix timestamp in milliseconds
  tokenType: string;
  scope?: string;
  cui: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * Token validation result
 */
export interface TokenValidationResult {
  valid: boolean;
  expired: boolean;
  expiresIn?: number; // Seconds until expiration
  needsRefresh?: boolean;
}

/**
 * Redis key prefix for ANAF tokens
 */
const REDIS_KEY_PREFIX = 'efactura:oauth:';
const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000; // 5 minutes before expiry

/**
 * ANAF OAuth Service
 *
 * Manages OAuth2 tokens for ANAF E-Factura API authentication.
 * Each dental clinic (identified by CUI) has its own OAuth credentials
 * that must be set up manually through ANAF's SPV portal.
 *
 * Key responsibilities:
 * - Store and retrieve OAuth tokens per CUI
 * - Check token validity and expiration
 * - Refresh expired tokens using refresh_token
 * - Cache tokens in Redis for distributed access
 *
 * Note: The initial OAuth authorization flow requires manual setup:
 * 1. Clinic registers on ANAF SPV portal
 * 2. Clinic authorizes the application via OAuth consent screen
 * 3. Application receives authorization code
 * 4. Application exchanges code for access_token and refresh_token
 * 5. Tokens are stored via storeTokens() method
 *
 * This service handles steps 4-5 after the initial authorization.
 */
@Injectable()
export class AnafOAuthService implements OnModuleInit {
  private readonly logger = new Logger(AnafOAuthService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async onModuleInit(): Promise<void> {
    this.logger.log('ANAF OAuth Service initialized');
  }

  /**
   * Get E-Factura configuration
   */
  private getConfig(): EFacturaConfigType {
    return this.configService.get<EFacturaConfigType>('efactura')!;
  }

  /**
   * Get the Redis key for a CUI's tokens
   */
  private getRedisKey(cui: string): string {
    // Normalize CUI - remove RO prefix if present for storage
    const normalizedCui = cui.replace(/^RO/i, '');
    return `${REDIS_KEY_PREFIX}${normalizedCui}`;
  }

  /**
   * Get access token for a specific CUI
   *
   * Retrieves the access token from Redis cache. If the token is about to expire,
   * it will attempt to refresh it automatically.
   *
   * @param cui - The company's CUI (tax identification number)
   * @returns Access token string
   * @throws Error if no token is available or refresh fails
   */
  async getAccessToken(cui: string): Promise<string> {
    this.logger.debug(`Getting access token for CUI: ${cui}`);

    const tokens = await this.getStoredTokens(cui);

    if (!tokens) {
      throw new Error(
        `No OAuth tokens found for CUI ${cui}. Please complete the OAuth authorization flow.`,
      );
    }

    // Check if token is expired or about to expire
    const validation = this.validateToken(tokens);

    if (validation.expired) {
      this.logger.log(`Token for CUI ${cui} has expired, attempting refresh`);

      if (tokens.refreshToken) {
        return this.refreshToken(cui);
      }

      throw new Error(
        `OAuth token for CUI ${cui} has expired and no refresh token is available. ` +
          `Please re-authorize through ANAF SPV portal.`,
      );
    }

    if (validation.needsRefresh && tokens.refreshToken) {
      // Attempt background refresh, but return current token
      this.refreshTokenBackground(cui, tokens.refreshToken).catch((err) => {
        this.logger.warn(`Background token refresh failed for CUI ${cui}: ${err.message}`);
      });
    }

    return tokens.accessToken;
  }

  /**
   * Get stored tokens for a CUI
   *
   * @param cui - The company's CUI
   * @returns Stored tokens or null if not found
   */
  async getStoredTokens(cui: string): Promise<StoredOAuthTokens | null> {
    const key = this.getRedisKey(cui);
    const data = await this.redis.get(key);

    if (!data) {
      return null;
    }

    try {
      return JSON.parse(data) as StoredOAuthTokens;
    } catch (error) {
      this.logger.error(`Failed to parse tokens for CUI ${cui}: ${error}`);
      return null;
    }
  }

  /**
   * Validate token expiration status
   */
  validateToken(tokens: StoredOAuthTokens): TokenValidationResult {
    const now = Date.now();
    const expiresAt = tokens.expiresAt;

    if (now >= expiresAt) {
      return {
        valid: false,
        expired: true,
      };
    }

    const expiresInMs = expiresAt - now;
    const expiresIn = Math.floor(expiresInMs / 1000);
    const needsRefresh = expiresInMs <= TOKEN_REFRESH_BUFFER_MS;

    return {
      valid: true,
      expired: false,
      expiresIn,
      needsRefresh,
    };
  }

  /**
   * Refresh an expired token using the refresh_token
   *
   * Contacts ANAF OAuth endpoint to exchange refresh_token for new access_token.
   *
   * @param cui - The company's CUI
   * @returns New access token
   * @throws Error if refresh fails
   */
  async refreshToken(cui: string): Promise<string> {
    this.logger.log(`Refreshing token for CUI: ${cui}`);

    const tokens = await this.getStoredTokens(cui);

    if (!tokens?.refreshToken) {
      throw new Error(
        `No refresh token available for CUI ${cui}. Please re-authorize through ANAF SPV portal.`,
      );
    }

    try {
      const newTokens = await this.exchangeRefreshToken(tokens.refreshToken, cui);

      await this.storeTokens(cui, newTokens);

      this.logger.log(`Successfully refreshed token for CUI: ${cui}`);

      return newTokens.access_token;
    } catch (error) {
      this.logger.error(`Failed to refresh token for CUI ${cui}: ${error}`);

      // Mark tokens as invalid
      await this.invalidateTokens(cui);

      throw new Error(
        `Failed to refresh OAuth token for CUI ${cui}. ` +
          `Please re-authorize through ANAF SPV portal. Error: ${error}`,
      );
    }
  }

  /**
   * Store OAuth tokens after successful authorization
   *
   * This method is called after completing the OAuth authorization flow.
   * It stores the tokens in Redis for subsequent API calls.
   *
   * @param cui - The company's CUI
   * @param tokens - OAuth tokens received from ANAF
   */
  async storeTokens(cui: string, tokens: AnafOAuthToken): Promise<void> {
    this.logger.log(`Storing tokens for CUI: ${cui}`);

    const normalizedCui = cui.replace(/^RO/i, '');
    const now = Date.now();

    const storedTokens: StoredOAuthTokens = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: now + tokens.expires_in * 1000,
      tokenType: tokens.token_type,
      scope: tokens.scope,
      cui: normalizedCui,
      createdAt: now,
      updatedAt: now,
    };

    const key = this.getRedisKey(cui);

    // Store with TTL slightly longer than token lifetime to allow refresh
    // ANAF tokens typically last 3600 seconds (1 hour)
    // We store for 30 days to keep refresh token available
    const ttlSeconds = 30 * 24 * 60 * 60; // 30 days

    await this.redis.set(key, JSON.stringify(storedTokens), 'EX', ttlSeconds);

    this.logger.log(
      `Tokens stored for CUI ${cui}, expires at ${new Date(storedTokens.expiresAt).toISOString()}`,
    );
  }

  /**
   * Invalidate/remove tokens for a CUI
   *
   * Used when tokens are no longer valid and user must re-authorize.
   *
   * @param cui - The company's CUI
   */
  async invalidateTokens(cui: string): Promise<void> {
    this.logger.log(`Invalidating tokens for CUI: ${cui}`);

    const key = this.getRedisKey(cui);
    await this.redis.del(key);
  }

  /**
   * Check if valid tokens exist for a CUI
   *
   * @param cui - The company's CUI
   * @returns true if valid (non-expired) tokens exist
   */
  async hasValidTokens(cui: string): Promise<boolean> {
    const tokens = await this.getStoredTokens(cui);

    if (!tokens) {
      return false;
    }

    const validation = this.validateToken(tokens);
    return validation.valid;
  }

  /**
   * Get token expiration info for a CUI
   *
   * Useful for displaying token status in admin UI.
   *
   * @param cui - The company's CUI
   */
  async getTokenStatus(cui: string): Promise<{
    exists: boolean;
    valid: boolean;
    expiresAt?: Date;
    expiresIn?: number;
    needsRefresh?: boolean;
    hasRefreshToken?: boolean;
  }> {
    const tokens = await this.getStoredTokens(cui);

    if (!tokens) {
      return { exists: false, valid: false };
    }

    const validation = this.validateToken(tokens);

    return {
      exists: true,
      valid: validation.valid,
      expiresAt: new Date(tokens.expiresAt),
      expiresIn: validation.expiresIn,
      needsRefresh: validation.needsRefresh,
      hasRefreshToken: !!tokens.refreshToken,
    };
  }

  /**
   * Generate the OAuth authorization URL for a clinic
   *
   * This URL should be opened in a browser where the clinic administrator
   * can log in and authorize the application.
   *
   * @param cui - The company's CUI
   * @param credentials - OAuth client credentials
   * @param state - State parameter for CSRF protection
   * @returns Authorization URL
   */
  generateAuthorizationUrl(cui: string, credentials: AnafOAuthCredentials, state: string): string {
    const config = this.getConfig();
    const baseUrl = config.anaf.oauthBaseUrl;

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: credentials.clientId,
      redirect_uri: credentials.redirectUri,
      state,
      scope: 'openid',
    });

    const url = `${baseUrl}/authorize?${params.toString()}`;

    this.logger.debug(`Generated authorization URL for CUI ${cui}: ${url}`);

    return url;
  }

  /**
   * Exchange authorization code for tokens
   *
   * Called after user completes OAuth authorization and is redirected back
   * with an authorization code.
   *
   * @param code - Authorization code from redirect
   * @param credentials - OAuth client credentials
   * @param cui - The company's CUI
   * @returns OAuth tokens
   */
  async exchangeAuthorizationCode(
    _code: string,
    _credentials: AnafOAuthCredentials,
    cui: string,
  ): Promise<AnafOAuthToken> {
    const config = this.getConfig();
    const tokenUrl = `${config.anaf.oauthBaseUrl}/token`;

    this.logger.log(`Exchanging authorization code for CUI: ${cui}`);

    // Note: In production, this would make an HTTP request to ANAF
    // For now, we provide a stub implementation

    // This is a placeholder - actual implementation would use axios
    // const response = await axios.post(tokenUrl, new URLSearchParams({
    //   grant_type: 'authorization_code',
    //   code: _code,
    //   client_id: _credentials.clientId,
    //   client_secret: _credentials.clientSecret,
    //   redirect_uri: _credentials.redirectUri,
    // }), {
    //   headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    // });

    throw new Error(
      'Authorization code exchange not fully implemented. ' +
        'This requires the OAuth flow to be completed manually through ANAF SPV portal. ' +
        `Token URL: ${tokenUrl}`,
    );
  }

  // ============================================
  // Private Helper Methods
  // ============================================

  /**
   * Exchange refresh token for new access token
   */
  private async exchangeRefreshToken(_refreshToken: string, cui: string): Promise<AnafOAuthToken> {
    const config = this.getConfig();
    const tokenUrl = `${config.anaf.oauthBaseUrl}/token`;

    this.logger.debug(`Exchanging refresh token for CUI: ${cui}`);

    // Note: In production, this would make an HTTP request to ANAF
    // For now, we provide a stub that throws an error

    // Placeholder - actual implementation:
    // const response = await axios.post(tokenUrl, new URLSearchParams({
    //   grant_type: 'refresh_token',
    //   refresh_token: _refreshToken,
    //   client_id: clientId,
    //   client_secret: clientSecret,
    // }), {
    //   headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    //   timeout: 30000,
    // });
    // return response.data;

    throw new Error(
      `Token refresh requires ANAF OAuth credentials configuration. ` +
        `Please set up the OAuth client credentials for CUI ${cui}. ` +
        `Token URL: ${tokenUrl}`,
    );
  }

  /**
   * Background token refresh - non-blocking
   */
  private async refreshTokenBackground(cui: string, refreshToken: string): Promise<void> {
    this.logger.debug(`Starting background token refresh for CUI: ${cui}`);

    try {
      const newTokens = await this.exchangeRefreshToken(refreshToken, cui);
      await this.storeTokens(cui, newTokens);
      this.logger.log(`Background token refresh successful for CUI: ${cui}`);
    } catch (error) {
      // Background refresh failures are logged but not thrown
      this.logger.warn(`Background token refresh failed for CUI ${cui}: ${error}`);
    }
  }
}
