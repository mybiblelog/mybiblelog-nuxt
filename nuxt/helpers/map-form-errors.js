/**
 * @typedef {Object} ApiErrorDetail
 * @property {string|null} field - Field name for field-level errors. Set to `null` for top-level errors.
 * @property {string} code - Machine-readable i18n-friendly code.
 * @property {Record<string, any>} [properties] - Optional metadata for the error.
 */

/**
 * @typedef {Object} ApiError
 * @property {string} code - Top-level error code.
 * @property {ApiErrorDetail[]} [errors] - Optional array of field errors.
 */

/**
 * Converts a normalized API error structure to a map of form errors.
 * @param {ApiError} error - The API error object.
 * @returns {Record<string, ApiErrorDetail>} A map of field names to error details.
 */
const mapFormErrors = (error) => {
  const formErrors = {};
  if (!error.errors?.length) {
    formErrors._form = error.code;
  }
  return error.errors?.reduce((acc, err) => {
    if (err.field) {
      acc[err.field] = err;
    }
    else {
      acc._form = err;
    }
    return acc;
  }, formErrors) ?? formErrors;
};

export default mapFormErrors;
