<template>
  <div class="content-column">
    <busy-bar :busy="loadingReadingSuggestions && !readingSuggestionsWithNewVerseCounts.length" />
    <header class="page-header">
      <h1 class="title">
        {{ $t('today') }}
        <info-link :to="localePath('/about/page-features--today')" />
      </h1>
      <button class="button is-info" @click="openAddEntryForm">
        {{ $t('add_entry') }}
      </button>
    </header>
    <br>
    <double-progress-bar :primary-percentage="dailyGoalPercentCompleteNew" :secondary-percentage="dailyGoalPercentComplete" />
    <div class="level is-mobile">
      <div class="level-left">
        <div v-if="userSettings.dailyVerseCountGoal" class="level-item">
          <span>{{ $t('new_verses_read', [newVersesReadToday, userSettings.dailyVerseCountGoal]) }}</span>
        </div>
        <div v-else class="level-item">
          <span>{{ $t('loading') }}</span>
        </div>
      </div>
      <div class="level-right">
        <div class="level-item">
          <span>{{ $n(dailyGoalPercentCompleteNew / 100, 'percent') }}</span>
        </div>
      </div>
    </div>
    <div class="entry-container" role="list" data-testid="log-entries">
      <client-only>
        <log-entry
          v-for="entry of logEntriesForToday"
          :key="entry.id"
          role="listitem"
          :passage="entry"
          :actions="actionsForTodayLogEntry(entry)"
        />
        <log-entry
          v-if="!logEntriesForToday.length"
          key="no-entries"
          role="listitem"
          :message="$t('no_entries')"
        />
      </client-only>
    </div>
    <div class="has-text-centered" style="margin-top: 1rem;">
      <nuxt-link class="button is-light" :to="localePath('/log')">
        {{ $t('view_all_reading') }}
      </nuxt-link>
    </div>
    <br>
    <h3 class="title is-5">
      {{ $t('reading_suggestions') }}
    </h3>
    <div class="entry-container" role="list" data-testid="reading-suggestions">
      <client-only>
        <log-entry
          v-for="(passage, index) of readingSuggestionsWithNewVerseCounts"
          :key="index + '-' + passage.startVerseId + '-' + passage.endVerseId"
          role="listitem"
          :message="passage.suggestionContext"
          :passage="passage"
          :actions="actionsForReadingSuggestionPassage(passage)"
        />
        <log-entry
          v-if="loadingReadingSuggestions && !readingSuggestionsWithNewVerseCounts.length"
          key="loading"
          role="listitem"
          :message="$t('loading')"
        />
        <log-entry
          v-if="!loadingReadingSuggestions && !readingSuggestionsWithNewVerseCounts.length"
          key="no-suggestions"
          role="listitem"
          :message="$t('no_suggestions')"
        />
      </client-only>
    </div>
    <br>
    <div class="level is-mobile">
      <div class="level-left">
        <div class="level-item">
          <h3 class="title is-5">
            {{ $t('recent_notes') }}
          </h3>
        </div>
      </div>
      <div class="level-right">
        <div class="level-item">
          <button class="button is-info" @click="openPassageNoteEditor({ empty: true })">
            {{ $t('new_note') }}
          </button>
        </div>
      </div>
    </div>
    <div class="recent-notes-container" role="list" data-testid="recent-notes">
      <client-only>
        <div
          v-if="loadingRecentNotes && !recentNotes.length"
          class="passage-note"
        >
          <div class="passage-note--content has-text-centered">
            {{ $t('loading') }}
          </div>
        </div>
        <template v-else-if="!recentNotes.length">
          <log-entry
            :message="$t('no_recent_notes')"
            role="listitem"
          />
        </template>
        <template v-else>
          <passage-note
            v-for="note in recentNotes"
            :key="note.id"
            :note="note"
            :actions="actionsForRecentNote(note)"
            :get-reading-url="getReadingUrl"
            role="listitem"
          />
          <div class="has-text-centered" style="margin-top: 1rem;">
            <nuxt-link class="button is-light" :to="localePath('/notes')">
              {{ $t('view_all_notes') }}
            </nuxt-link>
          </div>
        </template>
      </client-only>
    </div>
  </div>
</template>

<script>
import * as dayjs from 'dayjs';
import { Bible } from '@mybiblelog/shared';
import { encodePassageNotesQueryToRoute } from '@/helpers/passage-notes-route-query';
import BusyBar from '@/components/BusyBar';
import DoubleProgressBar from '@/components/DoubleProgressBar';
import LogEntry from '@/components/LogEntry';
import InfoLink from '@/components/InfoLink';
import PassageNote from '@/components/PassageNote';
import { useDialogStore } from '~/stores/dialog';
import { useToastStore } from '~/stores/toast';
import { useLogEntryEditorStore } from '~/stores/log-entry-editor';
import { useLogEntriesStore } from '~/stores/log-entries';
import { usePassageNotesStore } from '~/stores/passage-notes';
import { usePassageNoteTagsStore } from '~/stores/passage-note-tags';
import { usePassageNoteEditorStore } from '~/stores/passage-note-editor';
import { useReadingSuggestionsStore } from '~/stores/reading-suggestions';
import { useUserSettingsStore } from '~/stores/user-settings';
import { useAppInitStore } from '~/stores/app-init';

export default {
  name: 'TodayPage',
  components: {
    BusyBar,
    DoubleProgressBar,
    LogEntry,
    InfoLink,
    PassageNote,
  },
  middleware: ['auth'],
  data() {
    return {
      loadingReadingSuggestions: true,
    };
  },
  head() {
    return {
      title: this.$t('today'),
    };
  },
  computed: {
    logEntriesStore() {
      return useLogEntriesStore();
    },
    passageNotesStore() {
      return usePassageNotesStore();
    },
    passageNoteTagsStore() {
      return usePassageNoteTagsStore();
    },
    readingSuggestionsStore() {
      return useReadingSuggestionsStore();
    },
    logEntries() {
      return this.logEntriesStore.currentLogEntries;
    },
    passageNoteTags() {
      return this.passageNoteTagsStore.passageNoteTags;
    },
    userSettings() {
      return useUserSettingsStore().settings;
    },
    passageNotesLoading() {
      return this.passageNotesStore.loading;
    },
    passageNotes() {
      return this.passageNotesStore.passageNotes;
    },
    readingSuggestions() {
      return this.readingSuggestionsStore.passages;
    },
    loadingRecentNotes() {
      return this.passageNotesLoading;
    },
    recentNotes() {
      // Return the first 3 notes from the store (they're already sorted by createdAt descending)
      return this.passageNotes.slice(0, 3);
    },
    logEntriesForToday() {
      const today = dayjs().format('YYYY-MM-DD');
      return this.logEntries.filter(logEntry => logEntry.date === today).map(this.addNewVerseCountToLogEntry);
    },
    versesReadToday() {
      return Bible.countUniqueRangeVerses(this.logEntriesForToday);
    },
    newVersesReadToday() {
      const today = dayjs().format('YYYY-MM-DD');
      const logEntriesThroughYesterday = this.logEntries.filter(logEntry => logEntry.date < today);
      const uniqueVersesThroughYesterday = Bible.countUniqueRangeVerses(logEntriesThroughYesterday);

      const logEntriesThroughToday = this.logEntries.filter(logEntry => logEntry.date <= today);
      const uniqueVersesThroughToday = Bible.countUniqueRangeVerses(logEntriesThroughToday);

      return uniqueVersesThroughToday - uniqueVersesThroughYesterday;
    },
    dailyGoalPercentComplete() {
      // Before user settings are loaded, display 0% complete.
      // This prevents a bug where the progress bar will be considered
      // 100% complete for the fallback dailyVerseCountGoal of zero.
      if (!this.userSettings.dailyVerseCountGoal) {
        return 0;
      }
      const percentage = this.versesReadToday / this.userSettings.dailyVerseCountGoal * 100;
      return Math.min(100, percentage.toFixed(0));
    },
    dailyGoalPercentCompleteNew() {
      // Before user settings are loaded, display 0% complete.
      // This prevents a bug where the progress bar will be considered
      // 100% complete for the fallback dailyVerseCountGoal of zero.
      if (!this.userSettings.dailyVerseCountGoal) {
        return 0;
      }
      const percentage = this.newVersesReadToday / this.userSettings.dailyVerseCountGoal * 100;
      return Math.min(100, percentage.toFixed(0));
    },
    readingSuggestionsWithNewVerseCounts() {
      return this.readingSuggestions.map(this.addNewVerseCountToReadingSuggestion);
    },
  },
  async mounted() {
    await useAppInitStore().loadUserData();
    await this.readingSuggestionsStore.refreshReadingSuggestions();
    this.loadingReadingSuggestions = false;
    // Load the 3 most recent notes using the passage-notes store
    await this.passageNotesStore.resetQuery({
      limit: 3,
      offset: 0,
      sortOn: 'createdAt',
      sortDirection: 'descending',
    });
    await this.passageNoteTagsStore.loadPassageNoteTags();
  },
  methods: {
    actionsForTodayLogEntry(entry) {
      return [
        { label: this.$t('open_bible'), callback: () => this.openPassageInBible(entry, false) },
        { label: this.$t('take_note'), callback: () => this.takeNoteOnPassage(entry) },
        { label: this.$t('view_notes'), callback: () => this.viewNotesForPassage(entry) },
        { label: this.$t('edit'), callback: () => this.openEditEntryForm(entry.id) },
        { label: this.$t('delete'), callback: () => this.deleteEntry(entry.id) },
      ];
    },
    actionsForReadingSuggestionPassage(passage) {
      return [
        { label: this.$t('open_bible'), callback: () => this.openPassageInBible(passage, true) },
        { label: this.$t('log_reading'), callback: () => this.trackPassage(passage) },
      ];
    },
    getReadingUrl(bookIndex, chapterIndex) {
      return useUserSettingsStore().getReadingUrl(bookIndex, chapterIndex);
    },
    addNewVerseCountToLogEntry(logEntry) {
      const today = dayjs().format('YYYY-MM-DD');
      const logEntriesThroughYesterday = this.logEntries.filter(logEntry => logEntry.date < today);
      const uniqueVersesThroughYesterday = Bible.countUniqueRangeVerses(logEntriesThroughYesterday);

      logEntriesThroughYesterday.push(logEntry);
      const newVerseCount = Bible.countUniqueRangeVerses(logEntriesThroughYesterday) - uniqueVersesThroughYesterday;

      return {
        ...logEntry,
        newVerseCount,
      };
    },
    addNewVerseCountToReadingSuggestion(passage) {
      const today = dayjs().format('YYYY-MM-DD');
      const logEntriesThroughToday = this.logEntries.filter(logEntry => logEntry.date <= today);
      const uniqueVersesThroughToday = Bible.countUniqueRangeVerses(logEntriesThroughToday);

      logEntriesThroughToday.push(passage);
      const newVerseCount = Bible.countUniqueRangeVerses(logEntriesThroughToday) - uniqueVersesThroughToday;

      return {
        ...passage,
        newVerseCount,
      };
    },
    async deleteEntry(id) {
      const dialogStore = useDialogStore();
      const toastStore = useToastStore();
      const confirmed = await dialogStore.confirm({ message: this.$t('are_you_sure_you_want_to_delete_this_entry') });
      if (!confirmed) { return; }
      const success = await this.logEntriesStore.deleteLogEntry(id);
      if (!success) {
        toastStore.add({
          type: 'error',
          text: this.$t('the_log_entry_could_not_be_deleted'),
        });
      }
    },
    openAddEntryForm() {
      const logEntryEditorStore = useLogEntryEditorStore();
      logEntryEditorStore.openEditor({ empty: true });
    },
    openEditEntryForm(id) {
      const logEntryEditorStore = useLogEntryEditorStore();
      const targetEntry = this.logEntries.find(e => e.id === id);
      const { date, startVerseId, endVerseId } = targetEntry;
      logEntryEditorStore.openEditor({
        id,
        date,
        startVerseId,
        endVerseId,
      });
    },
    openPassageInBible(passage, track) {
      const { startVerseId } = passage;
      const start = Bible.parseVerseId(startVerseId);
      const url = this.getReadingUrl(start.book, start.chapter);
      window.open(url, '_blank');

      // When a chapter is opened in the Bible,
      // go ahead and open the log entry modal
      // so it's easy to log reading upon return
      if (track) {
        setTimeout(() => this.trackPassage(passage), 500);
      }
    },
    trackPassage(passage) {
      const logEntryEditorStore = useLogEntryEditorStore();
      const { startVerseId, endVerseId } = passage;
      logEntryEditorStore.openEditor({
        id: null,
        date: dayjs().format('YYYY-MM-DD'),
        startVerseId,
        endVerseId,
      });
    },
    takeNoteOnPassage(passage) {
      const { startVerseId, endVerseId } = passage;
      usePassageNoteEditorStore().openEditor({
        passages: [{ startVerseId, endVerseId }],
        content: '',
      });
    },
    viewNotesForPassage(passage) {
      const { startVerseId, endVerseId } = passage;
      const query = encodePassageNotesQueryToRoute({
        filterPassageStartVerseId: startVerseId,
        filterPassageEndVerseId: endVerseId,
        offset: 0,
      });
      this.$router.push({ path: this.localePath('/notes'), query });
    },
    actionsForRecentNote(note) {
      return [
        { label: this.$t('note.edit'), callback: () => this.openPassageNoteEditor(note) },
        { label: this.$t('note.delete'), callback: () => this.deletePassageNote(note.id) },
      ];
    },
    openPassageNoteEditor(passageNote) {
      // If passageNote has empty: true, open for creating new note
      // Otherwise, open for editing existing note
      const noteToEdit = passageNote.empty ? null : passageNote;
      usePassageNoteEditorStore().openEditor(noteToEdit);
    },
    async deletePassageNote(id) {
      const dialogStore = useDialogStore();
      const toastStore = useToastStore();
      const confirmed = await dialogStore.confirm({ message: this.$t('messaging.are_you_sure_delete_note') });
      if (!confirmed) { return; }

      const success = await this.passageNotesStore.deletePassageNote(id);
      if (!success) {
        toastStore.add({
          type: 'error',
          text: this.$t('messaging.note_could_not_be_deleted'),
        });
      }
      // Reload the recent notes after deletion
      await this.passageNotesStore.updateQuery({
        limit: 3,
        offset: 0,
        sortOn: 'createdAt',
        sortDirection: 'descending',
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.recent-notes-container {
  margin-top: 1rem;
}
</style>

<i18n locale="en" lang="json" src="@/locales/sfc/en/pages/today.json" />
<i18n locale="de" lang="json" src="@/locales/sfc/de/pages/today.json" />
<i18n locale="es" lang="json" src="@/locales/sfc/es/pages/today.json" />
<i18n locale="fr" lang="json" src="@/locales/sfc/fr/pages/today.json" />
<i18n locale="pt" lang="json" src="@/locales/sfc/pt/pages/today.json" />
<i18n locale="uk" lang="json" src="@/locales/sfc/uk/pages/today.json" />
