<template>
  <div class="container">
    <h2 class="title is-4">
      {{ $t('export') }}
    </h2>
    <p>{{ $t('you_can_download') }}</p>
    <br>
    <h2 class="title is-5">
      {{ $t('reading_log.title') }}
    </h2>
    <p>{{ $t('reading_log.info.1') }}</p>
    <p>{{ $t('reading_log.info.2') }}</p>
    <button class="button is-primary" @click="downloadLogEntriesCSV">
      {{ $t('reading_log.cta') }}
    </button>
    <hr>
    <h2 class="title is-5">
      {{ $t('notes.title') }}
    </h2>
    <div class="message">
      <div class="message-body">
        {{ $t('notes.info') }}
      </div>
    </div>
    <h2 class="title is-6">
      {{ $t('notes_text_file.title') }}
    </h2>
    <p>{{ $t('notes_text_file.info') }}</p>
    <p>
      <button class="button is-primary" @click="downloadNotesTextFile">
        {{ $t('notes_text_file.cta') }}
      </button>
    </p>
    <h2 class="title is-6">
      {{ $t('notes_json_file.title') }}
    </h2>
    <p>{{ $t('notes_json_file.info') }}</p>
    <p>
      <button class="button is-primary" @click="downloadNotesJsonFile">
        {{ $t('notes_json_file.cta') }}
      </button>
    </p>
  </div>
</template>

<script>
import * as csv from 'csv';
import * as dayjs from 'dayjs';
import { Bible } from '@mybiblelog/shared';
import { UnknownApiError } from '~/helpers/api-error';
import mapFormErrors from '~/helpers/map-form-errors';
import { useToastStore } from '~/stores/toast';
import { useLogEntriesStore } from '~/stores/log-entries';
import { useAppInitStore } from '~/stores/app-init';

const delimiter = ',';

export default {
  name: 'ExportPage',
  middleware: ['auth'],
  data() {
    return {
      logEntryExportCsvFileContent: '',
      notesExportTextFileContent: '',
      notesExportJsonFileContent: '',
    };
  },
  async fetch() {
    await useAppInitStore().loadUserData();
  },
  head() {
    return {
      meta: [
        { hid: 'robots', name: 'robots', content: 'noindex' },
      ],
    };
  },
  computed: {
    logEntriesStore() {
      return useLogEntriesStore();
    },
    logEntries() {
      return this.logEntriesStore.logEntries;
    },
  },
  methods: {
    /**
     * Generates a text file download named `filename` with contents of `dataString`.
     * @param {*} filename The file name for the download.
     * @param {*} dataString The text content for the file download.
     */
    generateDownload(filename, dataString) {
      const a = document.createElement('a');
      document.body.appendChild(a);
      a.style = 'display: none';
      const blob = new Blob([dataString], { type: 'octet/stream' });
      const url = URL.createObjectURL(blob);
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      a.parentElement.removeChild(a);
    },
    formatLogEntryToCsvRow(logEntry) {
      return [logEntry.date, Bible.displayVerseRange(logEntry.startVerseId, logEntry.endVerseId, this.$i18n.locale)];
    },
    generateCSVFromLogEntries(logEntries) {
      return new Promise((resolve, reject) => {
        const stringifier = csv.stringify({ delimiter });
        const data = [];
        stringifier.on('readable', () => {
          let row;
          while (row = stringifier.read()) { // eslint-disable-line
            data.push(row);
          }
        });
        stringifier.on('error', reject);
        stringifier.on('finish', () => resolve(data.join('')));
        for (const logEntry of logEntries) {
          const logEntryRow = this.formatLogEntryToCsvRow(logEntry);
          stringifier.write(logEntryRow);
        }
        stringifier.end();
      });
    },
    async downloadLogEntriesCSV() {
      if (!this.logEntryExportCsvFileContent.length) {
        this.logEntryExportCsvFileContent = await this.generateCSVFromLogEntries(this.logEntries);
      }
      const today = dayjs().format('YYYY-MM-DD');
      const filename = this.$t('reading_log_download.filename', { today });
      this.generateDownload(filename, this.logEntryExportCsvFileContent);
    },
    async downloadNotesTextFile() {
      if (!this.notesExportTextFileContent.length) {
        try {
          await this.generateTextDownloadFromNotes();
        }
        catch (err) {
          const toastStore = useToastStore();
          toastStore.add({ type: 'error', text: this.$terr(mapFormErrors(new UnknownApiError())._form) });
          return;
        }
      }
      const today = dayjs().format('YYYY-MM-DD');
      const filename = this.$t('notes_download.text_filename', { today });
      this.generateDownload(filename, this.notesExportTextFileContent);
    },
    async generateTextDownloadFromNotes() {
      const { data: tags } = await this.$http.get('/api/passage-note-tags');
      const notes = await this.loadAllNotes();

      const noteTexts = notes.map(note => this.generateNoteText(note, tags));
      const tagTexts = tags.map(tag => this.generateTagText(tag));

      const NOTES_HEADING = this.$t('notes_download.headings.notes');
      const TAGS_HEADING = this.$t('notes_download.headings.tags');

      this.notesExportTextFileContent = [
        this.$t('notes_download.title'),
        `\n\n===========\n${NOTES_HEADING}\n===========\n\n`,
        noteTexts.join('\n\n---------------\n\n'),
        `\n\n===========\n${TAGS_HEADING}\n===========\n\n`,
        tagTexts.join('\n\n---------------\n\n'),
      ].join('');
    },
    async downloadNotesJsonFile() {
      if (!this.notesExportJsonFileContent.length) {
        try {
          await this.generateJsonDownloadFromNotes();
        }
        catch (err) {
          const toastStore = useToastStore();
          toastStore.add({ type: 'error', text: this.$terr(mapFormErrors(new UnknownApiError())._form) });
          return;
        }
      }
      const today = dayjs().format('YYYY-MM-DD');
      const filename = this.$t('notes_download.json_filename', { today });
      this.generateDownload(filename, this.notesExportJsonFileContent);
    },
    async generateJsonDownloadFromNotes() {
      const { data: tags } = await this.$http.get('/api/passage-note-tags');
      const notes = await this.loadAllNotes();
      this.notesExportJsonFileContent = JSON.stringify({ notes, tags });
    },
    /**
     * Load all user notes via API, iterating through the pagination.
     * This assumes/works with the built-in limit of 10 results per page.
     */
    async loadAllNotes() {
      const allNotes = [];
      let done = false;
      let offset = 0;
      do {
        const { data: results, meta } = await this.$http.get(`/api/passage-notes?offset=${offset}`);
        const { size } = meta.pagination;
        if (allNotes.length < size) {
          allNotes.push(...results);
          offset += 10;
        }
        else {
          done = true;
        }
      } while (!done);
      return allNotes;
    },
    generateNoteText(note, tags) {
      const divider = '\n\n';

      const dateFormatOptions = { dateStyle: 'full', timeStyle: 'long' };
      const dateTimeFormat = new Intl.DateTimeFormat('en-US', dateFormatOptions);
      const noteDate = dateTimeFormat.format(new Date(note.createdAt));

      const PASSAGES_HEADING = this.$t('export.notes_download.headings.passages');
      const TAGS_HEADING = this.$t('export.notes_download.headings.tags');

      let result = noteDate;
      if (note.passages.length) {
        result += divider;
        result += `${PASSAGES_HEADING}:\n`;
        const passages = note.passages.map(passage => Bible.displayVerseRange(passage.startVerseId, passage.endVerseId));
        result += passages.map(passage => `* ${passage}`).join('\n'); // each passage on separate line
      }
      if (note.tags.length) {
        const tagLabels = note.tags
          .map((tagId) => {
            const tag = tags.find(t => t.id === tagId || t._id === tagId);
            return tag ? tag.label : null;
          })
          .filter(label => label !== null);
        if (tagLabels.length) {
          result += divider;
          result += `${TAGS_HEADING}:\n`;
          result += tagLabels.map(tag => `* ${tag}`).join('\n'); // each tag on separate line
        }
      }
      if (note.content.length) {
        result += divider;
        result += '- - - - -\n\n';
        result += note.content;
      }

      return result;
    },
    generateTagText(tag) {
      let result = tag.label;
      if (tag.description) {
        result += '\n\n' + tag.description;
      }
      return result;
    },
  },
};
</script>

<style lang="scss" scoped>
main p {
  margin-bottom: 1rem;
}
</style>

<i18n locale="en" lang="json" src="@/locales/sfc/en/pages/settings/export.json" />
<i18n locale="de" lang="json" src="@/locales/sfc/de/pages/settings/export.json" />
<i18n locale="es" lang="json" src="@/locales/sfc/es/pages/settings/export.json" />
<i18n locale="fr" lang="json" src="@/locales/sfc/fr/pages/settings/export.json" />
<i18n locale="pt" lang="json" src="@/locales/sfc/pt/pages/settings/export.json" />
<i18n locale="uk" lang="json" src="@/locales/sfc/uk/pages/settings/export.json" />
