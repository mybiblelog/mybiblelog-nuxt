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
              <PillProgressBar
                :current-step="progressTab + 1"
                :total-steps="totalSteps"
              />
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
              :next-button-text="$t('start_page.save_and_continue')"
              :previous-button-text="$t('start_page.back')"
              :show-toast="false"
              @next="handleNext"
              @previous="handlePrevious"
            />

            <!-- Look Back Date -->
            <LookBackDateForm
              v-if="progressTab === 2"
              :initial-value="userSettings.lookBackDate"
              :next-button-text="$t('start_page.save_and_continue')"
              :previous-button-text="$t('start_page.back')"
              :show-toast="false"
              @next="handleNext"
              @previous="handlePrevious"
            />

            <!-- Preferred Bible Version -->
            <PreferredBibleVersionForm
              v-if="progressTab === 3"
              :initial-value="userSettings.preferredBibleVersion"
              :next-button-text="$t('start_page.save_and_continue')"
              :previous-button-text="$t('start_page.back')"
              :show-toast="false"
              @next="handleNext"
              @previous="handlePrevious"
            />

            <!-- Preferred Bible App -->
            <PreferredBibleAppForm
              v-if="progressTab === 4"
              :initial-value="userSettings.preferredBibleApp"
              :next-button-text="$t('start_page.save_and_continue')"
              :previous-button-text="$t('start_page.back')"
              :show-toast="false"
              @next="handleNext"
              @previous="handlePrevious"
            />

            <!-- Start Page -->
            <StartPageForm
              v-if="progressTab === 5"
              :initial-value="userSettings.startPage || 'today'"
              :next-button-text="$t('start_page.save_and_continue')"
              :previous-button-text="$t('start_page.back')"
              :show-toast="false"
              @next="handleNext"
              @previous="handlePrevious"
            />

            <!-- Get Started -->
            <GetStartedStep
              v-if="progressTab === 6"
              :previous-button-text="$t('start_page.back')"
              @previous="handlePrevious"
            />
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
import PillProgressBar from '@/components/PillProgressBar.vue';

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
    PillProgressBar,
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
    handlePrevious() {
      if (this.progressTab > 0) {
        this.progressTab -= 1;
      }
    },
  },
};
</script>

<style scoped>
.progress-indicator {
  margin-bottom: 2rem;
}
</style>

<i18n lang="json">
{
  "de": {
    "start_page": {
      "title": "Start",
      "save_and_continue": "Speichern und Fortfahren",
      "back": "Zurück",
      "welcome": {
        "button": "Einstellungen wählen"
      }
    }
  },
  "en": {
    "start_page": {
      "title": "Start",
      "save_and_continue": "Save and Continue",
      "back": "Back",
      "welcome": {
        "button": "Choose Settings"
      }
    }
  },
  "es": {
    "start_page": {
      "title": "Inicio",
      "save_and_continue": "Guardar y Continuar",
      "back": "Atrás",
      "welcome": {
        "button": "Elegir Configuración"
      }
    }
  },
  "fr": {
    "start_page": {
      "title": "Démarrer",
      "save_and_continue": "Enregistrer et Continuer",
      "back": "Retour",
      "welcome": {
        "button": "Choisir les Paramètres"
      }
    }
  },
  "pt": {
    "start_page": {
      "title": "Início",
      "save_and_continue": "Salvar e Continuar",
      "back": "Voltar",
      "welcome": {
        "button": "Escolher Configurações"
      }
    }
  },
  "uk": {
    "start_page": {
      "title": "Старт",
      "save_and_continue": "Зберегти та Продовжити",
      "back": "Назад",
      "welcome": {
        "button": "Вибрати Налаштування"
      }
    }
  }
}
</i18n>
