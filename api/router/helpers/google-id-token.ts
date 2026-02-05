import config from '../../config';

type GoogleTokenInfoResponse = {
  aud?: string;
  sub?: string;
  email?: string;
  email_verified?: string | boolean;
  exp?: string;
  iss?: string;
};

export type VerifiedGoogleIdToken = {
  googleUserId: string; // "sub"
  email: string;
  audience: string;
};

function isEmailVerified(v: unknown): boolean {
  if (v === true) return true;
  if (v === 'true') return true;
  return false;
}

function isTokenExpired(expSeconds: unknown): boolean {
  const n = typeof expSeconds === 'string' ? Number(expSeconds) : NaN;
  if (!Number.isFinite(n) || n <= 0) return true;
  return Date.now() >= n * 1000;
}

async function verifyGoogleIdToken(idToken: string): Promise<VerifiedGoogleIdToken> {
  const res = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
    { method: 'GET' }
  );

  if (!res.ok) {
    // tokeninfo returns 400 for invalid tokens
    throw new Error(`Invalid Google id_token (status ${res.status})`);
  }

  const info = (await res.json()) as GoogleTokenInfoResponse;
  const audience = info.aud;
  const googleUserId = info.sub;
  const email = info.email;

  if (typeof audience !== 'string' || !audience) {
    throw new Error('Google id_token missing audience');
  }

  if (!config.google.allowedClientIds.includes(audience)) {
    throw new Error('Google id_token audience not allowed');
  }

  if (typeof googleUserId !== 'string' || !googleUserId) {
    throw new Error('Google id_token missing subject');
  }

  if (typeof email !== 'string' || !email) {
    throw new Error('Google id_token missing email');
  }

  if (!isEmailVerified(info.email_verified)) {
    throw new Error('Google email not verified');
  }

  if (isTokenExpired(info.exp)) {
    throw new Error('Google id_token expired');
  }

  return { googleUserId, email, audience };
}

export default {
  verifyGoogleIdToken,
};

