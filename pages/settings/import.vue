<template>
  <div class="container">
    <h2 class="title is-4">
      {{ $t('import') }}
    </h2>
    <p>{{ $t('you_can_import_a_csv') }}</p>
    <div class="file">
      <label class="file-label">
        <input class="file-input" type="file" multiple="multiple" @change="uploadCSVFilesChange">
        <span class="file-cta">
          <span class="file-label">{{ $t('choose_a_file') }}</span>
        </span>
      </label>
    </div>
    <hr>
    <h3 class="title is-5">
      {{ $t('log_import_progress') }}
    </h3>
    <table class="table is-fullwidth">
      <thead>
        <tr>
          <th>{{ $t('date') }}</th>
          <th>{{ $t('passage') }}</th>
          <th>{{ $t('status') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!importLogEntries.length">
          <td colspan="3">
            {{ $t('no_log_entries_to_show') }}
          </td>
        </tr>
        <tr v-for="entry in importLogEntries" :key="entry.id">
          <td>{{ entry.date }}</td>
          <td>
            <span v-if="entry.startVerseId !== null">
              {{ displayVerseRange(entry.startVerseId, entry.endVerseId) }}
            </span>
            <span v-else>{{ entry.verseRange }}</span>
          </td>
          <td>{{ entry.status }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import * as csv from 'csv';
import Bible from '@/shared/bible';
import SimpleDate from '@/shared/simple-date';

const delimiter = ',';

export default {
  name: 'ImportPage',
  data() {
    return {
      logEntryUploadFormData: null,
      importLogEntries: [],
    };
  },
  async fetch() {
    await this.$store.dispatch('loadUserData');
  },
  computed: {
    ...mapState({
      logEntries: state => state['log-entries'].logEntries,
    }),
    activeLocale() {
      return this.$i18n.locales.find(locale => locale.code === this.$i18n.locale).name;
    },
  },
  methods: {
    displayVerseRange(startVerseId, endVerseId) {
      return Bible.displayVerseRange(startVerseId, endVerseId, this.$i18n.locale);
    },
    readFile(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.addEventListener('load', (event) => {
          resolve(event.target.result);
        });
        reader.readAsText(file);
      });
    },
    parseCsv(csvText) {
      return new Promise((resolve, reject) => {
        const parser = csv.parse({ delimiter });
        const output = [];
        parser.on('readable', () => {
          let record;
          while (record = parser.read()) { // eslint-disable-line
            output.push(record);
          }
        });
        parser.on('error', reject);
        parser.on('end', () => resolve(output));
        parser.write(csvText);
        parser.end();
      });
    },
    async parseCsvToLogEntries(csvText) {
      // If unable to parse CSV, return empty array (indicates error)
      let csvRows;
      try {
        csvRows = await this.parseCsv(csvText);
      }
      catch (err) {
        return [];
      }

      const logEntries = csvRows.map((row) => {
        const [inputDate, verseRange] = row;
        let date = inputDate;

        // If date is invalid, set to null (indicates error)
        if (!SimpleDate.validateString(date)) {
          date = null;
        }

        // If passage is invalid, set to null (indicates error)
        let startVerseId, endVerseId, status;
        try {
          const parsed = Bible.parseVerseRange(verseRange, this.$i18n.locale);
          startVerseId = parsed.startVerseId;
          endVerseId = parsed.endVerseId;
          status = this.$t('log_entry_status.to_do');
        }
        catch (err) {
          startVerseId = null;
          endVerseId = null;
          status = this.$t('log_entry_status.invalid');
        }
        return { date, startVerseId, endVerseId, status, verseRange };
      });

      return logEntries;
    },
    async createLogEntries() {
      // ensure the log entry is not yet created
      for (const newLogEntry of this.importLogEntries) {
        if (newLogEntry.status === this.$t('log_entry_status.invalid')) {
          // skip invalid log entries
          continue;
        }
        newLogEntry.status = this.$t('log_entry_status.checking');
        const existingLogEntry = this.logEntries.find((existingLogEntry) => {
          return (
            existingLogEntry.date === newLogEntry.date &&
            existingLogEntry.startVerseId === newLogEntry.startVerseId &&
            existingLogEntry.endVerseId === newLogEntry.endVerseId
          );
        });

        if (existingLogEntry) {
          newLogEntry.status = this.$t('log_entry_status.already_exists');
        }
        else {
          newLogEntry.status = this.$t('log_entry_status.importing_now');
          await this.$store.dispatch('log-entries/createLogEntry', newLogEntry);
          newLogEntry.status = this.$t('log_entry_status.imported');
        }
      }
    },
    async uploadCSVFilesChange(event) {
      const files = event.target.files;
      if (!files.length) { return; }

      // parse all CSV file uploads into log entries
      this.importLogEntries = [];
      for (const file of files) {
        if (file.type && !file.type.includes('csv')) {
          this.$store.dispatch('toast/add', {
            type: 'error',
            text: this.$t('messaging.file_not_a_csv', { filename: file.name, filetype: file.type }),
          });
          return;
        }
        const textContent = await this.readFile(file);
        await this.parseCsvToLogEntries(textContent)
          .then((fileLogEntries) => {
            if (!fileLogEntries.length) {
              throw new Error(' ');
            }
            return fileLogEntries;
          })
          .then(fileLogEntries => this.importLogEntries.push(...fileLogEntries))
          .catch(() => {
            this.$store.dispatch('toast/add', {
              type: 'error',
              text: this.$t('messaging.unable_to_parse_file', { filename: file.name }),
            });
          });
      }

      // Ensure there were valid entries
      if (!this.importLogEntries.length) {
        this.$store.dispatch('toast/add', {
          type: 'error',
          text: this.$t('messaging.unable_to_parse_any_log_entries'),
        });
        return;
      }

      await this.createLogEntries()
        .then(() => {
          this.$store.dispatch('toast/add', {
            type: 'success',
            text: this.$t('messaging.successfully_processed_log_entries', { count: this.importLogEntries.length }),
          });
        })
        .catch(() => {
          this.$store.dispatch('toast/add', {
            type: 'error',
            text: this.$t('messaging.there_was_a_problem_creating_the_log_entries'),
          });
        });
    },
  },
  head() {
    return {
      meta: [
        { hid: 'robots', name: 'robots', content: 'noindex' },
      ],
    };
  },
  middleware: ['auth'],
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
    "import": "Import",
    "you_can_import_a_csv": "Sie können ein CSV-Datei mit Journal-Einträgen in My Bible Log importieren.",
    "choose_a_file": "Datei auswählen...",
    "log_import_progress": "Journal-Import-Fortschritt",
    "date": "Datum",
    "passage": "Passage",
    "status": "Status",
    "no_log_entries_to_show": "Keine Journal-Einträge zum Anzeigen.",
    "log_entry_status": {
      "invalid": "Ungültig",
      "to_do": "Zu tun",
      "checking": "Überprüfen",
      "already_exists": "Bereits vorhanden",
      "importing_now": "Wird importiert",
      "imported": "Importiert"
    },
    "messaging": {
      "file_not_a_csv": "Die Datei {filename} ist nicht im CSV-Format. Es ist {filetype}.",
      "unable_to_parse_file": "Die Datei {filename} kann nicht analysiert werden. Stellen Sie sicher, dass das Format korrekt ist.",
      "unable_to_parse_any_log_entries": "Die Journal-Einträge aus den hochgeladenen Dateien können nicht analysiert werden.",
      "successfully_processed_log_entries": "Erfolgreich verarbeitet {count} Journal-Einträge.",
      "there_was_a_problem_creating_the_log_entries": "Es gab ein Problem beim Erstellen der Journal-Einträge."
    }
  },
  "en": {
    "import": "Import",
    "you_can_import_a_csv": "You can import a reading log CSV file to My Bible Log.",
    "choose_a_file": "Choose a file...",
    "log_import_progress": "Log Import Progress",
    "date": "Date",
    "passage": "Passage",
    "status": "Status",
    "no_log_entries_to_show": "No log entries to show.",
    "log_entry_status": {
      "invalid": "Invalid",
      "to_do": "To Do",
      "checking": "Checking",
      "already_exists": "Already Exists",
      "importing_now": "Importing Now",
      "imported": "Imported"
    },
    "messaging": {
      "file_not_a_csv": "File {filename} is not in CSV format. It is {filetype}.",
      "unable_to_parse_file": "Unable to parse file {filename}. Make sure the format is correct.",
      "unable_to_parse_any_log_entries": "Unable to parse any log entries from uploaded files.",
      "successfully_processed_log_entries": "Successfully processed {count} log entries.",
      "there_was_a_problem_creating_the_log_entries": "There was a problem creating the log entries."
    }
  },
  "es": {
    "import": "Importar",
    "you_can_import_a_csv": "Puede importar un archivo CSV de registro de lectura a My Bible Log.",
    "choose_a_file": "Elija un archivo...",
    "log_import_progress": "Progreso de importación de registro",
    "date": "Fecha",
    "passage": "Pasaje",
    "status": "Estado",
    "no_log_entries_to_show": "No hay entradas de registro para mostrar.",
    "log_entry_status": {
      "invalid": "Inválido",
      "to_do": "Por Hacer",
      "checking": "Comprobando",
      "already_exists": "Ya Existe",
      "importing_now": "Importando Ahora",
      "imported": "Importado"
    },
    "messaging": {
      "file_not_a_csv": "El archivo {filename} no está en formato CSV. Es {filetype}.",
      "unable_to_parse_file": "No se puede analizar el archivo {filename}. Asegúrese de que el formato sea correcto.",
      "unable_to_parse_any_log_entries": "No se pueden analizar las entradas de registro de los archivos cargados.",
      "successfully_processed_log_entries": "Se procesaron correctamente {count} entradas de registro.",
      "there_was_a_problem_creating_the_log_entries": "Hubo un problema al crear las entradas de registro."
    }
  },
  "fr": {
    "import": "Importer",
    "you_can_import_a_csv": "Vous pouvez importer un fichier CSV de journal de lecture dans My Bible Log.",
    "choose_a_file": "Choisissez un fichier...",
    "log_import_progress": "Progression de l'importation du journal",
    "date": "Date",
    "passage": "Passage",
    "status": "Statut",
    "no_log_entries_to_show": "Aucune entrée de journal à afficher.",
    "log_entry_status": {
      "invalid": "Invalide",
      "to_do": "À faire",
      "checking": "Vérification",
      "already_exists": "Déjà Existant",
      "importing_now": "Importation en Cours",
      "imported": "Importé"
    },
    "messaging": {
      "file_not_a_csv": "Le fichier {filename} n'est pas au format CSV. Il est de type {filetype}.",
      "unable_to_parse_file": "Impossible d'analyser le fichier {filename}. Assurez-vous que le format est correct.",
      "unable_to_parse_any_log_entries": "Impossible d'analyser des entrées de journal à partir des fichiers téléchargés.",
      "successfully_processed_log_entries": "Traitement réussi de {count} entrées de journal.",
      "there_was_a_problem_creating_the_log_entries": "Un problème est survenu lors de la création des entrées de journal."
    }
  },
  "pt": {
    "import": "Import",
    "you_can_import_a_csv": "Você pode importar um arquivo CSV de registro de leitura para o My Bible Log.",
    "choose_a_file": "Escolha um arquivo...",
    "log_import_progress": "Progresso da importação de registros",
    "date": "Data",
    "passage": "Passagem",
    "status": "Status",
    "no_log_entries_to_show": "Nenhum registro para mostrar.",
    "log_entry_status": {
      "invalid": "Inválido",
      "to_do": "A fazer",
      "checking": "Verificando",
      "already_exists": "Já Existe",
      "importing_now": "Importando Agora",
      "imported": "Importado"
    },
    "messaging": {
      "file_not_a_csv": "O arquivo {filename} não está no formato CSV. É {filetype}.",
      "unable_to_parse_file": "Não é possível analisar o arquivo {filename}. Certifique-se de que o formato está correto.",
      "unable_to_parse_any_log_entries": "Não é possível analisar nenhuma entrada de log dos arquivos enviados.",
      "successfully_processed_log_entries": "Entradas de log processadas com sucesso: {count}.",
      "there_was_a_problem_creating_the_log_entries": "Houve um problema ao criar as entradas de log."
    }
  },
  "uk": {
    "import": "Імпорт",
    "you_can_import_a_csv": "Ви можете імпортувати файл CSV журналу читання до My Bible Log.",
    "choose_a_file": "Виберіть файл...",
    "log_import_progress": "Прогрес імпорту журналу",
    "date": "Дата",
    "passage": "Пасаж",
    "status": "Статус",
    "no_log_entries_to_show": "Немає записів журналу для відображення.",
    "log_entry_status": {
      "invalid": "Недійсний",
      "to_do": "Зробити",
      "checking": "Перевірка",
      "already_exists": "Вже існує",
      "importing_now": "Імпорт зараз",
      "imported": "Імпортовано"
    },
    "messaging": {
      "file_not_a_csv": "Файл {filename} не у форматі CSV. Це {filetype}.",
      "unable_to_parse_file": "Не вдалося проаналізувати файл {filename}. Переконайтеся, що формат правильний.",
      "unable_to_parse_any_log_entries": "Не вдалося проаналізувати жодного запису журналу з завантажених файлів.",
      "successfully_processed_log_entries": "Успішно оброблено {count} записів журналу.",
      "there_was_a_problem_creating_the_log_entries": "Виникла проблема при створенні записів журналу."
    }
  }
}
</i18n>
