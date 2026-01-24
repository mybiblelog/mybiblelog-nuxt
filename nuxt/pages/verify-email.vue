<template>
  <main>
    <div class="content-column">
      <h1 class="title">
        {{ $t('verifying_email') }}
      </h1>
      <p v-if="error">
        {{ $terr(error) }}
      </p>
      <p v-else>
        {{ $t('one_moment_please') }}
      </p>
    </div>
  </main>
</template>

<script>
import { mapGetters } from 'vuex';
import { ApiError, UnknownApiError } from '~/helpers/api-error';
import mapFormErrors from '~/helpers/map-form-errors';

export default {
  name: 'VerifyEmailPage',
  middleware: ['auth'],
  data() {
    return {
      error: null,
    };
  },
  head() {
    return {
      title: this.$t('verify_email'),
      meta: [
        { hid: 'robots', name: 'robots', content: 'noindex' },
      ],
    };
  },
  computed: {
    ...mapGetters(['isAuthenticated', 'loggedInUser']),
  },
  async mounted() {
    const emailVerificationCode = new URL(window.location.href).searchParams.get('code');
    if (!emailVerificationCode) {
      this.$router.push(this.localePath('/login'));
      return;
    }

    try {
      await this.$http.get(`/api/auth/verify-email/${emailVerificationCode}`);
      // If successful, automatically log the user in
      await this.$store.dispatch('auth/refreshUser');
      await this.$router.push(this.localePath('/start'));
    }
    catch (err) {
      if (err instanceof ApiError) {
        const formErrors = mapFormErrors(err);
        this.error = formErrors._form;
      }
      else {
        this.error = mapFormErrors(new UnknownApiError())._form;
      }
    }
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
    "verify_email": "E-Mail bestätigen",
    "verifying_email": "E-Mail wird bestätigt",
    "one_moment_please": "Einen Moment bitte..."
  },
  "en": {
    "verify_email": "Verify Email",
    "verifying_email": "Verifying Email",
    "one_moment_please": "One moment please..."
  },
  "es": {
    "verify_email": "Verificar correo electrónico",
    "verifying_email": "Verificando correo electrónico",
    "one_moment_please": "Un momento por favor..."
  },
  "fr": {
    "verify_email": "Vérifier l'email",
    "verifying_email": "Vérification de l'email",
    "one_moment_please": "Un instant s'il vous plaît..."
  },
  "pt": {
    "verify_email": "Verificar Email",
    "verifying_email": "Verificando Email",
    "one_moment_please": "Por favor, aguarde um momento..."
  },
  "uk": {
    "verify_email": "Підтвердити електронну пошту",
    "verifying_email": "Підтвердження електронної пошти",
    "one_moment_please": "Зачекайте хвилинку..."
  }
}
</i18n>
