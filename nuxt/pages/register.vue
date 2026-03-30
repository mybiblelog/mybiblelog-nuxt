<template>
  <main>
    <div class="content-column">
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
  </main>
</template>

<script>
import InfoLink from '@/components/InfoLink';
import { ApiError, UnknownApiError } from '~/helpers/api-error';
import mapFormErrors from '~/helpers/map-form-errors';
import { useAuthStore } from '~/stores/auth';

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
      email: '',
      password: '',
      errors: {},
      formSubmitted: false,
      requireEmailVerification: true,
    };
  },
  head() {
    return {
      title: this.$t('sign_up'),
      meta: [
        { hid: 'robots', name: 'robots', content: 'noindex' },
      ],
    };
  },
  methods: {
    async onSubmit() {
      this.email = this.email.trim(); // trim accidental spaces
      const { email, password } = this;
      const locale = this.$i18n.locale;

      try {
        await this.$http.post('/api/auth/register', { email, password, locale });
      }
      catch (err) {
        this.errors = (err instanceof ApiError ? mapFormErrors(err) : null) || mapFormErrors(new UnknownApiError());
        return;
      }

      this.formSubmitted = true;

      // if email verification is not required, log the user in:
      if (!this.requireEmailVerification) {
        const authStore = useAuthStore();
        try {
          await authStore.login({ email: this.email, password: this.password });
        }
        catch (error) {
          if (error instanceof ApiError) {
            this.errors = mapFormErrors(error);
          }
          else {
            this.errors = mapFormErrors(new UnknownApiError());
          }
          return;
        }

        this.$router.push(this.localePath('/start', this.$i18n.locale));
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

<i18n locale="en" lang="json" src="@/locales/sfc/en/pages/register.json" />
<i18n locale="de" lang="json" src="@/locales/sfc/de/pages/register.json" />
<i18n locale="es" lang="json" src="@/locales/sfc/es/pages/register.json" />
<i18n locale="fr" lang="json" src="@/locales/sfc/fr/pages/register.json" />
<i18n locale="pt" lang="json" src="@/locales/sfc/pt/pages/register.json" />
<i18n locale="uk" lang="json" src="@/locales/sfc/uk/pages/register.json" />
