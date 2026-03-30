<template>
  <main>
    <div class="content-column">
      <div class="level">
        <div class="level-left">
          <h1 class="title">
            {{ $t('sign_in') }}
            <info-link :to="localePath('/about/page-features--login')" />
          </h1>
        </div>
        <div v-if="!passwordResetSubmitted" class="level-right">
          <nuxt-link :to="localePath('/register')">
            {{ $t('need_an_account') }}
          </nuxt-link>
        </div>
      </div>
      <template v-if="passwordResetSubmitted">
        <p>{{ $t('password_reset_link_sent') }}</p>
      </template>
      <template v-else>
        <div v-if="errors._form" class="help is-danger">
          <div class="help is-danger">
            {{ $terr(errors._form) }}
          </div>
        </div>
        <form @submit.prevent="onSubmit">
          <div class="field">
            <label class="label">{{ $t('email') }}</label>
            <div class="control">
              <input v-model="email" class="input" type="text" :placeholder="$t('email')" :class="{ 'is-danger': errors.email }">
            </div>
            <p v-if="errors.email" class="help is-danger">
              {{ $terr(errors.email) }}
            </p>
          </div>
          <div class="field">
            <label class="label">{{ $t('password') }}</label>
            <div class="control">
              <input v-model="password" class="input" type="password" :placeholder="$t('password')" :class="{ 'is-danger': errors.password }">
              <p v-if="errors.password" class="help is-danger">
                {{ $terr(errors.password) }}
              </p>
            </div>
          </div>
          <div class="buttons">
            <button class="button is-primary">
              {{ $t('sign_in') }}
            </button>
            <button class="button" :class="{ 'is-text': !failedLoginAttempt, 'is-info': failedLoginAttempt }" @click.prevent="sendPasswordReset">
              {{ $t('forgot_your_password') }}
            </button>
          </div>
        </form>
        <div class="is-flex mt-5">
          <google-login-button v-if="googleOauth2Url" :google-oauth2-url="googleOauth2Url" />
        </div>
      </template>
    </div>
  </main>
</template>

<script>
import GoogleLoginButton from '@/components/forms/GoogleLoginButton.vue';
import InfoLink from '@/components/InfoLink';
import { ApiError, UnknownApiError } from '~/helpers/api-error';
import mapFormErrors from '~/helpers/map-form-errors';
import { useAuthStore } from '~/stores/auth';

export default {
  name: 'LoginPage',
  components: {
    GoogleLoginButton,
    InfoLink,
  },
  middleware: ['auth'],
  async asyncData({ app }) {
    let googleOauth2Url = null;
    try {
      const { data } = await app.$http.get('/api/auth/oauth2/google/url');
      googleOauth2Url = data.url;
    }
    catch (error) {
      console.error('Failed to get Google OAuth2 URL:', error);
    }
    return {
      googleOauth2Url,
    };
  },
  data() {
    return {
      email: null,
      password: null,

      errors: {
        email: '',
        password: '',
      },
      failedLoginAttempt: false,
      passwordResetSubmitted: false,

      googleOauth2Url: null,
    };
  },
  head() {
    return {
      title: this.$t('sign_in'),
      meta: [
        { hid: 'robots', name: 'robots', content: 'noindex' },
      ],
    };
  },
  // The localStorage usage here is a workaround for the i18n built-in locale persistence,
  // as i18n will try to infer the user's locale from the Google redirect URL,
  // but we don't change that URL according to locale (to keep things easy for OAuth2).
  // Instead, we store the user's locale in localStorage and use it to re-set the locale
  // when the user comes back to the app at the end of the OAuth2 flow.
  watch: {
    '$i18n.locale'(newVal, oldVal) {
      localStorage.setItem('login_language', newVal);
    },
  },
  mounted() {
    localStorage.setItem('login_language', this.$i18n.locale);
  },
  methods: {
    async onSubmit() {
      const authStore = useAuthStore();
      try {
        await authStore.login({ email: this.email, password: this.password });
      }
      catch (error) {
        if (error instanceof ApiError) {
          this.errors = mapFormErrors(error);
        }
        else {
          this.errors = mapFormErrors(new UnknownApiError());
        }
        this.failedLoginAttempt = true;
        return;
      }

      this.$router.push(this.localePath('/start', this.$i18n.locale));
    },
    async sendPasswordReset() {
      if (!this.email) {
        this.errors.email = this.$t('your_email_address_is_required');
        return;
      }
      try {
        await this.$http.post('/api/auth/reset-password', { email: this.email });
        this.passwordResetSubmitted = true;
      }
      catch (err) {
        this.errors = (err instanceof ApiError ? mapFormErrors(err) : null) || mapFormErrors(new UnknownApiError());
      }
    },
  },
  meta: {
    auth: 'guest',
  },
};
</script>

<style lang="scss" scoped>
//
</style>

<i18n locale="en" lang="json" src="@/locales/sfc/en/pages/login.json" />
<i18n locale="de" lang="json" src="@/locales/sfc/de/pages/login.json" />
<i18n locale="es" lang="json" src="@/locales/sfc/es/pages/login.json" />
<i18n locale="fr" lang="json" src="@/locales/sfc/fr/pages/login.json" />
<i18n locale="pt" lang="json" src="@/locales/sfc/pt/pages/login.json" />
<i18n locale="uk" lang="json" src="@/locales/sfc/uk/pages/login.json" />
