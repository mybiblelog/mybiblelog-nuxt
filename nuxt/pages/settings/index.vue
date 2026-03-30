<template>
  <div>
    <div class="container content">
      <h1 class="title is-4">
        {{ $t('account') }}
      </h1>
      <div class="content">
        <p>
          <em>{{ authStore.user?.email }}</em>
        </p>
        <p>
          <nuxt-link class="button is-primary" :to="localePath('/settings/email')">
            {{ $t('change_email') }}
          </nuxt-link>
        </p>
      </div>
      <template v-if="authStore.user?.hasLocalAccount">
        <h2 class="title is-4">
          {{ $t('password') }}
        </h2>
        <div class="content">
          <p>{{ $t('you_can_change_your_password_below') }}</p>
          <p>
            <nuxt-link class="button is-primary" :to="localePath('/settings/password')">
              {{ $t('change_password') }}
            </nuxt-link>
          </p>
        </div>
      </template>
      <h2 class="title is-4">
        {{ $t('delete_account') }}
      </h2>
      <div class="content">
        <p>{{ $t('you_are_in_control') }}</p>
        <p>
          <nuxt-link :to="localePath('/settings/delete-account')">
            {{ $t('learn_more') }}
          </nuxt-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { useUserSettingsStore } from '~/stores/user-settings';
import { useAuthStore } from '~/stores/auth';
import { useAppInitStore } from '~/stores/app-init';

export default {
  name: 'SettingsPage',
  middleware: ['auth'],
  data() {
    return {
    };
  },
  async fetch() {
    await useAppInitStore().loadUserData();
  },
  head() {
    return {
      meta: [
        { hid: 'robots', name: 'robots', content: 'noindex' },
      ],
    };
  },
  computed: {
    authStore() {
      return useAuthStore();
    },
    userSettings() {
      return useUserSettingsStore().settings;
    },
  },
};
</script>

<style lang="scss" scoped>
main p {
  margin-bottom: 1rem;
}
</style>

<i18n locale="en" lang="json" src="@/locales/sfc/en/pages/settings/index.json" />
<i18n locale="de" lang="json" src="@/locales/sfc/de/pages/settings/index.json" />
<i18n locale="es" lang="json" src="@/locales/sfc/es/pages/settings/index.json" />
<i18n locale="fr" lang="json" src="@/locales/sfc/fr/pages/settings/index.json" />
<i18n locale="ko" lang="json" src="@/locales/sfc/ko/pages/settings/index.json" />
<i18n locale="pt" lang="json" src="@/locales/sfc/pt/pages/settings/index.json" />
<i18n locale="uk" lang="json" src="@/locales/sfc/uk/pages/settings/index.json" />
