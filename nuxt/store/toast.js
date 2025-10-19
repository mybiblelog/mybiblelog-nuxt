import {
  ADD_TOAST_MESSAGE,
  CLOSE_TOAST_MESSAGE,
} from './mutation-types';

const timeout = 5000;

export const state = () => ({
  messages: [],
});

export const mutations = {
  [ADD_TOAST_MESSAGE](state, message) {
    state.messages.push(message);
  },
  [CLOSE_TOAST_MESSAGE](state, id) {
    state.messages = state.messages.filter(message => message.id !== id);
  },
};

export const actions = {
  add({ commit }, message) {
    const id = Date.now();
    commit(ADD_TOAST_MESSAGE, { id, ...message });
    setTimeout(() => commit(CLOSE_TOAST_MESSAGE, id), timeout);
  },
  close({ commit }, id) {
    commit(CLOSE_TOAST_MESSAGE, id);
  },
};
