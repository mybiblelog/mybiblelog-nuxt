import {
  OPEN_ALERT_DIALOGUE,
  CLOSE_ALERT_DIALOGUE,
  OPEN_CONFIRM_DIALOGUE,
  ACCEPT_CONFIRM_DIALOGUE,
  CANCEL_CONFIRM_DIALOGUE,
} from './mutation-types';

const emptyState = {
  open: false,
  type: '', // 'alert' or 'confirm'
  resolvePromise: undefined,

  // any dialog
  title: '',
  message: '',

  // alert dialog only
  buttonText: '',
  buttonType: 'is-primary',

  // confirm dialog only
  confirmButtonText: '',
  confirmButtonType: 'is-primary',
  cancelButtonText: '',
};

export const state = () => ({
  ...emptyState,
});

export const mutations = {
  [OPEN_ALERT_DIALOGUE](state, options) {
    const alertKeys = [
      'title',
      'message',
      'buttonText',
      'buttonType',
    ];
    for (const key of alertKeys) {
      if (options[key]) {
        state[key] = options[key];
      }
    }
    state.resolvePromise = options.resolvePromise;
    state.type = 'alert';
    state.open = true;
  },
  [CLOSE_ALERT_DIALOGUE](state, options) {
    Object.assign(state, emptyState);
  },
  [OPEN_CONFIRM_DIALOGUE](state, options) {
    const confirmKeys = [
      'title',
      'message',
      'confirmButtonText',
      'confirmButtonType',
      'cancelButtonText',
    ];
    for (const key of confirmKeys) {
      if (options[key]) {
        state[key] = options[key];
      }
    }
    state.resolvePromise = options.resolvePromise;
    state.type = 'confirm';
    state.open = true;
  },
  [ACCEPT_CONFIRM_DIALOGUE](state, options) {
    Object.assign(state, emptyState);
  },
  [CANCEL_CONFIRM_DIALOGUE](state, options) {
    Object.assign(state, emptyState);
  },
};

export const actions = {
  async alert({ commit }, options) {
    let resolvePromise;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    options.resolvePromise = resolvePromise;
    commit(OPEN_ALERT_DIALOGUE, options);
    return await promise;
  },
  async confirm({ commit }, options) {
    let resolvePromise;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    options.resolvePromise = resolvePromise;
    commit(OPEN_CONFIRM_DIALOGUE, options);
    return await promise;
  },
  closeAlert({ commit, state }) {
    state.resolvePromise();
    commit(CLOSE_ALERT_DIALOGUE);
  },
  acceptConfirm({ commit, state }) {
    state.resolvePromise(true);
    commit(ACCEPT_CONFIRM_DIALOGUE);
  },
  cancelConfirm({ commit, state }) {
    state.resolvePromise(false);
    commit(CANCEL_CONFIRM_DIALOGUE);
  },
};
