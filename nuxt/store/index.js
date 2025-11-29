export const AUTH_COOKIE_NAME = 'auth_token';

export const actions = {
  async nuxtServerInit({ dispatch, state }, { req, app }) {
    if (req.headers && req.headers.cookie && req.headers.cookie.includes(`${AUTH_COOKIE_NAME}=`)) {
      const token = req.headers.cookie.split(`${AUTH_COOKIE_NAME}=`)[1].split(';')[0];

      // `app` is not serialized into the HTML response,
      // so it's safe to store the token here for SSR access
      app.ssrToken = token;
      await dispatch('auth/fetchServerUser');
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
    await dispatch('log-entries/loadLogEntries');
    await dispatch('user-settings/loadSettings');
  },
};
