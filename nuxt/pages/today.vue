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
    <br>
    <h3 class="title is-5">
      {{ $t('suggestions') }}
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
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import * as dayjs from 'dayjs';
import { Bible } from '@mybiblelog/shared';
import BusyBar from '@/components/BusyBar';
import DoubleProgressBar from '@/components/DoubleProgressBar';
import LogEntry from '@/components/LogEntry';
import InfoLink from '@/components/InfoLink';

export default {
  name: 'TodayPage',
  components: {
    BusyBar,
    DoubleProgressBar,
    LogEntry,
    InfoLink,
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
      this.$store.dispatch('log-entry-editor/openEditor', { empty: true });
    },
    openEditEntryForm(id) {
      const targetEntry = this.logEntries.find(e => e.id === id);
      const { date, startVerseId, endVerseId } = targetEntry;
      this.$store.dispatch('log-entry-editor/openEditor', {
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
      const { startVerseId, endVerseId } = passage;
      this.$store.dispatch('log-entry-editor/openEditor', {
        id: null,
        date: dayjs().format('YYYY-MM-DD'),
        startVerseId,
        endVerseId,
      });
    },
    takeNoteOnPassage(passage) {
      const { startVerseId, endVerseId } = passage;
      this.$store.dispatch('passage-note-editor/openEditor', {
        passages: [{ startVerseId, endVerseId }],
        content: '',
      });
    },
    viewNotesForPassage(passage) {
      const { startVerseId, endVerseId } = passage;
      this.$store.dispatch('passage-notes/stageQuery', {
        filterPassageStartVerseId: startVerseId,
        filterPassageEndVerseId: endVerseId,
      });
      this.$router.push(this.localePath('/notes'));
    },
  },
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
    "take_note": "Notiz hinzufügen",
    "view_notes": "Notizen ansehen",
    "no_entries": "Keine Einträge",
    "suggestions": "Vorschläge",
    "open_bible": "Bibel öffnen",
    "log_reading": "Lesung hinzufügen",
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
    "take_note": "Take Note",
    "view_notes": "View Notes",
    "no_entries": "No Entries",
    "suggestions": "Suggestions",
    "open_bible": "Open Bible",
    "log_reading": "Log Reading",
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
    "take_note": "Tomar nota",
    "view_notes": "Ver notas",
    "no_entries": "No hay entradas",
    "suggestions": "Sugerencias",
    "open_bible": "Abrir en la Biblia",
    "log_reading": "Agregar lectura",
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
    "take_note": "Prendre note",
    "view_notes": "Voir les notes",
    "no_entries": "Pas d'entrées",
    "suggestions": "Suggestions",
    "open_bible": "Ouvrir dans la Bible",
    "log_reading": "Ajouter une lecture",
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
    "take_note": "Tomar nota",
    "view_notes": "Ver notas",
    "no_entries": "Sem Entradas",
    "suggestions": "Sugestões",
    "open_bible": "Ler na Biblia",
    "log_reading": "Adicionar uma leitura",
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
    "take_note": "Записати",
    "view_notes": "Переглянути записи",
    "no_entries": "Немає записів",
    "suggestions": "Рекомендації",
    "open_bible": "Читати в Біблії",
    "log_reading": "Додати читання",
    "no_suggestions": "Немає рекомендацій",
    "are_you_sure_you_want_to_delete_this_entry": "Ви впевнені, що хочете видалити цей запис?",
    "the_log_entry_could_not_be_deleted": "Не вдалося видалити запис."
  }
}
</i18n>
