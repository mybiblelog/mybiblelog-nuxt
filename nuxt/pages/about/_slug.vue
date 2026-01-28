<template>
  <div>
    <article class="content-column content">
      <nuxt-content :document="doc" />
      <template v-if="doc.slug !== 'overview'">
        <br>
        <nuxt-link :to="localePath('/about/overview')">
          {{ $t('back') }}
        </nuxt-link>
      </template>
    </article>
    <content-page-footer />
  </div>
</template>

<script>
export default {
  async asyncData({ $content, params, redirect, app }) {
    try {
      // If slug is empty, redirect to overview
      if (!params.slug) {
        return redirect(app.localePath('/about/overview', app.i18n.locale));
      }
      const doc = await $content(app.i18n.locale, 'about', params.slug).fetch();
      return { doc };
    }
    catch (err) {
      // If the content page doesn't exist, redirect to /about index page
      // This absolutely requires each locale to have an /about/overview page
      return redirect(app.localePath('/about/overview', app.i18n.locale));
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

h1, h2, h3, h4, h5, h6 {
  clear: both;
}

// For content screenshots that look like a phone screen
.phone-frame {
  float: right;
  margin-left: 1rem;
  margin-bottom: 1rem;

  padding: 14px;
  border-radius: 24px;
  background: #fff;

  /* separation */
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow:
    0 10px 25px rgba(0, 0, 0, 0.08),
    0 2px 6px rgba(0, 0, 0, 0.04);

  /* size normalization */
  max-width: 320px;

  img {
    display: block;
    width: 100%;
    height: auto;
    border-radius: 16px;
  }
}
</style>

<i18n lang="json">
{
  "de": {
    "back": "Zurück zur Übersicht von My Bible Log"
  },
  "en": {
    "back": "Go to My Bible Log overview"
  },
  "es": {
    "back": "Volver a la página de My Bible Log"
  },
  "fr": {
    "back": "Retour à la page d'accueil de My Bible Log"
  },
  "pt": {
    "back": "Ir para a visão geral do My Bible Log"
  },
  "uk": {
    "back": "Перейти до огляду My Bible Log"
  }
}
</i18n>
