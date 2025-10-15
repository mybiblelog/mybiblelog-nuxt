import { set as vueSet } from 'vue';
import * as dayjs from 'dayjs';
import {
  START_DATE_VERSE_COUNT_JOB,
  FINISH_DATE_VERSE_COUNT_JOB,
  SET_DATE_VERSE_COUNTS,
  SET_ALL_DATE_VERSE_COUNTS,
} from './mutation-types';
import Bible from '@/shared/bible';
import BrowserCache from '~/shared/browser-cache';

const DATE_VERSE_COUNTS_CACHE_KEY = 'dateVerseCounts';
const DATE_VERSE_COUNTS_CACHE_MINUTES = 60 * 24;

const blockingIterations = 10;

export const state = () => ({
  jobs: 0,
  dateVerseCounts: {},
});

export const getters = {
  busy(state) {
    return state.jobs > 0;
  },
  getDateVerseCounts: (state, getters, rootState) => (date) => {
    return state.dateVerseCounts[date] || { total: 0, unique: 0 };
  },
  getAllDateVerseCounts(state) {
    return state.dateVerseCounts;
  },
};

export const mutations = {
  [START_DATE_VERSE_COUNT_JOB](state) {
    state.jobs = state.jobs + 1;
  },
  [FINISH_DATE_VERSE_COUNT_JOB](state) {
    state.jobs = state.jobs - 1;
  },
  [SET_DATE_VERSE_COUNTS](state, { date, total, unique }) {
    // use this approach so the index-based property update
    // is recognized by Vue, causing a component re-render
    vueSet(state.dateVerseCounts, date, { total, unique });
  },
  [SET_ALL_DATE_VERSE_COUNTS](state, calendarVerseCounts) {
    state.dateVerseCounts = calendarVerseCounts;
  },
};

export const actions = {
  async cacheDateVerseCounts({ commit, getters, rootGetters, rootState }, startDate) {
    commit(START_DATE_VERSE_COUNT_JOB);

    // Check for cached data to give an immediate visual response
    const cachedDateVerseCounts = BrowserCache.get(DATE_VERSE_COUNTS_CACHE_KEY);
    if (cachedDateVerseCounts) {
      commit(SET_ALL_DATE_VERSE_COUNTS, cachedDateVerseCounts);
    }

    const logEntries = rootGetters['log-entries/currentLogEntries'];

    const cumulativeLogEntries = [];
    let totalVersesToDate = 0;
    if (startDate) {
      // If there is a startDate, count up all log entries BEFORE that date
      cumulativeLogEntries.push(...logEntries.filter(logEntry => logEntry.date < startDate));
      totalVersesToDate = Bible.countUniqueRangeVerses(cumulativeLogEntries);
    }
    else {
      // If no start date was provided, start at lookBackDate
      startDate = rootState['user-settings'].settings.lookBackDate;
    }

    let currentDate = dayjs(startDate).format('YYYY-MM-DD');
    const today = dayjs().format('YYYY-MM-DD');
    let iterations = 0;
    while (currentDate <= today) {
      const dateLogEntries = logEntries.filter(logEntry => logEntry.date === currentDate);
      const dateTotalVerses = Bible.countUniqueRangeVerses(dateLogEntries);

      cumulativeLogEntries.push(...dateLogEntries);
      const totalVersesThroughDate = Bible.countUniqueRangeVerses(cumulativeLogEntries);
      const dateUniqueVerses = totalVersesThroughDate - totalVersesToDate;
      totalVersesToDate = totalVersesThroughDate;

      commit(SET_DATE_VERSE_COUNTS, {
        date: currentDate,
        total: dateTotalVerses,
        unique: dateUniqueVerses,
      });

      currentDate = dayjs(currentDate).add(1, 'day').format('YYYY-MM-DD');

      // give up the event loop to let other things happen
      iterations++;
      if (iterations === blockingIterations) {
        await new Promise(resolve => setImmediate(resolve));
        iterations = 0;
      }
    }

    // Cache the data for future use for 1 day
    const allDateVerseCounts = getters.getAllDateVerseCounts;
    BrowserCache.set(
      DATE_VERSE_COUNTS_CACHE_KEY,
      allDateVerseCounts,
      DATE_VERSE_COUNTS_CACHE_MINUTES,
    );

    commit(FINISH_DATE_VERSE_COUNT_JOB);
  },
};
