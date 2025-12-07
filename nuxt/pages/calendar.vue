<template>
  <section class="section">
    <div class="container">
      <div class="columns is-centered">
        <div class="column is-two-thirds-tablet is-half-desktop">
          <log-entry-editor-modal v-if="editorOpen" ref="logEntryEditorModal" :populate-with="editorLogEntry" @closed="logEntryEditorClosed" />
          <client-only>
            <busy-bar :busy="dateVerseCountsBusy" />
            <div id="calendar-page">
              <calendar-month :get-date-verse-counts="getDateVerseCounts" :daily-verse-count-goal="userSettings.dailyVerseCountGoal" @daySelected="selectDate" />
              <div v-if="currentDate" class="entry-container">
                <div class="entry-date">
                  <div>
                    <div class="date">
                      {{ displayDate(entryDate.date) }}
                    </div>
                    <div class="verse-count">
                      {{ entryDate.verses }} {{ $tc('verse', entryDate.verses) }}
                    </div>
                  </div>
                  <button class="button is-small" :disabled="editorOpen" @click="openAddEntryFormForDate(entryDate.date)">
                    +
                  </button>
                </div>
                <log-entry v-for="entry of entryDate.entries" :key="entry.id" :passage="entry" :actions="actionsForLogEntry(entry)" />
                <log-entry v-if="!entryDate.entries.length" :message="$t('no_entries')" empty="empty" />
              </div>
            </div>
          </client-only>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import * as dayjs from 'dayjs';
import { Bible, displayDate } from '@mybiblelog/shared';
import BusyBar from '@/components/BusyBar';
import CalendarMonth from '@/components/calendar/CalendarMonth';
import LogEntryEditorModal from '@/components/forms/LogEntryEditorModal';
import LogEntry from '@/components/LogEntry';

export default {
  name: 'CalendarPage',
  components: {
    BusyBar,
    CalendarMonth,
    LogEntryEditorModal,
    LogEntry,
  },
  data() {
    return {
      currentDate: null,
      editorOpen: false,
      editorLogEntry: {
        id: null,
        date: dayjs().format('YYYY-MM-DD'),
        startVerseId: 0,
        endVerseId: 0,
      },
    };
  },
  async fetch() {
    await this.$store.dispatch('loadUserData');
  },
  computed: {
    ...mapGetters({
      dateVerseCountsBusy: 'date-verse-counts/busy',
      getDateVerseCounts: 'date-verse-counts/getDateVerseCounts',
    }),
    ...mapState({
      userSettings: state => state['user-settings'].settings,
      logEntries: state => state['log-entries'].logEntries,
    }),
    entryDate() {
      const dateLogEntries = [];
      let dateVerses = 0;
      for (const logEntry of this.logEntries) {
        if (logEntry.date === this.currentDate) {
          dateLogEntries.push(logEntry);
          dateVerses += Bible.countRangeVerses(logEntry.startVerseId, logEntry.endVerseId);
        }
      }
      return {
        date: this.currentDate,
        entries: dateLogEntries,
        verses: dateVerses,
      };
    },
  },
  beforeMount() {
    this.currentDate = dayjs().format('YYYY-MM-DD');
  },
  mounted() {
    setTimeout(() => {
      // dispatch this long-running action in a timeout to prevent blocking
      this.$store.dispatch('date-verse-counts/cacheDateVerseCounts');
    }, 0);
  },
  methods: {
    displayDate(date) {
      return displayDate(date, this.$i18n.locale);
    },
    actionsForLogEntry(entry) {
      return [
        { label: this.$t('open_bible'), callback: () => this.openPassageInBible(entry) },
        { label: this.$t('take_note'), callback: () => this.takeNoteOnPassage(entry) },
        { label: this.$t('edit'), callback: () => this.openEditEntryForm(entry.id) },
        { label: this.$t('delete'), callback: () => this.deleteEntry(entry.id) },
      ];
    },
    getReadingUrl(bookIndex, chapterIndex) {
      return this.$store.getters['user-settings/getReadingUrl'](bookIndex, chapterIndex);
    },
    async deleteEntry(id) {
      const confirmed = await this.$store.dispatch('dialog/confirm', {
        message: this.$t('are_you_sure'),
      });
      if (!confirmed) { return; }
      const success = await this.$store.dispatch('log-entries/deleteLogEntry', id);
      if (!success) {
        this.$store.dispatch('toast/add', {
          type: 'error',
          text: this.$t('could_not_delete'),
        });
      }
    },
    openAddEntryFormForDate(date) {
      this.editorLogEntry = { empty: true, date };
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
    openPassageInBible(passage) {
      const { startVerseId } = passage;
      const start = Bible.parseVerseId(startVerseId);
      const url = this.getReadingUrl(start.book, start.chapter);
      window.open(url, '_blank');
    },
    takeNoteOnPassage(passage) {
      const { startVerseId, endVerseId } = passage;
      // FIXME: this silently creates an empty note, but we want to open a prepopulated editor modal
      this.$store.dispatch('passage-notes/createPassageNote', {
        passages: [{ startVerseId, endVerseId }],
        content: '',
      });
    },
    logEntryEditorClosed() {
      this.editorOpen = false;
      this.editorLogEntry = { empty: true };
    },
    selectDate(date) {
      this.currentDate = date;
    },
  },
  head() {
    return {
      title: this.$t('page_title'),
    };
  },
  middleware: ['auth'],
};
</script>

<style lang="scss" scoped>

.entry-date {
  border-bottom: 2px solid #09f;
  padding: 1rem 0.5rem 0;
  display: flex;
  justify-content: space-between;
  .date {
    display: flex;
    flex-direction: column;
    font-weight: bold;
  }
  .verse-count {
    font-size: 0.8em;
  }
}
</style>

<i18n lang="json">
{
  "de": {
    "page_title": "Kalender",
    "verse": "Vers | Verse",
    "open_bible": "Bibel öffnen",
    "take_note": "Notiz hinzufügen",
    "edit": "Bearbeiten",
    "delete": "Löschen",
    "no_entries": "Keine Einträge",
    "are_you_sure": "Sind Sie sicher, dass Sie diesen Eintrag löschen möchten?",
    "could_not_delete": "Der Log-Eintrag konnte nicht gelöscht werden."
  },
  "en": {
    "page_title": "Calendar",
    "verse": "verse | verses",
    "open_bible": "Open Bible",
    "take_note": "Take Note",
    "edit": "Edit",
    "delete": "Delete",
    "no_entries": "No Entries",
    "are_you_sure": "Are you sure you want to delete this entry?",
    "could_not_delete": "The log entry could not be deleted."
  },
  "es": {
    "page_title": "Calendario",
    "verse": "versículo | versículos",
    "open_bible": "Abrir en la Biblia",
    "take_note": "Tomar nota",
    "edit": "Editar",
    "delete": "Borrar",
    "no_entries": "No hay entradas",
    "are_you_sure": "¿Estás seguro de que quieres borrar esta entrada?",
    "could_not_delete": "No se pudo borrar la entrada del registro."
  },
  "fr": {
    "page_title": "Calendrier",
    "verse": "verset | versets",
    "open_bible": "Ouvrir dans la Bible",
    "take_note": "Prendre note",
    "edit": "Modifier",
    "delete": "Supprimer",
    "no_entries": "Aucune entrée",
    "are_you_sure": "Êtes-vous sûr de vouloir supprimer cette entrée?",
    "could_not_delete": "L'entrée du journal n'a pas pu être supprimée."
  },
  "pt": {
    "page_title": "Calendário",
    "verse": "versículo | versículos",
    "open_bible": "Ler na Biblia",
    "take_note": "Tomar nota",
    "edit": "Editar",
    "delete": "Apagar",
    "no_entries": "Nenhum registro",
    "are_you_sure": "Tem certeza de que deseja apagar este registro?",
    "could_not_delete": "O registro não pôde ser apagado."
  },
  "uk": {
    "page_title": "Календар",
    "verse": "верс | верси",
    "open_bible": "Читати в Біблії",
    "take_note": "Записати",
    "edit": "Редагувати",
    "delete": "Видалити",
    "no_entries": "Немає записів",
    "are_you_sure": "Ви впевнені, що хочете видалити цей запис?",
    "could_not_delete": "Не вдалося видалити запис."
  }
}
</i18n>
