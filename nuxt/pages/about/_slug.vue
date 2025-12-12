<template>
  <div class="content-column">
    <article class="content">
      <nuxt-content :document="doc" />
      <template v-if="doc.slug !== 'overview'">
        <br>
        <nuxt-link :to="localePath('/about/overview')">
          {{ $t('back') }}
        </nuxt-link>
      </template>
    </article>
  </div>
</template>

<script>
import i18nConfig from '../../i18n.config';

export default {
  async asyncData({ $content, params, redirect, app, error }) {
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
  head() {
    const localePathSegment = this.$i18n.locale === 'en' ? '' : `/${this.$i18n.locale}`;
    const siteLocales = i18nConfig.locales.map(locale => locale.code);

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
