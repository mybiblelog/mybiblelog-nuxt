<template>
  <main>
    <div class="content-column">
      <h1 class="title">
        {{ $t('reset_password') }}
      </h1>
      <template v-if="passwordResetCodeValid">
        <div class="content">
          <p>{{ $t('once_you_set_a_new_password_you_will_be_automatically_logged_in') }}</p>
        </div>
        <form :disabled="formBusy" @submit.prevent="submitChangePassword()">
          <div v-if="changePasswordErrors._form" class="help is-danger">
            {{ $terr(changePasswordErrors._form) }}
          </div>
          <div class="field">
            <label class="label" for="newPassword">{{ $t('new_password') }}</label>
            <div class="control">
              <input v-model="changePasswordModel.newPassword" class="input" type="password" name="newPassword">
            </div>
            <div v-if="changePasswordErrors.newPassword" class="help is-danger">
              {{ $terr(changePasswordErrors.newPassword) }}
            </div>
          </div>
          <div class="field">
            <label class="label" for="confirmNewPassword">{{ $t('confirm_new_password') }}</label>
            <div class="control">
              <input v-model="changePasswordModel.confirmNewPassword" class="input" type="password" name="confirmNewPassword">
            </div>
            <div v-if="changePasswordErrors.confirmNewPassword" class="help is-danger">
              {{ $terr(changePasswordErrors.confirmNewPassword) }}
            </div>
          </div>
          <button class="button is-primary">
            {{ $t('submit') }}
          </button>
        </form>
      </template>
      <template v-else>
        <div class="content">
          <p>{{ $t('this_password_reset_link_is_expired') }}</p>
          <p>{{ $t('you_can_send_a_new_password_reset_email_from_the_sign_in_page') }}</p>
        </div>
        <nuxt-link class="button" :to="localePath('/login')">
          Sign In
        </nuxt-link>
      </template>
    </div>
  </main>
</template>

<script>
import { ApiError, UnknownApiError } from '~/helpers/api-error';
import mapFormErrors from '~/helpers/map-form-errors';
import { useAuthStore } from '~/stores/auth';

export default {
  name: 'ResetPasswordPage',
  middleware: ['auth'],
  data() {
    return {
      passwordResetCode: undefined,
      passwordResetCodeValid: true,
      formBusy: false,
      changePasswordModel: { // 'Change Password' form data
        newPassword: '',
        confirmNewPassword: '',
      },
      changePasswordErrors: { // 'Change Password' form errors
        _form: '',
        newPassword: '',
        confirmNewPassword: '',
      },
    };
  },
  head() {
    return {
      title: this.$t('reset_password'),
      meta: [
        { hid: 'robots', name: 'robots', content: 'noindex' },
      ],
    };
  },
  async mounted() {
    const passwordResetCode = new URL(window.location.href).searchParams.get('code');
    if (!passwordResetCode) {
      await this.$router.push(this.localePath('/login'));
      return;
    }
    this.passwordResetCode = passwordResetCode;

    // Determine if password reset code is valid
    try {
      const { data } = await this.$http.get(`/api/auth/reset-password/${this.passwordResetCode}/valid`);
      this.passwordResetCodeValid = data.valid;
    }
    catch {
      this.passwordResetCodeValid = false;
    }
  },
  methods: {
    resetChangePasswordErrors() {
      Object.assign(this.changePasswordErrors, {
        _form: '',
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    },
    async submitChangePassword() {
      // Disable form and remove previous errors
      this.formBusy = true;
      this.resetChangePasswordErrors();

      const { newPassword, confirmNewPassword } = this.changePasswordModel;

      if (confirmNewPassword !== newPassword) {
        this.changePasswordErrors.confirmNewPassword = this.$t('passwords_must_match');
        this.formBusy = false;
        return;
      }

      try {
        await this.$http.post(`/api/auth/reset-password/${this.passwordResetCode}`, { newPassword });
        // If successful, automatically log the user in
        await useAuthStore().refreshUser();
        await this.$router.push(this.localePath('/start'));
      }
      catch (err) {
        if (err instanceof ApiError) {
          Object.assign(this.changePasswordErrors, mapFormErrors(err));
        }
        else {
          Object.assign(this.changePasswordErrors, mapFormErrors(new UnknownApiError()));
        }
      }
      finally {
        this.formBusy = false;
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

<i18n locale="en" lang="json" src="@/locales/sfc/en/pages/reset-password.json" />
<i18n locale="de" lang="json" src="@/locales/sfc/de/pages/reset-password.json" />
<i18n locale="es" lang="json" src="@/locales/sfc/es/pages/reset-password.json" />
<i18n locale="fr" lang="json" src="@/locales/sfc/fr/pages/reset-password.json" />
<i18n locale="pt" lang="json" src="@/locales/sfc/pt/pages/reset-password.json" />
<i18n locale="uk" lang="json" src="@/locales/sfc/uk/pages/reset-password.json" />
