<template>
  <main>
    <div class="content-column">
      <h1 class="title">
        {{ $t('signing_in_with_google') }}
      </h1>
    </div>
  </main>
</template>

<script>
import { useAuthStore } from '~/stores/auth';

export default {
  name: 'GoogleLoginPage',
  middleware: ['auth'],
  data() {
    return {
      //
    };
  },
  head() {
    return {
      title: this.$t('page_title'),
    };
  },
  async mounted() {
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    if (code && state) {
      try {
        // Get the user's preferred locale to save as their user settings
        // We saved the user's locale to localStorage on the Login page,
        // allowing us to redirect to the correct locale after login
        // without changing the OAuth2 redirect URL.
        // Otherwise we would need to add a language prefix to the OAuth2 redirect URL,
        // as i18n will interpret the OAuth2 redirect URL as an intentional language switch.
        const defaultLocale = this.$i18n.defaultLocale;
        const loginLocale = localStorage.getItem('login_language');
        const userLocale = loginLocale || defaultLocale;

        await this.$http.post('/api/auth/oauth2/google/verify', {
          code,
          state,
          locale: userLocale,
        });

        // Reload user now that auth cookie should be set
        await useAuthStore().refreshUser();

        // Redirect to the user's preferred locale.
        const redirectUrl = this.localePath('/start', userLocale);
        await this.$router.push(redirectUrl);
      }
      catch (error) {
        console.error('Google OAuth verification failed:', error);
        // Redirect to login page with error
        await this.$router.push(this.localePath('/login?error=oauth_failed'));
      }
    }
    else {
      // Missing required parameters, redirect to login
      await this.$router.push(this.localePath('/login?error=invalid_oauth_response'));
    }
  },
  methods: {
    //
  },
  meta: {
    auth: 'guest',
  },
};
</script>

<style lang="scss" scoped>
//
</style>

<i18n locale="en" lang="json" src="@/locales/sfc/en/pages/google-login.json" />
<i18n locale="de" lang="json" src="@/locales/sfc/de/pages/google-login.json" />
<i18n locale="es" lang="json" src="@/locales/sfc/es/pages/google-login.json" />
<i18n locale="fr" lang="json" src="@/locales/sfc/fr/pages/google-login.json" />
<i18n locale="ko" lang="json" src="@/locales/sfc/ko/pages/google-login.json" />
<i18n locale="pt" lang="json" src="@/locales/sfc/pt/pages/google-login.json" />
<i18n locale="uk" lang="json" src="@/locales/sfc/uk/pages/google-login.json" />
