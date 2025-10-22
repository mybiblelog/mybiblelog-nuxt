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
    const response = await this.$axios.get('/api/log-entries');
    commit(SET_LOG_ENTRIES, response.data);
  },
  async createLogEntry({ commit, dispatch }, { date, startVerseId, endVerseId }) {
    const response = await this.$axios.post('/api/log-entries', { date, startVerseId, endVerseId });
    const { data } = response;
    if (!data) { return null; }
    commit(ADD_LOG_ENTRY, data);

    // non-blocking updates
    dispatch('reading-suggestions/refreshReadingSuggestions', null, { root: true });
    dispatch('date-verse-counts/cacheDateVerseCounts', date, { root: true });

    return data;
  },
  async updateLogEntry({ commit, dispatch }, { id, date, startVerseId, endVerseId }) {
    const response = await this.$axios.put(`/api/log-entries/${id}`, { id, date, startVerseId, endVerseId });
    const { data } = response;
    if (!data) { return null; }
    commit(UPDATE_LOG_ENTRY, data);

    // non-blocking updates
    dispatch('reading-suggestions/refreshReadingSuggestions', null, { root: true });
    dispatch('date-verse-counts/cacheDateVerseCounts', date, { root: true });

    return data;
  },
  async deleteLogEntry({ commit, dispatch, state }, logEntryId) {
    const response = await this.$axios.delete(`/api/log-entries/${logEntryId}`);
    if (response.data) {
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
