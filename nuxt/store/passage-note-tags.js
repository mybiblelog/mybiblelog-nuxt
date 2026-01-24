import { BrowserCache } from '@mybiblelog/shared';
import {
  SET_PASSAGE_NOTE_TAGS,
  ADD_PASSAGE_NOTE_TAG,
  UPDATE_PASSAGE_NOTE_TAG,
  REMOVE_PASSAGE_NOTE_TAG,
} from './mutation-types';

const PASSAGE_NOTE_TAGS_CACHE_KEY = 'passageNoteTags';
const PASSAGE_NOTE_TAGS_CACHE_MINUTES = 10;

export const state = () => ({
  passageNoteTags: [],
});

export const mutations = {
  [SET_PASSAGE_NOTE_TAGS](state, passageNoteTags) {
    state.passageNoteTags = passageNoteTags;
  },
  [ADD_PASSAGE_NOTE_TAG](state, passageNoteTag) {
    state.passageNoteTags.push(passageNoteTag);
  },
  [UPDATE_PASSAGE_NOTE_TAG](state, passageNoteTagUpdate) {
    const existingPassageNoteTag = state.passageNoteTags.find(passageNoteTag => passageNoteTag.id === passageNoteTagUpdate.id);
    Object.assign(existingPassageNoteTag, passageNoteTagUpdate);
  },
  [REMOVE_PASSAGE_NOTE_TAG](state, passageNoteTagId) {
    state.passageNoteTags = state.passageNoteTags.filter(passageNoteTag => passageNoteTag.id !== passageNoteTagId);
  },
};

export const actions = {
  async loadPassageNoteTags({ commit }) {
    // Check for cached data to give an immediate visual response
    let passageNoteTags = BrowserCache.get(PASSAGE_NOTE_TAGS_CACHE_KEY);
    if (passageNoteTags) {
      BrowserCache.set(PASSAGE_NOTE_TAGS_CACHE_KEY, passageNoteTags, PASSAGE_NOTE_TAGS_CACHE_MINUTES);
    }
    const { data: passageNoteTagsData } = await this.$http.get('/api/passage-note-tags');
    passageNoteTags = passageNoteTagsData;
    commit(SET_PASSAGE_NOTE_TAGS, passageNoteTags);
  },
  async createPassageNoteTag({ commit }, { label, color, description }) {
    const { data: result } = await this.$http.post('/api/passage-note-tags', { label, color, description });
    commit(ADD_PASSAGE_NOTE_TAG, result);
    return result;
  },
  async updatePassageNoteTag({ commit }, { id, label, color, description }) {
    const { data } = await this.$http.put(`/api/passage-note-tags/${id}`, { id, label, color, description });
    if (!data) { return null; }
    commit(UPDATE_PASSAGE_NOTE_TAG, data);
    return data;
  },
  async deletePassageNoteTag({ commit }, passageNoteTagId) {
    const { data } = await this.$http.delete(`/api/passage-note-tags/${passageNoteTagId}`);
    if (data) {
      commit(REMOVE_PASSAGE_NOTE_TAG, passageNoteTagId);
      return true;
    }
    return false;
  },
};
