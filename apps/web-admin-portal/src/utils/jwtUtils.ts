interface JwtPayload {
  exp?: number;
  iat?: number;
  sub?: string;
  [key: string]: unknown;
}

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string, bufferSeconds: number = 30): boolean {
  const payload = decodeJwt(token);
  if (!payload?.exp) return true;

  const expirationTime = payload.exp * 1000;
  const currentTime = Date.now();
  const bufferMs = bufferSeconds * 1000;

  return currentTime >= expirationTime - bufferMs;
}

export function getTokenExpirationTime(token: string): Date | null {
  const payload = decodeJwt(token);
  if (!payload?.exp) return null;
  return new Date(payload.exp * 1000);
}
