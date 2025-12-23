<template>
  <div>
    <div :class="{ 'content-column content': doc?.slug !== 'index' }">
      <nuxt-content :document="doc" />
    </div>
    <content-page-footer />
  </div>
</template>

<script>
export default {
  name: 'ContentPage',
  async asyncData({ $content, params, app, error }) {
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
    const slugSegment = this.doc?.slug === 'index' ? '' : `/${this.doc?.slug}`;

    // Generate hreflang links
    const hreflangLinks = siteLocales.map((locale) => {
      const localePathSegment = locale === 'en' ? '' : `/${locale}`;
      return {
        rel: 'alternate',
        hreflang: locale,
        href: `${this.$config.siteUrl}${localePathSegment}${slugSegment}`,
      };
    });

    // Add x-default hreflang
    hreflangLinks.push({
      rel: 'alternate',
      hreflang: 'x-default',
      href: `${this.$config.siteUrl}${slugSegment}`,
    });

    // Generate structured data
    let structuredData = null;
    if (this.doc?.slug === 'index') {
      structuredData = {
        type: 'application/ld+json',
        json: {
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: this.doc?.ld_json?.name,
          description: this.doc?.ld_json?.description,
          applicationCategory: 'EducationalApplication',
          operatingSystem: 'Any',
          browserRequirements: 'Any modern web browser',
          softwareVersion: '1.0',
          url: this.$config.siteUrl,
          screenshot: [
            `${this.$config.siteUrl}/screenshots/sc7-bible-progress.jpg`,
            `${this.$config.siteUrl}/screenshots/sc12-checklist.jpg`,
            `${this.$config.siteUrl}/screenshots/sc10-notes.jpg`,
            `${this.$config.siteUrl}/screenshots/sc9-calendar.jpg`,
            `${this.$config.siteUrl}/screenshots/sc4-daily-goal.jpg`,
          ],
          offers: {
            '@type': 'Offer',
            price: 'Free',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
            url: this.$config.siteUrl,
          },
        },
      };
    }

    return {
      title: this.doc?.seo?.title,
      link: [
        { rel: 'canonical', href: `${this.$config.siteUrl}${localePathSegment}${slugSegment}` },
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
      script: [
        ...(structuredData ? [structuredData] : []),
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
