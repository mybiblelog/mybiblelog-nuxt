import { defineStore } from 'pinia';
import { set as vueSet } from 'vue';
import dayjs from 'dayjs';
import { Bible, BrowserCache } from '@mybiblelog/shared';
import { useLogEntriesStore } from '~/stores/log-entries';

export type DateVerseCounts = {
  total: number;
  unique: number;
};

export type DateVerseCountsMap = Record<string, DateVerseCounts>;

const DATE_VERSE_COUNTS_CACHE_KEY = 'dateVerseCounts';
const DATE_VERSE_COUNTS_CACHE_MINUTES = 60 * 24;

const blockingIterations = 10;

const emptyCounts: DateVerseCounts = { total: 0, unique: 0 };

type VuexUserSettingsState = { settings?: { lookBackDate?: string } };
type VuexRootState = { 'user-settings'?: VuexUserSettingsState };

const yieldToEventLoop = async (): Promise<void> => {
  await new Promise<void>(resolve => setTimeout(resolve, 0));
};

const parseCachedDateVerseCounts = (value: unknown): DateVerseCountsMap | null => {
  if (!value) {
    return null;
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (parsed && typeof parsed === 'object') {
        return parsed as DateVerseCountsMap;
      }
      return null;
    }
    catch {
      return null;
    }
  }

  if (typeof value === 'object') {
    return value as DateVerseCountsMap;
  }

  return null;
};

export const useDateVerseCountsStore = defineStore('date-verse-counts', {
  state: () => ({
    jobs: 0,
    dateVerseCounts: {} as DateVerseCountsMap,
  }),
  getters: {
    busy: state => state.jobs > 0,
    getDateVerseCounts: state => (date: string): DateVerseCounts => {
      return state.dateVerseCounts[date] || emptyCounts;
    },
    getAllDateVerseCounts: state => state.dateVerseCounts,
  },
  actions: {
    async cacheDateVerseCounts(startDate?: string): Promise<void> {
      this.jobs += 1;
      try {
        // Check for cached data to give an immediate visual response
        try {
          const cachedRaw = BrowserCache.get(DATE_VERSE_COUNTS_CACHE_KEY) as unknown;
          const cached = parseCachedDateVerseCounts(cachedRaw);
          if (cached && Object.keys(cached).length) {
            this.dateVerseCounts = cached;
          }
        }
        catch {
          // BrowserCache can fail in non-browser contexts; ignore.
        }

        const logEntries = useLogEntriesStore().currentLogEntries;

        const cumulativeLogEntries = [];
        let totalVersesToDate = 0;

        const explicitStartDate = startDate;
        let effectiveStartDate = explicitStartDate;

        if (explicitStartDate) {
          // If there is a startDate, count up all log entries BEFORE that date
          cumulativeLogEntries.push(...logEntries.filter(logEntry => logEntry.date < explicitStartDate));
          totalVersesToDate = Bible.countUniqueRangeVerses(cumulativeLogEntries);
        }
        else {
          // If no start date was provided, start at lookBackDate (still in Vuex today)
          const vuexState = (this.$vuex?.state || {}) as unknown as VuexRootState;
          effectiveStartDate = vuexState['user-settings']?.settings?.lookBackDate;
        }

        if (!effectiveStartDate) {
          return;
        }

        let currentDate = dayjs(effectiveStartDate).format('YYYY-MM-DD');
        const today = dayjs().format('YYYY-MM-DD');

        let iterations = 0;
        while (currentDate <= today) {
          const dateLogEntries = logEntries.filter(logEntry => logEntry.date === currentDate);
          const dateTotalVerses = Bible.countUniqueRangeVerses(dateLogEntries);

          cumulativeLogEntries.push(...dateLogEntries);
          const totalVersesThroughDate = Bible.countUniqueRangeVerses(cumulativeLogEntries);
          const dateUniqueVerses = totalVersesThroughDate - totalVersesToDate;
          totalVersesToDate = totalVersesThroughDate;

          // Vue 2 needs Vue.set for new object keys to be reactive
          vueSet(this.dateVerseCounts, currentDate, { total: dateTotalVerses, unique: dateUniqueVerses });

          currentDate = dayjs(currentDate).add(1, 'day').format('YYYY-MM-DD');

          iterations++;
          if (iterations === blockingIterations) {
            await yieldToEventLoop();
            iterations = 0;
          }
        }

        // Cache the data for future use for 1 day
        try {
          BrowserCache.set(
            DATE_VERSE_COUNTS_CACHE_KEY,
            JSON.stringify(this.dateVerseCounts),
            DATE_VERSE_COUNTS_CACHE_MINUTES,
          );
        }
        catch {
          // ignore cache write failures
        }
      }
      finally {
        this.jobs -= 1;
      }
    },
  },
});
