import * as dayjs from 'dayjs';
import { Bible } from '@mybiblelog/shared';
import mapFormErrors from '~/helpers/map-form-errors';

import {
  OPEN_LOG_ENTRY_EDITOR,
  CLOSE_LOG_ENTRY_EDITOR,
  UPDATE_LOG_ENTRY_EDITOR,
  SET_LOG_ENTRY_EDITOR_ERRORS,
  SET_LOG_ENTRY_EDITOR_VALID,
} from './mutation-types';

const newLogEntry = {
  id: null,
  date: null,
  book: null,
  startVerseId: null,
  endVerseId: null,
};

const emptyState = {
  open: false,
  cleanFormValue: null,
  logEntry: JSON.parse(JSON.stringify(newLogEntry)),
  errors: {},
  isValid: false,
};

export const state = () => ({
  ...emptyState,
});

export const mutations = {
  [OPEN_LOG_ENTRY_EDITOR](state, logEntry = null) {
    if (logEntry && !logEntry.empty) {
      // Editing existing entry or opening with pre-filled data
      state.logEntry = JSON.parse(JSON.stringify(logEntry));

      // Ensure book property is set from startVerseId if not already set
      if (!state.logEntry.book && state.logEntry.startVerseId) {
        const start = Bible.parseVerseId(state.logEntry.startVerseId);
        state.logEntry.book = start.book;
      }
    }
    else {
      // New entry
      state.logEntry = JSON.parse(JSON.stringify(newLogEntry));
      // Set default date if not provided
      if (logEntry && logEntry.date) {
        state.logEntry.date = logEntry.date;
      }
      else {
        // Set today's date as default
        state.logEntry.date = dayjs().format('YYYY-MM-DD');
      }
    }

    // Store clean state for dirty tracking
    state.cleanFormValue = JSON.stringify(state.logEntry);
    state.errors = {};
    // Compute initial validity
    state.isValid = !!(state.logEntry.endVerseId && state.logEntry.date);
    state.open = true;
  },
  [CLOSE_LOG_ENTRY_EDITOR](state) {
    Object.assign(state, emptyState);
  },
  [UPDATE_LOG_ENTRY_EDITOR](state, logEntry) {
    state.logEntry = JSON.parse(JSON.stringify(logEntry));
    // Update validation state
    state.isValid = !!(state.logEntry.endVerseId && state.logEntry.date);
  },
  [SET_LOG_ENTRY_EDITOR_ERRORS](state, errors) {
    state.errors = errors || {};
  },
  [SET_LOG_ENTRY_EDITOR_VALID](state, isValid) {
    state.isValid = isValid;
  },
};

export const actions = {
  openEditor({ commit }, logEntry = null) {
    commit(OPEN_LOG_ENTRY_EDITOR, logEntry);
  },
  async closeEditor({ commit, state, dispatch }, options = {}) {
    const { force = false, confirmMessage } = options;
    // Check if form is dirty before closing
    if (!force && state.cleanFormValue) {
      const currentValue = JSON.stringify(state.logEntry);
      const isDirty = currentValue !== state.cleanFormValue;
      if (isDirty) {
        const message = confirmMessage || 'Are you sure you want to close without saving?';
        const confirmed = await dispatch('dialog/confirm', { message }, { root: true });
        if (!confirmed) {
          return false;
        }
      }
    }
    commit(CLOSE_LOG_ENTRY_EDITOR);
    return true;
  },
  updateLogEntry({ commit }, logEntry) {
    commit(UPDATE_LOG_ENTRY_EDITOR, logEntry);
  },
  setErrors({ commit }, errors) {
    commit(SET_LOG_ENTRY_EDITOR_ERRORS, errors);
  },
  setValid({ commit }, isValid) {
    commit(SET_LOG_ENTRY_EDITOR_VALID, isValid);
  },
  // Action to select a book - includes auto-fill logic
  selectBook({ commit, state, dispatch }, bookIndex) {
    const updatedLogEntry = JSON.parse(JSON.stringify(state.logEntry));
    updatedLogEntry.book = bookIndex;

    // Always clear verse IDs when book is selected (original behavior)
    updatedLogEntry.startVerseId = null;
    updatedLogEntry.endVerseId = null;

    commit(UPDATE_LOG_ENTRY_EDITOR, updatedLogEntry);

    // Auto-fill logic: if book has only one chapter, auto-select it
    const chapterCount = Bible.getBookChapterCount(bookIndex);
    if (chapterCount === 1) {
      // Auto-select chapter 1, which will trigger auto-fill of verses
      dispatch('selectStartChapter', 1);
    }
  },
  // Action to select start chapter - includes auto-fill logic
  selectStartChapter({ commit, state, dispatch }, chapterIndex) {
    const bookIndex = state.logEntry.book;
    if (!bookIndex || bookIndex === 0) { return; }

    const updatedLogEntry = JSON.parse(JSON.stringify(state.logEntry));

    // Auto-select verse 1 (this will trigger selectStartVerse logic)
    const startVerseId = Bible.makeVerseId(bookIndex, chapterIndex, 1);
    updatedLogEntry.startVerseId = startVerseId;
    commit(UPDATE_LOG_ENTRY_EDITOR, updatedLogEntry);

    // Auto-set end chapter to same as start chapter and auto-select last verse
    const chapterVerseCount = Bible.getChapterVerseCount(bookIndex, chapterIndex);
    const endVerseId = Bible.makeVerseId(bookIndex, chapterIndex, chapterVerseCount);
    const finalLogEntry = JSON.parse(JSON.stringify(updatedLogEntry));
    finalLogEntry.endVerseId = endVerseId;
    commit(UPDATE_LOG_ENTRY_EDITOR, finalLogEntry);
  },
  // Action to select start verse - includes auto-fill logic
  selectStartVerse({ commit, state }, verseIndex) {
    const bookIndex = state.logEntry.book;
    const startChapter = state.logEntry.startVerseId
      ? Bible.parseVerseId(state.logEntry.startVerseId).chapter
      : 0;

    if (!bookIndex || bookIndex === 0 || !startChapter || startChapter === 0) { return; }

    const updatedLogEntry = JSON.parse(JSON.stringify(state.logEntry));
    const startVerseId = Bible.makeVerseId(bookIndex, startChapter, verseIndex);
    updatedLogEntry.startVerseId = startVerseId;

    // Auto-set end chapter to start chapter if not already set
    if (!updatedLogEntry.endVerseId) {
      const chapterVerseCount = Bible.getChapterVerseCount(bookIndex, startChapter);
      const endVerseId = Bible.makeVerseId(bookIndex, startChapter, chapterVerseCount);
      updatedLogEntry.endVerseId = endVerseId;
    }
    else {
      // Ensure end verse is valid (not before start verse in same chapter)
      const end = Bible.parseVerseId(updatedLogEntry.endVerseId);
      if (end.chapter === startChapter && end.verse < verseIndex) {
        const chapterVerseCount = Bible.getChapterVerseCount(bookIndex, startChapter);
        const endVerseId = Bible.makeVerseId(bookIndex, startChapter, chapterVerseCount);
        updatedLogEntry.endVerseId = endVerseId;
      }
    }

    commit(UPDATE_LOG_ENTRY_EDITOR, updatedLogEntry);
  },
  // Action to select end chapter - includes auto-fill logic
  selectEndChapter({ commit, state }, chapterIndex) {
    const bookIndex = state.logEntry.book;
    const startChapter = state.logEntry.startVerseId
      ? Bible.parseVerseId(state.logEntry.startVerseId).chapter
      : 0;
    const startVerse = state.logEntry.startVerseId
      ? Bible.parseVerseId(state.logEntry.startVerseId).verse
      : 1;

    if (!bookIndex || bookIndex === 0) { return; }

    const updatedLogEntry = JSON.parse(JSON.stringify(state.logEntry));
    const chapterVerseCount = Bible.getChapterVerseCount(bookIndex, chapterIndex);

    // Auto-select last verse of the chapter
    // If same chapter as start, ensure end verse is at least start verse
    const endVerse = chapterVerseCount;

    const endVerseId = Bible.makeVerseId(bookIndex, chapterIndex, endVerse);
    updatedLogEntry.endVerseId = endVerseId;

    commit(UPDATE_LOG_ENTRY_EDITOR, updatedLogEntry);
  },
  // Action to select end verse
  selectEndVerse({ commit, state }, verseIndex) {
    const bookIndex = state.logEntry.book;
    const endChapter = state.logEntry.endVerseId
      ? Bible.parseVerseId(state.logEntry.endVerseId).chapter
      : 0;

    if (!bookIndex || bookIndex === 0 || !endChapter || endChapter === 0) { return; }

    const updatedLogEntry = JSON.parse(JSON.stringify(state.logEntry));
    const endVerseId = Bible.makeVerseId(bookIndex, endChapter, verseIndex);
    updatedLogEntry.endVerseId = endVerseId;

    commit(UPDATE_LOG_ENTRY_EDITOR, updatedLogEntry);
  },
  // Action to update date
  updateDate({ commit, state }, date) {
    const updatedLogEntry = JSON.parse(JSON.stringify(state.logEntry));
    updatedLogEntry.date = date;
    commit(UPDATE_LOG_ENTRY_EDITOR, updatedLogEntry);
  },
  async saveLogEntry({ commit, state, dispatch, rootState }) {
    try {
      let savedLogEntry;
      if (state.logEntry.id) {
        savedLogEntry = await dispatch('log-entries/updateLogEntry', state.logEntry, { root: true });
      }
      else {
        savedLogEntry = await dispatch('log-entries/createLogEntry', state.logEntry, { root: true });
      }

      if (savedLogEntry) {
        commit(CLOSE_LOG_ENTRY_EDITOR);
        return savedLogEntry;
      }
      return null;
    }
    catch (err) {
      const unknownError = { _form: 'An unknown error occurred' };
      const errorData = err.response?.data?.error;
      if (errorData) {
        const errors = mapFormErrors(errorData) || unknownError;
        commit(SET_LOG_ENTRY_EDITOR_ERRORS, errors);
      }
      else {
        commit(SET_LOG_ENTRY_EDITOR_ERRORS, unknownError);
      }
      throw err;
    }
  },
};
