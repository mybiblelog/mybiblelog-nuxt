<template>
  <div class="container">
    <h2 class="title is-4">
      {{ $t('reading') }}
    </h2>
    <h3 class="title is-5">
      {{ $t('daily_verse_count_goal.title') }}
    </h3>
    <div class="field has-addons">
      <div class="control">
        <input v-model="userSettingsForm.dailyVerseCountGoal" class="input" type="number" min="1" max="1111">
      </div>
      <div class="control">
        <a class="button is-primary" @click="handleDailyVerseCountGoalSubmit">{{ $t('save') }}</a>
      </div>
    </div>
    <div v-if="userSettingsErrors.dailyVerseCountGoal" class="help is-danger">
      {{ $terr(userSettingsErrors.dailyVerseCountGoal, { field: $t('daily_verse_count_goal.title')}) }}
    </div>
    <p>{{ $t('daily_verse_count_goal.info.1') }}</p>
    <p>{{ $t('daily_verse_count_goal.info.2', { dailyVerseCountGoal: userSettingsForm.dailyVerseCountGoal || 0, bibleReadingDays }) }}</p>
    <hr>
    <h3 class="title is-5">
      {{ $t('look_back_date.title') }}
    </h3>
    <div class="field has-addons">
      <div class="control">
        <input v-model="userSettingsForm.lookBackDate" class="input" type="date">
      </div>
      <div class="control">
        <a class="button is-primary" @click="handleLookBackDateSubmit">{{ $t('save') }}</a>
      </div>
    </div>
    <div v-if="userSettingsErrors.lookBackDate" class="help is-danger">
      {{ $terr(userSettingsErrors.lookBackDate, { field: $t('look_back_date.title') }) }}
    </div>
    <p>
      {{ $t('look_back_date.info.1') }}
      {{ $t('look_back_date.info.2') }}
      {{ $t('look_back_date.info.3') }}
    </p>
    <p>{{ $t('look_back_date.info.4') }}</p>
    <hr>
    <h3 class="title is-5">
      {{ $t('preferred_bible_version.title') }}
    </h3>
    <div class="field has-addons">
      <div class="control">
        <div class="select">
          <select v-model="userSettingsForm.preferredBibleVersion">
            <option value="" selected="selected" disabled="disabled">
              {{ $t('select_an_option') }}
            </option>
            <option v-for="option in bibleVersionOptions" :key="option.value" :value="option.value" :selected="option.value === userSettingsForm.preferredBibleVersion">
              {{ option.text }}
            </option>
          </select>
        </div>
      </div>
      <div class="control">
        <a class="button is-primary" @click="handlePreferredBibleVersionSubmit">{{ $t('save') }}</a>
      </div>
    </div>
    <div v-if="userSettingsErrors.preferredBibleVersion" class="help is-danger">
      {{ $terr(userSettingsErrors.preferredBibleVersion, { field: $t('preferred_bible_version.title') }) }}
    </div>
    <p>{{ $t('preferred_bible_version.info.1') }}</p>
    <hr>
    <h3 class="title is-5">
      {{ $t('preferred_bible_app.title') }}
    </h3>
    <div class="field has-addons">
      <div class="control">
        <div class="select">
          <select v-model="userSettingsForm.preferredBibleApp">
            <option value="" selected="selected" disabled="disabled">
              {{ $t('select_an_option') }}
            </option>
            <option v-for="option in bibleAppOptions" :key="option.value" :value="option.value" :selected="option.value === userSettingsForm.preferredBibleApp">
              {{ option.text }}
            </option>
          </select>
        </div>
      </div>
      <div class="control">
        <a class="button is-primary" @click="handlePreferredBibleAppSubmit">{{ $t('save') }}</a>
      </div>
    </div>
    <div v-if="userSettingsErrors.preferredBibleApp" class="help is-danger">
      {{ userSettingsErrors.preferredBibleApp }}
    </div>
    <p>{{ $t('preferred_bible_app.info.1') }}</p>
    <div class="message">
      <div class="message-body">
        {{ $t('preferred_bible_app.callout.1') }}
        {{ $t('preferred_bible_app.callout.2') }}
      </div>
    </div>
  </div>
</template>

<script>
import { BibleApps, BibleVersions } from '@mybiblelog/shared';
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
};

const bibleAppNames = {
  [BibleApps.BIBLEGATEWAY]: 'Bible Gateway',
  [BibleApps.YOUVERSIONAPP]: 'YouVersion App',
  [BibleApps.BIBLECOM]: 'Bible.com (YouVersion)',
  [BibleApps.BLUELETTERBIBLE]: 'Blue Letter Bible',
  [BibleApps.OLIVETREE]: 'Olive Tree App',
};

const bibleVersionOptions = Object.keys(bibleVersionNames).map((key) => {
  const value = bibleVersionNames[key];
  return {
    text: value,
    value: key,
  };
});

const bibleAppOptions = Object.keys(bibleAppNames).map((key) => {
  const value = bibleAppNames[key];
  return {
    text: value,
    value: key,
  };
});

export default {
  name: 'ReadingSettingsPage',
  middleware: ['auth'],
  data() {
    return {
      bibleVersionOptions,
      bibleAppOptions,
      userSettingsForm: {
        lookBackDate: '',
        dailyVerseCountGoal: 0,
        preferredBibleVersion: '',
        preferredBibleApp: '',
      },
      userSettingsErrors: {
        lookBackDate: '',
        dailyVerseCountGoal: '',
        preferredBibleVersion: '',
        preferredBibleApp: '',
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
    bibleReadingDays() {
      if (!this.userSettings.dailyVerseCountGoal) {
        return '?';
      }
      const bibleVerseCount = 31102;
      return Math.ceil(bibleVerseCount / this.userSettingsForm.dailyVerseCountGoal);
    },
  },
  created() {
    Object.assign(this.userSettingsForm, this.userSettings);
  },
  methods: {
    async handleDailyVerseCountGoalSubmit() {
      const { dailyVerseCountGoal } = this.userSettingsForm;
      const success = await useUserSettingsStore().updateSettings({ dailyVerseCountGoal });
      if (success) {
        const toastStore = useToastStore();
        toastStore.add({
          type: 'success',
          text: this.$t('messaging.daily_verse_count_goal_saved_successfully'),
        });
      }
      else {
        this.userSettingsErrors.dailyVerseCountGoal = this.$t('messaging.unable_to_save_daily_verse_count_goal');
      }
    },
    async handleLookBackDateSubmit() {
      const { lookBackDate } = this.userSettingsForm;
      const success = await useUserSettingsStore().updateSettings({ lookBackDate });
      if (success) {
        const toastStore = useToastStore();
        toastStore.add({
          type: 'success',
          text: this.$t('messaging.look_back_date_saved_successfully'),
        });
      }
      else {
        this.userSettingsErrors.lookBackDate = this.$t('messaging.unable_to_save_look_back_date');
      }
    },
    async handlePreferredBibleVersionSubmit() {
      const { preferredBibleVersion } = this.userSettingsForm;
      const success = await useUserSettingsStore().updateSettings({ preferredBibleVersion });
      if (success) {
        const toastStore = useToastStore();
        toastStore.add({
          type: 'success',
          text: this.$t('messaging.preferred_bible_version_saved_successfully'),
        });
      }
      else {
        this.userSettingsErrors.preferredBibleVersion = this.$t('messaging.unable_to_save_preferred_bible_version');
      }
    },
    async handlePreferredBibleAppSubmit() {
      const { preferredBibleApp } = this.userSettingsForm;
      const success = await useUserSettingsStore().updateSettings({ preferredBibleApp });
      if (success) {
        const toastStore = useToastStore();
        toastStore.add({
          type: 'success',
          text: this.$t('messaging.preferred_bible_app_saved_successfully'),
        });
      }
      else {
        this.userSettingsErrors.preferredBibleApp = this.$t('messaging.unable_to_save_preferred_bible_app');
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

<i18n locale="en" lang="json" src="@/locales/sfc/en/pages/settings/reading.json" />
<i18n locale="de" lang="json" src="@/locales/sfc/de/pages/settings/reading.json" />
<i18n locale="es" lang="json" src="@/locales/sfc/es/pages/settings/reading.json" />
<i18n locale="fr" lang="json" src="@/locales/sfc/fr/pages/settings/reading.json" />
<i18n locale="pt" lang="json" src="@/locales/sfc/pt/pages/settings/reading.json" />
<i18n locale="uk" lang="json" src="@/locales/sfc/uk/pages/settings/reading.json" />
