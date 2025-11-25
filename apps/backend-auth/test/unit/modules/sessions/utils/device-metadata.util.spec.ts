/**
 * Device Metadata Utility Unit Tests
 *
 * Tests cover:
 * - Device metadata extraction from Express requests
 * - IP address masking for GDPR compliance (IPv4 and IPv6)
 * - User-Agent parsing (browser, OS, device type)
 * - Device fingerprint generation (SHA256)
 * - Proxy header handling (X-Forwarded-For, X-Real-IP)
 * - Edge cases and fallback behaviors
 *
 * Privacy & Security Coverage:
 * - IP masking maintains regional info while protecting PII
 * - Device fingerprints are non-reversible
 * - Missing headers have safe defaults
 *
 * @group unit
 * @module backend-auth/test/unit/modules/sessions/utils
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Request } from 'express';
import {
  extractDeviceMetadata,
  maskIpAddress,
  generateDeviceFingerprint,
  formatDeviceName,
} from '../../../../../src/modules/sessions/utils/device-metadata.util';

describe('Device Metadata Utility', () => {
  // Mock Express Request factory
  const createMockRequest = (overrides: Partial<Request> = {}): Request => {
    return {
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      ip: '192.168.1.100',
      socket: {
        remoteAddress: '192.168.1.100',
      },
      ...overrides,
    } as unknown as Request;
  };

  describe('extractDeviceMetadata()', () => {
    it('should extract complete device metadata from request', () => {
      const request = createMockRequest();
      const metadata = extractDeviceMetadata(request);

      expect(metadata).toBeDefined();
      expect(metadata.deviceId).toBeDefined();
      expect(metadata.deviceId).toMatch(/^[a-f0-9]{64}$/i); // SHA256 format
      expect(metadata.deviceName).toBeDefined();
      expect(metadata.userAgent).toBeDefined();
      expect(metadata.ipAddress).toBeDefined();
      expect(metadata.browser).toBeDefined();
      expect(metadata.browserVersion).toBeDefined();
      expect(metadata.os).toBeDefined();
      expect(metadata.osVersion).toBeDefined();
      expect(metadata.deviceType).toBeDefined();
    });

    it('should parse Chrome User-Agent correctly', () => {
      const request = createMockRequest({
        headers: {
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        },
      });

      const metadata = extractDeviceMetadata(request);

      expect(metadata.browser).toBe('Chrome');
      expect(metadata.browserVersion).toContain('120');
      expect(metadata.os).toBe('Windows');
      expect(metadata.osVersion).toContain('10');
      expect(metadata.deviceType).toBe('Desktop');
    });

    it('should parse Firefox User-Agent correctly', () => {
      const request = createMockRequest({
        headers: {
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
        },
      });

      const metadata = extractDeviceMetadata(request);

      expect(metadata.browser).toBe('Firefox');
      expect(metadata.browserVersion).toContain('121');
      expect(metadata.os).toBe('Windows');
    });

    it('should parse Safari User-Agent correctly', () => {
      const request = createMockRequest({
        headers: {
          'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
        },
      });

      const metadata = extractDeviceMetadata(request);

      expect(metadata.browser).toContain('Safari');
      expect(metadata.os).toBe('Mac OS');
    });

    it('should parse mobile Chrome User-Agent correctly', () => {
      const request = createMockRequest({
        headers: {
          'user-agent': 'Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36',
        },
      });

      const metadata = extractDeviceMetadata(request);

      expect(metadata.browser).toBe('Chrome');
      expect(metadata.os).toBe('Android');
      expect(metadata.deviceType).toBe('Mobile');
    });

    it('should parse iOS Safari User-Agent correctly', () => {
      const request = createMockRequest({
        headers: {
          'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Version/17.2 Safari/604.1',
        },
      });

      const metadata = extractDeviceMetadata(request);

      expect(metadata.os).toBe('iOS');
      expect(metadata.deviceType).toBe('Mobile');
    });

    it('should parse tablet User-Agent correctly', () => {
      const request = createMockRequest({
        headers: {
          'user-agent': 'Mozilla/5.0 (iPad; CPU OS 17_2 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1',
        },
      });

      const metadata = extractDeviceMetadata(request);

      expect(metadata.os).toBe('iOS');
      expect(metadata.deviceType).toBe('Tablet');
    });

    it('should default to "Unknown" for missing User-Agent', () => {
      const request = createMockRequest({
        headers: {},
      });

      const metadata = extractDeviceMetadata(request);

      expect(metadata.userAgent).toBe('Unknown');
      expect(metadata.browser).toContain('Unknown');
    });

    it('should handle empty User-Agent header', () => {
      const request = createMockRequest({
        headers: {
          'user-agent': '',
        },
      });

      const metadata = extractDeviceMetadata(request);

      expect(metadata.userAgent).toBe('Unknown');
    });

    it('should mask IP address in metadata', () => {
      const request = createMockRequest({
        ip: '192.168.1.100',
      });

      const metadata = extractDeviceMetadata(request);

      expect(metadata.ipAddress).toBe('192.168.1.xxx');
      expect(metadata.ipAddress).not.toContain('100');
    });

    it('should generate unique device fingerprints for same request', () => {
      const request = createMockRequest();

      const metadata1 = extractDeviceMetadata(request);
      const metadata2 = extractDeviceMetadata(request);

      // Fingerprints include timestamp, so should be different
      expect(metadata1.deviceId).not.toBe(metadata2.deviceId);
      expect(metadata1.deviceId).toMatch(/^[a-f0-9]{64}$/i);
      expect(metadata2.deviceId).toMatch(/^[a-f0-9]{64}$/i);
    });

    it('should create human-readable device name', () => {
      const request = createMockRequest({
        headers: {
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
        },
      });

      const metadata = extractDeviceMetadata(request);

      expect(metadata.deviceName).toContain('Chrome');
      expect(metadata.deviceName).toContain('Windows');
      expect(metadata.deviceName).toContain('on');
    });
  });

  describe('IP Address Extraction - Proxy Headers', () => {
    it('should prioritize X-Forwarded-For header', () => {
      const request = createMockRequest({
        headers: {
          'x-forwarded-for': '203.0.113.1, 192.168.1.1',
          'user-agent': 'Mozilla/5.0',
        },
        ip: '10.0.0.1',
      });

      const metadata = extractDeviceMetadata(request);

      // Should use first IP from X-Forwarded-For chain
      expect(metadata.ipAddress).toBe('203.0.113.xxx');
    });

    it('should handle X-Forwarded-For with single IP', () => {
      const request = createMockRequest({
        headers: {
          'x-forwarded-for': '203.0.113.50',
          'user-agent': 'Mozilla/5.0',
        },
      });

      const metadata = extractDeviceMetadata(request);

      expect(metadata.ipAddress).toBe('203.0.113.xxx');
    });

    it('should handle X-Forwarded-For with whitespace', () => {
      const request = createMockRequest({
        headers: {
          'x-forwarded-for': '  203.0.113.1  ,  192.168.1.1  ',
          'user-agent': 'Mozilla/5.0',
        },
      });

      const metadata = extractDeviceMetadata(request);

      expect(metadata.ipAddress).toBe('203.0.113.xxx');
    });

    it('should handle X-Forwarded-For as array', () => {
      const request = createMockRequest({
        headers: {
          'x-forwarded-for': ['203.0.113.1', '192.168.1.1'] as any,
          'user-agent': 'Mozilla/5.0',
        },
      });

      const metadata = extractDeviceMetadata(request);

      expect(metadata.ipAddress).toBe('203.0.113.xxx');
    });

    it('should use X-Real-IP header when X-Forwarded-For is missing', () => {
      const request = createMockRequest({
        headers: {
          'x-real-ip': '203.0.113.75',
          'user-agent': 'Mozilla/5.0',
        },
        ip: '10.0.0.1',
      });

      const metadata = extractDeviceMetadata(request);

      expect(metadata.ipAddress).toBe('203.0.113.xxx');
    });

    it('should fallback to request.ip when no proxy headers', () => {
      const request = createMockRequest({
        headers: {
          'user-agent': 'Mozilla/5.0',
        },
        ip: '192.168.5.100',
      });

      const metadata = extractDeviceMetadata(request);

      expect(metadata.ipAddress).toBe('192.168.5.xxx');
    });

    it('should fallback to socket.remoteAddress when request.ip is missing', () => {
      const request = createMockRequest({
        headers: {
          'user-agent': 'Mozilla/5.0',
        },
        ip: undefined,
        socket: {
          remoteAddress: '192.168.7.200',
        },
      } as any);

      const metadata = extractDeviceMetadata(request);

      expect(metadata.ipAddress).toBe('192.168.7.xxx');
    });

    it('should default to 0.0.0.0 when no IP available', () => {
      const request = createMockRequest({
        headers: {
          'user-agent': 'Mozilla/5.0',
        },
        ip: undefined,
        socket: {},
      } as any);

      const metadata = extractDeviceMetadata(request);

      expect(metadata.ipAddress).toBe('0.0.0.xxx');
    });
  });

  describe('maskIpAddress() - IPv4', () => {
    it('should mask last octet of IPv4 address', () => {
      expect(maskIpAddress('192.168.1.100')).toBe('192.168.1.xxx');
    });

    it('should keep first three octets visible', () => {
      const masked = maskIpAddress('10.20.30.40');
      expect(masked).toBe('10.20.30.xxx');
      expect(masked).toContain('10');
      expect(masked).toContain('20');
      expect(masked).toContain('30');
      expect(masked).not.toContain('40');
    });

    it('should mask public IP addresses', () => {
      expect(maskIpAddress('203.0.113.42')).toBe('203.0.113.xxx');
    });

    it('should mask private IP addresses', () => {
      expect(maskIpAddress('172.16.5.99')).toBe('172.16.5.xxx');
    });

    it('should mask localhost', () => {
      expect(maskIpAddress('127.0.0.1')).toBe('127.0.0.xxx');
    });

    it('should mask broadcast address', () => {
      expect(maskIpAddress('255.255.255.255')).toBe('255.255.255.xxx');
    });

    it('should return masked placeholder for invalid IPv4 format', () => {
      expect(maskIpAddress('invalid')).toBe('xxx.xxx.xxx.xxx');
      expect(maskIpAddress('192.168.1')).toBe('xxx.xxx.xxx.xxx');
      expect(maskIpAddress('192.168.1.1.1')).toBe('xxx.xxx.xxx.xxx');
    });
  });

  describe('maskIpAddress() - IPv6', () => {
    it('should mask last 4 groups of IPv6 address', () => {
      const masked = maskIpAddress('2001:0db8:85a3:0000:0000:8a2e:0370:7334');
      expect(masked).toBe('2001:0db8:85a3:0000:xxxx:xxxx:xxxx:xxxx');
    });

    it('should keep first 4 groups visible', () => {
      const masked = maskIpAddress('2001:0db8:85a3:0042:1234:5678:9abc:def0');
      expect(masked).toContain('2001');
      expect(masked).toContain('0db8');
      expect(masked).toContain('85a3');
      expect(masked).toContain('0042');
      expect(masked).not.toContain('1234');
      expect(masked).not.toContain('def0');
    });

    it('should handle compressed IPv6 (::) notation', () => {
      const masked = maskIpAddress('2001:db8::1');
      expect(masked).toContain('2001');
      expect(masked).toContain('db8');
      expect(masked).toContain('xxxx');
    });

    it('should handle IPv6 localhost', () => {
      const masked = maskIpAddress('::1');
      expect(masked).toContain('xxxx');
    });

    it('should handle fully compressed IPv6', () => {
      const masked = maskIpAddress('::');
      expect(masked).toContain('xxxx');
    });

    it('should handle IPv6 with trailing compression', () => {
      const masked = maskIpAddress('2001:db8:85a3::');
      expect(masked).toContain('2001');
      expect(masked).toContain('xxxx');
    });

    it('should return masked placeholder for invalid IPv6 format', () => {
      const masked = maskIpAddress('invalid:ipv6');
      expect(masked).toBe('xxxx:xxxx:xxxx:xxxx:xxxx:xxxx:xxxx:xxxx');
    });
  });

  describe('generateDeviceFingerprint()', () => {
    it('should generate 64-character hex string (SHA256)', () => {
      const fingerprint = generateDeviceFingerprint('Mozilla/5.0', '192.168.1.xxx');

      expect(fingerprint).toMatch(/^[a-f0-9]{64}$/i);
      expect(fingerprint.length).toBe(64);
    });

    it('should generate different fingerprints for same inputs (timestamp)', () => {
      const ua = 'Mozilla/5.0';
      const ip = '192.168.1.xxx';

      const fingerprint1 = generateDeviceFingerprint(ua, ip);
      const fingerprint2 = generateDeviceFingerprint(ua, ip);

      // Different timestamps should produce different hashes
      expect(fingerprint1).not.toBe(fingerprint2);
    });

    it('should generate different fingerprints for different User-Agents', () => {
      const ip = '192.168.1.xxx';

      const fingerprint1 = generateDeviceFingerprint('Chrome', ip);
      const fingerprint2 = generateDeviceFingerprint('Firefox', ip);

      expect(fingerprint1).not.toBe(fingerprint2);
    });

    it('should generate different fingerprints for different IPs', () => {
      const ua = 'Mozilla/5.0';

      const fingerprint1 = generateDeviceFingerprint(ua, '192.168.1.xxx');
      const fingerprint2 = generateDeviceFingerprint(ua, '10.0.0.xxx');

      expect(fingerprint1).not.toBe(fingerprint2);
    });

    it('should handle empty strings', () => {
      const fingerprint = generateDeviceFingerprint('', '');

      expect(fingerprint).toMatch(/^[a-f0-9]{64}$/i);
    });

    it('should handle special characters', () => {
      const fingerprint = generateDeviceFingerprint(
        'Mozilla/5.0 (Windows; U; "Special")',
        '192.168.1.xxx'
      );

      expect(fingerprint).toMatch(/^[a-f0-9]{64}$/i);
    });

    it('should handle unicode characters', () => {
      const fingerprint = generateDeviceFingerprint('你好世界', '192.168.1.xxx');

      expect(fingerprint).toMatch(/^[a-f0-9]{64}$/i);
    });

    it('should be deterministic within same millisecond', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-01-01T00:00:00.000Z'));

      const fingerprint1 = generateDeviceFingerprint('Mozilla/5.0', '192.168.1.xxx');
      const fingerprint2 = generateDeviceFingerprint('Mozilla/5.0', '192.168.1.xxx');

      expect(fingerprint1).toBe(fingerprint2);

      vi.useRealTimers();
    });
  });

  describe('formatDeviceName()', () => {
    it('should format device name with browser and OS', () => {
      const name = formatDeviceName('Chrome', '120.0.0.0', 'Windows', '10');

      expect(name).toBe('Chrome 120.0.0.0 on Windows 10');
      expect(name).toContain('Chrome');
      expect(name).toContain('Windows');
      expect(name).toContain('on');
    });

    it('should format device name without OS version', () => {
      const name = formatDeviceName('Firefox', '121.0', 'Linux', '');

      expect(name).toBe('Firefox 121.0 on Linux');
    });

    it('should format device name with unknown browser', () => {
      const name = formatDeviceName('Unknown Browser', '0.0', 'Windows', '11');

      expect(name).toContain('Unknown Browser');
      expect(name).toContain('Windows 11');
    });

    it('should format device name with unknown OS', () => {
      const name = formatDeviceName('Chrome', '120', 'Unknown OS', '0.0');

      expect(name).toContain('Chrome');
      expect(name).toContain('Unknown OS');
    });

    it('should format mobile device name', () => {
      const name = formatDeviceName('Chrome', '120.0', 'Android', '13');

      expect(name).toBe('Chrome 120.0 on Android 13');
    });

    it('should format iOS device name', () => {
      const name = formatDeviceName('Safari', '17.2', 'iOS', '17.2');

      expect(name).toBe('Safari 17.2 on iOS 17.2');
    });

    it('should format Mac OS device name', () => {
      const name = formatDeviceName('Safari', '17.2', 'Mac OS', '14.2');

      expect(name).toBe('Safari 17.2 on Mac OS 14.2');
    });

    it('should handle browser names with spaces', () => {
      const name = formatDeviceName('Mobile Safari', '17.0', 'iOS', '17.0');

      expect(name).toContain('Mobile Safari');
    });

    it('should handle OS names with spaces', () => {
      const name = formatDeviceName('Chrome', '120', 'Chrome OS', '120');

      expect(name).toContain('Chrome OS');
    });
  });

  describe('Device Type Determination', () => {
    it('should identify Desktop device', () => {
      const request = createMockRequest({
        headers: {
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
        },
      });

      const metadata = extractDeviceMetadata(request);

      expect(metadata.deviceType).toBe('Desktop');
    });

    it('should identify Mobile device', () => {
      const request = createMockRequest({
        headers: {
          'user-agent': 'Mozilla/5.0 (Linux; Android 13) Chrome/120.0.0.0 Mobile',
        },
      });

      const metadata = extractDeviceMetadata(request);

      expect(metadata.deviceType).toBe('Mobile');
    });

    it('should identify Tablet device', () => {
      const request = createMockRequest({
        headers: {
          'user-agent': 'Mozilla/5.0 (iPad; CPU OS 17_2 like Mac OS X) Safari/604.1',
        },
      });

      const metadata = extractDeviceMetadata(request);

      expect(metadata.deviceType).toBe('Tablet');
    });

    it('should default to Desktop for unknown device', () => {
      const request = createMockRequest({
        headers: {
          'user-agent': 'CustomBot/1.0',
        },
      });

      const metadata = extractDeviceMetadata(request);

      expect(metadata.deviceType).toBe('Desktop');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long User-Agent strings', () => {
      const longUA = 'Mozilla/5.0 ' + 'x'.repeat(1000);
      const request = createMockRequest({
        headers: {
          'user-agent': longUA,
        },
      });

      const metadata = extractDeviceMetadata(request);

      expect(metadata.userAgent).toBe(longUA);
      expect(metadata.deviceId).toMatch(/^[a-f0-9]{64}$/i);
    });

    it('should handle malformed User-Agent strings', () => {
      const request = createMockRequest({
        headers: {
          'user-agent': 'Not A Valid UA',
        },
      });

      const metadata = extractDeviceMetadata(request);

      expect(metadata.userAgent).toBe('Not A Valid UA');
      expect(metadata.browser).toBeDefined();
      expect(metadata.os).toBeDefined();
    });

    it('should handle IPv4-mapped IPv6 addresses', () => {
      const masked = maskIpAddress('::ffff:192.168.1.100');

      // Should be treated as IPv6
      expect(masked).toContain('xxxx');
    });

    it('should handle link-local IPv6 addresses', () => {
      const masked = maskIpAddress('fe80::1');

      expect(masked).toContain('fe80');
      expect(masked).toContain('xxxx');
    });

    it('should handle User-Agent with null bytes', () => {
      const request = createMockRequest({
        headers: {
          'user-agent': 'Mozilla/5.0\x00Evil',
        },
      });

      const metadata = extractDeviceMetadata(request);

      expect(metadata.userAgent).toContain('Mozilla');
    });

    it('should extract metadata from bot User-Agent', () => {
      const request = createMockRequest({
        headers: {
          'user-agent': 'Googlebot/2.1 (+http://www.google.com/bot.html)',
        },
      });

      const metadata = extractDeviceMetadata(request);

      expect(metadata.userAgent).toContain('Googlebot');
      expect(metadata.deviceId).toMatch(/^[a-f0-9]{64}$/i);
    });

    it('should handle requests with only socket address', () => {
      const request = {
        headers: {
          'user-agent': 'Mozilla/5.0',
        },
        socket: {
          remoteAddress: '10.0.0.1',
        },
      } as unknown as Request;

      const metadata = extractDeviceMetadata(request);

      expect(metadata.ipAddress).toBe('10.0.0.xxx');
    });
  });

  describe('GDPR Compliance', () => {
    it('should mask IP addresses to protect PII', () => {
      const personalIP = '203.0.113.42';
      const masked = maskIpAddress(personalIP);

      expect(masked).not.toContain('42');
      expect(masked).toContain('xxx');
    });

    it('should maintain regional information in masked IP', () => {
      const masked = maskIpAddress('203.0.113.42');

      // First 3 octets preserved for regional analysis
      expect(masked).toContain('203.0.113');
    });

    it('should create non-reversible device fingerprints', () => {
      const fingerprint = generateDeviceFingerprint('Mozilla/5.0', '192.168.1.xxx');

      // Cannot reverse SHA256 hash
      expect(fingerprint).not.toContain('Mozilla');
      expect(fingerprint).not.toContain('192.168');
      expect(fingerprint.length).toBe(64);
    });

    it('should not store full IP addresses in metadata', () => {
      const request = createMockRequest({
        ip: '203.0.113.42',
      });

      const metadata = extractDeviceMetadata(request);

      expect(metadata.ipAddress).not.toContain('42');
      expect(metadata.ipAddress).toContain('xxx');
    });
  });
});
