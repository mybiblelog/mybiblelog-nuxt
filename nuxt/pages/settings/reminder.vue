<template>
  <div class="container">
    <h2 class="title is-4">
      {{ $t('reminder') }}
    </h2>
    <p>
      {{ $t('info.p1a') }}
      {{ $t('info.p1b') }}
    </p>
    <p>
      {{ $t('info.p2a') }}
      {{ $t('info.p2b') }}
    </p>
    <div class="field">
      <div class="control">
        <label class="checkbox">
          <input v-model="reminderForm.active" type="checkbox"> {{ $t('form.i_want_to_receive_a_daily_reminder_email') }}
        </label>
      </div>
    </div>
    <div class="field has-addons">
      <div class="control">
        <label class="label">{{ $t('form.reminder_time') }}</label>
        <input v-model="reminderForm.time" class="input" type="time" min="0" max="23">
      </div>
    </div>
    <div class="field">
      <div class="control">
        <button class="button is-primary" @click="handleReminderSubmit">
          {{ $t('form.save_preferences') }}
        </button>
      </div>
    </div>
    <div v-if="reminderErrors._form" class="help is-danger">
      {{ $terr(reminderErrors._form) }}
    </div>
  </div>
</template>

<script>
import { ApiError, UnknownApiError } from '~/helpers/api-error';
import mapFormErrors from '~/helpers/map-form-errors';
import { useToastStore } from '~/stores/toast';

export default {
  name: 'ReminderSettingsPage',
  middleware: ['auth'],
  async asyncData({ app }) {
    const { data: reminder } = await app.$http.get('/api/reminders/daily-reminder');
    const {
      hour,
      minute,
      active,
    } = reminder;
    const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

    return {
      reminderForm: {
        time,
        active,
      },
    };
  },
  data() {
    return {
      reminderErrors: {
        _form: '',
      },
    };
  },
  head() {
    return {
      meta: [
        { hid: 'robots', name: 'robots', content: 'noindex' },
      ],
    };
  },
  methods: {
    async handleReminderSubmit() {
      this.formBusy = true;
      this.reminderErrors._form = '';

      const { time, active } = this.reminderForm;
      const hourMinuteRE = /(\d+):(\d+)/;
      if (!hourMinuteRE.test(time)) {
        this.reminderErrors._form = this.$t('messaging.please_choose_a_time');
        this.formBusy = false;
        return;
      }
      const [, hour, minute] = hourMinuteRE.exec(time);
      const timezoneOffset = new Date().getTimezoneOffset();

      try {
        await this.$http.put('/api/reminders/daily-reminder', {
          hour,
          minute,
          timezoneOffset,
          active,
        });
        const toastStore = useToastStore();
        toastStore.add({
          type: 'success',
          text: this.$t('messaging.reminder_settings_updated_successfully'),
        });
      }
      catch (err) {
        if (err instanceof ApiError) {
          Object.assign(this.reminderErrors, mapFormErrors(err));
        }
        else {
          Object.assign(this.reminderErrors, mapFormErrors(new UnknownApiError()));
        }
      }
      finally {
        this.formBusy = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
main p {
  margin-bottom: 1rem;
}
</style>

<i18n locale="en" lang="json" src="@/locales/sfc/en/pages/settings/reminder.json" />
<i18n locale="de" lang="json" src="@/locales/sfc/de/pages/settings/reminder.json" />
<i18n locale="es" lang="json" src="@/locales/sfc/es/pages/settings/reminder.json" />
<i18n locale="fr" lang="json" src="@/locales/sfc/fr/pages/settings/reminder.json" />
<i18n locale="pt" lang="json" src="@/locales/sfc/pt/pages/settings/reminder.json" />
<i18n locale="uk" lang="json" src="@/locales/sfc/uk/pages/settings/reminder.json" />
