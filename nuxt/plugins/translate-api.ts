import type { Plugin } from '@nuxt/types';

import type { ApiErrorDetail } from '@/helpers/api-error';

type TranslateApiError = string | ApiErrorDetail;
type Terr = (error: TranslateApiError, componentProperties?: Record<string, unknown>) => string;

const plugin: Plugin = (context, inject) => {
  type I18nLike = {
    t: (key: string, params?: Record<string, unknown>) => string;
  };

  // adds $terr helper to the app context for translating API errors,
  // allowing its use in components and templates
  const $terr: Terr = (error, componentProperties = {}) => {
    // String errors are allowed to pass through, allowing the frontend to set pre-translated error messages.
    if (typeof error === 'string') {
      return error;
    }

    const { field, code, properties: errorProperties } = error;

    // Any component can provide additional context, such as the already-translated field name for a form input.
    // For example: $terr(error, { field: $t('label') })
    // This prevents the English word "label" from being used in other translations.
    const i18n = (context.app as unknown as { i18n: I18nLike }).i18n;
    const result = i18n.t(`api_error.${code}`, { field, ...(errorProperties ?? {}), ...componentProperties });
    return result;
  };

  inject('terr', $terr);
};

export default plugin;
