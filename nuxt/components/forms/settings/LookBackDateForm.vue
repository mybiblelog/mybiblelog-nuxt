<template>
  <div>
    <h2 class="title is-5">
      {{ $t('start_page.look_back_date.title') }}
    </h2>
    <div class="content">
      <p>
        {{ $t('start_page.look_back_date.description') }}
      </p>
      <div class="card" style="background-color: #fafafa; border: 1px solid #dbdbdb; margin-bottom: 1.5rem;">
        <div class="card-content" style="padding: 1rem;">
          <p style="margin-bottom: 0.75rem;">
            {{ $t('start_page.look_back_date.welcome_message') }}
          </p>
          <div class="field">
            <div class="control">
              <div class="formatted-date">
                {{ displayDate(lookBackDate) }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <p>
        {{ $t('start_page.look_back_date.explanation.1') }}
      </p>
      <p>
        {{ $t('start_page.look_back_date.explanation.2') }}
      </p>
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
  },
  data() {
    return {
      lookBackDate: this.initialValue || dayjs().format('YYYY-MM-DD'),
    };
  },
  watch: {
    initialValue(newValue) {
      if (newValue) {
        this.lookBackDate = newValue;
      }
    },
  },
  methods: {
    displayDate(dateString) {
      const date = dayjs(dateString).toDate();
      const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };
      return date.toLocaleDateString(this.$i18n.locale, options);
    },
    handlePrevious() {
      this.$emit('previous');
    },
    handleSubmit() {
      this.$emit('next');
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
        "description": "Ihr Rückblickdatum ist der erste Tag Ihres Lesetrackers. Es beginnt als das Datum, an dem Sie Ihr Konto erstellt haben.",
        "explanation": {
          "1": "Wenn My Bible Log Ihren Fortschritt anzeigt, ignoriert es Ihre Lektüre vor diesem Datum. Sie können dies jederzeit auf das aktuelle Datum setzen, wenn Sie Ihren Lesetracker neu starten möchten.",
          "2": "Sie verlieren keine Lektüre, die Sie bereits verfolgt haben, wenn Sie dieses Datum zurücksetzen. Sie wird nur von Ihrem aktuellen Fortschritt ausgeblendet."
        },
        "label": "Rückblickdatum",
        "welcome_message": "Ihr Rückblickdatum ist:",
        "change_hint": "Sie können diese Einstellung jederzeit ändern."
      }
    }
  },
  "en": {
    "start_page": {
      "look_back_date": {
        "title": "Look Back Date",
        "description": "Your Look Back Date is the first day of your reading tracker. It starts as the date you created your account.",
        "explanation": {
          "1": "When My Bible Log shows your progress, it will ignore your reading before this date. You can set this to the current date whenever you want to restart your reading tracker.",
          "2": "You won't lose any reading you already tracked if you reset this date. It is only hidden from your current progress."
        },
        "label": "Look Back Date",
        "welcome_message": "Your Look Back Date is:",
        "change_hint": "You can change this setting at any time."
      }
    }
  },
  "es": {
    "start_page": {
      "look_back_date": {
        "title": "Fecha de Revisión",
        "description": "Su Fecha de Revisión es el primer día de su rastreador de lectura. Comienza como la fecha en que creó su cuenta.",
        "explanation": {
          "1": "Cuando My Bible Log muestra su progreso, ignorará su lectura antes de esta fecha. Puede establecer esto en la fecha actual siempre que desee reiniciar su rastreador de lectura.",
          "2": "No perderá ninguna lectura que ya haya rastreado si restablece esta fecha. Solo está oculta de su progreso actual."
        },
        "label": "Fecha de Revisión",
        "welcome_message": "Su Fecha de Revisión es:",
        "change_hint": "Puede cambiar esta configuración en cualquier momento."
      }
    }
  },
  "fr": {
    "start_page": {
      "look_back_date": {
        "title": "Date de retour en arrière",
        "description": "Votre Date de retour en arrière est le premier jour de votre suivi de lecture. Elle commence à la date où vous avez créé votre compte.",
        "explanation": {
          "1": "Lorsque My Bible Log affiche votre progression, il ignorera votre lecture avant cette date. Vous pouvez définir cela à la date actuelle chaque fois que vous souhaitez redémarrer votre suivi de lecture.",
          "2": "Vous ne perdrez aucune lecture que vous avez déjà suivie si vous réinitialisez cette date. Elle est simplement masquée de votre progression actuelle."
        },
        "label": "Date de retour en arrière",
        "welcome_message": "Votre Date de retour en arrière est :",
        "change_hint": "Vous pouvez modifier ce paramètre à tout moment."
      }
    }
  },
  "pt": {
    "start_page": {
      "look_back_date": {
        "title": "Data de Retrocesso",
        "description": "Sua Data de Retrocesso é o primeiro dia do seu rastreador de leitura. Ela começa como a data em que você criou sua conta.",
        "explanation": {
          "1": "Quando My Bible Log mostra seu progresso, ele ignorará sua leitura antes desta data. Você pode definir isso para a data atual sempre que quiser reiniciar seu rastreador de leitura.",
          "2": "Você não perderá nenhuma leitura que já rastreou se redefinir esta data. Ela apenas fica oculta do seu progresso atual."
        },
        "label": "Data de Retrocesso",
        "welcome_message": "Sua Data de Retrocesso é:",
        "change_hint": "Você pode alterar esta configuração a qualquer momento."
      }
    }
  },
  "uk": {
    "start_page": {
      "look_back_date": {
        "title": "Дата перегляду",
        "description": "Ваша Дата перегляду - це перший день вашого трекера читання. Вона починається з дати створення вашого облікового запису.",
        "explanation": {
          "1": "Коли My Bible Log показує ваш прогрес, він ігноруватиме ваше читання до цієї дати. Ви можете встановити це на поточну дату щоразу, коли хочете перезапустити свій трекер читання.",
          "2": "Ви не втратите жодного читання, яке ви вже відстежували, якщо скинете цю дату. Воно лише приховане від вашого поточного прогресу."
        },
        "label": "Дата перегляду",
        "welcome_message": "Ваша Дата перегляду:",
        "change_hint": "Ви можете змінити це налаштування в будь-який час."
      }
    }
  }
}
</i18n>

<style scoped>
.formatted-date {
  padding: 0.5rem;
  background-color: white;
  border: 1px solid #dbdbdb;
  border-radius: 4px;
  font-size: 1rem;
  color: #3273dc;
  font-weight: 600;
}
</style>
