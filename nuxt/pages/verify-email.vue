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

<style lang="scss" scoped>
//
</style>

<i18n locale="en" lang="json" src="@/locales/sfc/en/pages/verify-email.json" />
<i18n locale="de" lang="json" src="@/locales/sfc/de/pages/verify-email.json" />
<i18n locale="es" lang="json" src="@/locales/sfc/es/pages/verify-email.json" />
<i18n locale="fr" lang="json" src="@/locales/sfc/fr/pages/verify-email.json" />
<i18n locale="ko" lang="json" src="@/locales/sfc/ko/pages/verify-email.json" />
<i18n locale="pt" lang="json" src="@/locales/sfc/pt/pages/verify-email.json" />
<i18n locale="uk" lang="json" src="@/locales/sfc/uk/pages/verify-email.json" />
