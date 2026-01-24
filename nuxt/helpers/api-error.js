export class ApiError extends Error {
  /**
   * Top-level error code.
   * @type {string}
   */
  code;
  /**
   * Array of field-level errors.
   * @type {ApiErrorDetail[]}
   */
  errors;

  /**
   * Creates a new ApiError.
   * @param {Object} payload - The payload to create the ApiError from.
   * @param {string} payload.code - The code of the error.
   * @param {ApiErrorDetail[]} payload.errors - The errors of the error.
   */
  constructor(payload) {
    super(payload.code);

    this.name = 'ApiError';
    this.code = payload.code;
    this.errors = payload.errors ?? [];
  }
}

export class UnknownApiError extends ApiError {
  constructor() {
    super({ code: 'unknown_error', errors: [] });
  }
}
