<template>
  <div class="container">
    <h2 class="title is-4">
      {{ $t('change_password') }}
    </h2>
    <form :disabled="formBusy" @submit.prevent="submitChangePassword()">
      <div v-if="changePasswordErrors._form" class="help is-danger">
        {{ $terr(changePasswordErrors._form) }}
      </div>
      <div class="field">
        <label class="label" for="currentPassword">{{ $t('current_password') }}</label>
        <div class="control">
          <input v-model="changePasswordModel.currentPassword" class="input" type="password" name="currentPassword">
        </div>
        <div v-if="changePasswordErrors.currentPassword" class="help is-danger">
          {{ $terr(changePasswordErrors.currentPassword) }}
        </div>
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
      <div class="field">
        <div class="control">
          <button class="button is-primary" type="submit">
            {{ $t('change_password_button') }}
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { ApiError, UnknownApiError } from '~/helpers/api-error';
import mapFormErrors from '~/helpers/map-form-errors';
import { useToastStore } from '~/stores/toast';

export default {
  name: 'PasswordSettingsPage',
  middleware: ['auth'],
  data() {
    return {
      formBusy: false,
      changePasswordModel: { // 'Change Password' form data
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      },
      changePasswordErrors: { // 'Change Password' form errors
        _form: '',
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      },
    };
  },
  head() {
    return {
      meta: [
        { hid: 'robots', name: 'robots', content: 'noindex' },
      ],
    };
  },
  methods: {
    // Resets 'Change Password' form fields and errors.
    resetChangePasswordForm() {
      Object.assign(this.changePasswordModel, {
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
      this.resetChangePasswordErrors();
    },

    // Resets 'Change Password' form errors.
    resetChangePasswordErrors() {
      Object.assign(this.changePasswordErrors, {
        _form: '',
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    },

    // Submits 'Change Password' form data and handles response.
    async submitChangePassword() {
      // Disable form and remove previous errors
      this.formBusy = true;
      this.resetChangePasswordErrors();

      const { currentPassword, newPassword, confirmNewPassword } = this.changePasswordModel;

      if (!currentPassword.length) {
        this.changePasswordErrors.currentPassword = this.$t('enter_current_password');
        this.formBusy = false;
        return;
      }

      if (confirmNewPassword !== newPassword) {
        this.changePasswordErrors.confirmNewPassword = this.$t('passwords_must_match');
        this.formBusy = false;
        return;
      }

      try {
        await this.$http.put('/api/auth/change-password', {
          currentPassword,
          newPassword,
        });
        this.resetChangePasswordForm();
        const toastStore = useToastStore();
        toastStore.add({
          type: 'success',
          text: this.$t('password_changed_successfully'),
        });
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
};
</script>

<style lang="scss" scoped>
main p {
  margin-bottom: 1rem;
}
</style>

<i18n locale="en" lang="json" src="@/locales/sfc/en/pages/settings/password.json" />
<i18n locale="de" lang="json" src="@/locales/sfc/de/pages/settings/password.json" />
<i18n locale="es" lang="json" src="@/locales/sfc/es/pages/settings/password.json" />
<i18n locale="fr" lang="json" src="@/locales/sfc/fr/pages/settings/password.json" />
<i18n locale="ko" lang="json" src="@/locales/sfc/ko/pages/settings/password.json" />
<i18n locale="pt" lang="json" src="@/locales/sfc/pt/pages/settings/password.json" />
<i18n locale="uk" lang="json" src="@/locales/sfc/uk/pages/settings/password.json" />
