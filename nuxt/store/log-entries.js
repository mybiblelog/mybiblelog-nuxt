import {
  SET_LOG_ENTRIES,
  ADD_LOG_ENTRY,
  UPDATE_LOG_ENTRY,
  REMOVE_LOG_ENTRY,
} from './mutation-types';
import { Bible } from '@mybiblelog/shared';

export const state = () => ({
  logEntries: [],
});

export const getters = {
  currentLogEntries: (state, _getters, rootState) => {
    const lookBackDate = rootState['user-settings'].settings.lookBackDate;
    return state.logEntries.filter(logEntry => logEntry.date >= lookBackDate);
  },
};

// Helper functions to check completion
const isBookComplete = (bookIndex, logEntries) => {
  const totalVerses = Bible.getBookVerseCount(bookIndex);
  const versesRead = Bible.countUniqueBookRangeVerses(bookIndex, logEntries);
  return versesRead === totalVerses;
};

const isBibleComplete = (logEntries) => {
  const totalBooks = Bible.getBookCount();
  for (let i = 1; i <= totalBooks; i++) {
    if (!isBookComplete(i, logEntries)) {
      return false;
    }
  }
  return true;
};

const getBookIndexFromVerseId = (verseId) => {
  const parsed = Bible.parseVerseId(verseId);
  return parsed.book;
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
    const { data } = await this.$http.get('/api/log-entries');
    commit(SET_LOG_ENTRIES, data);
  },
  async createLogEntry({ commit, dispatch, getters }, { date, startVerseId, endVerseId }) {
    // Get current log entries before adding the new one
    const currentLogEntries = getters.currentLogEntries;
    const bookIndex = getBookIndexFromVerseId(startVerseId);

    // Check if book was already complete before adding this entry
    const wasBookComplete = isBookComplete(bookIndex, currentLogEntries);
    const wasBibleComplete = isBibleComplete(currentLogEntries);

    const { data } = await this.$http.post('/api/log-entries', {
      date,
      startVerseId,
      endVerseId,
    });
    commit(ADD_LOG_ENTRY, data);

    // Check completion after adding the entry
    // Need to get updated log entries (including the new one)
    const updatedLogEntries = getters.currentLogEntries;
    const isBookNowComplete = isBookComplete(bookIndex, updatedLogEntries);
    const isBibleNowComplete = isBibleComplete(updatedLogEntries);

    // Show achievement modals if completion status changed
    if (!wasBibleComplete && isBibleNowComplete) {
      // Show Bible completion first (more significant achievement)
      dispatch('achievements/showBibleCompleteAchievement', null, { root: true });
    }
    else if (!wasBookComplete && isBookNowComplete) {
      // Show book completion if Bible isn't complete
      dispatch('achievements/showBookCompleteAchievement', bookIndex, { root: true });
    }

    // non-blocking updates
    dispatch('reading-suggestions/refreshReadingSuggestions', null, { root: true });
    dispatch('date-verse-counts/cacheDateVerseCounts', date, { root: true });

    return data;
  },
  async updateLogEntry({ commit, dispatch, getters }, { id, date, startVerseId, endVerseId }) {
    // Get current log entries before updating
    const currentLogEntries = getters.currentLogEntries;
    const bookIndex = getBookIndexFromVerseId(startVerseId);

    // Check if book was already complete before updating this entry
    const wasBookComplete = isBookComplete(bookIndex, currentLogEntries);
    const wasBibleComplete = isBibleComplete(currentLogEntries);

    const { data } = await this.$http.put(`/api/log-entries/${id}`, {
      date,
      startVerseId,
      endVerseId,
    });
    commit(UPDATE_LOG_ENTRY, data);

    // Check completion after updating the entry
    // Need to get updated log entries
    const updatedLogEntries = getters.currentLogEntries;
    const isBookNowComplete = isBookComplete(bookIndex, updatedLogEntries);
    const isBibleNowComplete = isBibleComplete(updatedLogEntries);

    // Show achievement modals if completion status changed
    if (!wasBibleComplete && isBibleNowComplete) {
      // Show Bible completion first (more significant achievement)
      dispatch('achievements/showBibleCompleteAchievement', null, { root: true });
    }
    else if (!wasBookComplete && isBookNowComplete) {
      // Show book completion if Bible isn't complete
      dispatch('achievements/showBookCompleteAchievement', bookIndex, { root: true });
    }

    // non-blocking updates
    dispatch('reading-suggestions/refreshReadingSuggestions', null, { root: true });
    dispatch('date-verse-counts/cacheDateVerseCounts', date, { root: true });

    return data;
  },
  async deleteLogEntry({ commit, dispatch, state }, logEntryId) {
    const { data } = await this.$http.delete(`/api/log-entries/${logEntryId}`);
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
