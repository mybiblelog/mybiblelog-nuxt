export const actions = {
  async nuxtServerInit({ dispatch }, { $auth }) {
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
