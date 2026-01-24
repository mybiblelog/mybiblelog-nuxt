export default ({ app }, inject) => {
  // adds $terr helper to the app context for translating API errors,
  // allowing its use in components and templates
  const $terr = (error, componentProperties = {}) => {
    // String errors are allowed to pass through, allowing the frontend to set pre-translated error messages.
    if (typeof error === 'string') {
      return error;
    }

    const { field, code, properties: errorProperties } = error;

    // Any component can provide additional context, such as the already-translated field name for a form input.
    // For example: $terr(error, { field: $t('label') })
    // This prevents the English word "label" from being used in other translations.
    const result = app.i18n.t(`api_error.${code}`, { field, ...errorProperties, ...componentProperties });
    return result;
  };

  inject('terr', $terr);
};
