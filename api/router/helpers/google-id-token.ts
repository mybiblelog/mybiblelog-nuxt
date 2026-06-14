import { OAuth2Client } from 'google-auth-library';
import config from '../../config';

export type VerifiedGoogleIdToken = {
  googleUserId: string; // "sub"
  email: string;
  audience: string;
};

const client = new OAuth2Client();

async function verifyGoogleIdToken(idToken: string): Promise<VerifiedGoogleIdToken> {
  // Verifies signature against Google's JWKS and checks exp/aud/iss locally.
  // Throws if the token is invalid, expired, or not issued for an allowed client.
  const ticket = await client.verifyIdToken({
    idToken,
    audience: config.google.allowedClientIds,
  });

  const payload = ticket.getPayload();
  if (!payload) throw new Error('Google id_token payload missing');

  const googleUserId = payload.sub;
  if (!googleUserId) throw new Error('Google id_token missing subject');

  const email = payload.email;
  if (typeof email !== 'string' || !email) throw new Error('Google id_token missing email');

  if (!payload.email_verified) throw new Error('Google email not verified');

  const audience = Array.isArray(payload.aud) ? payload.aud[0] : payload.aud;
  if (!audience) throw new Error('Google id_token missing audience');

  return { googleUserId, email, audience };
}

export default {
  verifyGoogleIdToken,
};
