export default ({ app }, inject) => {
  // adds $terr helper to the app context for translating API errors,
  // allowing its use in components and templates
  const $terr = (error, componentProperties = {}) => {
    // String errors are allowed to pass through, allowing the frontend to set pre-translated error messages.
    if (typeof error === 'string') {
      return error;
    }

    // FIXME: The "field" is redundant since it is only accessed in the template, where it is already known.
    //        Removing `field` would simplify things.
    //        It would need to be removed here and in every `makeI18nError` call.
    const { field, kind, properties: errorProperties } = error;

    // Any component can provide additional context, such as the already-translated field name for a form input.
    // For example: $terr(error, { field: $t('label') })
    // This prevents the English word "label" from being used in other translations.
    const result = app.i18n.t(kind, { field, ...errorProperties, ...componentProperties });
    return result;
  };

  inject('terr', $terr);
};
