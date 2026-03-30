<template>
  <div class="container">
    <h2 class="title is-4">
      {{ $t('change_email') }}
    </h2>
    <template v-if="checkingForEmailChangeRequest">
      <div class="content">
        <p>{{ $t('checking_current_email_settings') }}</p>
      </div>
    </template>
    <template v-else-if="currentChangeEmailRequest">
      <div class="content">
        <p>
          {{ $t('current_request.your_current_email_is') }}
          <br>
          <strong>{{ authStore.user?.email }}</strong>
        </p>
        <p>
          {{ $t('current_request.your_requested_email_is') }}
          <br>
          <strong>{{ currentChangeEmailRequest.newEmail }}</strong>
        </p>
        <p>{{ $t('current_request.check_your_new_email') }}</p>
        <p>{{ $t('current_request.you_can_cancel') }}</p>
        <button class="button is-danger" @click="cancelChangeEmailRequest">
          {{ $t('current_request.cancel_request') }}
        </button>
      </div>
    </template>
    <template v-else>
      <div class="content">
        <p>{{ $t('new_request.enter_new_email') }}</p>
        <p>{{ $t('new_request.you_will_receive_an_email') }}</p>
        <div class="message">
          <div class="message-body">
            {{ $t('new_request.create_password.part_1') }}
            {{ $t('new_request.create_password.part_2') }}
            {{ $t('new_request.create_password.part_3') }}
          </div>
        </div>
      </div>
      <form :disabled="formBusy" @submit.prevent="submitChangeEmail()">
        <div v-if="changeEmailErrors._form" class="help is-danger">
          {{ $terr(changeEmailErrors._form) }}
        </div>
        <div class="field">
          <label class="label" for="newEmail">{{ $t('form.new_email') }}</label>
          <div class="control">
            <input v-model="changeEmailModel.newEmail" class="input" type="email" name="newEmail">
          </div>
          <div v-if="changeEmailErrors.newEmail" class="help is-danger">
            {{ $terr(changeEmailErrors.newEmail, { field: $t('form.new_email') }) }}
          </div>
        </div>
        <div class="field">
          <label class="label" for="password">{{ $t('form.password') }}</label>
          <div class="control">
            <input v-model="changeEmailModel.password" class="input" type="password" name="password">
          </div>
          <div v-if="changeEmailErrors.password" class="help is-danger">
            {{ $terr(changeEmailErrors.password, { field: $t('form.password') }) }}
          </div>
        </div>
        <div class="field">
          <div class="control">
            <button class="button is-primary" type="submit">
              {{ $t('form.change_email') }}
            </button>
          </div>
        </div>
      </form>
    </template>
  </div>
</template>

<script>
import { ApiError, UnknownApiError } from '~/helpers/api-error';
import mapFormErrors from '~/helpers/map-form-errors';
import { useDialogStore } from '~/stores/dialog';
import { useToastStore } from '~/stores/toast';
import { useAuthStore } from '~/stores/auth';

export default {
  name: 'EmailSettingsPage',
  middleware: ['auth'],
  data() {
    return {
      formBusy: false, // if any form was submitted and is awaiting response
      changeEmailModel: { // 'Change Email' form data
        password: '',
        newEmail: '',
      },
      changeEmailErrors: { // 'Change Email' form errors
        _form: '',
        password: '',
        newEmail: '',
      },

      checkingForEmailChangeRequest: true,
      currentChangeEmailRequest: null, // { newEmail: string, expires: number }
    };
  },
  head() {
    return {
      meta: [
        { hid: 'robots', name: 'robots', content: 'noindex' },
      ],
    };
  },
  computed: {
    authStore() {
      return useAuthStore();
    },
  },
  async mounted() {
    await this.checkChangeEmailRequestState();

    window.addEventListener('focus', this.checkChangeEmailRequestState);
  },
  beforeDestroy() {
    window.removeEventListener('focus', this.checkChangeEmailRequestState);
  },
  methods: {
    // Resets 'Change Email' form fields and errors.
    resetChangeEmailForm() {
      Object.assign(this.changeEmailModel, {
        password: '',
        newEmail: '',
      });
      this.resetChangeEmailErrors();
    },

    // Resets 'Change Email' form errors.
    resetChangeEmailErrors() {
      Object.assign(this.changeEmailErrors, {
        _form: '',
        password: '',
        newEmail: '',
      });
    },

    // Checks if there is an email change request in progress
    async checkChangeEmailRequestState() {
      try {
        const { data } = await this.$http.get('/api/auth/change-email');
        if (data?.newEmail) {
          // no `newEmail` means there is no email change request in progress
          this.currentChangeEmailRequest = data;
        }
        else {
          this.currentChangeEmailRequest = null;
        }
      }
      catch {
        this.currentChangeEmailRequest = null;
      }
      finally {
        this.checkingForEmailChangeRequest = false;
      }
    },

    // Submits 'Change Email' form data and handles response.
    async submitChangeEmail() {
      // Disable form and remove previous errors
      this.formBusy = true;
      this.resetChangeEmailErrors();

      const { password, newEmail } = this.changeEmailModel;

      if (!password.length) {
        this.changeEmailErrors.password = this.$t('messaging.enter_your_current_password');
        this.formBusy = false;
        return;
      }

      try {
        await this.$http.post('/api/auth/change-email', {
          password,
          newEmail,
        });
        this.resetChangeEmailForm();
        const toastStore = useToastStore();
        toastStore.add({
          type: 'success',
          text: this.$t('messaging.confirmation_link_sent'),
        });
      }
      catch (err) {
        if (err instanceof ApiError) {
          Object.assign(this.changeEmailErrors, mapFormErrors(err));
        }
        else {
          Object.assign(this.changeEmailErrors, mapFormErrors(new UnknownApiError()));
        }
      }
      finally {
      // Re-enable the form
        this.formBusy = false;
        this.checkChangeEmailRequestState();
      }
    },

    async cancelChangeEmailRequest() {
      const dialogStore = useDialogStore();
      const toastStore = useToastStore();
      this.formBusy = true;
      try {
        const { data } = await this.$http.delete('/api/auth/change-email');
        if (data === true) {
          this.currentChangeEmailRequest = null;
          await dialogStore.alert({ message: this.$t('messaging.your_request_was_cancelled') });
        }
        else {
          toastStore.add({
            type: 'error',
            text: this.$t('messaging.unable_to_cancel_request'),
          });
        }
      }
      catch (err) {
        toastStore.add({
          type: 'error',
          text: this.$t('messaging.something_went_wrong'),
        });
      }
      this.formBusy = false;
    },
  },
};
</script>

<style lang="scss" scoped>
main p {
  margin-bottom: 1rem;
}
</style>

<i18n locale="en" lang="json" src="@/locales/sfc/en/pages/settings/email.json" />
<i18n locale="de" lang="json" src="@/locales/sfc/de/pages/settings/email.json" />
<i18n locale="es" lang="json" src="@/locales/sfc/es/pages/settings/email.json" />
<i18n locale="fr" lang="json" src="@/locales/sfc/fr/pages/settings/email.json" />
<i18n locale="pt" lang="json" src="@/locales/sfc/pt/pages/settings/email.json" />
<i18n locale="uk" lang="json" src="@/locales/sfc/uk/pages/settings/email.json" />
