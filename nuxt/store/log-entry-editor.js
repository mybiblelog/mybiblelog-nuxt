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
      state.logEntry = JSON.parse(JSON.stringify(logEntry));
      // Ensure book property is set from startVerseId if not already set
      if (!state.logEntry.book && state.logEntry.startVerseId) {
        // Import Bible here would require a different approach, so we'll let the form handle it
        // But we can at least ensure the structure is correct
      }
    }
    else {
      state.logEntry = JSON.parse(JSON.stringify(newLogEntry));
      // Set default date if not provided
      if (logEntry && logEntry.date) {
        state.logEntry.date = logEntry.date;
      }
      else {
        // Set today's date as default
        const today = new Date();
        state.logEntry.date = today.toISOString().split('T')[0];
      }
    }
    state.cleanFormValue = JSON.stringify(state.logEntry);
    state.errors = {};
    state.isValid = false;
    state.open = true;
  },
  [CLOSE_LOG_ENTRY_EDITOR](state) {
    Object.assign(state, emptyState);
  },
  [UPDATE_LOG_ENTRY_EDITOR](state, logEntry) {
    state.logEntry = JSON.parse(JSON.stringify(logEntry));
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
      const errors = err.response?.data?.errors || unknownError;
      commit(SET_LOG_ENTRY_EDITOR_ERRORS, errors);
      throw err;
    }
  },
};
