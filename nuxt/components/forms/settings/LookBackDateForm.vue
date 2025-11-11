<template>
  <div>
    <h2 class="title is-5">
      {{ $t('start_page.look_back_date.title') }}
    </h2>
    <div class="content">
      <p>
        {{ $t('start_page.look_back_date.description') }}
      </p>
      <p>
        {{ $t('start_page.look_back_date.explanation.1') }}
      </p>
      <p>
        {{ $t('start_page.look_back_date.explanation.2') }}
      </p>
    </div>

    <div class="field">
      <label class="label">{{ $t('start_page.look_back_date.label') }}</label>
      <div class="control">
        <input
          v-model="lookBackDate"
          class="input"
          type="date"
          :max="maxDate"
        >
      </div>
    </div>

    <div v-if="error" class="help is-danger">
      {{ error }}
    </div>

    <div class="content">
      <p class="help">
        {{ $t('start_page.look_back_date.change_hint') }}
      </p>
    </div>

    <div class="field">
      <div class="control buttons">
        <button class="button" :disabled="isSaving" @click="handlePrevious">
          {{ previousButtonText }}
        </button>
        <button class="button is-info" :disabled="isSaving" @click="handleSubmit">
          {{ nextButtonText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import * as dayjs from 'dayjs';

export default {
  name: 'LookBackDateForm',
  props: {
    initialValue: {
      type: String,
      default: '',
    },
    nextButtonText: {
      type: String,
      default: 'Save and Continue',
    },
    previousButtonText: {
      type: String,
      default: 'Back',
    },
    showToast: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      lookBackDate: this.initialValue || dayjs().format('YYYY-MM-DD'),
      error: '',
      isSaving: false,
    };
  },
  computed: {
    maxDate() {
      return dayjs().add(1, 'day').format('YYYY-MM-DD');
    },
  },
  watch: {
    initialValue(newValue) {
      if (newValue) {
        this.lookBackDate = newValue;
      }
    },
  },
  methods: {
    handlePrevious() {
      this.$emit('previous');
    },
    async handleSubmit() {
      this.error = '';

      if (!this.lookBackDate) {
        this.error = this.$t('messaging.unable_to_save_look_back_date');
        return;
      }

      const selectedDate = dayjs(this.lookBackDate);
      const tomorrow = dayjs().add(1, 'day');

      if (selectedDate.isAfter(tomorrow, 'day')) {
        this.error = this.$t('messaging.unable_to_save_look_back_date');
        return;
      }

      this.isSaving = true;
      const success = await this.$store.dispatch('user-settings/updateSettings', {
        lookBackDate: this.lookBackDate,
      });

      if (success) {
        if (this.showToast) {
          this.$store.dispatch('toast/add', {
            type: 'success',
            text: this.$t('messaging.look_back_date_saved_successfully'),
          });
        }
        this.$emit('saved', this.lookBackDate);
        this.$emit('next');
      }
      else {
        this.error = this.$t('messaging.unable_to_save_look_back_date');
      }

      this.isSaving = false;
    },
  },
};
</script>

<i18n lang="json">
{
  "de": {
    "start_page": {
      "look_back_date": {
        "title": "Rückblickdatum",
        "description": "Ihr Rückblickdatum ist der Tag, an dem Sie begonnen haben, auf Ihr Leseziel hinzuarbeiten. Es beginnt als das Datum, an dem Sie Ihr Konto erstellt haben.",
        "explanation": {
          "1": "Die Fortschrittsbalken von My Bible Log ignorieren Ihre Lektüre vor diesem Datum, sodass Sie dieses Datum zurücksetzen können, um von vorne zu beginnen und Ihre Lektüre erneut zu verfolgen.",
          "2": "Sie verlieren keine Lektüre, die Sie bereits verfolgt haben, wenn Sie dieses Datum zurücksetzen. Sie wird nur von Ihrem Fortschritt ausgeblendet."
        },
        "label": "Rückblickdatum",
        "change_hint": "Sie können diese Einstellung jederzeit ändern."
      }
    },
    "messaging": {
      "look_back_date_saved_successfully": "Rückblickdatum erfolgreich gespeichert.",
      "unable_to_save_look_back_date": "Nicht gespeichert. Bitte geben Sie ein Datum nicht später als morgen ein."
    }
  },
  "en": {
    "start_page": {
      "look_back_date": {
        "title": "Look Back Date",
        "description": "Your Look Back Date is the day you started working toward your reading goal. It starts as the date you created your account.",
        "explanation": {
          "1": "My Bible Log progress bars ignore your reading before this date, so you can reset this date to start over and track your reading again.",
          "2": "You won't lose any reading you already tracked if you reset this date. It is only hidden from your progress."
        },
        "label": "Look Back Date",
        "change_hint": "You can change this setting at any time."
      }
    },
    "messaging": {
      "look_back_date_saved_successfully": "Look back date saved successfully.",
      "unable_to_save_look_back_date": "Unable to save. Please enter a date no later than tomorrow."
    }
  },
  "es": {
    "start_page": {
      "look_back_date": {
        "title": "Fecha de Revisión",
        "description": "Su Fecha de Revisión es el día en que comenzó a trabajar hacia su objetivo de lectura. Comienza como la fecha en que creó su cuenta.",
        "explanation": {
          "1": "Las barras de progreso de My Bible Log ignoran su lectura anterior a esta fecha, por lo que puede restablecer esta fecha para comenzar de nuevo y rastrear su lectura nuevamente.",
          "2": "No perderá ninguna lectura que ya haya registrado si restablece esta fecha. Solo se oculta de su progreso."
        },
        "label": "Fecha de Revisión",
        "change_hint": "Puede cambiar esta configuración en cualquier momento."
      }
    },
    "messaging": {
      "look_back_date_saved_successfully": "Fecha de revisión guardada con éxito.",
      "unable_to_save_look_back_date": "No se puede guardar. Por favor ingrese una fecha no posterior a mañana."
    }
  },
  "fr": {
    "start_page": {
      "look_back_date": {
        "title": "Date de retour en arrière",
        "description": "Votre Date de retour en arrière est le jour où vous avez commencé à travailler vers votre objectif de lecture. Elle commence à la date où vous avez créé votre compte.",
        "explanation": {
          "1": "Les barres de progression de My Bible Log ignorent votre lecture avant cette date, vous permettant de réinitialiser cette date pour recommencer et suivre votre lecture à nouveau.",
          "2": "Vous ne perdrez aucune lecture que vous avez déjà suivie si vous réinitialisez cette date. Elle est simplement masquée de votre progression."
        },
        "label": "Date de retour en arrière",
        "change_hint": "Vous pouvez modifier ce paramètre à tout moment."
      }
    },
    "messaging": {
      "look_back_date_saved_successfully": "Date de recherche en arrière enregistrée avec succès.",
      "unable_to_save_look_back_date": "Impossible d'enregistrer. Veuillez saisir une date au plus tard demain."
    }
  },
  "pt": {
    "start_page": {
      "look_back_date": {
        "title": "Data de Retrocesso",
        "description": "Sua Data de Retrocesso é o dia em que você começou a trabalhar em direção ao seu objetivo de leitura. Ela começa como a data em que você criou sua conta.",
        "explanation": {
          "1": "As barras de progresso do My Bible Log ignoram sua leitura anterior a esta data, permitindo que você redefina esta data para começar de novo e rastrear sua leitura novamente.",
          "2": "Você não perderá nenhuma leitura que já rastreou se redefinir esta data. Ela apenas fica oculta do seu progresso."
        },
        "label": "Data de Retrocesso",
        "change_hint": "Você pode alterar esta configuração a qualquer momento."
      }
    },
    "messaging": {
      "look_back_date_saved_successfully": "Data de retorno salva com sucesso.",
      "unable_to_save_look_back_date": "Não é possível salvar. Por favor, insira uma data até amanhã no máximo."
    }
  },
  "uk": {
    "start_page": {
      "look_back_date": {
        "title": "Дата перегляду",
        "description": "Ваша Дата перегляду - це день, коли ви почали працювати над вашою метою читання. Вона починається з дати створення вашого облікового запису.",
        "explanation": {
          "1": "Смужки прогресу My Bible Log ігнорують ваше читання до цієї дати, дозволяючи вам скинути цю дату, щоб почати заново і знову відстежувати ваше читання.",
          "2": "Ви не втратите жодного читання, яке ви вже відстежували, якщо скинете цю дату. Воно лише приховане від вашого прогресу."
        },
        "label": "Дата перегляду",
        "change_hint": "Ви можете змінити це налаштування в будь-який час."
      }
    },
    "messaging": {
      "look_back_date_saved_successfully": "Дата перегляду успішно збережена.",
      "unable_to_save_look_back_date": "Не вдалося зберегти. Будь ласка, введіть дату, яка не пізніше завтра."
    }
  }
}
</i18n>
