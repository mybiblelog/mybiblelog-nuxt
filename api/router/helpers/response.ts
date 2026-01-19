import { ApiErrorCode, ApiErrorDetailCode } from './error-codes';

/**
 * Represents a field-level error.
 */
export type ApiErrorDetail = {
  /**
   * Field name for field-level errors.
   * Set to `null` for top-level errors.
   */
  field: string | null;
  /**
   * Machine-readable i18n-friendly code.
   */
  code: typeof ApiErrorDetailCode[keyof typeof ApiErrorDetailCode];
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
  code: typeof ApiErrorCode[keyof typeof ApiErrorCode];
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
