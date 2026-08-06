// Minimal JWT payload decoder. No signature verification is performed here
// (nor should it be — this is purely for client-side UX, like scheduling a
// refresh before the token's `exp` claim passes). The backend remains the
// sole source of truth for whether a token is actually valid.
export function decodeJwtPayload(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const json = decodeURIComponent(
      atob(padded)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// Returns the token's expiry as an epoch-ms timestamp, or null if it can't
// be determined (malformed token, missing `exp` claim, etc).
export function getJwtExpiryMs(token) {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return null;
  return payload.exp * 1000;
}
