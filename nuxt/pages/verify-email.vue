<template>
  <main>
    <div class="content-column">
      <h1 class="mbl-title">
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
import { ApiError, UnknownApiError } from '~/helpers/api-error';
import mapFormErrors from '~/helpers/map-form-errors';
import { useAuthStore } from '~/stores/auth';

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
  async mounted() {
    const emailVerificationCode = new URL(window.location.href).searchParams.get('code');
    if (!emailVerificationCode) {
      this.$router.push(this.localePath('/login'));
      return;
    }

    try {
      await this.$http.post(`/api/auth/verify-email`, { code: emailVerificationCode });
      // If successful, automatically log the user in
      await useAuthStore().refreshUser();
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

<style scoped>

</style>

<i18n lang="json">
{
  "en": {
    "verify_email": "Verify Email",
    "verifying_email": "Verifying Email",
    "one_moment_please": "One moment please..."
  },
  "de": {
    "verify_email": "E-Mail bestätigen",
    "verifying_email": "E-Mail wird bestätigt",
    "one_moment_please": "Einen Moment bitte..."
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
  "ko": {
    "verify_email": "이메일 인증",
    "verifying_email": "이메일 인증 진행 중",
    "one_moment_please": "잠시만 기다려주세요..."
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
