import crypto from 'node:crypto';

// OAuth 2.1 PKCE helpers (RFC 7636)

export function base64UrlEncode(input: Buffer): string {
  return input
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

export function sha256Base64Url(input: string): string {
  const hash = crypto.createHash('sha256').update(input).digest();
  return base64UrlEncode(hash);
}

// RFC 7636: code_verifier is 43..128 chars, unreserved URI chars
export function isValidPkceCodeVerifier(verifier: unknown): verifier is string {
  if (typeof verifier !== 'string') return false;
  if (verifier.length < 43 || verifier.length > 128) return false;
  return /^[A-Za-z0-9\-._~]+$/.test(verifier);
}

// RFC 7636: code_challenge derived from verifier; base64url-encoded SHA-256 is 43 chars
export function isValidPkceCodeChallenge(challenge: unknown): challenge is string {
  if (typeof challenge !== 'string') return false;
  if (challenge.length < 43 || challenge.length > 128) return false;
  return /^[A-Za-z0-9\-_]+$/.test(challenge);
}

