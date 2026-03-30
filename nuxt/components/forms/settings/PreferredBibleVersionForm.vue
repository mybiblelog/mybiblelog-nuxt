<template>
  <div>
    <h2 class="title is-5">
      {{ $t('start_page.preferred_bible_version.title') }}
    </h2>

    <div class="box field-box">
      <div class="field">
        <label class="label">{{ $t('start_page.preferred_bible_version.translation_label') }}</label>
        <div class="control">
          <div class="select">
            <select v-model="preferredBibleVersion">
              <option value="" selected="selected" disabled="disabled">
                {{ $t('select_an_option') }}
              </option>
              <option
                v-for="option in bibleVersionOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.text }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <div class="box field-box">
      <div class="field">
        <label class="label">{{ $t('start_page.preferred_bible_version.app_label') }}</label>
        <div class="control">
          <div class="select">
            <select v-model="preferredBibleApp">
              <option value="" selected="selected" disabled="disabled">
                {{ $t('select_an_option') }}
              </option>
              <option
                v-for="option in bibleAppOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.text }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <div v-if="error" class="help is-danger">
      {{ error }}
    </div>

    <div class="content">
      <p class="help">
        {{ $t('start_page.preferred_bible_version.change_hint') }}
      </p>
    </div>

    <div class="field">
      <div class="control buttons">
        <button class="button" :disabled="isSaving" @click="handlePrevious">
          {{ previousButtonText }}
        </button>
        <button class="button is-info" :disabled="isSaving || !preferredBibleVersion || !preferredBibleApp" @click="handleSubmit">
          {{ nextButtonText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { BibleVersions, BibleApps } from '@mybiblelog/shared';
import { useToastStore } from '~/stores/toast';
import { useUserSettingsStore } from '~/stores/user-settings';

const bibleVersionNames = {
  [BibleVersions.NASB2020]: 'New American Standard Bible (NASB)',
  [BibleVersions.NASB1995]: 'New American Standard Bible 1995 (NASB 1995)',
  [BibleVersions.AMP]: 'Amplified Bible (AMP)',
  [BibleVersions.KJV]: 'King James Version (KJV)',
  [BibleVersions.NKJV]: 'New King James Version (NKJV)',
  [BibleVersions.NIV]: 'New International Version (NIV)',
  [BibleVersions.ESV]: 'English Standard Version (ESV)',
  [BibleVersions.NABRE]: 'New American Bible Revised Edition (NABRE)',
  [BibleVersions.NLT]: 'New Living Translation (NLT)',
  [BibleVersions.TPT]: 'The Passion Translation (TPT)',
  [BibleVersions.MSG]: 'The Message (MSG)',
  [BibleVersions.RVR1960]: 'Reina-Valera 1960 (RVR1960)',
  [BibleVersions.RVR2020]: 'Reina-Valera 2020 (RVR2020)',
  [BibleVersions.UKR]: 'українська (UKRK)',
  [BibleVersions.BDS]: 'Bible du Semeur (BDS)',
  [BibleVersions.LSG]: 'Louis Segond (LSG)',
  [BibleVersions.ARC]: 'Almeida Revista e Corrigida (ARC)',
  [BibleVersions.LUT]: 'Luther 1545 (LUT)',
  [BibleVersions.KRV]: '개역한글 (KRV)',
};

const bibleVersionOptions = Object.keys(bibleVersionNames).map((key) => {
  const value = bibleVersionNames[key];
  return {
    text: value,
    value: key,
  };
});

const bibleAppNames = {
  [BibleApps.BIBLEGATEWAY]: 'Bible Gateway',
  [BibleApps.YOUVERSIONAPP]: 'YouVersion App',
  [BibleApps.BIBLECOM]: 'Bible.com (YouVersion)',
  [BibleApps.BLUELETTERBIBLE]: 'Blue Letter Bible',
  [BibleApps.OLIVETREE]: 'Olive Tree App',
};

const bibleAppOptions = Object.keys(bibleAppNames).map((key) => {
  const value = bibleAppNames[key];
  return {
    text: value,
    value: key,
  };
});

export default {
  name: 'PreferredBibleVersionForm',
  props: {
    initialValue: {
      type: String,
      default: '',
    },
    initialBibleApp: {
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
    showToast: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      preferredBibleVersion: this.initialValue || '',
      preferredBibleApp: this.initialBibleApp || '',
      bibleVersionOptions,
      bibleAppOptions,
      error: '',
      isSaving: false,
    };
  },
  watch: {
    initialValue(newValue) {
      if (newValue) {
        this.preferredBibleVersion = newValue;
      }
    },
    initialBibleApp(newValue) {
      if (newValue) {
        this.preferredBibleApp = newValue;
      }
    },
  },
  methods: {
    handlePrevious() {
      this.$emit('previous');
    },
    async handleSubmit() {
      this.error = '';

      if (!this.preferredBibleVersion) {
        this.error = this.$t('messaging.unable_to_save_preferred_bible_version');
        return;
      }

      if (!this.preferredBibleApp) {
        this.error = this.$t('messaging.unable_to_save_preferred_bible_app');
        return;
      }

      this.isSaving = true;
      const success = await useUserSettingsStore().updateSettings({
        preferredBibleVersion: this.preferredBibleVersion,
        preferredBibleApp: this.preferredBibleApp,
      });

      if (success) {
        if (this.showToast) {
          const toastStore = useToastStore();
          toastStore.add({
            type: 'success',
            text: this.$t('messaging.preferred_bible_settings_saved_successfully'),
          });
        }
        this.$emit('saved', {
          preferredBibleVersion: this.preferredBibleVersion,
          preferredBibleApp: this.preferredBibleApp,
        });
        this.$emit('next');
      }
      else {
        this.error = this.$t('messaging.unable_to_save_preferred_bible_settings');
      }

      this.isSaving = false;
    },
  },
};
</script>

<style scoped>
.field-box {
  margin-bottom: 1.5rem;
}

.field-box .label {
  font-weight: normal;
  margin-bottom: 0.75rem;
}

select {
  max-width: 65vw;
}
</style>

<i18n locale="en" lang="json" src="@/locales/sfc/en/components/forms/settings/PreferredBibleVersionForm.json" />
<i18n locale="de" lang="json" src="@/locales/sfc/de/components/forms/settings/PreferredBibleVersionForm.json" />
<i18n locale="es" lang="json" src="@/locales/sfc/es/components/forms/settings/PreferredBibleVersionForm.json" />
<i18n locale="fr" lang="json" src="@/locales/sfc/fr/components/forms/settings/PreferredBibleVersionForm.json" />
<i18n locale="ko" lang="json" src="@/locales/sfc/ko/components/forms/settings/PreferredBibleVersionForm.json" />
<i18n locale="pt" lang="json" src="@/locales/sfc/pt/components/forms/settings/PreferredBibleVersionForm.json" />
<i18n locale="uk" lang="json" src="@/locales/sfc/uk/components/forms/settings/PreferredBibleVersionForm.json" />
