<template>
  <main>
    <div class="content-column">
      <!-- Progress Indicator -->
      <div class="progress-indicator">
        <pill-progress-bar
          :current-step="progressTab + 1"
          :total-steps="totalSteps"
        />
      </div>

      <!-- Welcome -->
      <welcome-step
        v-if="progressTab === 0"
        :button-text="$t('start_page.welcome.button')"
        @next="handleNext"
      />

      <!-- Daily Verse Count Goal -->
      <daily-verse-count-goal-form
        v-if="progressTab === 1"
        :initial-value="userSettings.dailyVerseCountGoal"
        :next-button-text="$t('start_page.save_and_continue')"
        :previous-button-text="$t('start_page.back')"
        :show-toast="false"
        @next="handleNext"
        @previous="handlePrevious"
      />

      <!-- Preferred Bible Version and App -->
      <preferred-bible-version-form
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

    <!-- Get Started Modal -->
    <get-started-modal
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
import { useUserSettingsStore } from '~/stores/user-settings';

export default {
  name: 'StartPage',
  components: {
    WelcomeStep,
    DailyVerseCountGoalForm,
    PreferredBibleVersionForm,
    GetStartedModal,
    PillProgressBar,
  },
  middleware: ['auth'],
  async asyncData({ app, redirect }) {
    // Redirect to the user's preferred start page if they have one
    try {
      const { data } = await app.$http.get('/api/settings');
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
    }
    catch {
      // If settings fail to load, show the start page
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
    await useUserSettingsStore().loadSettings();
  },
  computed: {
    userSettings() {
      return useUserSettingsStore().settings;
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

<i18n locale="en" lang="json" src="@/locales/sfc/en/pages/start.json" />
<i18n locale="de" lang="json" src="@/locales/sfc/de/pages/start.json" />
<i18n locale="es" lang="json" src="@/locales/sfc/es/pages/start.json" />
<i18n locale="fr" lang="json" src="@/locales/sfc/fr/pages/start.json" />
<i18n locale="pt" lang="json" src="@/locales/sfc/pt/pages/start.json" />
<i18n locale="uk" lang="json" src="@/locales/sfc/uk/pages/start.json" />
