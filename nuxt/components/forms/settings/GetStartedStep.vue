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
import { useUserSettingsStore } from '~/stores/user-settings';

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
      return useUserSettingsStore().settings;
    },
  },
  methods: {
    handlePrevious() {
      this.$emit('previous');
    },
    async handleGetStarted() {
      await useUserSettingsStore().updateSettings({ startPage: 'today' });
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

<i18n locale="en" lang="json" src="@/locales/sfc/en/components/forms/settings/GetStartedStep.json" />
<i18n locale="de" lang="json" src="@/locales/sfc/de/components/forms/settings/GetStartedStep.json" />
<i18n locale="es" lang="json" src="@/locales/sfc/es/components/forms/settings/GetStartedStep.json" />
<i18n locale="fr" lang="json" src="@/locales/sfc/fr/components/forms/settings/GetStartedStep.json" />
<i18n locale="pt" lang="json" src="@/locales/sfc/pt/components/forms/settings/GetStartedStep.json" />
<i18n locale="uk" lang="json" src="@/locales/sfc/uk/components/forms/settings/GetStartedStep.json" />
