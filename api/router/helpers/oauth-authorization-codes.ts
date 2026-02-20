import crypto from 'node:crypto';

export type OAuthAuthorizationCodeRecord = {
  code: string;
  clientId: string;
  redirectUri: string;
  userId: string;
  codeChallenge: string;
  codeChallengeMethod: 'S256';
  createdAt: number;
  expiresAt: number;
};

const CODE_BYTES = 32;
const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

// MVP: in-memory store (single-instance). For production: persist (Redis/DB) and make single-use.
class OAuthAuthorizationCodeStore {
  private codes = new Map<string, OAuthAuthorizationCodeRecord>();

  create(input: Omit<OAuthAuthorizationCodeRecord, 'code' | 'createdAt' | 'expiresAt'> & { ttlMs?: number }): OAuthAuthorizationCodeRecord {
    const now = Date.now();
    const ttlMs = input.ttlMs ?? DEFAULT_TTL_MS;
    const code = this.randomCode();
    const record: OAuthAuthorizationCodeRecord = {
      code,
      clientId: input.clientId,
      redirectUri: input.redirectUri,
      userId: input.userId,
      codeChallenge: input.codeChallenge,
      codeChallengeMethod: input.codeChallengeMethod,
      createdAt: now,
      expiresAt: now + ttlMs,
    };
    this.codes.set(code, record);
    return record;
  }

  consume(code: string): OAuthAuthorizationCodeRecord | null {
    const record = this.codes.get(code) ?? null;
    if (!record) return null;
    this.codes.delete(code); // single-use
    if (Date.now() > record.expiresAt) return null;
    return record;
  }

  private randomCode(): string {
    // base64url-ish (strip padding, swap URL-unsafe chars)
    return crypto
      .randomBytes(CODE_BYTES)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');
  }
}

export const oauthAuthorizationCodes = new OAuthAuthorizationCodeStore();

