<template>
  <main>
    <div class="content-column">
      <header class="page-header">
        <h1 class="title is-3">
          {{ $t('unsubscribe') }}
        </h1>
      </header>
      <div class="content">
        <template v-if="complete">
          <p v-html="$t('success', { email })" />
          <p>
            <nuxt-link class="button is-primary" :to="localePath('/settings/reminder')">
              {{ $t('update_preferences') }}
            </nuxt-link>
          </p>
        </template>
        <template v-else>
          <template v-if="error">
            <p class="has-text-danger">
              {{ $t('client_error.title') }}
            </p>
            <p>{{ $t('client_error.p1') }}</p>
            <p>{{ $t('client_error.p2') }}</p>
            <p>{{ $t('client_error.p3') }}</p>
            <p>
              <nuxt-link class="button is-primary" :to="localePath('/settings/reminder')">
                {{ $t('update_preferences') }}
              </nuxt-link>
            </p>
          </template>
          <template v-else>
            <p>{{ $t('unsubscribing_you') }}</p>
          </template>
        </template>
      </div>
    </div>
  </main>
</template>

<script>
import { ApiError } from '~/helpers/api-error';

export default {
  name: 'ReminderUnsubscribePage',
  data() {
    return {
      reminderUnsubscribeCode: null,
      complete: false,
      error: '',
      email: '',
    };
  },
  head() {
    return {
      meta: [
        { hid: 'robots', name: 'robots', content: 'noindex' },
      ],
    };
  },
  mounted() {
    this.reminderUnsubscribeCode = new URL(window.location.href).searchParams.get('code');
    if (!this.reminderUnsubscribeCode) {
      return this.$router.push(this.localePath('/'));
    }
    this.unsubscribe();
  },
  methods: {
    async unsubscribe() {
      try {
        const { data } = await this.$http.put(`/api/reminders/daily-reminder/unsubscribe/${this.reminderUnsubscribeCode}`);
        this.complete = true;
        this.email = data.email;
      }
      catch (err) {
        if (err instanceof ApiError) {
          this.error = [
            this.$t('server_error.p1'),
            this.$t('server_error.p2'),
            this.$t('server_error.p3'),
          ].join(' ');
        }
        else {
          this.error = this.$t('there_was_an_error');
        }
      }
    },
  },
  auth: false,
};
</script>

<style lang="scss" scoped>
//
</style>

<i18n locale="en" lang="json" src="@/locales/sfc/en/pages/daily-reminder-unsubscribe.json" />
<i18n locale="de" lang="json" src="@/locales/sfc/de/pages/daily-reminder-unsubscribe.json" />
<i18n locale="es" lang="json" src="@/locales/sfc/es/pages/daily-reminder-unsubscribe.json" />
<i18n locale="fr" lang="json" src="@/locales/sfc/fr/pages/daily-reminder-unsubscribe.json" />
<i18n locale="pt" lang="json" src="@/locales/sfc/pt/pages/daily-reminder-unsubscribe.json" />
<i18n locale="uk" lang="json" src="@/locales/sfc/uk/pages/daily-reminder-unsubscribe.json" />
