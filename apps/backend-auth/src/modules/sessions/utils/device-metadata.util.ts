/**
 * Device Metadata Utility - Extract and anonymize device information
 *
 * Responsibilities:
 * - Parse User-Agent strings to extract browser/OS information
 * - Generate device fingerprints for session tracking
 * - Anonymize IP addresses for GDPR compliance
 * - Create human-readable device names
 *
 * Security & Privacy:
 * - IP addresses are partially masked (last octet for IPv4)
 * - Device fingerprints are one-way hashes (SHA256)
 * - No PII is stored in device metadata
 *
 * @module DeviceMetadataUtil
 */

import { createHash } from 'crypto';
import { Request } from 'express';
import { UAParser } from 'ua-parser-js';

/**
 * Parsed device metadata
 */
export interface DeviceMetadata {
  /** SHA256 fingerprint (unique device identifier) */
  deviceId: string;
  /** Human-readable device name */
  deviceName: string;
  /** Full User-Agent string */
  userAgent: string;
  /** GDPR-compliant masked IP address */
  ipAddress: string;
  /** Browser name */
  browser: string;
  /** Browser version */
  browserVersion: string;
  /** Operating system name */
  os: string;
  /** Operating system version */
  osVersion: string;
  /** Device type (Desktop, Mobile, Tablet) */
  deviceType: string;
}

/**
 * Extract device metadata from Express request
 * Parses User-Agent, anonymizes IP, generates fingerprint
 *
 * @param request - Express Request object
 * @returns DeviceMetadata object with all device information
 *
 * Edge cases handled:
 * - Missing User-Agent header → defaults to 'Unknown'
 * - Missing IP address → defaults to '0.0.0.0'
 * - Proxy headers (X-Forwarded-For) → uses first IP in chain
 * - IPv6 addresses → masked to first 4 groups
 * - Unknown browsers/OS → labeled as 'Unknown'
 *
 * Example:
 * ```typescript
 * const metadata = extractDeviceMetadata(req);
 * // Returns: {
 * //   deviceId: 'abc123...',
 * //   deviceName: 'Chrome 120 on Windows 11',
 * //   userAgent: 'Mozilla/5.0...',
 * //   ipAddress: '192.168.1.xxx',
 * //   ...
 * // }
 * ```
 */
export function extractDeviceMetadata(request: Request): DeviceMetadata {
  // Extract User-Agent (handle missing header)
  const userAgent = request.headers['user-agent'] || 'Unknown';

  // Extract IP address (handle proxies via X-Forwarded-For)
  const ipAddress = extractIpAddress(request);

  // Parse User-Agent string
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  // Extract browser information
  const browser = result.browser.name || 'Unknown Browser';
  const browserVersion = result.browser.version || '0.0';

  // Extract OS information
  const os = result.os.name || 'Unknown OS';
  const osVersion = result.os.version || '0.0';

  // Determine device type
  const deviceType = determineDeviceType(result);

  // Generate human-readable device name
  const deviceName = formatDeviceName(browser, browserVersion, os, osVersion);

  // Anonymize IP address (GDPR compliance)
  const maskedIpAddress = maskIpAddress(ipAddress);

  // Generate device fingerprint
  const deviceId = generateDeviceFingerprint(userAgent, maskedIpAddress);

  return {
    deviceId,
    deviceName,
    userAgent,
    ipAddress: maskedIpAddress,
    browser,
    browserVersion,
    os,
    osVersion,
    deviceType,
  };
}

/**
 * Extract IP address from request
 * Handles proxy headers (X-Forwarded-For, X-Real-IP)
 *
 * Priority:
 * 1. X-Forwarded-For (first IP in chain)
 * 2. X-Real-IP
 * 3. request.ip
 * 4. request.socket.remoteAddress
 * 5. Default: '0.0.0.0'
 *
 * @param request - Express Request object
 * @returns IP address string
 */
function extractIpAddress(request: Request): string {
  // Check X-Forwarded-For header (proxy chain)
  const forwardedFor = request.headers['x-forwarded-for'];
  if (forwardedFor) {
    // X-Forwarded-For can be comma-separated list
    // First IP is the original client IP
    const ips = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
    const firstIp = ips.split(',')[0].trim();
    if (firstIp) return firstIp;
  }

  // Check X-Real-IP header (single proxy)
  const realIp = request.headers['x-real-ip'];
  if (realIp) {
    return Array.isArray(realIp) ? realIp[0] : realIp;
  }

  // Fallback to request.ip or socket remote address
  return request.ip || request.socket?.remoteAddress || '0.0.0.0';
}

/**
 * Mask IP address for GDPR compliance
 * Partially obscures IP while maintaining regional information
 *
 * IPv4: Mask last octet (192.168.1.123 → 192.168.1.xxx)
 * IPv6: Mask last 4 groups (2001:db8::1 → 2001:db8:xxxx:xxxx:xxxx:xxxx:xxxx:xxxx)
 *
 * @param ip - IP address to mask
 * @returns Masked IP address
 */
export function maskIpAddress(ip: string): string {
  // IPv6 address detection (contains colons)
  if (ip.includes(':')) {
    return maskIpv6(ip);
  }

  // IPv4 address masking
  return maskIpv4(ip);
}

/**
 * Mask IPv4 address (last octet)
 */
function maskIpv4(ip: string): string {
  const parts = ip.split('.');

  // Validate IPv4 format (4 parts)
  if (parts.length !== 4) {
    return 'xxx.xxx.xxx.xxx';
  }

  // Keep first 3 octets, mask last
  return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
}

/**
 * Mask IPv6 address (last 4 groups)
 */
function maskIpv6(ip: string): string {
  // Expand compressed IPv6 (e.g., :: notation)
  const expanded = expandIpv6(ip);
  const groups = expanded.split(':');

  // IPv6 has 8 groups
  if (groups.length !== 8) {
    return 'xxxx:xxxx:xxxx:xxxx:xxxx:xxxx:xxxx:xxxx';
  }

  // Keep first 4 groups, mask last 4
  return `${groups[0]}:${groups[1]}:${groups[2]}:${groups[3]}:xxxx:xxxx:xxxx:xxxx`;
}

/**
 * Expand compressed IPv6 address
 * Handles :: notation and short groups
 */
function expandIpv6(ip: string): string {
  // If already full format, return as-is
  if (!ip.includes('::') && ip.split(':').length === 8) {
    return ip;
  }

  // Split on :: to get parts before and after
  const [before, after] = ip.split('::');
  const beforeGroups = before ? before.split(':') : [];
  const afterGroups = after ? after.split(':') : [];

  // Calculate number of zero groups
  const totalGroups = 8;
  const zeroGroups = totalGroups - beforeGroups.length - afterGroups.length;

  // Build expanded groups
  const groups = [...beforeGroups, ...Array(zeroGroups).fill('0000'), ...afterGroups];

  // Pad each group to 4 digits
  return groups.map((g) => g.padStart(4, '0')).join(':');
}

/**
 * Generate device fingerprint using SHA256
 * Creates a unique identifier based on User-Agent and IP
 *
 * Note: Fingerprint includes timestamp to ensure uniqueness
 * even for same device/IP combination (new session = new ID)
 *
 * @param userAgent - User-Agent string
 * @param ipAddress - Masked IP address
 * @returns 64-character hex string (SHA256 hash)
 */
export function generateDeviceFingerprint(userAgent: string, ipAddress: string): string {
  const timestamp = Date.now().toString();
  const rawString = `${userAgent}:${ipAddress}:${timestamp}`;
  return createHash('sha256').update(rawString).digest('hex');
}

/**
 * Format human-readable device name
 * Example: "Chrome 120.0.0 on Windows 11"
 *
 * @param browser - Browser name
 * @param browserVersion - Browser version
 * @param os - Operating system name
 * @param osVersion - OS version
 * @returns Formatted device name string
 */
export function formatDeviceName(
  browser: string,
  browserVersion: string,
  os: string,
  osVersion: string
): string {
  const browserPart = `${browser} ${browserVersion}`;
  const osPart = `${os}${osVersion ? ' ' + osVersion : ''}`;
  return `${browserPart} on ${osPart}`;
}

/**
 * Determine device type from parsed User-Agent
 *
 * @param result - UAParser result
 * @returns Device type string (Desktop, Mobile, Tablet, Unknown)
 */
function determineDeviceType(result: UAParser.IResult): string {
  const deviceType = result.device.type;

  // Map UA-Parser types to our device types
  if (deviceType === 'mobile') return 'Mobile';
  if (deviceType === 'tablet') return 'Tablet';
  if (deviceType === 'wearable') return 'Wearable';
  if (deviceType === 'smarttv') return 'Smart TV';
  if (deviceType === 'console') return 'Console';
  if (deviceType === 'embedded') return 'Embedded';

  // Default to Desktop if no specific type detected
  return 'Desktop';
}
