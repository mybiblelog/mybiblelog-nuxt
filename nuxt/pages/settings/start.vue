<template>
  <div class="container">
    <h2 class="title is-4">
      {{ $t('start_page') }}
    </h2>
    <div class="field has-addons">
      <div class="control">
        <div class="select">
          <select v-model="userSettingsForm.startPage">
            <option value="" selected="selected" disabled="disabled">
              {{ $t('select_an_option') }}
            </option>
            <option v-for="option in startPageOptions" :key="option.value" :value="option.value" :selected="option.value === userSettingsForm.startPage">
              {{ option.text }}
            </option>
          </select>
        </div>
      </div>
      <div class="control">
        <a class="button is-primary" @click="handleStartPageSubmit">{{ $t('save') }}</a>
      </div>
    </div>
    <div v-if="userSettingsErrors.startPage" class="help is-danger">
      {{ $terr(userSettingsErrors.startPage, { field: $t('preferred_start_page.title') }) }}
    </div>
    <p>{{ $t('preferred_start_page.info.1') }}</p>
  </div>
</template>

<script>
import { useToastStore } from '~/stores/toast';
import { useUserSettingsStore } from '~/stores/user-settings';

export default {
  name: 'StartPageSettingsPage',
  middleware: ['auth'],
  data() {
    return {
      userSettingsForm: {
        startPage: '',
      },
      userSettingsErrors: {
        startPage: '',
      },
    };
  },
  head() {
    return {
      meta: [
        { hid: 'robots', name: 'robots', content: 'noindex' },
      ],
    };
  },
  computed: {
    userSettings() {
      return useUserSettingsStore().settings;
    },
    startPageOptions() {
      return [
        // This option can be enabled for development of the "Start" page
        // { text: this.$t('start'), value: 'start' },
        { text: this.$t('today'), value: 'today' },
        { text: this.$t('bible_books'), value: 'books' },
        { text: this.$t('chapter_checklist'), value: 'checklist' },
        { text: this.$t('calendar'), value: 'calendar' },
        { text: this.$t('notes'), value: 'notes' },
      ];
    },
  },
  created() {
    this.userSettingsForm.startPage = this.userSettings.startPage || 'start';
  },
  methods: {
    async handleStartPageSubmit() {
      const { startPage } = this.userSettingsForm;
      const success = await useUserSettingsStore().updateSettings({ startPage });
      if (success) {
        const toastStore = useToastStore();
        toastStore.add({
          type: 'success',
          text: this.$t('messaging.preferred_start_page_saved_successfully'),
        });
      }
      else {
        this.userSettingsErrors.startPage = this.$t('messaging.unable_to_save_preferred_start_page');
      }
    },
  },
};
</script>

<style lang="scss" scoped>
main p {
  margin-bottom: 1rem;
}

select {
  // cap <select> width so it doesn't overflow mobile device
  max-width: 65vw;
}
</style>

<i18n locale="en" lang="json" src="@/locales/sfc/en/pages/settings/start.json" />
<i18n locale="de" lang="json" src="@/locales/sfc/de/pages/settings/start.json" />
<i18n locale="es" lang="json" src="@/locales/sfc/es/pages/settings/start.json" />
<i18n locale="fr" lang="json" src="@/locales/sfc/fr/pages/settings/start.json" />
<i18n locale="ko" lang="json" src="@/locales/sfc/ko/pages/settings/start.json" />
<i18n locale="pt" lang="json" src="@/locales/sfc/pt/pages/settings/start.json" />
<i18n locale="uk" lang="json" src="@/locales/sfc/uk/pages/settings/start.json" />
