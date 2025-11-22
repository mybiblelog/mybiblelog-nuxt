<template>
  <main>
    <section class="section">
      <div class="container">
        <div class="columns is-centered">
          <div class="column is-two-thirds-tablet is-half-desktop">
            <h1 class="title">
              {{ $t('verifying_email') }}
            </h1>
            <p v-if="error">
              {{ error }}
            </p>
            <p v-else>
              {{ $t('one_moment_please') }}
            </p>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'VerifyEmailPage',
  data() {
    return {
      error: null,
    };
  },
  computed: {
    ...mapGetters(['isAuthenticated', 'loggedInUser']),
  },
  mounted() {
    const emailVerificationCode = new URL(window.location.href).searchParams.get('code');
    if (!emailVerificationCode) {
      this.$router.push(this.localePath('/login'));
      return;
    }
    this.$axios.get('/api/auth/verify-email/' + emailVerificationCode)
      .then((response) => {
        // If successful, automatically log the user in
        // The auto-login will result in a redirect, but will leave the query in the URL
        // Remove the query manually first
        this.$router.push(this.localePath({ path: this.$route.path, query: { } }));
        const { jwt } = response.data;
        this.$store.dispatch('auth2/setUserToken', jwt);
      })
      .catch((err) => {
        this.error = err.message;
      });
  },
  head() {
    return {
      title: this.$t('verify_email'),
      meta: [
        { hid: 'robots', name: 'robots', content: 'noindex' },
      ],
    };
  },
  middleware: ['auth2'],
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
