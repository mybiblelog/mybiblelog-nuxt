<template>
  <main>
    <section class="section">
      <div class="container">
        <div class="columns is-centered">
          <div class="column is-two-thirds-tablet is-half-desktop">
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

            <!-- Preferred Bible Version and App -->
            <PreferredBibleVersionForm
              v-if="progressTab === 2"
              :initial-value="userSettings.preferredBibleVersion"
              :initial-bible-app="userSettings.preferredBibleApp"
              :next-button-text="$t('start_page.save_and_finish')"
              :previous-button-text="$t('start_page.back')"
              :show-toast="false"
              @next="handleNext"
              @previous="handlePrevious"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Get Started Modal -->
    <GetStartedModal
      :is-visible="showGetStartedModal"
      @close="closeGetStartedModal"
    />
  </main>
</template>

<script>
import WelcomeStep from '@/components/forms/settings/WelcomeStep.vue';
import DailyVerseCountGoalForm from '@/components/forms/settings/DailyVerseCountGoalForm.vue';
import PreferredBibleVersionForm from '@/components/forms/settings/PreferredBibleVersionForm.vue';
import GetStartedModal from '@/components/popups/GetStartedModal.vue';
import PillProgressBar from '@/components/PillProgressBar.vue';
import getCookieToken from '@/helpers/getCookieToken';

export default {
  name: 'StartPage',
  components: {
    WelcomeStep,
    DailyVerseCountGoalForm,
    PreferredBibleVersionForm,
    GetStartedModal,
    PillProgressBar,
  },
  middleware: ['auth2'],
  async asyncData({ app, redirect, req }) {
    const token = getCookieToken(req);
    // Redirect to the user's preferred start page if they have one
    const url = new URL(app.$config.siteUrl); // from nuxt.config.js
    url.pathname = '/api/settings';
    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
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
      // 2: Preferred Bible Version and App
      progressTab: 0,
      totalSteps: 3,
      showGetStartedModal: false,
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
      if (this.progressTab === 2) {
        // Show modal when clicking "Save and Continue" from Preferred Bible Version form
        this.showGetStartedModal = true;
      }
      else if (this.progressTab < this.totalSteps - 1) {
        this.progressTab += 1;
      }
    },
    handlePrevious() {
      if (this.progressTab > 0) {
        this.progressTab -= 1;
      }
    },
    closeGetStartedModal() {
      this.showGetStartedModal = false;
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
      "save_and_continue": "Speichern und Fortfahren",
      "save_and_finish": "Speichern und Fertigstellen",
      "back": "Zurück",
      "welcome": {
        "button": "Meine Einstellungen personalisieren"
      }
    }
  },
  "en": {
    "start_page": {
      "save_and_continue": "Save and Continue",
      "save_and_finish": "Save and Finish",
      "back": "Back",
      "welcome": {
        "button": "Personalize My Settings"
      }
    }
  },
  "es": {
    "start_page": {
      "save_and_continue": "Guardar y Continuar",
      "save_and_finish": "Guardar y Finalizar",
      "back": "Atrás",
      "welcome": {
        "button": "Personalizar Mi Configuración"
      }
    }
  },
  "fr": {
    "start_page": {
      "save_and_continue": "Enregistrer et Continuer",
      "save_and_finish": "Enregistrer et Finir",
      "back": "Retour",
      "welcome": {
        "button": "Personnaliser Mes Paramètres"
      }
    }
  },
  "pt": {
    "start_page": {
      "save_and_continue": "Salvar e Continuar",
      "save_and_finish": "Salvar e Finalizar",
      "back": "Voltar",
      "welcome": {
        "button": "Personalizar Minhas Configurações"
      }
    }
  },
  "uk": {
    "start_page": {
      "save_and_continue": "Зберегти та Продовжити",
      "save_and_finish": "Зберегти та Завершити",
      "back": "Назад",
      "welcome": {
        "button": "Персоналізувати Мої Налаштування"
      }
    }
  }
}
</i18n>
