<template>
  <main>
    <div class="content-column">
      <h1 class="title">
        {{ $t('feedback_form') }}
      </h1>
      <div class="content">
        <p>{{ $t('feedback_form_intro.p1') }}</p>
        <p>{{ $t('feedback_form_intro.p2') }}</p>
      </div>
      <feedback-form />
    </div>
    <content-page-footer />
  </main>
</template>

<script>
import FeedbackForm from '@/components/forms/FeedbackForm.vue';
import ContentPageFooter from '@/components/content/PageFooter.vue';

export default {
  name: 'FeedbackFormPage',
  components: {
    FeedbackForm,
    ContentPageFooter,
  },
  head() {
    return {
      title: this.$t('feedback_form'),
      meta: [
        { hid: 'robots', name: 'robots', content: 'noindex' },
      ],
    };
  },
  // NO auth middleware -- this page will be accessible
  // for both authenticated and unauthenticated users
  auth: false,
};
</script>

<style lang="scss" scoped>
//
</style>

<i18n locale="en" lang="json" src="@/locales/sfc/en/pages/feedback.json" />
<i18n locale="de" lang="json" src="@/locales/sfc/de/pages/feedback.json" />
<i18n locale="es" lang="json" src="@/locales/sfc/es/pages/feedback.json" />
<i18n locale="fr" lang="json" src="@/locales/sfc/fr/pages/feedback.json" />
<i18n locale="pt" lang="json" src="@/locales/sfc/pt/pages/feedback.json" />
<i18n locale="uk" lang="json" src="@/locales/sfc/uk/pages/feedback.json" />
