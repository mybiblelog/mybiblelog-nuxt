<template>
  <main>
    <div class="content-column content">
      <nuxt-content :document="doc" />
    </div>
    <content-page-footer />
  </main>
</template>

<script>
export default {
  async asyncData({ $content, params, app, error }) {
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

<i18n locale="en" lang="json" src="@/locales/sfc/en/pages/policy/_slug.json" />
<i18n locale="de" lang="json" src="@/locales/sfc/de/pages/policy/_slug.json" />
<i18n locale="es" lang="json" src="@/locales/sfc/es/pages/policy/_slug.json" />
<i18n locale="fr" lang="json" src="@/locales/sfc/fr/pages/policy/_slug.json" />
<i18n locale="ko" lang="json" src="@/locales/sfc/ko/pages/policy/_slug.json" />
<i18n locale="pt" lang="json" src="@/locales/sfc/pt/pages/policy/_slug.json" />
<i18n locale="uk" lang="json" src="@/locales/sfc/uk/pages/policy/_slug.json" />
