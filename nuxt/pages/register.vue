<template>
  <main>
    <section class="section">
      <div class="container">
        <div class="columns is-centered">
          <div class="column is-two-thirds-tablet is-half-desktop">
            <div class="level">
              <div class="level-left">
                <h1 class="title">
                  {{ $t('sign_up') }}
                  <info-link :to="localePath('/about/page-features--login')" />
                </h1>
              </div>
              <div class="level-right">
                <nuxt-link :to="localePath('/login')">
                  {{ $t('have_an_account') }}
                </nuxt-link>
              </div>
            </div>
            <template v-if="formSubmitted">
              <div class="content">
                <p>{{ $t('registration_submitted') }}</p>
              </div>
            </template>
            <template v-else>
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
                <button class="button is-primary">
                  {{ $t('sign_up') }}
                </button>
              </form>
            </template>
            <div class="is-flex mt-6">
              <article class="message is-info">
                <div class="message-header">
                  <p>{{ $t('have_a_google_account') }}</p>
                </div>
                <div class="message-body">
                  {{ $t('sign_in_with_google') }}
                </div>
              </article>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script>
import InfoLink from '@/components/InfoLink';

export default {
  name: 'RegisterPage',
  components: {
    InfoLink,
  },
  middleware: ['auth'],
  asyncData({ $config }) {
    return {
      requireEmailVerification: $config.requireEmailVerification,
    };
  },
  data() {
    return {
      email: null,
      password: null,
      errors: {},
      formSubmitted: false,
      requireEmailVerification: true,
    };
  },
  head() {
    return {
      title: this.$t('register'),
      meta: [
        { hid: 'robots', name: 'robots', content: 'noindex' },
      ],
    };
  },
  methods: {
    onSubmit() {
      this.email = this.email.trim(); // trim accidental spaces
      const { email, password } = this;
      const locale = this.$i18n.locale;
      this.$axios.post('/api/auth/register', { email, password, locale })
        .then((response) => {
          this.formSubmitted = true;

          // if email verification is not required, log the user in:
          if (!this.requireEmailVerification) {
            this.$auth.loginWith('local', {
              data: {
                email: this.email,
                password: this.password,
              },
            });
          }
        })
        .catch((error) => {
          const unknownError = { _form: 'An unknown error occurred.' };
          this.errors = error.response.data.errors || unknownError;
        });
    },
  },
  auth: 'guest',
};
</script>

<style lang="scss" scoped>
//
</style>

<i18n lang="json">
{
  "de": {
    "sign_up": "Registrieren",
    "have_an_account": "Haben Sie bereits ein Konto?",
    "registration_submitted": "Registrierung erfolgreich! Bitte überprüfen Sie Ihre E-Mail für einen Bestätigungslink.",
    "email": "E-Mail",
    "password": "Passwort",
    "have_a_google_account": "Haben Sie ein Google-Konto?",
    "sign_in_with_google": "Sie können sich mit Google anmelden, ohne ein Passwort zu erstellen! Gehen Sie zur Anmeldeseite, um loszulegen."
  },
  "en": {
    "sign_up": "Sign Up",
    "have_an_account": "Have an account?",
    "registration_submitted": "Registration submitted! Please check your email for a verification link.",
    "email": "Email",
    "password": "Password",
    "have_a_google_account": "Have a Google account?",
    "sign_in_with_google": "You can sign in with Google without creating a password! Go to the Sign In page to get started."
  },
  "es": {
    "sign_up": "Registrarse",
    "have_an_account": "¿Ya tienes una cuenta?",
    "registration_submitted": "¡Registro enviado! Por favor, revisa tu correo electrónico para obtener el enlace de verificación.",
    "email": "Correo electrónico",
    "password": "Contraseña",
    "have_a_google_account": "¿Tienes una cuenta de Google?",
    "sign_in_with_google": "¡Puedes iniciar sesión con Google sin crear una contraseña! ¡Ve a la página de inicio de sesión para comenzar!"
  },
  "fr": {
    "sign_up": "S'inscrire",
    "have_an_account": "Vous avez un compte?",
    "registration_submitted": "Inscription soumise! Veuillez vérifier votre e-mail pour un lien de vérification.",
    "email": "E-mail",
    "password": "Mot de passe",
    "have_a_google_account": "Vous avez un compte Google?",
    "sign_in_with_google": "Vous pouvez vous connecter avec Google sans créer de mot de passe! Rendez-vous sur la page de connexion pour commencer."
  },
  "pt": {
    "sign_up": "Inscrever-se",
    "have_an_account": "Já tem uma conta?",
    "registration_submitted": "Inscrição enviada! Por favor, verifique seu e-mail para um link de verificação.",
    "email": "E-mail",
    "password": "Senha",
    "have_a_google_account": "Tem uma conta do Google?",
    "sign_in_with_google": "Você pode entrar com o Google sem criar uma senha! Acesse a página de Login para começar."
  },
  "uk": {
    "sign_up": "Зареєструватися",
    "have_an_account": "Вже маєте обліковий запис?",
    "registration_submitted": "Реєстрація надіслана! Будь ласка, перевірте свою електронну пошту на наявність посилання для підтвердження.",
    "email": "Електронна пошта",
    "password": "Пароль",
    "have_a_google_account": "Маєте обліковий запис Google?",
    "sign_in_with_google": "Ви можете увійти за допомогою Google без створення пароля! Перейдіть на сторінку входу, щоб почати."
  }
}
</i18n>
