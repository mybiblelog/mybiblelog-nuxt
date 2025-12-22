<template>
  <nuxt-content :document="doc" />
</template>

<script>
export default {
  name: 'ContentPage',
  async asyncData({ $content, params, redirect, app, error }) {
    try {
      const slug = params.slug ?? 'index';
      const doc = await $content(app.i18n.locale, slug).fetch();
      return { doc };
    }
    catch (err) {
      // If the page doesn't exist, return a 404 error
      error({ statusCode: 404, message: 'Page not found' });
    }
  },
  data() {
    return {
      doc: null,
    };
  },
  head({ $config }) {
    const localePathSegment = this.$i18n.locale === 'en' ? '' : `/${this.$i18n.locale}`;
    const siteLocales = $config.locales;

    // Generate hreflang links
    const hreflangLinks = siteLocales.map((locale) => {
      const localePathSegment = locale === 'en' ? '' : `/${locale}`;
      return {
        rel: 'alternate',
        hreflang: locale,
        href: `${this.$config.siteUrl}${localePathSegment}/about/${this.doc?.slug}`,
      };
    });

    // Add x-default hreflang
    hreflangLinks.push({
      rel: 'alternate',
      hreflang: 'x-default',
      href: `${this.$config.siteUrl}/about/${this.doc?.slug}`,
    });

    return {
      title: this.doc?.seo?.title,
      link: [
        { rel: 'canonical', href: `${this.$config.siteUrl}${localePathSegment}/about/${this.doc?.slug}` },
        ...hreflangLinks,
      ],
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: this.doc?.seo?.description,
        },
        {
          hid: 'og:title',
          name: 'og:title',
          content: this.doc?.og?.title || this.doc?.seo?.title,
        },
        {
          hid: 'og:description',
          name: 'og:description',
          content: this.doc?.og?.description || this.doc?.seo?.description,
        },
        {
          hid: 'og:image',
          name: 'og:image',
          content: `${this.$config.siteUrl}/share.jpg`,
        },
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

:root {
  --primary-color: #00aaf9;
  --secondary-color: #0965f7;
  --tertiary-color: #00d1b2;
}
</style>
