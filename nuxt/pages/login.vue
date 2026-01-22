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
import mapFormErrors from '~/helpers/map-form-errors';

export default {
  name: 'LoginPage',
  components: {
    GoogleLoginButton,
    InfoLink,
  },
  middleware: ['auth'],
  async asyncData({ $config }) {
    let googleOauth2Url = null;
    try {
      const googleUrlResponse = await fetch(`${$config.siteUrl}/api/auth/oauth2/google/url`);
      const responseData = await googleUrlResponse.json();
      googleOauth2Url = responseData.data.url;
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
      try {
        await this.$store.dispatch('auth/login', {
          email: this.email,
          password: this.password,
        });
      }
      catch (error) {
        const formErrors = mapFormErrors(error);
        this.errors = formErrors;
        this.failedLoginAttempt = true;
        return;
      }

      this.$router.push(this.localePath('/start', this.$i18n.locale));
    },
    async sendPasswordReset() {
      if (!this.email) {
        this.errors.email = 'Your email address is required.';
        return;
      }
      const response = await fetch(`${this.$config.siteUrl}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          credentials: 'include',
        },
        body: JSON.stringify({ email: this.email }),
      });
      if (!response.ok) {
        const responseData = await response.json();
        const unknownError = { _form: 'An unknown error occurred.' };
        if (responseData.error) {
          this.errors = mapFormErrors(responseData.error) || unknownError;
        }
        else {
          this.errors = unknownError;
        }
        return;
      }
      this.passwordResetSubmitted = true;
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

<i18n lang="json">
{
  "de": {
    "sign_in": "Anmelden",
    "need_an_account": "Benötigen Sie ein Konto?",
    "password_reset_link_sent": "Ein Link zum Zurücksetzen des Passworts wurde an Ihre E-Mail-Adresse gesendet.",
    "email": "E-Mail",
    "password": "Passwort",
    "forgot_your_password": "Passwort vergessen? Setzen Sie es per E-Mail zurück."
  },
  "en": {
    "sign_in": "Sign In",
    "need_an_account": "Need an account?",
    "password_reset_link_sent": "A password reset link has been sent to your email address.",
    "email": "Email",
    "password": "Password",
    "forgot_your_password": "Forgot your password? Reset it via email."
  },
  "es": {
    "sign_in": "Iniciar sesión",
    "need_an_account": "¿Necesitas una cuenta?",
    "password_reset_link_sent": "Se ha enviado un enlace de restablecimiento de contraseña a su dirección de correo electrónico.",
    "email": "Correo electrónico",
    "password": "Contraseña",
    "forgot_your_password": "¿Olvidaste tu contraseña? Restablézcalo por correo electrónico."
  },
  "fr": {
    "sign_in": "Se connecter",
    "need_an_account": "Besoin d'un compte?",
    "password_reset_link_sent": "Un lien de réinitialisation de mot de passe a été envoyé à votre adresse e-mail.",
    "email": "Email",
    "password": "Mot de passe",
    "forgot_your_password": "Mot de passe oublié ? Réinitialisez-le via e-mail."
  },
  "pt": {
    "sign_in": "Entrar",
    "need_an_account": "Precisa de uma conta?",
    "password_reset_link_sent": "Um link de redefinição de senha foi enviado para o seu endereço de email.",
    "email": "E-mail",
    "password": "Senha",
    "forgot_your_password": "Esqueceu sua senha? Redefina-a via email."
  },
  "uk": {
    "sign_in": "Увійти",
    "need_an_account": "Потрібен обліковий запис?",
    "password_reset_link_sent": "Посилання на скидання пароля було надіслано на вашу електронну адресу.",
    "email": "Електронна пошта",
    "password": "Пароль",
    "forgot_your_password": "Забули пароль? Скиньте його електронною поштою."
  }
}
</i18n>
