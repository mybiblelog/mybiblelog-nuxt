/**
 * Represents all possible errors that can be thrown by the API.
 * These codes are used to map to i18n keys for translation.
 *
 * Keep in sync with locales/locale.d.ts
 * @enum {string}
 */
const I18nError = {
  // Request Input Validation Errors
  Required: 'required',
  NotValid: 'not_valid',
  Unique: 'unique',
  MinLength: 'min_length', // properties.minlength
  MaxLength: 'max_length', // properties.maxlength
  // mongoose also validates enums and numbers, which can be added here
  Review: 'review',

  // Custom Errors
  InvalidLogin: 'invalid_login',
  VerifyEmail: 'verify_email',
  NewEmailRequired: 'new_email_required',
  EmailInUse: 'email_in_use',
  PasswordIncorrect: 'password_incorrect',
  AccountNotFound: 'account_not_found',
  PasswordResetLinkExpired: 'password_reset_link_expired',
  TooManyRequests: 'too_many_requests', // 429
  InvalidRequest: 'invalid_request',
  EmailNotVerified: 'email_not_verified',
  VerificationCodeExpired: 'verification_code_expired',
};

/**
 * Creates an error that can be thrown by the API and translated on the frontend.
 * @param {I18nError} kind
 * @param {string} field
 * @param {object} properties
 */
const makeI18nError = (kind, field, properties = {}) => ({
  kind: `api_error.${kind}`, // prefix for i18n key
  field,
  properties,
});

module.exports = {
  I18nError,
  makeI18nError,
};
