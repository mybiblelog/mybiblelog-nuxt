// actions
const SET_USER = 'SET_USER';

export const state = () => ({
  loggedIn: false,
  user: null,
});

export const mutations = {
  [SET_USER](state, user) {
    state.user = user;
    state.loggedIn = !!user;
  },
};

export const actions = {
  async login({ commit }, { email, password }) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        const { token, ...user } = data;
        commit(SET_USER, user);
        return { success: true, error: null };
      }
      else {
        commit(SET_USER, null);
        return { success: false, error: data.errors };
      }
    }
    catch (error) {
      return { success: false, error: error.message };
    }
  },
  async fetchServerUser({ commit }) {
    const url = new URL(this.$config.siteUrl); // from nuxt.config.js
    url.pathname = '/api/auth/user';
    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${this.app.ssrToken}`,
      },
    });
    const data = await response.json();
    const { user } = data;
    if (user) {
      delete user.token;
    }
    commit(SET_USER, user);
  },
  async refreshUser({ commit }) {
    const url = new URL(this.$config.siteUrl); // from nuxt.config.js
    url.pathname = '/api/auth/user';
    const response = await fetch(url.toString(), {
      credentials: 'include',
    });
    const data = await response.json();
    const { user } = data;
    delete user.token;
    commit(SET_USER, user);
  },
  async logout({ commit }) {
    try {
      // Send API request to delete token from HttpOnly cookie
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    catch (error) {
      // This is expected to fail after account deletion
    }
    commit(SET_USER, null);
  },
};
