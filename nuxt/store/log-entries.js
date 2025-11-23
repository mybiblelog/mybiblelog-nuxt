import {
  SET_LOG_ENTRIES,
  ADD_LOG_ENTRY,
  UPDATE_LOG_ENTRY,
  REMOVE_LOG_ENTRY,
} from './mutation-types';

export const state = () => ({
  logEntries: [],
});

export const getters = {
  currentLogEntries: (state, getters, rootState) => {
    const lookBackDate = rootState['user-settings'].settings.lookBackDate;
    return state.logEntries.filter(logEntry => logEntry.date >= lookBackDate);
  },
};

export const mutations = {
  [SET_LOG_ENTRIES](state, logEntries) {
    state.logEntries = logEntries;
  },
  [ADD_LOG_ENTRY](state, logEntry) {
    state.logEntries.push(logEntry);
  },
  [UPDATE_LOG_ENTRY](state, logEntryUpdate) {
    const existingLogEntry = state.logEntries.find(logEntry => logEntry.id === logEntryUpdate.id);
    Object.assign(existingLogEntry, logEntryUpdate);
  },
  [REMOVE_LOG_ENTRY](state, logEntryId) {
    state.logEntries = state.logEntries.filter(logEntry => logEntry.id !== logEntryId);
  },
};

export const actions = {
  async loadLogEntries({ commit }) {
    const url = new URL(this.$config.siteUrl); // from nuxt.config.js
    url.pathname = '/api/log-entries';
    const response = await fetch(url.toString(), {
      credentials: 'include',
      headers: {
        Authorization: this.app?.ssrToken ? `Bearer ${this.app.ssrToken}` : undefined,
      },
    });
    const data = await response.json();
    commit(SET_LOG_ENTRIES, data);
  },
  async createLogEntry({ commit, dispatch, rootState }, { date, startVerseId, endVerseId }) {
    const response = await fetch('/api/log-entries', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ date, startVerseId, endVerseId }),
    });
    const data = await response.json();
    if (!data) { return null; }
    commit(ADD_LOG_ENTRY, data);

    // non-blocking updates
    dispatch('reading-suggestions/refreshReadingSuggestions', null, { root: true });
    dispatch('date-verse-counts/cacheDateVerseCounts', date, { root: true });

    return data;
  },
  async updateLogEntry({ commit, dispatch, rootState }, { id, date, startVerseId, endVerseId }) {
    const url = new URL(this.$config.siteUrl); // from nuxt.config.js
    url.pathname = `/api/log-entries/${id}`;
    const response = await fetch(url.toString(), {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, date, startVerseId, endVerseId }),
    });
    const data = await response.json();
    if (!data) { return null; }
    commit(UPDATE_LOG_ENTRY, data);

    // non-blocking updates
    dispatch('reading-suggestions/refreshReadingSuggestions', null, { root: true });
    dispatch('date-verse-counts/cacheDateVerseCounts', date, { root: true });

    return data;
  },
  async deleteLogEntry({ commit, dispatch, state, rootState }, logEntryId) {
    const url = new URL(this.$config.siteUrl); // from nuxt.config.js
    url.pathname = `/api/log-entries/${logEntryId}`;
    const response = await fetch(url.toString(), {
      method: 'DELETE',
      credentials: 'include',
    });
    const data = await response.json();
    if (data) {
      // find the deleted log entry and get its date for efficient cache updating
      const logEntry = state.logEntries.find(logEntry => logEntry.id === logEntryId);
      const date = logEntry.date;

      commit(REMOVE_LOG_ENTRY, logEntryId);

      // non-blocking updates
      dispatch('reading-suggestions/refreshReadingSuggestions', null, { root: true });
      dispatch('date-verse-counts/cacheDateVerseCounts', date, { root: true });

      return true;
    }
    return false;
  },
};
