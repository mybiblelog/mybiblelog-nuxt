import { set as vueSet } from 'vue';
import {
  SET_PASSAGE_NOTES_QUERY,
  SET_PASSAGE_NOTES_STAGED_QUERY,
  SET_PASSAGE_NOTES_LOADING,
  SET_PASSAGE_NOTES,
  SET_PASSAGE_NOTE_PAGINATION,
} from './mutation-types';

const initialQuery = {
  limit: 10,
  offset: 0,
  sortOn: 'createdAt',
  sortDirection: 'descending',
  filterTags: [],
  filterTagMatching: 'any', // 'any' or 'all'
  searchText: '',
  filterPassageStartVerseId: 0, // VerseId number
  filterPassageEndVerseId: 0, // VerseId number
  filterPassageMatching: 'inclusive', // 'inclusive' | 'exclusive'
};

export const state = () => ({
  // if a request to load a page of passage notes is in transit
  loading: true,
  // the currently opened passage note for create/edit/view
  activePassageNote: null,
  // the parameters used to load the current page of notes
  query: JSON.parse(JSON.stringify(initialQuery)),
  // a query to be applied when the query would otherwise be reset
  // allows other pages to open the notes page with a specific query in place
  stagedQuery: null,
  // the current page of passage notes - listing data only, not full content
  // loaded from server w/ pagination, sort, search query, etc. in request
  passageNotes: [],

  // set from API response; to be consumed by pagination component
  pagination: {
    limit: 10,
    page: 1,
    size: 0,
    totalPages: 1,
  },
});

export const mutations = {
  [SET_PASSAGE_NOTES_QUERY](state, queryUpdate) {
    [
      'limit',
      'offset',
      'sortOn',
      'sortDirection',
      'filterTags',
      'filterTagMatching',
      'filterPassageStartVerseId',
      'filterPassageEndVerseId',
      'filterPassageMatching',
      'searchText',
    ].forEach((param) => {
      if (queryUpdate[param] !== undefined) {
        vueSet(state.query, param, queryUpdate[param]);
      }
    });
    // If properties were updated but offset was not one of them,
    // reset offset to zero so the updated results display from the beginning
    if (Object.keys(queryUpdate).length && queryUpdate.offset === undefined) {
      vueSet(state.query, 'offset', queryUpdate.offset);
    }
  },
  [SET_PASSAGE_NOTES_STAGED_QUERY](state, queryUpdate) {
    state.stagedQuery = queryUpdate;
  },
  [SET_PASSAGE_NOTES_LOADING](state, loading) {
    state.loading = loading;
  },
  [SET_PASSAGE_NOTES](state, passageNotes) {
    state.passageNotes = passageNotes;
  },
  [SET_PASSAGE_NOTE_PAGINATION](state, { limit, page, size, totalPages }) {
    state.pagination = { limit, page, size, totalPages };
  },
};

export const actions = {
  async resetQuery({ state, commit, dispatch }) {
    commit(SET_PASSAGE_NOTES_QUERY, JSON.parse(JSON.stringify(initialQuery)));
    if (state.stagedQuery) {
      commit(SET_PASSAGE_NOTES_QUERY, state.stagedQuery);
      commit(SET_PASSAGE_NOTES_STAGED_QUERY, null);
    }
    await dispatch('loadPassageNotesPage');
  },
  async updateQuery({ commit, dispatch }, queryUpdate) {
    commit(SET_PASSAGE_NOTES_QUERY, queryUpdate);
    await dispatch('loadPassageNotesPage');
  },
  stageQuery({ commit }, queryUpdate) {
    commit(SET_PASSAGE_NOTES_STAGED_QUERY, queryUpdate);
  },
  async loadPassageNotesPage({ commit, state }) {
    commit(SET_PASSAGE_NOTES_LOADING, true);
    // Build the request URL
    const url = new URL(this.$config.siteUrl); // from nuxt.config.js
    url.pathname = '/api/passage-notes';
    if (state.query.filterTags.length) {
      for (const filterTag of state.query.filterTags) {
        url.searchParams.append('filterTags', filterTag);
      }
    }
    if (state.query.searchText) {
      url.searchParams.set('searchText', state.query.searchText);
    }
    if (state.query.filterTagMatching) {
      url.searchParams.set('filterTagMatching', state.query.filterTagMatching);
    }
    if (state.query.filterPassageStartVerseId && state.query.filterPassageEndVerseId) {
      url.searchParams.set('filterPassageStartVerseId', state.query.filterPassageStartVerseId);
      url.searchParams.set('filterPassageEndVerseId', state.query.filterPassageEndVerseId);
      if (state.query.filterPassageMatching) {
        url.searchParams.set('filterPassageMatching', state.query.filterPassageMatching);
      }
    }
    if (state.query.sortOn) {
      url.searchParams.set('sortOn', state.query.sortOn);
    }
    if (state.query.sortDirection) {
      url.searchParams.set('sortDirection', state.query.sortDirection);
    }
    if (state.query.limit) {
      url.searchParams.set('limit', state.query.limit);
    }
    if (state.query.offset) {
      url.searchParams.set('offset', state.query.offset);
    }

    const response = await this.$axios.get(url);

    const {
      offset,
      limit,
      size,
      results,
    } = response.data;
    commit(SET_PASSAGE_NOTES, results);
    commit(SET_PASSAGE_NOTE_PAGINATION, {
      limit,
      page: Math.floor(offset / limit) + 1,
      size,
      totalPages: Math.ceil(size / limit),
    });
    commit(SET_PASSAGE_NOTES_LOADING, false);
  },
  async createPassageNote({ commit, dispatch }, newPassageNote) {
    const response = await this.$axios.post('/api/passage-notes', newPassageNote);
    const { data } = response;
    if (!data) { return null; }
    return data;
  },
  async updatePassageNote({ commit, dispatch }, passageNoteUpdate) {
    const { id } = passageNoteUpdate;
    const response = await this.$axios.put(`/api/passage-notes/${id}`, passageNoteUpdate);
    const { data } = response;
    if (!data) { return null; }
    return data;
  },
  async deletePassageNote({ commit, dispatch }, passageNoteId) {
    const response = await this.$axios.delete(`/api/passage-notes/${passageNoteId}`);
    if (response.data) {
      await dispatch('loadPassageNotesPage');
      return true;
    }
    return false;
  },
  async fetchPassageNotes({ commit, state, rootState }, { $config }) {
    commit(SET_PASSAGE_NOTES_LOADING, true);
    // Build the request URL
    const url = new URL($config.siteUrl); // from nuxt.config.js
    url.pathname = '/api/passage-notes';
    if (state.query.filterTags.length) {
      for (const filterTag of state.query.filterTags) {
        url.searchParams.append('filterTags', filterTag);
      }
    }
    if (state.query.searchText) {
      url.searchParams.set('searchText', state.query.searchText);
    }
    if (state.query.filterTagMatching) {
      url.searchParams.set('filterTagMatching', state.query.filterTagMatching);
    }
    if (state.query.filterPassageStartVerseId && state.query.filterPassageEndVerseId) {
      url.searchParams.set('filterPassageStartVerseId', state.query.filterPassageStartVerseId);
      url.searchParams.set('filterPassageEndVerseId', state.query.filterPassageEndVerseId);
      if (state.query.filterPassageMatching) {
        url.searchParams.set('filterPassageMatching', state.query.filterPassageMatching);
      }
    }
    if (state.query.sortOn) {
      url.searchParams.set('sortOn', state.query.sortOn);
    }
    if (state.query.sortDirection) {
      url.searchParams.set('sortDirection', state.query.sortDirection);
    }
    if (state.query.limit) {
      url.searchParams.set('limit', state.query.limit);
    }
    if (state.query.offset) {
      url.searchParams.set('offset', state.query.offset);
    }

    const response = await this.$axios.get(url);

    const {
      offset,
      limit,
      size,
      results,
    } = response.data;
    commit(SET_PASSAGE_NOTES, results);
    commit(SET_PASSAGE_NOTE_PAGINATION, {
      limit,
      page: Math.floor(offset / limit) + 1,
      size,
      totalPages: Math.ceil(size / limit),
    });
    commit(SET_PASSAGE_NOTES_LOADING, false);
  },
};
