/**
 * JWT Utility Functions
 *
 * Handles JWT decoding and validation without external dependencies
 */

interface JwtPayload {
  sub: string;
  email: string;
  organizationId: string;
  roles: string[];
  iat: number;
  exp: number;
}

/**
 * Decode JWT token without verification (frontend validation only)
 */
export function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded;
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

/**
 * Check if JWT token is expired
 * Returns true if expired or invalid
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeJwt(token);
  if (!decoded || !decoded.exp) {
    return true;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
}

/**
 * Get time until token expires in milliseconds
 * Returns 0 if expired or invalid
 */
export function getTokenExpiryTime(token: string): number {
  const decoded = decodeJwt(token);
  if (!decoded || !decoded.exp) {
    return 0;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  const expiryTime = decoded.exp - currentTime;
  return Math.max(0, expiryTime * 1000);
}

/**
 * Check if token will expire within the given buffer time (in seconds)
 * Default buffer is 5 minutes (300 seconds)
 */
export function shouldRefreshToken(token: string, bufferSeconds: number = 300): boolean {
  const decoded = decodeJwt(token);
  if (!decoded || !decoded.exp) {
    return true;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  const timeUntilExpiry = decoded.exp - currentTime;
  return timeUntilExpiry < bufferSeconds;
}
