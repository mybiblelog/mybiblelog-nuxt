import type { Options } from '@nuxtjs/i18n';
import { locales, defaultLocale } from '@mybiblelog/shared';

const numberFormats = {
  decimal: {
    style: 'decimal' as const,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  },
  percent: {
    style: 'percent' as const,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  },
  grouped: {
    style: 'decimal' as const,
    useGrouping: true,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  },
};

const i18nConfig: Options = {
  baseUrl: process.env.BASE_URL,
  locales: locales.map(locale => ({
    ...locale,
    file: `${locale.code}.json`,
  })),
  defaultLocale,
  strategy: 'prefix_except_default', // default value, but explicitly set for clarity
  lazy: true,
  langDir: 'locales/global/',
  vueI18n: {
    silentFallbackWarn: true, // for suppressing the warning about missing translations
    fallbackLocale: defaultLocale,
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

export default i18nConfig;
