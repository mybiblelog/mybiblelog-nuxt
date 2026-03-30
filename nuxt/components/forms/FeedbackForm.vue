<template>
  <form @submit.prevent="submitFeedback">
    <div v-if="errors._form" class="help is-danger">
      <div class="help is-danger">
        {{ $terr(errors._form) }}
      </div>
    </div>
    <div class="field">
      <label class="label">{{ $t('your_email') }}</label>
      <div class="control">
        <input v-model="form.email" class="input" type="email" :placeholder="$t('your_email')" :disabled="authStore.loggedIn">
        <div v-if="errors.email" class="help is-danger">
          {{ $terr(errors.email) }}
        </div>
      </div>
    </div>
    <div class="field">
      <label class="label">{{ $t('what_kind_of_feedback') }}</label>
      <div class="control">
        <div class="select">
          <select v-model="form.kind">
            <option value="bug">
              {{ $t('bug_report') }}
            </option>
            <option value="feature">
              {{ $t('feature_request') }}
            </option>
            <option value="comment">
              {{ $t('general_comment') }}
            </option>
          </select>
        </div>
        <div v-if="errors.kind" class="help is-danger">
          {{ $terr(errors.kind) }}
        </div>
      </div>
    </div>
    <div class="field">
      <label class="label">{{ $t('feedback_details') }}</label>
      <div class="control">
        <textarea v-model="form.message" class="textarea" :placeholder="$t('feedback_details')" />
        <div v-if="errors.message" class="help is-danger">
          {{ $terr(errors.message) }}
        </div>
      </div>
    </div>
    <div class="field">
      <div class="control">
        <button class="button is-primary">
          {{ $t('submit_feedback') }}
        </button>
      </div>
    </div>
  </form>
</template>

<script>
import { ApiError, UnknownApiError } from '~/helpers/api-error';
import mapFormErrors from '~/helpers/map-form-errors';
import { useDialogStore } from '~/stores/dialog';
import { useAuthStore } from '~/stores/auth';

export default {
  name: 'FeedbackForm',
  data() {
    const authStore = useAuthStore();
    return {
      form: {
        email: authStore.user?.email || '',
        kind: 'bug',
        message: '',
      },
      errors: {},
    };
  },
  computed: {
    authStore() {
      return useAuthStore();
    },
  },
  methods: {
    async submitFeedback() {
      this.errors = {};
      try {
        await this.$http.post('/api/feedback', {
          email: this.form.email,
          kind: this.form.kind,
          message: this.form.message,
        });

        // Clear the form
        this.form.kind = 'bug';
        this.form.message = '';

        const dialogStore = useDialogStore();
        await dialogStore.alert({ message: this.$t('messaging.feedback_submitted') });

        // Emit success event so parent can handle (e.g., close modal)
        this.$emit('success');
      }
      catch (err) {
        this.errors = (err instanceof ApiError ? mapFormErrors(err) : null) || mapFormErrors(new UnknownApiError());
      }
    },
  },
};
</script>

<style lang="scss" scoped>
//
</style>

<i18n locale="en" lang="json" src="@/locales/sfc/en/components/forms/FeedbackForm.json" />
<i18n locale="de" lang="json" src="@/locales/sfc/de/components/forms/FeedbackForm.json" />
<i18n locale="es" lang="json" src="@/locales/sfc/es/components/forms/FeedbackForm.json" />
<i18n locale="fr" lang="json" src="@/locales/sfc/fr/components/forms/FeedbackForm.json" />
<i18n locale="pt" lang="json" src="@/locales/sfc/pt/components/forms/FeedbackForm.json" />
<i18n locale="uk" lang="json" src="@/locales/sfc/uk/components/forms/FeedbackForm.json" />
