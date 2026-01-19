/**
 * Represents a field-level error.
 */
export type ApiErrorDetail = {
  /**
   * Optional field name for field-level errors.
   */
  field?: string;
  /**
   * Machine-readable i18n-friendly code.
   */
  code: string;
  /**
   * Optional metadata for the error. This can be used to pass additional information to the error.
   */
  properties?: Record<string, any>;
};

/**
 * Represents a top-level error.
 */
export type ApiError = {
  /**
   * Top-level error code.
   */
  code: string;
  /**
   * Optional array of field errors.
   */
  errors?: ApiErrorDetail[];
};

/**
 * Represents a response from the API.
 */
export type ApiResponse<T = any> =
  | { data: T; meta?: Record<string, any>; error?: never }
  | { data?: never; meta?: never; error: ApiError };
