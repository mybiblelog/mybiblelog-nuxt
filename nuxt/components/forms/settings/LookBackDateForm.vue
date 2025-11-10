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
        {{ $t('start_page.look_back_date.explanation') }}
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
        <button class="button is-primary" :disabled="isSaving" @click="handleSubmit">
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
        "description": "Ihr Rückblickdatum ist der Tag, an dem Sie begonnen haben, auf Ihr aktuelles Leseziel hinzuarbeiten.",
        "explanation": "Die meisten My Bible Log-Funktionen ignorieren Ihre Lektüre vor diesem Datum, sodass Sie Ihren Fortschritt jederzeit zurücksetzen und neu starten können. Sie verlieren keine Lektüre, die Sie bereits verfolgt haben, wenn Sie dieses Datum zurücksetzen.",
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
        "description": "Your Look Back Date is the day you started working toward your current reading goal.",
        "explanation": "Most My Bible Log features will ignore your reading from before this date, allowing you to reset your progress and start fresh at any time. You won't lose any reading you already tracked when you reset this date.",
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
        "description": "Su Fecha de Revisión es el día en que comenzó a trabajar hacia su objetivo de lectura actual.",
        "explanation": "La mayoría de las funciones de My Bible Log ignorarán su lectura anterior a esta fecha, lo que le permitirá restablecer su progreso y comenzar de nuevo en cualquier momento. No perderá ninguna lectura que ya haya registrado cuando restablezca esta fecha.",
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
        "description": "Votre Date de retour en arrière est le jour où vous avez commencé à travailler vers votre objectif de lecture actuel.",
        "explanation": "La plupart des fonctionnalités de My Bible Log ignoreront votre lecture avant cette date, vous permettant de réinitialiser votre progression et de recommencer à tout moment. Vous ne perdrez aucune lecture que vous avez déjà suivie lorsque vous réinitialiserez cette date.",
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
        "description": "Sua Data de Retrocesso é o dia em que você começou a trabalhar em direção ao seu objetivo de leitura atual.",
        "explanation": "A maioria dos recursos do My Bible Log ignorará sua leitura anterior a esta data, permitindo que você redefina seu progresso e comece de novo a qualquer momento. Você não perderá nenhuma leitura que já rastreou quando redefinir esta data.",
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
        "description": "Ваша Дата перегляду - це день, коли ви почали працювати над вашою поточною метою читання.",
        "explanation": "Більшість функцій My Bible Log ігноруватимуть ваше читання до цієї дати, дозволяючи вам скинути свій прогрес і почати заново в будь-який час. Ви не втратите жодного читання, яке ви вже відстежували, коли скидаєте цю дату.",
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
