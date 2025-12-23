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
    const url = new URL('/api/log-entries', this.$config.siteUrl);
    const response = await fetch(url.toString(), {
      credentials: 'include',
      headers: {
        Authorization: this.app?.ssrToken ? `Bearer ${this.app.ssrToken}` : undefined,
      },
    });
    const data = await response.json();
    commit(SET_LOG_ENTRIES, data);
  },
  async createLogEntry({ commit, dispatch, rootState, getters }, { date, startVerseId, endVerseId }) {
    // Get current log entries before adding the new one
    const currentLogEntries = getters.currentLogEntries;
    const bookIndex = getBookIndexFromVerseId(startVerseId);

    // Check if book was already complete before adding this entry
    const wasBookComplete = isBookComplete(bookIndex, currentLogEntries);
    const wasBibleComplete = isBibleComplete(currentLogEntries);

    const response = await fetch(new URL('/api/log-entries', this.$config.siteUrl), {
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

    // Check completion after adding the entry
    // Need to get updated log entries (including the new one)
    const updatedLogEntries = getters.currentLogEntries;
    const isBookNowComplete = isBookComplete(bookIndex, updatedLogEntries);
    const isBibleNowComplete = isBibleComplete(updatedLogEntries);

    // Show alerts if completion status changed
    if (!wasBookComplete && isBookNowComplete) {
      const bookName = Bible.getBookName(bookIndex, rootState['user-settings']?.settings?.locale || 'en');
      alert(`Congratulations! You have completed ${bookName}!`);
    }

    if (!wasBibleComplete && isBibleNowComplete) {
      alert('🎉 Amazing! You have completed reading the entire Bible! 🎉');
    }

    // non-blocking updates
    dispatch('reading-suggestions/refreshReadingSuggestions', null, { root: true });
    dispatch('date-verse-counts/cacheDateVerseCounts', date, { root: true });

    return data;
  },
  async updateLogEntry({ commit, dispatch, rootState, getters }, { id, date, startVerseId, endVerseId }) {
    // Get current log entries before updating
    const currentLogEntries = getters.currentLogEntries;
    const bookIndex = getBookIndexFromVerseId(startVerseId);

    // Check if book was already complete before updating this entry
    const wasBookComplete = isBookComplete(bookIndex, currentLogEntries);
    const wasBibleComplete = isBibleComplete(currentLogEntries);

    const url = new URL(`/api/log-entries/${id}`, this.$config.siteUrl);
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

    // Check completion after updating the entry
    // Need to get updated log entries
    const updatedLogEntries = getters.currentLogEntries;
    const isBookNowComplete = isBookComplete(bookIndex, updatedLogEntries);
    const isBibleNowComplete = isBibleComplete(updatedLogEntries);

    // Show alerts if completion status changed
    if (!wasBookComplete && isBookNowComplete) {
      const bookName = Bible.getBookName(bookIndex, rootState['user-settings']?.settings?.locale || 'en');
      alert(`Congratulations! You have completed ${bookName}!`);
    }

    if (!wasBibleComplete && isBibleNowComplete) {
      alert('🎉 Amazing! You have completed reading the entire Bible! 🎉');
    }

    // non-blocking updates
    dispatch('reading-suggestions/refreshReadingSuggestions', null, { root: true });
    dispatch('date-verse-counts/cacheDateVerseCounts', date, { root: true });

    return data;
  },
  async deleteLogEntry({ commit, dispatch, state }, logEntryId) {
    const url = new URL(`/api/log-entries/${logEntryId}`, this.$config.siteUrl);
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
