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
      <div class="control">
        <button class="button is-primary is-large" @click="handleGetStarted">
          {{ $t('start_page.get_started.button') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GetStartedStep',
  computed: {
    userSettings() {
      return this.$store.state['user-settings'].settings;
    },
  },
  methods: {
    handleGetStarted() {
      const { startPage, locale } = this.userSettings;
      const redirectPath = {
        today: '/today',
        books: '/books',
        checklist: '/checklist',
        calendar: '/calendar',
        notes: '/notes',
      }[startPage] || '/today';

      this.$router.push(this.$localePath(redirectPath, locale));
    },
  },
};
</script>

<i18n lang="json">
{
  "de": {
    "start_page": {
      "get_started": {
        "title": "Loslegen",
        "description": "Sie sind fertig eingerichtet! Es ist Zeit, mit dem Lesen zu beginnen.",
        "button": "Los geht's"
      }
    }
  },
  "en": {
    "start_page": {
      "get_started": {
        "title": "Get Started",
        "description": "You're all set up! It's time to start reading.",
        "button": "Let's Go"
      }
    }
  },
  "es": {
    "start_page": {
      "get_started": {
        "title": "Comenzar",
        "description": "¡Todo está listo! Es hora de comenzar a leer.",
        "button": "Vamos"
      }
    }
  },
  "fr": {
    "start_page": {
      "get_started": {
        "title": "Commencer",
        "description": "Tout est prêt ! Il est temps de commencer à lire.",
        "button": "Allons-y"
      }
    }
  },
  "pt": {
    "start_page": {
      "get_started": {
        "title": "Começar",
        "description": "Tudo está pronto! É hora de começar a ler.",
        "button": "Vamos lá"
      }
    }
  },
  "uk": {
    "start_page": {
      "get_started": {
        "title": "Почніть",
        "description": "Все налаштовано! Час почати читати.",
        "button": "Поїхали"
      }
    }
  }
}
</i18n>
