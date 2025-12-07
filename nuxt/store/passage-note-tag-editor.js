import {
  OPEN_PASSAGE_NOTE_TAG_EDITOR,
  CLOSE_PASSAGE_NOTE_TAG_EDITOR,
  UPDATE_PASSAGE_NOTE_TAG_EDITOR,
  SET_PASSAGE_NOTE_TAG_EDITOR_ERRORS,
  SET_PASSAGE_NOTE_TAG_EDITOR_VALID,
} from './mutation-types';

const newPassageNoteTag = {
  id: null,
  label: '',
  color: '#000000',
  description: '',
};

const emptyState = {
  open: false,
  cleanFormValue: null,
  passageNoteTag: JSON.parse(JSON.stringify(newPassageNoteTag)),
  errors: {},
  isValid: false,
};

export const state = () => ({
  ...emptyState,
});

export const mutations = {
  [OPEN_PASSAGE_NOTE_TAG_EDITOR](state, passageNoteTag = null) {
    if (passageNoteTag && !passageNoteTag.empty) {
      state.passageNoteTag = JSON.parse(JSON.stringify(passageNoteTag));
    }
    else {
      state.passageNoteTag = JSON.parse(JSON.stringify(newPassageNoteTag));
    }
    state.cleanFormValue = JSON.stringify(state.passageNoteTag);
    state.errors = {};
    state.isValid = false;
    state.open = true;
  },
  [CLOSE_PASSAGE_NOTE_TAG_EDITOR](state) {
    Object.assign(state, emptyState);
  },
  [UPDATE_PASSAGE_NOTE_TAG_EDITOR](state, passageNoteTag) {
    state.passageNoteTag = JSON.parse(JSON.stringify(passageNoteTag));
  },
  [SET_PASSAGE_NOTE_TAG_EDITOR_ERRORS](state, errors) {
    state.errors = errors || {};
  },
  [SET_PASSAGE_NOTE_TAG_EDITOR_VALID](state, isValid) {
    state.isValid = isValid;
  },
};

export const actions = {
  openEditor({ commit }, passageNoteTag = null) {
    commit(OPEN_PASSAGE_NOTE_TAG_EDITOR, passageNoteTag);
  },
  async closeEditor({ commit, state, dispatch }, options = {}) {
    const { force = false, confirmMessage } = options;
    // Check if form is dirty before closing
    if (!force && state.cleanFormValue) {
      const currentValue = JSON.stringify(state.passageNoteTag);
      const isDirty = currentValue !== state.cleanFormValue;
      if (isDirty) {
        const message = confirmMessage || 'Are you sure you want to close without saving?';
        const confirmed = await dispatch('dialog/confirm', { message }, { root: true });
        if (!confirmed) {
          return false;
        }
      }
    }
    commit(CLOSE_PASSAGE_NOTE_TAG_EDITOR);
    return true;
  },
  updatePassageNoteTag({ commit }, passageNoteTag) {
    commit(UPDATE_PASSAGE_NOTE_TAG_EDITOR, passageNoteTag);
  },
  setErrors({ commit }, errors) {
    commit(SET_PASSAGE_NOTE_TAG_EDITOR_ERRORS, errors);
  },
  setValid({ commit }, isValid) {
    commit(SET_PASSAGE_NOTE_TAG_EDITOR_VALID, isValid);
  },
  async savePassageNoteTag({ commit, state, dispatch, rootState }) {
    try {
      let savedPassageNoteTag;
      if (state.passageNoteTag.id) {
        savedPassageNoteTag = await dispatch('passage-note-tags/updatePassageNoteTag', state.passageNoteTag, { root: true });
      }
      else {
        savedPassageNoteTag = await dispatch('passage-note-tags/createPassageNoteTag', state.passageNoteTag, { root: true });
      }

      if (savedPassageNoteTag) {
        commit(CLOSE_PASSAGE_NOTE_TAG_EDITOR);
        // Reload passage note tags list if it exists
        if (rootState['passage-note-tags']) {
          await dispatch('passage-note-tags/loadPassageNoteTags', undefined, { root: true });
        }
        return savedPassageNoteTag;
      }
      return null;
    }
    catch (err) {
      const unknownError = { _form: 'An unknown error occurred' };
      const errors = err.response?.data?.errors || unknownError;
      commit(SET_PASSAGE_NOTE_TAG_EDITOR_ERRORS, errors);
      throw err;
    }
  },
};
