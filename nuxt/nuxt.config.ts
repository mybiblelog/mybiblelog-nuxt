import path from 'node:path';
import dotenv from 'dotenv';
import redirectSSL from 'redirect-ssl';
import sass from 'sass';
import i18nConfig from './i18n.config';

import type { NuxtConfig } from '@nuxt/types';

dotenv.config({
  path: path.resolve(__dirname, '../.env'),
  quiet: true,
} as dotenv.DotenvConfigOptions);

const config: NuxtConfig = {
  components: true,
  // Doc: https://nuxt.com/docs/4.x/bridge/configuration
  bridge: {
    typescript: true,
    capi: true,
    nitro: false,
  },
  /*
  ** Headers of the page
  */
  head: {
    htmlAttrs: {
      lang: 'en',
    },
    titleTemplate: (titleChunk) => {
      const siteTitle = 'My Bible Log';
      if (titleChunk && titleChunk !== siteTitle) {
        if (titleChunk.includes(siteTitle)) {
          return titleChunk;
        }
        return `${titleChunk} | ${siteTitle}`;
      }
      return siteTitle;
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Track and gain insights on your Bible reading.' },
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
    ],
  },
  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#fff' },
  /*
  ** Global CSS
  */
  css: [
    '@/assets/scss/main.scss',
  ],
  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    '~/plugins/gtag.client.js',
    '~/plugins/translate-api.js',
    '~/plugins/nuxt-client-init.client.js',
  ],
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
    // Doc: https://github.com/nuxt-community/eslint-module
    '@nuxtjs/eslint-module',
    // Doc: https://pwa.nuxtjs.org/
    '@nuxtjs/pwa',
  ],
  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://www.npmjs.com/package/@nuxtjs/style-resources
    '@nuxtjs/style-resources',
    // Doc: https://nuxt.com/modules/proxy
    '@nuxtjs/proxy',
    // Doc: https://www.npmjs.com/package/@nuxtjs/redirect-module
    '@nuxtjs/redirect-module',
    // Doc: https://content.nuxtjs.org/
    '@nuxt/content',
    // Doc: https://github.com/nuxt-community/robots-module#readme
    '@nuxtjs/robots',
    // Doc: https://i18n.nuxtjs.org/
    '@nuxtjs/i18n',
  ],
  i18n: i18nConfig,
  styleResources: {
    scss: ['./assets/scss/_variables.scss'],
  },
  /*
  ** Proxy
  */
  proxy: {
    '/api': {
      target: process.env.API_BASE_URL || 'http://localhost:8080',
    },
  },
  redirect: [
    // The default locale was unintentionally removed from the i18n config,
    // so /en/ URLs may have been cached or indexed.
    // All /en/ URLs should be redirected to remove the locale prefix.
    { from: '^/en/(.*)$', to: '/$1' },
  ],
  robots: {
    Sitemap: `${process.env.SITE_URL}/api/sitemap.xml`,
    UserAgent: '*',
    Disallow: '',
  },
  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */
    extend(config, ctx) {
      // Webpack alias removed - now using npm workspace package
    },
    loaders: {
      scss: {
        implementation: sass,
        additionalData: '@use "sass:math"; @use "sass:color";',
        sassOptions: {
          sourceMap: true,
          includePaths: ['./assets/scss'],
          silenceDeprecations: ['legacy-js-api'],
        } as sass.Options<'sync'>,
      },
    },
  },
  serverMiddleware: [
    // Force HTTPS in production
    redirectSSL.create({
      enabled: (
        process.env.NODE_ENV === 'production' &&
        process.env.SITE_URL?.includes('https://')
      ),
    }),
  ],
  // New runtime config
  publicRuntimeConfig: {
    siteUrl: process.env.SITE_URL,
    requireEmailVerification: process.env.REQUIRE_EMAIL_VERIFICATION !== 'false',
    googleAnalytics4MeasurementId: process.env.GA_MEASUREMENT_ID,
    // We only use the LocaleObject type, but check for string to appease the type checker
    locales: i18nConfig.locales?.map((locale) => typeof locale === 'string' ? locale : locale.code) || [],
  },
  pwa: {
    manifest: {
      name: 'My Bible Log',
      short_name: 'My Bible Log',
      lang: 'en',
      display: 'standalone',
      theme_color: '#0099FF',
    },
    workbox: {
      runtimeCaching: [
        {
          urlPattern: '.*',
          handler: 'networkFirst',
          method: 'GET',
          strategyOptions: {
            cacheName: 'my-bible-log-cache',
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
      ],
    },
  },
  // Disable telemetry
  telemetry: false,
};

export default config;
