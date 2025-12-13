import {
  OPEN_PASSAGE_NOTE_EDITOR,
  CLOSE_PASSAGE_NOTE_EDITOR,
  UPDATE_PASSAGE_NOTE_EDITOR,
  SET_PASSAGE_NOTE_EDITOR_ERRORS,
  SET_PASSAGE_NOTE_EDITOR_VALID,
} from './mutation-types';

const newPassageNote = {
  id: null,
  passages: [],
  content: '',
  tags: [],
};

const emptyState = {
  open: false,
  cleanFormValue: null,
  passageNote: JSON.parse(JSON.stringify(newPassageNote)),
  errors: {},
  isValid: false,
};

export const state = () => ({
  ...emptyState,
});

export const mutations = {
  [OPEN_PASSAGE_NOTE_EDITOR](state, passageNote = null) {
    if (passageNote && !passageNote.empty) {
      state.passageNote = JSON.parse(JSON.stringify(passageNote));
    }
    else {
      state.passageNote = JSON.parse(JSON.stringify(newPassageNote));
    }
    state.cleanFormValue = JSON.stringify(state.passageNote);
    state.errors = {};
    state.isValid = false;
    state.open = true;
  },
  [CLOSE_PASSAGE_NOTE_EDITOR](state) {
    Object.assign(state, emptyState);
  },
  [UPDATE_PASSAGE_NOTE_EDITOR](state, passageNote) {
    state.passageNote = JSON.parse(JSON.stringify(passageNote));
  },
  [SET_PASSAGE_NOTE_EDITOR_ERRORS](state, errors) {
    state.errors = errors || {};
  },
  [SET_PASSAGE_NOTE_EDITOR_VALID](state, isValid) {
    state.isValid = isValid;
  },
};

export const actions = {
  openEditor({ commit }, passageNote = null) {
    commit(OPEN_PASSAGE_NOTE_EDITOR, passageNote);
  },
  async closeEditor({ commit, state, dispatch }, options = {}) {
    const { force = false, confirmMessage } = options;
    // Check if form is dirty before closing
    if (!force && state.cleanFormValue) {
      const currentValue = JSON.stringify(state.passageNote);
      const isDirty = currentValue !== state.cleanFormValue;
      if (isDirty) {
        const message = confirmMessage || 'Are you sure you want to close without saving?';
        const confirmed = await dispatch('dialog/confirm', { message }, { root: true });
        if (!confirmed) {
          return false;
        }
      }
    }
    commit(CLOSE_PASSAGE_NOTE_EDITOR);
    return true;
  },
  updatePassageNote({ commit }, passageNote) {
    commit(UPDATE_PASSAGE_NOTE_EDITOR, passageNote);
  },
  setErrors({ commit }, errors) {
    commit(SET_PASSAGE_NOTE_EDITOR_ERRORS, errors);
  },
  setValid({ commit }, isValid) {
    commit(SET_PASSAGE_NOTE_EDITOR_VALID, isValid);
  },
  async savePassageNote({ commit, state, dispatch, rootState }) {
    try {
      let savedPassageNote;
      if (state.passageNote.id) {
        savedPassageNote = await dispatch('passage-notes/updatePassageNote', state.passageNote, { root: true });
      }
      else {
        savedPassageNote = await dispatch('passage-notes/createPassageNote', state.passageNote, { root: true });
      }

      if (savedPassageNote) {
        commit(CLOSE_PASSAGE_NOTE_EDITOR);
        // Reload passage notes list if it exists
        if (rootState['passage-notes']) {
          await dispatch('passage-notes/loadPassageNotesPage', null, { root: true });
        }
        return savedPassageNote;
      }
      return null;
    }
    catch (err) {
      const unknownError = { _form: 'An unknown error occurred' };
      const errors = err.response?.data?.errors || unknownError;
      commit(SET_PASSAGE_NOTE_EDITOR_ERRORS, errors);
      throw err;
    }
  },
};
