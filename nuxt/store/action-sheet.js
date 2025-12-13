import {
  OPEN_ACTION_SHEET,
  CLOSE_ACTION_SHEET,
} from './mutation-types';

const emptyState = {
  open: false,
  title: null,
  actions: [],
};

export const state = () => ({
  ...emptyState,
});

export const mutations = {
  [OPEN_ACTION_SHEET](state, { title, actions }) {
    state.title = title || null;
    state.actions = actions || [];
    state.open = true;
  },
  [CLOSE_ACTION_SHEET](state) {
    Object.assign(state, emptyState);
  },
};

export const actions = {
  openSheet({ commit }, { title, actions }) {
    commit(OPEN_ACTION_SHEET, { title, actions });
  },
  closeSheet({ commit }) {
    commit(CLOSE_ACTION_SHEET);
  },
};
