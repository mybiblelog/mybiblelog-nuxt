<template>
  <div>
    <h2 class="title is-5">
      {{ $t('start_page.get_started.title') }}
    </h2>
    <div class="content">
      <p>
        {{ $t('start_page.get_started.description') }}
      </p>
    </div>
    <div class="field">
      <div class="control buttons">
        <button class="button is-info is-large" @click="handleGetStarted">
          {{ $t('start_page.get_started.button') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GetStartedStep',
  props: {
    previousButtonText: {
      type: String,
      default: 'Back',
    },
  },
  computed: {
    userSettings() {
      return this.$store.state['user-settings'].settings;
    },
  },
  methods: {
    handlePrevious() {
      this.$emit('previous');
    },
    async handleGetStarted() {
      await this.$store.dispatch('user-settings/updateSettings', { startPage: 'today' });
      this.$router.push('/today');
    },
  },
};
</script>

<style scoped>
.feedback-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background-color: #f5f5f5;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  margin-top: 1rem;
}

.feedback-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  min-width: 56px;
  border-radius: 50%;
  background-color: #7a7a7a; /* Gray background */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  flex-shrink: 0;
}

.feedback-text {
  margin: 0;
  flex: 1;
}

@media screen and (max-width: 768px) {
  .feedback-icon-container {
    width: 48px;
    height: 48px;
    min-width: 48px;
  }

  .feedback-card {
    gap: 0.75rem;
    padding: 0.75rem;
  }
}
</style>

<i18n lang="json">
{
  "de": {
    "start_page": {
      "get_started": {
        "title": "Loslegen",
        "description": "Sie sind fertig eingerichtet! Es ist Zeit, mit dem Lesen zu beginnen.",
        "feedback_hint": "Eine letzte Sache - Sie können Feedback geben, Funktionen anfordern und Fehler melden, indem Sie auf diese Feedback-Schaltfläche in der unteren rechten Ecke klicken.",
        "button": "Los geht's"
      }
    }
  },
  "en": {
    "start_page": {
      "get_started": {
        "title": "Get Started",
        "description": "You're all set up! It's time to start reading.",
        "feedback_hint": "One last thing - you can provide feedback, request features, and report bugs by clicking this feedback button in the bottom right corner.",
        "button": "Let's Go"
      }
    }
  },
  "es": {
    "start_page": {
      "get_started": {
        "title": "Comenzar",
        "description": "¡Todo está listo! Es hora de comenzar a leer.",
        "feedback_hint": "Una última cosa: puede proporcionar comentarios, solicitar funciones e informar errores haciendo clic en este botón de comentarios en la esquina inferior derecha.",
        "button": "Vamos"
      }
    }
  },
  "fr": {
    "start_page": {
      "get_started": {
        "title": "Commencer",
        "description": "Tout est prêt ! Il est temps de commencer à lire.",
        "feedback_hint": "Une dernière chose - vous pouvez fournir des commentaires, demander des fonctionnalités et signaler des bugs en cliquant sur ce bouton de commentaires dans le coin inférieur droit.",
        "button": "Allons-y"
      }
    }
  },
  "pt": {
    "start_page": {
      "get_started": {
        "title": "Começar",
        "description": "Tudo está pronto! É hora de começar a ler.",
        "feedback_hint": "Uma última coisa - você pode fornecer feedback, solicitar recursos e relatar bugs clicando neste botão de feedback no canto inferior direito.",
        "button": "Vamos lá"
      }
    }
  },
  "uk": {
    "start_page": {
      "get_started": {
        "title": "Почніть",
        "description": "Все налаштовано! Час почати читати.",
        "feedback_hint": "Останнє - ви можете надати відгук, запросити функції та повідомити про помилки, натиснувши цю кнопку відгуку в правому нижньому куті.",
        "button": "Поїхали"
      }
    }
  }
}
</i18n>
