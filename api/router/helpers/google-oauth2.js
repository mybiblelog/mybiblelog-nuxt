const crypto = require('node:crypto');
const config = require('../../config');

const {
  clientId,
  clientSecret,
  redirectUri,
} = config.google;

// In-memory store for OAuth2 state parameters (in production, use Redis)
const stateStore = new Map();

const generateState = () => {
  const state = crypto.randomBytes(32).toString('hex');
  const expires = Date.now() + (10 * 60 * 1000); // 10 minutes
  stateStore.set(state, { expires });

  // Clean up expired states
  for (const [key, value] of stateStore.entries()) {
    if (value.expires < Date.now()) {
      stateStore.delete(key);
    }
  }

  return state;
};

const verifyState = (state) => {
  const stateData = stateStore.get(state);
  if (!stateData) {
    return false;
  }

  if (stateData.expires < Date.now()) {
    stateStore.delete(state);
    return false;
  }

  // Remove used state
  stateStore.delete(state);
  return true;
};

const getGoogleLoginUrl = () => {
  const state = generateState();
  const stringifiedParams = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ].join(' '), // space separated string
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
    state,
  }).toString();

  return {
    url: `https://accounts.google.com/o/oauth2/v2/auth?${stringifiedParams}`,
    state,
  };
};

const getAccessTokenFromCode = async (code) => {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
        code,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OAuth2 token exchange failed: ${response.status} - ${errorData.error_description || 'Unknown error'}`);
    }

    // data: { access_token, expires_in, token_type, refresh_token }
    const data = await response.json();
    return data.access_token;
  }
  catch (err) {
    console.error('OAuth2 token exchange error:', err);
    throw err;
  }
};

const getUserProfileFromToken = async (token) => {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP Error Status: ${response.status}`);
  }

  // data: { id, email, verified_email, given_name, family_name, name, locale, picture }
  const data = await response.json();
  return data;
};

module.exports = {
  getGoogleLoginUrl,
  verifyState,
  getAccessTokenFromCode,
  getUserProfileFromToken,
};
