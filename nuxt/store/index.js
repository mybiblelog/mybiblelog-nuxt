const AUTH_COOKIE_NAME = 'auth_token';

export const actions = {
  // async nuxtServerInit({ dispatch }, { req, $auth }) {
  async nuxtServerInit({ dispatch }, { req, $auth }) {
    if (req.headers && req.headers.cookie && req.headers.cookie.includes(`${AUTH_COOKIE_NAME}=`)) {
      const token = req.headers.cookie.split(`${AUTH_COOKIE_NAME}=`)[1].split(';')[0];
      await dispatch('auth2/setUserToken', token);
    }

    if ($auth.loggedIn) {
      await dispatch('loadUserData');
    }
  },
  async nuxtClientInit({ dispatch }, { app: { $auth } }) {
    if ($auth.loggedIn) {
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
