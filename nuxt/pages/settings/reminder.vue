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
export default {
  name: 'ReminderSettingsPage',
  middleware: ['auth2'],
  async asyncData({ $axios }) {
    const response = await $axios.get(`/api/reminders/daily-reminder`);
    const reminder = response.data;
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
    handleReminderSubmit() {
      this.formBusy = true;
      this.reminderErrors._form = '';

      const { time, active } = this.reminderForm;
      const hourMinuteRE = /(\d+):(\d+)/;
      if (!hourMinuteRE.test(time)) {
        this.reminderErrors._form = this.$t('messaging.please_choose_a_time');
        return;
      }
      const [, hour, minute] = hourMinuteRE.exec(time);
      const timezoneOffset = new Date().getTimezoneOffset();

      this.$axios.put('/api/reminders/daily-reminder', {
        hour,
        minute,
        timezoneOffset,
        active,
      })
        .then((response) => {
          this.$store.dispatch('toast/add', {
            type: 'success',
            text: this.$t('messaging.reminder_settings_updated_successfully'),
          });
        })
        // Display form errors form the server
        .catch(error => Object.assign(this.reminderErrors, error.response.data.errors))
        // Account for actual server errors
        .catch(() => {
          this.reminderErrors._form = this.$t('messaging.an_unknown_error_occurred');
        })
        // Re-enable the form
        .then(() => {
          this.formBusy = false;
        });
    },
  },
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
    "reminder": "Erinnerung",
    "info": {
      "p1a": "Sie können eine Uhrzeit für die tägliche Erinnerungs-E-Mail festlegen.",
      "p1b": "Sie müssen das Kästchen unten ankreuzen und Ihre Einstellungen speichern, um E-Mails zu erhalten.",
      "p2a": "Wenn Sie diese E-Mails nicht mehr erhalten möchten, entfernen Sie einfach das Kästchen unten und speichern Sie Ihre Einstellungen.",
      "p2b": "Sie können auch den Link \"abbestellen\" in einer E-Mail klicken, um sich abzumelden."
    },
    "form": {
      "i_want_to_receive_a_daily_reminder_email": "Ich möchte eine tägliche Erinnerungs-E-Mail erhalten.",
      "reminder_time": "Erinnerungszeit",
      "save_preferences": "Einstellungen speichern"
    },
    "messaging": {
      "please_choose_a_time": "Bitte wählen Sie eine Uhrzeit für die Erinnerung.",
      "reminder_settings_updated_successfully": "Erinnerungseinstellungen erfolgreich aktualisiert.",
      "an_unknown_error_occurred": "Ein unbekannter Fehler ist aufgetreten."
    }
  },
  "en": {
    "reminder": "Reminder",
    "info": {
      "p1a": "You can set a time to receive a daily reminder email.",
      "p1b": "You must check the checkbox below and save your preferences to begin receiving emails.",
      "p2a": "If you no longer wish to receive these emails, simply uncheck the box below and save your preferences.",
      "p2b": "You can also click the \"unsubscribe\" link in an email to opt out."
    },
    "form": {
      "i_want_to_receive_a_daily_reminder_email": "I want to receive a daily reminder email.",
      "reminder_time": "Reminder Time",
      "save_preferences": "Save Preferences"
    },
    "messaging": {
      "please_choose_a_time": "Please choose a time to receive a reminder",
      "reminder_settings_updated_successfully": "Reminder settings updated successfully.",
      "an_unknown_error_occurred": "An unknown error occurred."
    }
  },
  "es": {
    "reminder": "Recordatorio",
    "info": {
      "p1a": "Puede establecer una hora para recibir un correo electrónico de recordatorio diario.",
      "p1b": "Debe marcar la casilla de abajo y guardar sus preferencias para comenzar a recibir correos electrónicos.",
      "p2a": "Si ya no desea recibir estos correos electrónicos, simplemente desmarque la casilla de abajo y guarde sus preferencias.",
      "p2b": "También puede hacer clic en el enlace \"cancelar suscripción\" en un correo electrónico para cancelar la suscripción."
    },
    "form": {
      "i_want_to_receive_a_daily_reminder_email": "Quiero recibir un correo electrónico de recordatorio diario.",
      "reminder_time": "Hora del recordatorio",
      "save_preferences": "Guardar preferencias"
    },
    "messaging": {
      "please_choose_a_time": "Por favor, elija una hora para recibir un recordatorio",
      "reminder_settings_updated_successfully": "Configuración de recordatorio actualizada correctamente.",
      "an_unknown_error_occurred": "Ocurrió un error desconocido."
    }
  },
  "fr": {
    "reminder": "Rappel",
    "info": {
      "p1a": "Vous pouvez définir une heure pour recevoir un email de rappel quotidien.",
      "p1b": "Vous devez cocher la case ci-dessous et enregistrer vos préférences pour commencer à recevoir des emails.",
      "p2a": "Si vous ne souhaitez plus recevoir ces emails, il vous suffit de décocher la case ci-dessous et d'enregistrer vos préférences.",
      "p2b": "Vous pouvez également cliquer sur le lien \"se désabonner\" dans un email pour vous désinscrire."
    },
    "form": {
      "i_want_to_receive_a_daily_reminder_email": "Je veux recevoir un email de rappel quotidien.",
      "reminder_time": "Heure de rappel",
      "save_preferences": "Enregistrer les préférences"
    },
    "messaging": {
      "please_choose_a_time": "Veuillez choisir une heure pour recevoir un rappel",
      "reminder_settings_updated_successfully": "Paramètres de rappel mis à jour avec succès.",
      "an_unknown_error_occurred": "Une erreur inconnue est survenue."
    }
  },
  "pt": {
    "reminder": "Lembrete",
    "info": {
      "p1a": "Você pode definir um horário para receber um e-mail de lembrete diário.",
      "p1b": "Você deve marcar a caixa abaixo e salvar suas preferências para começar a receber e-mails.",
      "p2a": "Se você não deseja mais receber esses e-mails, basta desmarcar a caixa abaixo e salvar suas preferências.",
      "p2b": "Você também pode clicar no link \"cancelar inscrição\" em um e-mail para cancelar."
    },
    "form": {
      "i_want_to_receive_a_daily_reminder_email": "Desejo receber um e-mail de lembrete diário.",
      "reminder_time": "Horário do Lembrete",
      "save_preferences": "Salvar Preferências"
    },
    "messaging": {
      "please_choose_a_time": "Por favor, escolha um horário para receber um lembrete",
      "reminder_settings_updated_successfully": "Configurações de lembrete atualizadas com sucesso.",
      "an_unknown_error_occurred": "Ocorreu um erro desconhecido."
    }
  },
  "uk": {
    "reminder": "Нагадування",
    "info": {
      "p1a": "Ви можете встановити час для отримання щоденного листа нагадування.",
      "p1b": "Ви повинні відмітити прапорець нижче та зберегти свої налаштування, щоб почати отримувати електронну пошту.",
      "p2a": "Якщо ви більше не бажаєте отримувати ці листи, просто зніміть прапорець нижче та збережіть свої налаштування.",
      "p2b": "Ви також можете натиснути посилання \"відписатися\" в електронному листі, щоб відмовитися."
    },
    "form": {
      "i_want_to_receive_a_daily_reminder_email": "Я хочу отримувати щоденний лист нагадування.",
      "reminder_time": "Час нагадування",
      "save_preferences": "Зберегти налаштування"
    },
    "messaging": {
      "please_choose_a_time": "Будь ласка, виберіть час для отримання нагадування",
      "reminder_settings_updated_successfully": "Налаштування нагадування успішно оновлено.",
      "an_unknown_error_occurred": "Сталася невідома помилка."
    }
  }
}
</i18n>
