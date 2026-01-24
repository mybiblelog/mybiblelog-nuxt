import {
  BibleApps,
  getAppReadingUrl,
  getDefaultBibleApp,
  getDefaultBibleVersion,
} from '@mybiblelog/shared';
import {
  SET_USER_SETTINGS,
} from './mutation-types';

const LocalStorageKeys = {
  PREFERRED_BIBLE_APP: 'store:user-settings:preferredBibleApp',
};

const DEFAULT_BIBLE_APP = getDefaultBibleApp();
const DEFAULT_BIBLE_VERSION = getDefaultBibleVersion();

export const state = () => ({
  settings: {
    lookBackDate: '',
    dailyVerseCountGoal: 0,
    preferredBibleApp: DEFAULT_BIBLE_APP,
    preferredBibleVersion: DEFAULT_BIBLE_VERSION,
    locale: 'en',
  },
});

export const getters = {
  getReadingUrl: state => (bookIndex, chapterIndex) => {
    const app = state.settings.preferredBibleApp;
    const version = state.settings.preferredBibleVersion;
    return getAppReadingUrl(app, version, bookIndex, chapterIndex);
  },
};

export const mutations = {
  [SET_USER_SETTINGS](state, {
    lookBackDate,
    dailyVerseCountGoal,
    preferredBibleApp,
    preferredBibleVersion,
    startPage,
    locale,
  }) {
    if (lookBackDate) {
      state.settings.lookBackDate = lookBackDate;
    }
    if (dailyVerseCountGoal) {
      state.settings.dailyVerseCountGoal = dailyVerseCountGoal;
    }
    if (preferredBibleApp) {
      state.settings.preferredBibleApp = preferredBibleApp;
    }
    if (preferredBibleVersion) {
      state.settings.preferredBibleVersion = preferredBibleVersion;
    }
    if (startPage) {
      state.settings.startPage = startPage;
    }
    if (locale) {
      state.settings.locale = locale;
    }
  },
};

export const actions = {
  async updateSettings({ commit, rootState }, {
    lookBackDate,
    dailyVerseCountGoal,
    preferredBibleApp,
    preferredBibleVersion,
    startPage,
    locale,
  }) {
    try {
      // Update local storage only if there was a change so we don't erase user settings.
      // The API call below also ignores any values that weren't provided.
      if (preferredBibleApp) {
        localStorage.setItem(LocalStorageKeys.PREFERRED_BIBLE_APP, preferredBibleApp);
      }
      await this.$http.put('/api/settings', {
        settings: {
          lookBackDate,
          dailyVerseCountGoal,
          preferredBibleVersion,
          startPage,
          locale,
        },
      });
      commit(SET_USER_SETTINGS, {
        lookBackDate,
        dailyVerseCountGoal,
        preferredBibleApp,
        preferredBibleVersion,
        startPage,
        locale,
      });
      return true;
    }
    catch (err) {
      return false;
    }
  },
  async loadSettings({ dispatch }) {
    dispatch('loadClientSettings');
    await dispatch('loadServerSettings');
  },
  async loadServerSettings({ commit, rootState }) {
    const { data } = await this.$http.get('/api/settings');
    const {
      lookBackDate,
      dailyVerseCountGoal,
      preferredBibleVersion,
      startPage,
      locale,
    } = data;
    commit(SET_USER_SETTINGS, {
      lookBackDate,
      dailyVerseCountGoal,
      preferredBibleVersion,
      startPage,
      locale,
    });
  },
  loadClientSettings({ commit }) {
    let preferredBibleApp = DEFAULT_BIBLE_APP;
    if (process.client) {
      const localStorageSetting = localStorage.getItem(LocalStorageKeys.PREFERRED_BIBLE_APP);
      if (BibleApps[localStorageSetting]) {
        preferredBibleApp = localStorageSetting;
      }
    }
    commit(SET_USER_SETTINGS, {
      preferredBibleApp,
    });
  },
};
