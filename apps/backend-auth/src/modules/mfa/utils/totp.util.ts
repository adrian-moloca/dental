/**
 * TOTP Utility Functions
 *
 * Pure utility functions for TOTP operations:
 * - Secret generation
 * - Token generation and verification
 * - QR code URI generation
 * - Time-window validation
 *
 * Standards Compliance:
 * - RFC 6238 (TOTP: Time-Based One-Time Password Algorithm)
 * - RFC 4226 (HOTP: HMAC-Based One-Time Password Algorithm)
 *
 * @module TOTPUtil
 */

import { createHmac, randomBytes } from 'crypto';

/**
 * TOTP configuration options
 */
export interface TOTPOptions {
  algorithm?: 'sha1' | 'sha256' | 'sha512';
  digits?: number;
  period?: number;
  window?: number;
}

/**
 * Generate a random base32-encoded secret
 *
 * @param length - Length of secret in bytes (default: 20 for 160-bit secret)
 * @returns Base32-encoded secret string
 */
export function generateSecret(length: number = 20): string {
  const buffer = randomBytes(length);
  return base32Encode(buffer);
}

/**
 * Generate TOTP token for a given secret and time
 *
 * @param secret - Base32-encoded secret
 * @param options - TOTP options
 * @returns 6-digit TOTP token
 */
export function generateToken(secret: string, options: TOTPOptions = {}): string {
  const { algorithm = 'sha1', digits = 6, period = 30 } = options;

  const time = Math.floor(Date.now() / 1000);
  const counter = Math.floor(time / period);

  return generateHOTP(secret, counter, { algorithm, digits });
}

/**
 * Verify TOTP token against a secret
 *
 * @param secret - Base32-encoded secret
 * @param token - User-provided token
 * @param options - TOTP options
 * @returns True if token is valid within time window
 */
export function verifyToken(secret: string, token: string, options: TOTPOptions = {}): boolean {
  const { algorithm = 'sha1', digits = 6, period = 30, window = 1 } = options;

  const time = Math.floor(Date.now() / 1000);
  const currentCounter = Math.floor(time / period);

  for (let i = -window; i <= window; i++) {
    const counter = currentCounter + i;
    const expectedToken = generateHOTP(secret, counter, { algorithm, digits });

    if (constantTimeCompare(token, expectedToken)) {
      return true;
    }
  }

  return false;
}

/**
 * Generate otpauth:// URI for QR code generation
 *
 * @param secret - Base32-encoded secret
 * @param userEmail - User email address
 * @param issuer - Organization/issuer name
 * @param options - TOTP options
 * @returns otpauth:// URI string
 */
export function generateOTPAuthURL(
  secret: string,
  userEmail: string,
  issuer: string,
  options: TOTPOptions = {}
): string {
  const { algorithm = 'sha1', digits = 6, period = 30 } = options;

  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: algorithm.toUpperCase(),
    digits: digits.toString(),
    period: period.toString(),
  });

  const label = encodeURIComponent(`${issuer}:${userEmail}`);
  return `otpauth://totp/${label}?${params.toString()}`;
}

/**
 * Generate HOTP token (used internally by TOTP)
 */
function generateHOTP(
  secret: string,
  counter: number,
  options: { algorithm: string; digits: number }
): string {
  const key = base32Decode(secret);
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));

  const hmac = createHmac(options.algorithm, key);
  hmac.update(counterBuffer);
  const hash = hmac.digest();

  const offset = hash[hash.length - 1] & 0x0f;
  const binary =
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff);

  const otp = binary % Math.pow(10, options.digits);
  return otp.toString().padStart(options.digits, '0');
}

/**
 * Base32 encoding (RFC 4648)
 */
function base32Encode(buffer: Buffer): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let value = 0;
  let output = '';

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;

    while (bits >= 5) {
      output += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += alphabet[(value << (5 - bits)) & 31];
  }

  return output;
}

/**
 * Base32 decoding (RFC 4648)
 */
function base32Decode(encoded: string): Buffer {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let value = 0;
  const output: number[] = [];

  for (let i = 0; i < encoded.length; i++) {
    const idx = alphabet.indexOf(encoded[i].toUpperCase());
    if (idx === -1) continue;

    value = (value << 5) | idx;
    bits += 5;

    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(output);
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}
