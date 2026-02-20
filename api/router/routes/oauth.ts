import express from 'express';
import config from '../../config';
import authCurrentUser from '../helpers/authCurrentUser';
import { InvalidRequestError, UnauthenticatedError } from '../errors/http-errors';
import { oauthAuthorizationCodes } from '../helpers/oauth-authorization-codes';
import { isValidPkceCodeChallenge, isValidPkceCodeVerifier, sha256Base64Url } from '../helpers/pkce';
import useMongooseModels from '../../mongoose/useMongooseModels';

const router = express.Router();

function isAllowedRedirectUri({ clientId, redirectUri }: { clientId: string; redirectUri: string }): boolean {
  if (clientId !== config.oauth.mobileClientId) return false;
  return config.oauth.mobileRedirectUris.some((allowed) => {
    if (allowed.endsWith('*')) {
      const prefix = allowed.slice(0, -1);
      return redirectUri.startsWith(prefix);
    }
    return redirectUri === allowed;
  });
}

function appendQueryParams(rawUrl: string, params: Record<string, string | undefined>) {
  const url = new URL(rawUrl);
  for (const [key, val] of Object.entries(params)) {
    if (typeof val === 'string' && val.length > 0) {
      url.searchParams.set(key, val);
    }
  }
  return url.toString();
}

/**
 * OAuth 2.1 Authorization Code + PKCE
 *
 * This endpoint relies on the existing web auth session (JWT cookie).
 * If unauthenticated, we redirect to the web UI (/login) with redirect_to set back to this authorize URL.
 */
router.get('/oauth/authorize', async (req, res, next) => {
  try {
    const responseType = String(req.query.response_type ?? '');
    const clientId = String(req.query.client_id ?? '');
    const redirectUri = String(req.query.redirect_uri ?? '');
    const codeChallenge = req.query.code_challenge;
    const codeChallengeMethod = String(req.query.code_challenge_method ?? '');
    const state = typeof req.query.state === 'string' ? req.query.state : undefined;

    if (responseType !== 'code') throw new InvalidRequestError();
    if (!clientId || !redirectUri) throw new InvalidRequestError();
    if (codeChallengeMethod !== 'S256') throw new InvalidRequestError();
    if (!isValidPkceCodeChallenge(codeChallenge)) throw new InvalidRequestError();
    if (!isAllowedRedirectUri({ clientId, redirectUri })) throw new InvalidRequestError();

    const currentUser = await authCurrentUser(req, { optional: true });
    if (!currentUser) {
      const redirectTo = encodeURIComponent(req.originalUrl); // includes /api prefix and querystring
      return res.redirect(`${config.siteUrl}/login?redirect_to=${redirectTo}`);
    }

    const record = oauthAuthorizationCodes.create({
      clientId,
      redirectUri,
      userId: String(currentUser._id),
      codeChallenge: codeChallenge,
      codeChallengeMethod: 'S256',
    });

    const redirect = appendQueryParams(redirectUri, {
      code: record.code,
      state,
    });
    return res.redirect(redirect);
  }
  catch (err) {
    next(err);
  }
});

/**
 * OAuth token endpoint.
 *
 * Exchanges an authorization code for a JWT access token (no refresh token for now).
 * Supports both JSON and x-www-form-urlencoded bodies.
 */
router.post('/oauth/token', async (req, res, next) => {
  try {
    const grantType = String(req.body?.grant_type ?? '');
    const code = String(req.body?.code ?? '');
    const redirectUri = String(req.body?.redirect_uri ?? '');
    const clientId = String(req.body?.client_id ?? '');
    const codeVerifier = req.body?.code_verifier;

    if (grantType !== 'authorization_code') throw new InvalidRequestError();
    if (!code || !redirectUri || !clientId) throw new InvalidRequestError();
    if (!isValidPkceCodeVerifier(codeVerifier)) throw new InvalidRequestError();
    if (!isAllowedRedirectUri({ clientId, redirectUri })) throw new InvalidRequestError();

    const record = oauthAuthorizationCodes.consume(code);
    if (!record) throw new InvalidRequestError();
    if (record.clientId !== clientId) throw new InvalidRequestError();
    if (record.redirectUri !== redirectUri) throw new InvalidRequestError();
    if (record.codeChallengeMethod !== 'S256') throw new InvalidRequestError();

    const expectedChallenge = sha256Base64Url(codeVerifier);
    if (expectedChallenge !== record.codeChallenge) throw new InvalidRequestError();

    const { User } = await useMongooseModels();
    const user = await User.findById(record.userId);
    if (!user) throw new UnauthenticatedError();

    const token = user.generateJWT();

    // Standard OAuth token response shape
    return res.json({
      access_token: token,
      token_type: 'Bearer',
    });
  }
  catch (err) {
    next(err);
  }
});

export default router;

