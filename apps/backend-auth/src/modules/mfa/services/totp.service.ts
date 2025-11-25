/**
 * TOTPService - Time-based One-Time Password operations
 *
 * Responsibilities:
 * - Generate TOTP secrets
 * - Generate QR code URIs for authenticator apps
 * - Verify TOTP tokens
 * - Manage TOTP configuration
 *
 * Standards:
 * - RFC 6238 compliant TOTP implementation
 * - Compatible with Google Authenticator, Authy, etc.
 *
 * @module TOTPService
 */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { generateSecret, generateToken, verifyToken, generateOTPAuthURL } from '../utils/totp.util';

/**
 * TOTP service configuration
 */
export interface TOTPConfig {
  issuer: string;
  algorithm: 'sha1' | 'sha256' | 'sha512';
  digits: number;
  period: number;
  window: number;
}

/**
 * Injectable TOTP service
 */
@Injectable()
export class TOTPService {
  private readonly config: TOTPConfig;

  constructor(private configService: ConfigService) {
    this.config = {
      issuer: this.configService.get('app.name', 'DentalOS'),
      algorithm: this.configService.get('security.mfa.totp.algorithm', 'sha1'),
      digits: this.configService.get('security.mfa.totp.digits', 6),
      period: this.configService.get('security.mfa.totp.period', 30),
      window: this.configService.get('security.mfa.totp.window', 1),
    };
  }

  /**
   * Generate new TOTP secret
   *
   * @returns Base32-encoded secret string
   */
  generateSecret(): string {
    return generateSecret();
  }

  /**
   * Generate QR code URI for TOTP enrollment
   *
   * @param secret - Base32-encoded secret
   * @param userEmail - User email address
   * @param organizationName - Organization name (overrides default issuer)
   * @returns otpauth:// URI for QR code generation
   */
  generateQRCodeURI(secret: string, userEmail: string, organizationName?: string): string {
    const issuer = organizationName || this.config.issuer;

    return generateOTPAuthURL(secret, userEmail, issuer, {
      algorithm: this.config.algorithm,
      digits: this.config.digits,
      period: this.config.period,
    });
  }

  /**
   * Verify TOTP token against secret
   *
   * @param secret - Base32-encoded secret
   * @param token - User-provided 6-digit token
   * @returns True if token is valid
   */
  verifyToken(secret: string, token: string): boolean {
    if (!token || token.length !== this.config.digits) {
      return false;
    }

    if (!/^\d+$/.test(token)) {
      return false;
    }

    return verifyToken(secret, token, {
      algorithm: this.config.algorithm,
      digits: this.config.digits,
      period: this.config.period,
      window: this.config.window,
    });
  }

  /**
   * Generate current TOTP token (for testing purposes)
   *
   * @param secret - Base32-encoded secret
   * @returns Current valid TOTP token
   */
  getCurrentToken(secret: string): string {
    return generateToken(secret, {
      algorithm: this.config.algorithm,
      digits: this.config.digits,
      period: this.config.period,
    });
  }
}
