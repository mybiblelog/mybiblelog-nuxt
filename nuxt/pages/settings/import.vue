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
    <div v-if="showLookBackDateResetMessage" class="message is-info">
      <div class="message-body">
        <p>{{ $t('messaging.look_back_date_reset_message.1') }}</p>
        <p>{{ $t('messaging.look_back_date_reset_message.2', { lookBackDate: displayDate(userSettings.lookBackDate, $i18n.locale) }) }}</p>
        <div class="buttons">
          <button class="button is-primary" @click="updateLookBackDate">
            {{ $t('messaging.update_look_back_date_yes') }}
          </button>
          <button class="button" @click="() => showLookBackDateResetMessage = false">
            {{ $t('messaging.update_look_back_date_no') }}
          </button>
        </div>
      </div>
    </div>
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
import * as csv from 'csv';
import { Bible, SimpleDate, displayDate } from '@mybiblelog/shared';
import { useToastStore } from '~/stores/toast';
import { useLogEntriesStore } from '~/stores/log-entries';
import { useUserSettingsStore } from '~/stores/user-settings';
import { useAppInitStore } from '~/stores/app-init';

const delimiter = ',';

export default {
  name: 'ImportPage',
  middleware: ['auth'],
  data() {
    return {
      logEntryUploadFormData: null,
      importLogEntries: [],

      earliestLogEntryDate: null,
      showLookBackDateResetMessage: false,
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
    activeLocale() {
      return this.$i18n.locales.find(locale => locale.code === this.$i18n.locale).name;
    },
    userSettings() {
      return useUserSettingsStore().settings;
    },
  },
  methods: {
    displayDate,
    displayVerseRange(startVerseId, endVerseId) {
      return Bible.displayVerseRange(startVerseId, endVerseId, this.$i18n.locale);
    },
    readFile(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.addEventListener('load', (event) => {
          resolve(event.target.result);
        });
        reader.addEventListener('error', reject);
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

        // Check date to see if it's before the earliest log entry date
        if (!this.earliestLogEntryDate || newLogEntry.date < this.earliestLogEntryDate) {
          this.earliestLogEntryDate = newLogEntry.date;
        }

        if (existingLogEntry) {
          newLogEntry.status = this.$t('log_entry_status.already_exists');
        }
        else {
          newLogEntry.status = this.$t('log_entry_status.importing_now');
          await this.logEntriesStore.createLogEntry({
            date: newLogEntry.date,
            startVerseId: newLogEntry.startVerseId,
            endVerseId: newLogEntry.endVerseId,
          });
          newLogEntry.status = this.$t('log_entry_status.imported');
        }
      }
    },
    async uploadCSVFilesChange(event) {
      const toastStore = useToastStore();
      const files = event.target.files;
      if (!files.length) { return; }

      // parse all CSV file uploads into log entries
      this.importLogEntries = [];
      for (const file of files) {
        if (file.type && !file.type.includes('csv')) {
          toastStore.add({
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
            toastStore.add({
              type: 'error',
              text: this.$t('messaging.unable_to_parse_file', { filename: file.name }),
            });
          });
      }

      // Ensure there were valid entries
      if (!this.importLogEntries.length) {
        toastStore.add({
          type: 'error',
          text: this.$t('messaging.unable_to_parse_any_log_entries'),
        });
        return;
      }

      await this.createLogEntries()
        .then(() => {
          toastStore.add({
            type: 'success',
            text: this.$t('messaging.successfully_processed_log_entries', { count: this.importLogEntries.length }),
          });

          if (this.earliestLogEntryDate && this.earliestLogEntryDate < this.userSettings.lookBackDate) {
            this.showLookBackDateResetMessage = true;
          }
        })
        .catch(() => {
          toastStore.add({
            type: 'error',
            text: this.$t('messaging.there_was_a_problem_creating_the_log_entries'),
          });
        });
    },
    async updateLookBackDate() {
      const toastStore = useToastStore();
      await useUserSettingsStore().updateSettings({ lookBackDate: this.earliestLogEntryDate });
      toastStore.add({
        type: 'success',
        text: this.$t('messaging.look_back_date_updated_successfully'),
      });
      this.showLookBackDateResetMessage = false;
    },
  },
};
</script>

<style lang="scss" scoped>
main p {
  margin-bottom: 1rem;
}
</style>

<i18n locale="en" lang="json" src="@/locales/sfc/en/pages/settings/import.json" />
<i18n locale="de" lang="json" src="@/locales/sfc/de/pages/settings/import.json" />
<i18n locale="es" lang="json" src="@/locales/sfc/es/pages/settings/import.json" />
<i18n locale="fr" lang="json" src="@/locales/sfc/fr/pages/settings/import.json" />
<i18n locale="ko" lang="json" src="@/locales/sfc/ko/pages/settings/import.json" />
<i18n locale="pt" lang="json" src="@/locales/sfc/pt/pages/settings/import.json" />
<i18n locale="uk" lang="json" src="@/locales/sfc/uk/pages/settings/import.json" />
