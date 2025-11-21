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
      return true;
    }
    else {
      commit(SET_USER, null);
      commit(SET_USER_TOKEN, null);
      return false;
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
    // Send API request to delete token from HttpOnly cookie
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    commit(SET_USER, null);
    commit(SET_USER_TOKEN, null);
  },
  // TODO: loginWith in:
  // login.vue
  // register.vue
  // --- this will be replaced with 'login' above (will still need a manual redirect afterward -- to an i18n-aware redirect URL)
  // TODO: handle 'onRedirect' in:
  // plugins/auth-i18n-redirect.js
  // ---  the redirect behavior comes from auth middleware, right?
  //      so if we implement custom auth middleware, we can handle the redirect behavior there.
  // TODO: how to access state from this store in the global store?
  // nuxt/store/index.js
  // --- can access user from 'req' object: https://v2.nuxt.com/docs/directory-structure/store/#the-nuxtserverinit-action

};
