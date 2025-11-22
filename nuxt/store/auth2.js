// actions
const SET_USER = 'SET_USER';
const SET_USER_TOKEN = 'SET_USER_TOKEN';

export const state = () => ({
  loggedIn: false,
  user: null,
  token: null,
});

export const mutations = {
  [SET_USER](state, user) {
    state.user = user;
    state.loggedIn = !!user;
  },
  [SET_USER_TOKEN](state, token) {
    state.token = token;
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
        commit(SET_USER_TOKEN, token);
        return { success: true, error: null };
      }
      else {
        commit(SET_USER, null);
        commit(SET_USER_TOKEN, null);
        return { success: false, error: data.errors };
      }
    }
    catch (error) {
      return { success: false, error: error.message };
    }
  },
  async setUserToken({ commit }, token) {
    const url = new URL(this.$config.siteUrl); // from nuxt.config.js
    url.pathname = '/api/auth/user';
    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (response.ok && data?.user) {
      const { user } = data;
      delete user.token;
      commit(SET_USER, user);
      commit(SET_USER_TOKEN, token);
    }
    else {
      commit(SET_USER, null);
      commit(SET_USER_TOKEN, null);
    }
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
    commit(SET_USER_TOKEN, null);
  },
};
