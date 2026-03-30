<template>
  <main>
    <div class="content-column">
      <h1 class="title">
        {{ $t('change_email') }}
      </h1>
      <template v-if="busy">
        <div class="content">
          <p>{{ $t('confirming_your_new_email_address') }}</p>
        </div>
      </template>
      <template v-if="codeExpired">
        <div class="content">
          <p>{{ $t('your_email_change_request_has_expired') }}</p>
          <p>{{ $t('please_go_to_your_settings_and_try_changing_your_email_address_again') }}</p>
        </div>
      </template>
      <template v-if="serverError">
        <div class="content">
          <p>{{ $t('there_was_an_error_changing_your_email_address') }}</p>
          <p v-if="serverError">
            {{ $terr(serverError) }}
          </p>
          <p>{{ $t('please_go_to_your_settings_and_try_changing_your_email_address_again') }}</p>
        </div>
      </template>
    </div>
  </main>
</template>

<script>
import { ApiError, UnknownApiError } from '~/helpers/api-error';
import mapFormErrors from '~/helpers/map-form-errors';
import { useToastStore } from '~/stores/toast';
import { useAuthStore } from '~/stores/auth';

export default {
  name: 'ChangeEmailPage',
  data() {
    return {
      newEmail: '',
      busy: true,
      codeExpired: false,
      serverError: '',
    };
  },
  head() {
    return {
      title: this.$t('change_email'),
      meta: [
        { hid: 'robots', name: 'robots', content: 'noindex' },
      ],
    };
  },
  async mounted() {
    const newEmailVerificationCode = new URL(window.location.href).searchParams.get('code');
    if (!newEmailVerificationCode) {
      this.$router.push(this.localePath('/settings/email'));
      return;
    }

    // Determine if change email code is valid
    let changeEmailRequest;
    try {
      const { data } = await this.$http.get(`/api/auth/change-email/${newEmailVerificationCode}`);
      changeEmailRequest = data;
    }
    catch (err) {
      // If there is no open email change request (404), redirect to the settings page
      // which will show the user's current email address
      this.$router.push(this.localePath('/settings'));
      return;
    }

    const { newEmail, expires } = changeEmailRequest;
    this.newEmail = newEmail;
    if (Date.now() > expires) {
      this.codeExpired = true;
      this.busy = false;
      return;
    }

    // Submit change email code to finalize the update
    try {
      await this.$http.post(`/api/auth/change-email/${newEmailVerificationCode}`);
    }
    catch (err) {
      if (err instanceof ApiError && err.errors?.length) {
        this.serverError = this.$terr(err.errors[0]);
      }
      else {
        this.serverError = mapFormErrors(new UnknownApiError())._form;
      }
      this.busy = false;
      return;
    }

    // Display confirmation toast
    const toastStore = useToastStore();
    toastStore.add({
      type: 'success',
      text: this.$t('your_email_address_was_updated_successfully'),
    });

    // Reload user now that auth cookie should be set
    await useAuthStore().refreshUser();

    // Redirect to the settings page, which displays the current email
    this.$router.push(this.localePath('/settings'));
  },
  // NO auth middleware -- this page will be accessible via email link
  // for both authenticated and unauthenticated users
  auth: false,
};
</script>

<style lang="scss" scoped>
//
</style>

<i18n locale="en" lang="json" src="@/locales/sfc/en/pages/change-email.json" />
<i18n locale="de" lang="json" src="@/locales/sfc/de/pages/change-email.json" />
<i18n locale="es" lang="json" src="@/locales/sfc/es/pages/change-email.json" />
<i18n locale="fr" lang="json" src="@/locales/sfc/fr/pages/change-email.json" />
<i18n locale="ko" lang="json" src="@/locales/sfc/ko/pages/change-email.json" />
<i18n locale="pt" lang="json" src="@/locales/sfc/pt/pages/change-email.json" />
<i18n locale="uk" lang="json" src="@/locales/sfc/uk/pages/change-email.json" />
