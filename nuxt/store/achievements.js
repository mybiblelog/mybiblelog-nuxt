import {
  SHOW_ACHIEVEMENT,
  CLOSE_ACHIEVEMENT,
} from './mutation-types';

export const ACHIEVEMENT = {
  BOOK_COMPLETE: 'BOOK_COMPLETE',
  BIBLE_COMPLETE: 'BIBLE_COMPLETE',
};

const emptyState = {
  open: false,
  achievementType: null,
  achievementData: null,
};

export const state = () => ({
  ...emptyState,
});

export const mutations = {
  [SHOW_ACHIEVEMENT](state, { achievementType, achievementData }) {
    state.achievementType = achievementType;
    state.achievementData = achievementData;
    state.open = true;
  },
  [CLOSE_ACHIEVEMENT](state) {
    Object.assign(state, emptyState);
  },
};

export const actions = {
  showBookCompleteAchievement({ commit }, bookIndex) {
    commit(SHOW_ACHIEVEMENT, {
      achievementType: ACHIEVEMENT.BOOK_COMPLETE,
      achievementData: bookIndex,
    });
  },
  showBibleCompleteAchievement({ commit }) {
    commit(SHOW_ACHIEVEMENT, {
      achievementType: ACHIEVEMENT.BIBLE_COMPLETE,
      achievementData: null,
    });
  },
  closeAchievement({ commit }) {
    commit(CLOSE_ACHIEVEMENT);
  },
};
