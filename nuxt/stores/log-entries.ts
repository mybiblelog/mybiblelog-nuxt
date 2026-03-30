import { defineStore } from 'pinia';
import { Bible } from '@mybiblelog/shared';
import { useAchievementsStore } from '~/stores/achievements';

export type LogEntry = {
  id: number | string;
  date: string; // YYYY-MM-DD
  startVerseId: number;
  endVerseId: number;
  [key: string]: unknown;
};

export type CreateLogEntryInput = {
  date: string;
  startVerseId: number;
  endVerseId: number;
};

export type UpdateLogEntryInput = CreateLogEntryInput & {
  id: number | string;
};

const isBookComplete = (bookIndex: number, logEntries: LogEntry[]): boolean => {
  const totalVerses = Bible.getBookVerseCount(bookIndex);
  const versesRead = Bible.countUniqueBookRangeVerses(bookIndex, logEntries);
  return versesRead === totalVerses;
};

const isBibleComplete = (logEntries: LogEntry[]): boolean => {
  const totalBooks = Bible.getBookCount();
  for (let i = 1; i <= totalBooks; i++) {
    if (!isBookComplete(i, logEntries)) {
      return false;
    }
  }
  return true;
};

const getBookIndexFromVerseId = (verseId: number): number => {
  const parsed = Bible.parseVerseId(verseId);
  return parsed.book;
};

export const useLogEntriesStore = defineStore('log-entries', {
  state: () => ({
    logEntries: [] as LogEntry[],
  }),
  getters: {
    currentLogEntries(state): LogEntry[] {
      type VuexUserSettingsState = { settings?: { lookBackDate?: string } };
      type VuexRootState = { 'user-settings'?: VuexUserSettingsState };

      const vuexState = (this.$vuex?.state || {}) as unknown as VuexRootState;
      const lookBackDate = vuexState['user-settings']?.settings?.lookBackDate;
      if (!lookBackDate) {
        return state.logEntries;
      }
      return state.logEntries.filter(logEntry => logEntry.date >= lookBackDate);
    },
  },
  actions: {
    async loadLogEntries(): Promise<LogEntry[]> {
      const { data } = await this.$http.get<LogEntry[]>('/api/log-entries');
      this.logEntries = Array.isArray(data) ? data : [];
      return this.logEntries;
    },

    async createLogEntry(input: CreateLogEntryInput): Promise<LogEntry> {
      const { date, startVerseId, endVerseId } = input;

      const currentLogEntries = this.currentLogEntries;
      const bookIndex = getBookIndexFromVerseId(startVerseId);

      const wasBookComplete = isBookComplete(bookIndex, currentLogEntries);
      const wasBibleComplete = isBibleComplete(currentLogEntries);

      const { data } = await this.$http.post<LogEntry>('/api/log-entries', {
        date,
        startVerseId,
        endVerseId,
      });

      this.logEntries.push(data);

      const updatedLogEntries = this.currentLogEntries;
      const isBookNowComplete = isBookComplete(bookIndex, updatedLogEntries);
      const isBibleNowComplete = isBibleComplete(updatedLogEntries);

      if (!wasBibleComplete && isBibleNowComplete) {
        useAchievementsStore().showBibleCompleteAchievement();
      }
      else if (!wasBookComplete && isBookNowComplete) {
        useAchievementsStore().showBookCompleteAchievement(bookIndex);
      }

      const vuex = this.$vuex;
      if (vuex) {
        vuex.dispatch('reading-suggestions/refreshReadingSuggestions', null, { root: true });
        vuex.dispatch('date-verse-counts/cacheDateVerseCounts', date, { root: true });
      }

      return data;
    },

    async updateLogEntry(input: UpdateLogEntryInput): Promise<LogEntry> {
      const { id, date, startVerseId, endVerseId } = input;

      const currentLogEntries = this.currentLogEntries;
      const bookIndex = getBookIndexFromVerseId(startVerseId);

      const wasBookComplete = isBookComplete(bookIndex, currentLogEntries);
      const wasBibleComplete = isBibleComplete(currentLogEntries);

      const { data } = await this.$http.put<LogEntry>(`/api/log-entries/${id}`, {
        date,
        startVerseId,
        endVerseId,
      });

      const updated = data;
      const existing = this.logEntries.find(le => le.id === updated.id);
      if (existing) {
        Object.assign(existing, updated);
      }
      else {
        this.logEntries.push(updated);
      }

      const updatedLogEntries = this.currentLogEntries;
      const isBookNowComplete = isBookComplete(bookIndex, updatedLogEntries);
      const isBibleNowComplete = isBibleComplete(updatedLogEntries);

      if (!wasBibleComplete && isBibleNowComplete) {
        useAchievementsStore().showBibleCompleteAchievement();
      }
      else if (!wasBookComplete && isBookNowComplete) {
        useAchievementsStore().showBookCompleteAchievement(bookIndex);
      }

      const vuex = this.$vuex;
      if (vuex) {
        vuex.dispatch('reading-suggestions/refreshReadingSuggestions', null, { root: true });
        vuex.dispatch('date-verse-counts/cacheDateVerseCounts', date, { root: true });
      }

      return updated;
    },

    async deleteLogEntry(logEntryId: number | string): Promise<boolean> {
      const logEntry = this.logEntries.find(le => le.id === logEntryId);
      const date = logEntry?.date;

      const { data } = await this.$http.delete<unknown>(`/api/log-entries/${logEntryId}`);
      if (!data) {
        return false;
      }

      this.logEntries = this.logEntries.filter(le => le.id !== logEntryId);

      const vuex = this.$vuex;
      if (vuex) {
        vuex.dispatch('reading-suggestions/refreshReadingSuggestions', null, { root: true });
        if (date) {
          vuex.dispatch('date-verse-counts/cacheDateVerseCounts', date, { root: true });
        }
      }

      return true;
    },
  },
});
