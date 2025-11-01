const path = require('node:path');
const dotenv = require('dotenv');
const redirectSSL = require('redirect-ssl');
const sass = require('sass');
const i18nConfig = require('./i18n.config');

dotenv.config({
  path: path.resolve(__dirname, '../.env'),
});

module.exports = {
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
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    '@nuxtjs/auth',
    // Doc: https://www.npmjs.com/package/@nuxtjs/style-resources
    '@nuxtjs/style-resources',
    // Doc: https://www.npmjs.com/package/@nuxtjs/redirect-module
    '@nuxtjs/redirect-module',
    // Doc: https://content.nuxtjs.org/
    '@nuxt/content',
    // Doc: https://github.com/nuxt-community/robots-module#readme
    '@nuxtjs/robots',
    // Doc: https://i18n.nuxtjs.org/
    '@nuxtjs/i18n',
  ],
  auth: {
    plugins: [
      // Registers a plugin like the top-level `plugins` array,
      // but allows this plugin to access `context.app.$auth`
      '~/plugins/nuxt-client-init.client.js',
      '~/plugins/auth-i18n-redirect.js',
    ],
    strategies: {
      local: {
        endpoints: {
          login: { url: '/api/auth/login', method: 'post', propertyName: 'token' },
          logout: { url: '/api/auth/logout', method: 'post' },
          user: { url: '/api/auth/user', method: 'get', propertyName: 'user' },
        },
        tokenRequired: true,
        tokenType: 'Bearer',
        autoFetchUser: true,
      },
    },
  },
  i18n: i18nConfig,
  styleResources: {
    scss: ['./assets/scss/_variables.scss'],
  },
  /*
  ** Axios module configuration
  ** See https://axios.nuxtjs.org/options
  */
  axios: {
    proxy: true,
    baseURL: process.env.SITE_URL,
  },
  /*
  ** Proxy
  */
  proxy: {
    '/api': {
      target: process.env.API_BASE_URL || 'http://localhost:8080',
    },
  },
  router: {
    middleware: [
      'auth',
    ],
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
    // Related issue: https://github.com/axios/axios/issues/5243
    transpile: [({ isLegacy }) => isLegacy && 'axios'],
    loaders: {
      scss: {
        implementation: sass,
        additionalData: '@use "sass:math"; @use "sass:color";',
        sassOptions: {
          sourceMap: true,
          includePaths: ['./assets/scss'],
        },
      },
    },
  },
  serverMiddleware: [
    // Force HTTPS in production
    redirectSSL.create({
      enabled: (
        process.env.NODE_ENV === 'production' &&
        process.env.SITE_URL.includes('https://')
      ),
    }),
  ],
  // New runtime config
  publicRuntimeConfig: {
    siteTitle: 'My Bible Log',
    siteUrl: process.env.SITE_URL,
    requireEmailVerification: process.env.REQUIRE_EMAIL_VERIFICATION !== 'false',
    googleAnalytics4MeasurementId: process.env.GA_MEASUREMENT_ID,
    axios: {
      browserBaseURL: process.env.SITE_URL,
    },
  },
  privateRuntimeConfig: {
    axios: {
      baseURL: process.env.SITE_URL,
    },
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
