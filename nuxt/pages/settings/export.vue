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
import { mapState } from 'vuex';
import * as csv from 'csv';
import * as dayjs from 'dayjs';
import { Bible } from '@mybiblelog/shared';

const delimiter = ',';

export default {
  name: 'ExportPage',
  data() {
    return {
      logEntryExportCsvFileContent: '',
      notesExportTextFileContent: '',
      notesExportJsonFileContent: '',
    };
  },
  async fetch() {
    await this.$store.dispatch('loadUserData');
  },
  computed: {
    ...mapState({
      logEntries: state => state['log-entries'].logEntries,
    }),
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
      if (!this.logEntryExportCsvFileContent.length) {
        await this.generateTextDownloadFromNotes(this.logEntries);
      }
      const today = dayjs().format('YYYY-MM-DD');
      const filename = this.$t('notes_download.text_filename', { today });
      this.generateDownload(filename, this.notesExportTextFileContent);
    },
    async generateTextDownloadFromNotes() {
      const tagsResponse = await fetch('/api/passage-note-tags', {
        credentials: 'include',
      });
      if (!tagsResponse.ok) {
        throw new Error('Failed to load tags');
      }
      const { data: tags } = await tagsResponse.json();
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
        await this.generateJsonDownloadFromNotes(this.logEntries);
      }
      const today = dayjs().format('YYYY-MM-DD');
      const filename = this.$t('notes_download.json_filename', { today });
      this.generateDownload(filename, this.notesExportJsonFileContent);
    },
    async generateJsonDownloadFromNotes() {
      const tagsResponse = await fetch('/api/passage-note-tags', {
        credentials: 'include',
      });
      if (!tagsResponse.ok) {
        throw new Error('Failed to load tags');
      }
      const { data: tags } = await tagsResponse.json();
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
        const url = new URL(this.$config.siteUrl); // from nuxt.config.js
        url.pathname = '/api/passage-notes';
        url.searchParams.set('offset', offset);
        const response = await fetch(url, {
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Failed to load notes');
        }
        const {
          data: {
            results,
            size,
          },
        } = await response.json();
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
        const tagLabels = note.tags.map(tagId => tags.find(tag => tag.id === tagId).label);
        result += divider;
        result += `${TAGS_HEADING}:\n`;
        result += tagLabels.map(tag => `* ${tag}`).join('\n'); // each tag on separate line
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
  head() {
    return {
      meta: [
        { hid: 'robots', name: 'robots', content: 'noindex' },
      ],
    };
  },
  middleware: ['auth2'],
};
</script>

<style lang="scss" scoped>
main p {
  margin-bottom: 1rem;
}
</style>

<i18n lang="json">
{
  "de": {
    "export": "Export",
    "you_can_download": "Sie können Ihre Daten in verschiedenen Formaten herunterladen.",
    "reading_log": {
      "title": "Journal",
      "info": {
        "1": "Sie können Ihre Journal-Einträge als Tabelle (CSV-Datei) exportieren.",
        "2": "Diese Datei kann in My Bible Log importiert oder in einem Tabellenkalkulationsprogramm geöffnet werden."
      },
      "cta": "Journal als CSV exportieren"
    },
    "notes": {
      "title": "Notizen",
      "info": "Obwohl exportierte Notizen nicht automatisch in My Bible Log importiert werden können, können Sie Notizen und Tags immer manuell neu erstellen."
    },
    "notes_text_file": {
      "title": "Notizen Textdatei",
      "info": "Sie können Ihre Notizen in einer Textdatei exportieren.",
      "cta": "Notizen Text exportieren"
    },
    "notes_json_file": {
      "title": "Notizen JSON Datei",
      "info": "Sie können Ihre Notizen auch als JSON-Datei exportieren.",
      "cta": "Notizen JSON exportieren"
    },
    "reading_log_download": {
      "filename": "My_Bible_Log_Journal_Export_{today}.csv"
    },
    "notes_download": {
      "text_filename": "My_Bible_Log_Notizen_Export_{today}.txt",
      "json_filename": "My_Bible_Log_Notizen_Export_{today}.json",
      "title": "My Bible Log Notizen Export",
      "headings": {
        "notes": "NOTIZEN",
        "tags": "TAGS",
        "passages": "PASSAGES"
      }
    }
  },
  "en": {
    "export": "Export",
    "you_can_download": "You can download your data in different formats.",
    "reading_log": {
      "title": "Reading Log",
      "info": {
        "1": "You can export your log entries as a spreadsheet (CSV file).",
        "2": "This file can be imported into My Bible Log or opened in a spreadsheet program."
      },
      "cta": "Export Reading Log CSV"
    },
    "notes": {
      "title": "Notes",
      "info": "While exported notes cannot be automatically imported into My Bible Log, you can always re-create notes and tags manually."
    },
    "notes_text_file": {
      "title": "Notes Text File",
      "info": "You can export your notes in a text file.",
      "cta": "Export Notes Text"
    },
    "notes_json_file": {
      "title": "Notes JSON File",
      "info": "You also have the option of exporting your notes as a JSON file.",
      "cta": "Export Notes JSON"
    },
    "reading_log_download": {
      "filename": "My_Bible_Log_Reading_Log_Export_{today}.csv"
    },
    "notes_download": {
      "text_filename": "My_Bible_Log_Notes_Export_{today}.txt",
      "json_filename": "My_Bible_Log_Notes_Export_{today}.json",
      "title": "My Bible Log Notes Export",
      "headings": {
        "notes": "NOTES",
        "tags": "TAGS",
        "passages": "PASSAGES"
      }
    }
  },
  "es": {
    "export": "Exportar",
    "you_can_download": "Puede descargar sus datos en diferentes formatos.",
    "reading_log": {
      "title": "Journal de lectura",
      "info": {
        "1": "Puede exportar sus entradas de journal como un tableur (fichier CSV).",
        "2": "Este archivo puede ser importado en My Bible Log o abierto en un programa de tableur."
      },
      "cta": "Exporter le journal de lectura en CSV"
    },
    "notes": {
      "title": "Notas",
      "info": "Bien que les notes exportées ne puissent pas être importées automatiquement dans My Bible Log, vous pouvez toujours recréer manuellement les notes et les tags."
    },
    "notes_text_file": {
      "title": "Fichier de texte des notes",
      "info": "Vous pouvez exporter vos notes dans un fichier texte.",
      "cta": "Exporter le texte des notes"
    },
    "notes_json_file": {
      "title": "Fichier JSON des notes",
      "info": "Vous avez également la possibilité d'exporter vos notes sous forme de fichier JSON.",
      "cta": "Exporter les notes en JSON"
    },
    "reading_log_download": {
      "filename": "My_Bible_Log_Reading_Log_Export_{today}.csv"
    },
    "notes_download": {
      "text_filename": "My_Bible_Log_Notes_Export_{today}.txt",
      "json_filename": "My_Bible_Log_Notes_Export_{today}.json",
      "title": "Exportación de notas de My Bible Log",
      "headings": {
        "notes": "NOTAS",
        "tags": "ETIQUETAS",
        "passages": "PASAJES"
      }
    }
  },
  "fr": {
    "export": "Export",
    "you_can_download": "Vous pouvez télécharger vos données dans différents formats.",
    "reading_log": {
      "title": "Journal de lecture",
      "info": {
        "1": "Vous pouvez exporter vos entrées de journal comme un tableur (fichier CSV).",
        "2": "Ce fichier peut être importé dans My Bible Log ou ouvert dans un programme de tableur."
      },
      "cta": "Exporter le journal de lecture en CSV"
    },
    "notes": {
      "title": "Notes",
      "info": "Bien que les notes exportées ne puissent pas être importées automatiquement dans My Bible Log, vous pouvez toujours recréer manuellement les notes et les tags."
    },
    "notes_text_file": {
      "title": "Fichier de texte des notes",
      "info": "Vous pouvez exporter vos notes dans un fichier texte.",
      "cta": "Exporter le texte des notes"
    },
    "notes_json_file": {
      "title": "Fichier JSON des notes",
      "info": "Vous avez également la possibilité d'exporter vos notes sous forme de fichier JSON.",
      "cta": "Exporter les notes en JSON"
    },
    "reading_log_download": {
      "filename": "My_Bible_Log_Reading_Log_Export_{today}.csv"
    },
    "notes_download": {
      "text_filename": "My_Bible_Log_Notes_Export_{today}.txt",
      "json_filename": "My_Bible_Log_Notes_Export_{today}.json",
      "title": "Exportation des notes de My Bible Log",
      "headings": {
        "notes": "NOTES",
        "tags": "ÉTIQUETTES",
        "passages": "PASSAGES"
      }
    }
  },
  "pt": {
    "export": "Exportar",
    "you_can_download": "Você pode baixar seus dados em diferentes formatos.",
    "reading_log": {
      "title": "Registro de Leitura",
      "info": {
        "1": "Você pode exportar suas entradas de registro como uma planilha (arquivo CSV).",
        "2": "Este arquivo pode ser importado para My Bible Log ou aberto em um programa de planilha."
      },
      "cta": "Exportar Registro de Leitura CSV"
    },
    "notes": {
      "title": "Notas",
      "info": "Embora as notas exportadas não possam ser importadas automaticamente para My Bible Log, você sempre pode recriar as notas e etiquetas manualmente."
    },
    "notes_text_file": {
      "title": "Arquivo de Texto das Notas",
      "info": "Você pode exportar suas notas em um arquivo de texto.",
      "cta": "Exportar Notas de Texto"
    },
    "notes_json_file": {
      "title": "Arquivo JSON de Notas",
      "info": "Você também tem a opção de exportar suas notas como um arquivo JSON.",
      "cta": "Exportar Notas JSON"
    },
    "reading_log_download": {
      "filename": "My_Bible_Log_Reading_Log_Export_{today}.csv"
    },
    "notes_download": {
      "text_filename": "My_Bible_Log_Notes_Export_{today}.txt",
      "json_filename": "My_Bible_Log_Notes_Export_{today}.json",
      "title": "Exportação de Notas do My Bible Log",
      "headings": {
        "notes": "NOTAS",
        "tags": "TAGS",
        "passages": "PASSAGENS"
      }
    }
  },
  "uk": {
    "export": "Експорт",
    "you_can_download": "Ви можете завантажити свої дані у різних форматах.",
    "reading_log": {
      "title": "Журнал читання",
      "info": {
        "1": "Ви можете експортувати ваші записи з журналу у вигляді електронної таблиці (CSV-файл).",
        "2": "Цей файл можна імпортувати в My Bible Log або відкрити в програмі для роботи з електронними таблицями."
      },
      "cta": "Експорт Журналу читання у форматі CSV"
    },
    "notes": {
      "title": "Нотатки",
      "info": "Хоча експортовані нотатки не можна автоматично імпортувати в My Bible Log, ви завжди можете вручну відновити нотатки та теги."
    },
    "notes_text_file": {
      "title": "Текстовий файл нотаток",
      "info": "Ви можете експортувати свої нотатки у текстовому файлі.",
      "cta": "Експорт Текстового файлу нотаток"
    },
    "notes_json_file": {
      "title": "JSON-файл нотаток",
      "info": "Ви також можете експортувати свої нотатки у форматі JSON.",
      "cta": "Експорт JSON-файлу нотаток"
    },
    "reading_log_download": {
      "filename": "My_Bible_Log_Reading_Log_Export_{today}.csv"
    },
    "notes_download": {
      "text_filename": "My_Bible_Log_Notes_Export_{today}.txt",
      "json_filename": "My_Bible_Log_Notes_Export_{today}.json",
      "title": "Експорт нотаток My Bible Log",
      "headings": {
        "notes": "НОТАТКИ",
        "tags": "ТЕГИ",
        "passages": "ВІРШІ"
      }
    }
  }
}
</i18n>
