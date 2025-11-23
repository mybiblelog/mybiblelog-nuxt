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
  async loadPassageNoteTags({ commit, rootState }) {
    // Check for cached data to give an immediate visual response
    let passageNoteTags = BrowserCache.get(PASSAGE_NOTE_TAGS_CACHE_KEY);
    if (passageNoteTags) {
      BrowserCache.set(PASSAGE_NOTE_TAGS_CACHE_KEY, passageNoteTags, PASSAGE_NOTE_TAGS_CACHE_MINUTES);
    }
    const url = new URL(this.$config.siteUrl); // from nuxt.config.js
    url.pathname = '/api/passage-note-tags';
    const response = await fetch(url.toString(), {
      credentials: 'include',
      headers: {
        Authorization: this.app?.ssrToken ? `Bearer ${this.app.ssrToken}` : undefined,
      },
    });
    passageNoteTags = await response.json();
    commit(SET_PASSAGE_NOTE_TAGS, passageNoteTags);
  },
  async createPassageNoteTag({ commit, dispatch, rootState }, { label, color, description }) {
    const url = new URL(this.$config.siteUrl); // from nuxt.config.js
    url.pathname = '/api/passage-note-tags';
    const response = await fetch(url.toString(), {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ label, color, description }),
    });
    const data = await response.json();
    if (!data) { return null; }
    commit(ADD_PASSAGE_NOTE_TAG, data);
    return data;
  },
  async updatePassageNoteTag({ commit, dispatch, rootState }, { id, label, color, description }) {
    const url = new URL(this.$config.siteUrl); // from nuxt.config.js
    url.pathname = `/api/passage-note-tags/${id}`;
    const response = await fetch(url.toString(), {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, label, color, description }),
    });
    const data = await response.json();
    if (!data) { return null; }
    commit(UPDATE_PASSAGE_NOTE_TAG, data);
    return data;
  },
  async deletePassageNoteTag({ commit, dispatch, rootState }, passageNoteTagId) {
    const url = new URL(this.$config.siteUrl); // from nuxt.config.js
    url.pathname = `/api/passage-note-tags/${passageNoteTagId}`;
    const response = await fetch(url.toString(), {
      method: 'DELETE',
      credentials: 'include',
    });
    const data = await response.json();
    if (data) {
      commit(REMOVE_PASSAGE_NOTE_TAG, passageNoteTagId);
      return true;
    }
    return false;
  },
};
