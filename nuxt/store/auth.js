/**
 * AUTH STRATEGY
 *
 * For authentication, Nuxt relies completely on an httpOnly cookie named `auth_token`.
 * For security, the token is never serialized to HTML and never accessible to browser JS.
 *
 * During SSR, the token is temporarily stored as `app.ssrToken`.
 * The `app.ssrToken` value is used as an Authorization header in server-initiated `fetch` requests,
 * since cookies are not available during SSR.
 * The `app.ssrToken` value is not serialized in the initial HTML and never reaches the browser.
 *
 * Any API route that creates a new user session (issues a token) also sets the cookie.
 */

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
    const url = new URL('/api/auth/user', this.$config.siteUrl);
    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${this.app.ssrToken}`,
      },
    });
    const data = await response.json();
    const { user } = data;
    delete user?.token;
    commit(SET_USER, user);
  },
  async refreshUser({ commit }) {
    const url = new URL('/api/auth/user', this.$config.siteUrl);
    const response = await fetch(url.toString(), {
      credentials: 'include',
    });
    const data = await response.json();
    const { user } = data;
    delete user?.token;
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
    // Clear session storage and fully reload the page
    // to ensure the user is logged out and all store data is cleared.
    sessionStorage.clear();
    window.location.href = '/login';
  },
};
