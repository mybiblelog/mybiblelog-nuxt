<template>
  <main>
    <section class="section">
      <div class="container">
        <div class="columns is-centered">
          <div class="column is-two-thirds-tablet is-half-desktop">
            <h1 class="title">
              {{ $t('start_page.title') }}
            </h1>

            <!-- Progress Indicator -->
            <div class="progress-indicator">
              <p class="has-text-centered">
                {{ $t('start_page.progress', { current: progressTab + 1, total: totalSteps }) }}
              </p>
              <progress
                class="progress is-primary"
                :value="progressTab + 1"
                :max="totalSteps"
              >
                {{ Math.round(((progressTab + 1) / totalSteps) * 100) }}%
              </progress>
            </div>

            <!-- Welcome -->
            <WelcomeStep
              v-if="progressTab === 0"
              :button-text="$t('start_page.welcome.button')"
              @next="handleNext"
            />

            <!-- Daily Verse Count Goal -->
            <DailyVerseCountGoalForm
              v-if="progressTab === 1"
              :initial-value="userSettings.dailyVerseCountGoal"
              :button-text="$t('start_page.save_and_continue')"
              :show-toast="false"
              @next="handleNext"
            />

            <!-- Look Back Date -->
            <LookBackDateForm
              v-if="progressTab === 2"
              :initial-value="userSettings.lookBackDate"
              :button-text="$t('start_page.save_and_continue')"
              :show-toast="false"
              @next="handleNext"
            />

            <!-- Preferred Bible Version -->
            <PreferredBibleVersionForm
              v-if="progressTab === 3"
              :initial-value="userSettings.preferredBibleVersion"
              :button-text="$t('start_page.save_and_continue')"
              :show-toast="false"
              @next="handleNext"
            />

            <!-- Preferred Bible App -->
            <PreferredBibleAppForm
              v-if="progressTab === 4"
              :initial-value="userSettings.preferredBibleApp"
              :button-text="$t('start_page.save_and_continue')"
              :show-toast="false"
              @next="handleNext"
            />

            <!-- Start Page -->
            <StartPageForm
              v-if="progressTab === 5"
              :initial-value="userSettings.startPage || 'today'"
              :button-text="$t('start_page.save_and_continue')"
              :show-toast="false"
              @next="handleNext"
            />

            <!-- Get Started -->
            <GetStartedStep v-if="progressTab === 6" />
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script>
import WelcomeStep from '@/components/forms/settings/WelcomeStep.vue';
import DailyVerseCountGoalForm from '@/components/forms/settings/DailyVerseCountGoalForm.vue';
import LookBackDateForm from '@/components/forms/settings/LookBackDateForm.vue';
import PreferredBibleVersionForm from '@/components/forms/settings/PreferredBibleVersionForm.vue';
import PreferredBibleAppForm from '@/components/forms/settings/PreferredBibleAppForm.vue';
import StartPageForm from '@/components/forms/settings/StartPageForm.vue';
import GetStartedStep from '@/components/forms/settings/GetStartedStep.vue';

export default {
  name: 'StartPage',
  components: {
    WelcomeStep,
    DailyVerseCountGoalForm,
    LookBackDateForm,
    PreferredBibleVersionForm,
    PreferredBibleAppForm,
    StartPageForm,
    GetStartedStep,
  },
  middleware: ['auth'],
  async asyncData({ $axios, app, redirect }) {
    // Redirect to the user's preferred start page if they have one
    const { data } = await $axios.get('/api/settings');
    const { startPage, locale } = data;

    if (startPage !== 'start') {
      // Mapping these individually allows URLs to change separately
      // from the start page names in user settings
      const redirectPath = {
        today: '/today',
        books: '/books',
        checklist: '/checklist',
        calendar: '/calendar',
        notes: '/notes',
      }[startPage];
      if (redirectPath) {
        return redirect(app.localePath(redirectPath, locale));
      }
    }

    return {};
  },
  data() {
    return {
      // 0: Welcome
      // 1: Daily Verse Count Goal
      // 2: Look Back Date
      // 3: Preferred Bible Version
      // 4: Preferred Bible App
      // 5: Start Page
      // 6: Get Started
      progressTab: 0,
      totalSteps: 7,
    };
  },
  async fetch() {
    await this.$store.dispatch('user-settings/loadSettings');
  },
  computed: {
    userSettings() {
      return this.$store.state['user-settings'].settings;
    },
  },
  methods: {
    handleNext() {
      if (this.progressTab < this.totalSteps - 1) {
        this.progressTab += 1;
      }
    },
  },
};
</script>

<style scoped>
.progress-indicator {
  margin-bottom: 2rem;
}

.progress {
  margin-top: 0.5rem;
}
</style>

<i18n lang="json">
{
  "de": {
    "start_page": {
      "title": "Start",
      "progress": "Fortschritt: {current}/{total}",
      "save_and_continue": "Speichern und Fortfahren",
      "welcome": {
        "button": "Einstellungen wählen"
      }
    }
  },
  "en": {
    "start_page": {
      "title": "Start",
      "progress": "Progress: {current}/{total}",
      "save_and_continue": "Save and Continue",
      "welcome": {
        "button": "Choose Settings"
      }
    }
  },
  "es": {
    "start_page": {
      "title": "Inicio",
      "progress": "Progreso: {current}/{total}",
      "save_and_continue": "Guardar y Continuar",
      "welcome": {
        "button": "Elegir Configuración"
      }
    }
  },
  "fr": {
    "start_page": {
      "title": "Démarrer",
      "progress": "Progression : {current}/{total}",
      "save_and_continue": "Enregistrer et Continuer",
      "welcome": {
        "button": "Choisir les Paramètres"
      }
    }
  },
  "pt": {
    "start_page": {
      "title": "Início",
      "progress": "Progresso: {current}/{total}",
      "save_and_continue": "Salvar e Continuar",
      "welcome": {
        "button": "Escolher Configurações"
      }
    }
  },
  "uk": {
    "start_page": {
      "title": "Старт",
      "progress": "Прогрес: {current}/{total}",
      "save_and_continue": "Зберегти та Продовжити",
      "welcome": {
        "button": "Вибрати Налаштування"
      }
    }
  }
}
</i18n>
