<template>
  <div>
    <h2 class="title is-5">
      {{ $t('start_page.welcome.title') }}
    </h2>
    <div class="content">
      <p>
        {{ $t('start_page.welcome.description') }}
      </p>
    </div>
    <div class="field">
      <div class="control">
        <button class="button is-info" @click="handleNext">
          {{ buttonText }}
        </button>
      </div>
    </div>
    <div class="field">
      <div class="control">
        <button class="button" @click="handleSkip">
          {{ $t('start_page.welcome.skip_personalization') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { useUserSettingsStore } from '~/stores/user-settings';

export default {
  name: 'WelcomeStep',
  props: {
    buttonText: {
      type: String,
      default: 'Next',
    },
  },
  methods: {
    handleNext() {
      this.$emit('next');
    },
    async handleSkip() {
      const success = await useUserSettingsStore().updateSettings({
        startPage: 'today',
      });
      if (success) {
        window.location.reload();
      }
    },
  },
};
</script>

<i18n locale="en" lang="json" src="@/locales/sfc/en/components/forms/settings/WelcomeStep.json" />
<i18n locale="de" lang="json" src="@/locales/sfc/de/components/forms/settings/WelcomeStep.json" />
<i18n locale="es" lang="json" src="@/locales/sfc/es/components/forms/settings/WelcomeStep.json" />
<i18n locale="fr" lang="json" src="@/locales/sfc/fr/components/forms/settings/WelcomeStep.json" />
<i18n locale="pt" lang="json" src="@/locales/sfc/pt/components/forms/settings/WelcomeStep.json" />
<i18n locale="uk" lang="json" src="@/locales/sfc/uk/components/forms/settings/WelcomeStep.json" />
