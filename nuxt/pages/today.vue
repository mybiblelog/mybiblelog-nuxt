<template>
  <section class="section">
    <div class="container">
      <div class="columns is-centered">
        <div class="column is-two-thirds-tablet is-half-desktop">
          <busy-bar :busy="loadingReadingSuggestions && !readingSuggestionsWithNewVerseCounts.length" />
          <header class="page-header">
            <h1 class="title">
              {{ $t('today') }}
              <info-link :to="localePath('/about/page-features--today')" />
            </h1>
            <button class="button is-info" :disabled="editorOpen" @click="openAddEntryForm">
              {{ $t('add_entry') }}
            </button>
          </header>
          <br>
          <log-entry-editor-modal v-if="editorOpen" ref="logEntryEditorModal" :populate-with="editorLogEntry" @closed="logEntryEditorClosed" />
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
            <log-entry v-for="entry of logEntriesForToday" :key="entry.id" role="listitem" :passage="entry" :actions="actionsForTodayLogEntry(entry)" />
            <log-entry v-if="!logEntriesForToday.length" role="listitem" :message="$t('no_entries')" />
          </div>
          <br>
          <h3 class="title is-5">
            {{ $t('suggestions') }}
          </h3>
          <div class="entry-container" role="list" data-testid="reading-suggestions">
            <log-entry
              v-for="(passage, index) of readingSuggestionsWithNewVerseCounts"
              :key="index"
              role="listitem"
              :message="passage.suggestionContext"
              :passage="passage"
              :actions="actionsForReadingSuggestionPassage(passage)"
            />
            <log-entry v-if="loadingReadingSuggestions && !readingSuggestionsWithNewVerseCounts.length" role="listitem" :message="$t('loading')" />
            <log-entry v-if="!loadingReadingSuggestions && !readingSuggestionsWithNewVerseCounts.length" role="listitem" :message="$t('no_suggestions')" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import * as dayjs from 'dayjs';
import Bible from '@shared/bible';
import { displayDate } from '@shared/date-helpers';
import BusyBar from '@/components/BusyBar';
import DoubleProgressBar from '@/components/DoubleProgressBar';
import LogEntryEditorModal from '@/components/forms/LogEntryEditorModal';
import LogEntry from '@/components/LogEntry';
import InfoLink from '@/components/InfoLink';

export default {
  name: 'TodayPage',
  components: {
    BusyBar,
    DoubleProgressBar,
    LogEntryEditorModal,
    LogEntry,
    InfoLink,
  },
  data() {
    return {
      editorOpen: false,
      editorLogEntry: {
        id: null,
        date: dayjs().format('YYYY-MM-DD'),
        startVerseId: 0,
        endVerseId: 0,
      },
      loadingReadingSuggestions: true,
    };
  },
  computed: {
    ...mapGetters({
      logEntries: 'log-entries/currentLogEntries',
    }),
    ...mapState({
      userSettings: state => state['user-settings'].settings,
      readingSuggestions: state => state['reading-suggestions'].passages,
    }),
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
    await this.$store.dispatch('loadUserData');
    await this.$store.dispatch('reading-suggestions/refreshReadingSuggestions');
    this.loadingReadingSuggestions = false;
  },
  methods: {
    displayDate(date) {
      return displayDate(date, this.$i18n.locale);
    },
    actionsForTodayLogEntry(entry) {
      return [
        { label: this.$t('edit'), callback: () => this.openEditEntryForm(entry.id) },
        { label: this.$t('delete'), callback: () => this.deleteEntry(entry.id) },
      ];
    },
    actionsForReadingSuggestionPassage(passage) {
      return [
        { label: this.$t('open'), callback: () => this.openPassageInBible(passage) },
        { label: this.$t('track'), callback: () => this.trackPassage(passage) },
      ];
    },
    getReadingUrl(bookIndex, chapterIndex) {
      return this.$store.getters['user-settings/getReadingUrl'](bookIndex, chapterIndex);
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
      const confirmed = await this.$store.dispatch('dialog/confirm', {
        message: this.$t('are_you_sure_you_want_to_delete_this_entry'),
      });
      if (!confirmed) { return; }
      const success = await this.$store.dispatch('log-entries/deleteLogEntry', id);
      if (!success) {
        this.$store.dispatch('toast/add', {
          type: 'error',
          text: this.$t('the_log_entry_could_not_be_deleted'),
        });
      }
    },
    openAddEntryForm() {
      this.editorLogEntry = { empty: true };
      this.editorOpen = true;
    },
    openEditEntryForm(id) {
      const targetEntry = this.logEntries.find(e => e.id === id);
      const { date, startVerseId, endVerseId } = targetEntry;
      this.editorLogEntry = {
        id,
        date,
        startVerseId,
        endVerseId,
      };
      this.editorOpen = true;
    },
    logEntryEditorClosed() {
      this.editorOpen = false;
      this.editorLogEntry = { empty: true };
    },
    openPassageInBible(passage) {
      const { startVerseId } = passage;
      const start = Bible.parseVerseId(startVerseId);
      const url = this.getReadingUrl(start.book, start.chapter);
      window.open(url, '_blank');

      // When a chapter is opened in the Bible,
      // go ahead and open the log entry modal
      // so it's easy to log reading upon return
      setTimeout(() => this.trackPassage(passage), 500);
    },
    trackPassage(passage) {
      const { startVerseId, endVerseId } = passage;
      this.editorLogEntry = {
        id: null,
        date: dayjs().format('YYYY-MM-DD'),
        startVerseId,
        endVerseId,
      };
      this.editorOpen = true;
    },
  },
  head() {
    return {
      title: this.$t('today'),
    };
  },
  middleware: ['auth'],
};
</script>

<style lang="scss" scoped>
//
</style>

<i18n lang="json">
{
  "de": {
    "today": "Heute",
    "add_entry": "Eintrag hinzufügen",
    "new_verses_read": "{0} / {1} neue Versetze",
    "loading": "Lädt...",
    "edit": "Bearbeiten",
    "delete": "Löschen",
    "no_entries": "Keine Einträge",
    "suggestions": "Vorschläge",
    "open": "Öffnen",
    "track": "Verfolgen",
    "no_suggestions": "Keine Vorschläge",
    "are_you_sure_you_want_to_delete_this_entry": "Sind Sie sicher, dass Sie diesen Eintrag löschen möchten?",
    "the_log_entry_could_not_be_deleted": "Der Eintrag konnte nicht gelöscht werden."
  },
  "en": {
    "today": "Today",
    "add_entry": "Add Entry",
    "new_verses_read": "{0} / {1} new verses",
    "loading": "Loading...",
    "edit": "Edit",
    "delete": "Delete",
    "no_entries": "No Entries",
    "suggestions": "Suggestions",
    "open": "Open",
    "track": "Track",
    "no_suggestions": "No Suggestions",
    "are_you_sure_you_want_to_delete_this_entry": "Are you sure you want to delete this entry?",
    "the_log_entry_could_not_be_deleted": "The log entry could not be deleted."
  },
  "es": {
    "today": "Hoy",
    "add_entry": "Añadir entrada",
    "new_verses_read": "{0} / {1} versículos nuevos",
    "loading": "Cargando...",
    "edit": "Editar",
    "delete": "Borrar",
    "no_entries": "No hay entradas",
    "suggestions": "Sugerencias",
    "open": "Abrir",
    "track": "Seguir",
    "no_suggestions": "No hay sugerencias",
    "are_you_sure_you_want_to_delete_this_entry": "¿Estás seguro de que quieres borrar esta entrada?",
    "the_log_entry_could_not_be_deleted": "No se pudo borrar la entrada del registro."
  },
  "fr": {
    "today": "Aujourd'hui",
    "add_entry": "Ajouter une entrée",
    "new_verses_read": "{0} / {1} nouveaux versets",
    "loading": "Chargement...",
    "edit": "Éditer",
    "delete": "Supprimer",
    "no_entries": "Pas d'entrées",
    "suggestions": "Suggestions",
    "open": "Ouvrir",
    "track": "Suivre",
    "no_suggestions": "Aucune suggestion",
    "are_you_sure_you_want_to_delete_this_entry": "Êtes-vous sûr de vouloir supprimer cette entrée?",
    "the_log_entry_could_not_be_deleted": "L'entrée du journal n'a pas pu être supprimée."
  },
  "pt": {
    "today": "Hoje",
    "add_entry": "Adicionar Entrada",
    "new_verses_read": "{0} / {1} novos versículos",
    "loading": "Carregando...",
    "edit": "Editar",
    "delete": "Excluir",
    "no_entries": "Sem Entradas",
    "suggestions": "Sugestões",
    "open": "Abrir",
    "track": "Rastrear",
    "no_suggestions": "Sem sugestões",
    "are_you_sure_you_want_to_delete_this_entry": "Tem certeza de que deseja excluir esta entrada?",
    "the_log_entry_could_not_be_deleted": "A entrada do registro não pôde ser excluída."
  },
  "uk": {
    "today": "Сьогодні",
    "add_entry": "Додати запис",
    "new_verses_read": "{0} / {1} нових віршів",
    "loading": "Завантаження...",
    "edit": "Редагувати",
    "delete": "Видалити",
    "no_entries": "Немає записів",
    "suggestions": "Рекомендації",
    "open": "Відкрити",
    "track": "Відстежити",
    "no_suggestions": "Немає рекомендацій",
    "are_you_sure_you_want_to_delete_this_entry": "Ви впевнені, що хочете видалити цей запис?",
    "the_log_entry_could_not_be_deleted": "Не вдалося видалити запис."
  }
}
</i18n>
