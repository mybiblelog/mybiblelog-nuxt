<template>
  <main>
    <div class="content-column content">
      <nuxt-content :document="doc" />
    </div>
    <content-page-footer
      :links="[
        {text:'Home',destination:'/'},
        {text:'F.A.Q.',destination:'/faq'},
        {text:'Privacy Policy',destination:'/policy/privacy'},
        {text:'Terms and Conditions',destination:'/policy/terms'},
      ]"
    />
  </main>
</template>

<script>
export default {
  async asyncData({ $content, params, redirect, app, error }) {
    try {
      const doc = await $content(app.i18n.locale, 'policy', params.slug).fetch();
      return { doc };
    }
    catch (err) {
      // If the policy page doesn't exist, return a 404 error
      error({ statusCode: 404, message: 'Page not found' });
    }
  },
  data() {
    return {
      doc: null,
    };
  },
  head() {
    return {
      meta: [
        { hid: 'robots', name: 'robots', content: 'noindex' },
      ],
    };
  },
  auth: false,
};
</script>

<style lang="scss">
// This <style> is not scoped because @nuxt/content content is added
// later in the render pipeline after component compilation (still before SSR),
// so the Nuxt/Vue loader doesn't apply scoped styles to it
.icon {
  // override Bulma so @nuxt/content title anchor links don't create empty space
  display: inline !important;
}
</style>

<i18n lang="json">
{
  "de": {
    "back": "Zurück"
  },
  "en": {
    "back": "Back"
  },
  "es": {
    "back": "Atrás"
  },
  "fr": {
    "back": "Retour"
  },
  "pt": {
    "back": "Voltar"
  },
  "uk": {
    "back": "Назад"
  }
}
</i18n>
