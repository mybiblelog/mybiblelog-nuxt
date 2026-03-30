import { useLogEntriesStore } from '~/stores/log-entries';

export const AUTH_COOKIE_NAME = 'auth_token';

const parseCookieHeader = (cookieHeader) => {
  const out = {};
  for (const part of String(cookieHeader).split(';')) {
    const trimmed = part.trim();
    if (!trimmed) {
      continue;
    }
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx <= 0) {
      continue;
    }
    const name = trimmed.slice(0, eqIdx).trim();
    const rawValue = trimmed.slice(eqIdx + 1);
    if (!name) {
      continue;
    }
    try {
      out[name] = decodeURIComponent(rawValue);
    }
    catch {
      /* eslint-disable no-console */
      console.warn('[auth] failed to decode cookie during SSR', {
        cookieName: name,
        rawLength: rawValue.length,
      });
      /* eslint-enable no-console */
      out[name] = rawValue;
    }
  }
  return out;
};

export const actions = {
  async nuxtServerInit({ dispatch, state }, { req, app }) {
    const cookieHeader = req.headers?.cookie;
    if (cookieHeader && cookieHeader.includes(`${AUTH_COOKIE_NAME}=`)) {
      const cookies = parseCookieHeader(cookieHeader);
      const token = cookies[AUTH_COOKIE_NAME];
      if (token) {
        // `app` is not serialized into the HTML response,
        // so it's safe to store the token here for SSR access
        app.ssrToken = token;
        await dispatch('auth/refreshUser');
      }
    }

    if (state.auth.loggedIn) {
      await dispatch('loadUserData');
    }
  },
  async nuxtClientInit({ dispatch, state }) {
    if (state.auth.loggedIn) {
      // On client side, re-trigger user settings load
      // since some settings are stored in LocalStorage
      await dispatch('user-settings/loadClientSettings');
    }
  },
  async loadUserData({ dispatch }) {
    await useLogEntriesStore().loadLogEntries();
    await dispatch('user-settings/loadSettings');
  },
};
