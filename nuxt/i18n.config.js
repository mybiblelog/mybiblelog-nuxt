const {
  de,
  en,
  es,
  fr,
  pt,
  uk,
} = require('../locales/locales.js');

const numberFormats = {
  decimal: {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  },
  percent: {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  },
  grouped: {
    style: 'decimal',
    useGrouping: true,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  },
};

/**
 * @type {import('@nuxtjs/i18n').ModuleOptions}
 */
const i18nConfig = {
  baseUrl: process.env.BASE_URL,
  locales: [
    // The only place where English is hoisted out of alphabetical order
    { code: 'en', iso: 'en-US', name: 'English' },
    { code: 'de', iso: 'de-DE', name: 'Deutsch' },
    { code: 'es', iso: 'es-ES', name: 'Español' },
    { code: 'fr', iso: 'fr-FR', name: 'Français' },
    { code: 'pt', iso: 'pt-BR', name: 'Português' },
    { code: 'uk', iso: 'uk-UA', name: 'українська' },
  ],
  defaultLocale: 'en',
  vueI18n: {
    silentFallbackWarn: true, // for suppressing the warning about missing translations
    fallbackLocale: 'en',
    messages: {
      de,
      en,
      es,
      fr,
      pt,
      uk,
    },
    numberFormats: {
      en: numberFormats,
      de: numberFormats,
      es: numberFormats,
      fr: numberFormats,
      pt: numberFormats,
      uk: numberFormats,
    },
  },
  vueI18nLoader: true,
  detectBrowserLanguage: {
    useCookie: true,
    cookieKey: 'i18n_redirected',
    alwaysRedirect: true,
    redirectOn: 'root',
  },
};

module.exports = i18nConfig;
