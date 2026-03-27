import { BrowserCache } from '@mybiblelog/shared';
import {
  SET_PASSAGE_NOTE_TAGS,
  ADD_PASSAGE_NOTE_TAG,
  UPDATE_PASSAGE_NOTE_TAG,
  REMOVE_PASSAGE_NOTE_TAG,
  SET_PASSAGE_NOTE_TAG_SORT_ORDER,
} from './mutation-types';

const PASSAGE_NOTE_TAGS_CACHE_KEY = 'passageNoteTags';
const PASSAGE_NOTE_TAGS_CACHE_MINUTES = 10;

const TagSortOrders = [
  'label:ascending',
  'createdAt:descending',
  'createdAt:ascending',
  'noteCount:descending',
  'noteCount:ascending',
  'color:hue',
];

const passageNoteTagLabelCollator = new Intl.Collator(undefined, {
  usage: 'sort',
  sensitivity: 'base',
  numeric: true,
});

const getPassageNoteTagSortKey = (label) => {
  return String(label ?? '')
    .trimStart()
    // Strip any leading non-alphanumeric chars (emoji, whitespace, punctuation, etc.)
    .replace(/^[^\p{L}\p{N}]+/u, '');
};

const compareByLabelAsc = (a, b) => {
  const aKey = getPassageNoteTagSortKey(a?.label);
  const bKey = getPassageNoteTagSortKey(b?.label);
  const byKey = passageNoteTagLabelCollator.compare(aKey, bKey);
  if (byKey) { return byKey; }

  // Tie-breaker: fall back to full label, then id for stability.
  const byFullLabel = passageNoteTagLabelCollator.compare(String(a?.label ?? ''), String(b?.label ?? ''));
  if (byFullLabel) { return byFullLabel; }

  return passageNoteTagLabelCollator.compare(String(a?.id ?? ''), String(b?.id ?? ''));
};

const getDateMsOrNull = (value) => {
  const ms = Date.parse(String(value ?? ''));
  return Number.isFinite(ms) ? ms : null;
};

const getObjectIdCreatedMsOrNull = (id) => {
  const hex = String(id ?? '').trim();
  if (!/^[0-9a-f]{24}$/i.test(hex)) { return null; }
  const seconds = parseInt(hex.slice(0, 8), 16);
  if (!Number.isFinite(seconds)) { return null; }
  return seconds * 1000;
};

const getTagCreatedMsOrNull = (tag) => {
  return getDateMsOrNull(tag?.createdAt) ??
    getObjectIdCreatedMsOrNull(tag?.id) ??
    getObjectIdCreatedMsOrNull(tag?._id);
};

const normalizeHexColor = (hex) => {
  const raw = String(hex ?? '').trim().toLowerCase();
  if (!raw) { return null; }
  const withHash = raw.startsWith('#') ? raw : `#${raw}`;
  if (/^#[0-9a-f]{3}$/i.test(withHash)) {
    const r = withHash[1];
    const g = withHash[2];
    const b = withHash[3];
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  if (/^#[0-9a-f]{6}$/i.test(withHash)) {
    return withHash;
  }
  return null;
};

const hexToRgb = (hex) => {
  const normalized = normalizeHexColor(hex);
  if (!normalized) { return null; }
  const r = parseInt(normalized.slice(1, 3), 16);
  const g = parseInt(normalized.slice(3, 5), 16);
  const b = parseInt(normalized.slice(5, 7), 16);
  if (![r, g, b].every(Number.isFinite)) { return null; }
  return { r, g, b };
};

// Returns hue in [0, 360), or null for undefined hue (grayscale).
const rgbToHue = ({ r, g, b }) => {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  if (delta === 0) { return null; }
  let h;
  if (max === rn) {
    h = ((gn - bn) / delta) % 6;
  }
  else if (max === gn) {
    h = (bn - rn) / delta + 2;
  }
  else {
    h = (rn - gn) / delta + 4;
  }
  return Math.round((h * 60 + 360) % 360);
};

const compareNullableNumberAscNullLast = (a, b) => {
  const aNull = a === null || a === undefined || Number.isNaN(a);
  const bNull = b === null || b === undefined || Number.isNaN(b);
  if (aNull && bNull) { return 0; }
  if (aNull) { return 1; }
  if (bNull) { return -1; }
  return a - b;
};

const makeTagComparator = (sortOrder) => {
  switch (sortOrder) {
  case 'createdAt:descending':
    return (a, b) => {
      const byDate = compareNullableNumberAscNullLast(getTagCreatedMsOrNull(b), getTagCreatedMsOrNull(a));
      if (byDate) { return byDate; }
      return compareByLabelAsc(a, b);
    };
  case 'createdAt:ascending':
    return (a, b) => {
      const byDate = compareNullableNumberAscNullLast(getTagCreatedMsOrNull(a), getTagCreatedMsOrNull(b));
      if (byDate) { return byDate; }
      return compareByLabelAsc(a, b);
    };
  case 'noteCount:descending':
    return (a, b) => {
      const aCount = Number(a?.noteCount ?? 0);
      const bCount = Number(b?.noteCount ?? 0);
      const byCount = bCount - aCount;
      if (byCount) { return byCount; }
      return compareByLabelAsc(a, b);
    };
  case 'noteCount:ascending':
    return (a, b) => {
      const aCount = Number(a?.noteCount ?? 0);
      const bCount = Number(b?.noteCount ?? 0);
      const byCount = aCount - bCount;
      if (byCount) { return byCount; }
      return compareByLabelAsc(a, b);
    };
  case 'color:hue':
    return (a, b) => {
      const aRgb = hexToRgb(a?.color);
      const bRgb = hexToRgb(b?.color);
      const aHue = aRgb ? rgbToHue(aRgb) : null;
      const bHue = bRgb ? rgbToHue(bRgb) : null;
      const byHue = compareNullableNumberAscNullLast(aHue, bHue);
      if (byHue) { return byHue; }
      return compareByLabelAsc(a, b);
    };
  case 'label:ascending':
  default:
    return compareByLabelAsc;
  }
};

const normalizeSortOrder = (sortOrder) => {
  return TagSortOrders.includes(sortOrder) ? sortOrder : 'label:ascending';
};

const sortPassageNoteTags = (tags, sortOrder) => {
  const comparator = makeTagComparator(normalizeSortOrder(sortOrder));
  return tags.sort(comparator);
};

export const state = () => ({
  passageNoteTags: [],
  sortOrder: 'label:ascending',
});

export const mutations = {
  [SET_PASSAGE_NOTE_TAGS](state, passageNoteTags) {
    state.passageNoteTags = Array.isArray(passageNoteTags)
      ? sortPassageNoteTags(passageNoteTags, state.sortOrder)
      : [];
  },
  [ADD_PASSAGE_NOTE_TAG](state, passageNoteTag) {
    state.passageNoteTags.push(passageNoteTag);
    sortPassageNoteTags(state.passageNoteTags, state.sortOrder);
  },
  [UPDATE_PASSAGE_NOTE_TAG](state, passageNoteTagUpdate) {
    const existingPassageNoteTag = state.passageNoteTags.find(passageNoteTag => passageNoteTag.id === passageNoteTagUpdate.id);
    Object.assign(existingPassageNoteTag, passageNoteTagUpdate);
    sortPassageNoteTags(state.passageNoteTags, state.sortOrder);
  },
  [REMOVE_PASSAGE_NOTE_TAG](state, passageNoteTagId) {
    state.passageNoteTags = state.passageNoteTags.filter(passageNoteTag => passageNoteTag.id !== passageNoteTagId);
  },
  [SET_PASSAGE_NOTE_TAG_SORT_ORDER](state, sortOrder) {
    state.sortOrder = normalizeSortOrder(sortOrder);
    sortPassageNoteTags(state.passageNoteTags, state.sortOrder);
  },
};

export const getters = {
  tagCreatedAtMs: () => tag => getTagCreatedMsOrNull(tag),
};

export const actions = {
  async loadPassageNoteTags({ commit, rootState }) {
    const sortOrder = rootState?.['user-settings']?.settings?.passageNoteTagSortOrder;
    if (sortOrder) {
      commit(SET_PASSAGE_NOTE_TAG_SORT_ORDER, sortOrder);
    }

    // Check for cached data to give an immediate visual response
    let passageNoteTags = BrowserCache.get(PASSAGE_NOTE_TAGS_CACHE_KEY);
    if (passageNoteTags) {
      commit(SET_PASSAGE_NOTE_TAGS, passageNoteTags);
      BrowserCache.set(PASSAGE_NOTE_TAGS_CACHE_KEY, passageNoteTags, PASSAGE_NOTE_TAGS_CACHE_MINUTES);
    }
    const { data: passageNoteTagsData } = await this.$http.get('/api/passage-note-tags');
    passageNoteTags = passageNoteTagsData;
    commit(SET_PASSAGE_NOTE_TAGS, passageNoteTags);
  },
  setPassageNoteTagSortOrder({ commit, dispatch }, { sortOrder, persist = true } = {}) {
    const normalized = normalizeSortOrder(sortOrder);
    commit(SET_PASSAGE_NOTE_TAG_SORT_ORDER, normalized);
    if (!persist) { return true; }
    return dispatch('user-settings/updateSettings', { passageNoteTagSortOrder: normalized }, { root: true });
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
