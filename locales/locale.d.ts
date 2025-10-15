// Keep in sync with api/router/helpers/i18n-errors.js
export type Translation = {
  my_bible_log: string;
  api_error: {
    // Request Input Validation Errors
    required: string;
    is_invalid: string;
    unique: string;
    min_length: string;
    max_length: string;
    review: string;

    // Custom Errors
    invalid_login: string;
    verify_email: string;
    new_email_required: string;
    email_in_use: string;
    password_incorrect: string;
    account_not_found: string;
    password_reset_link_expired: string;
    too_many_requests: string;
    invalid_request: string;
    email_not_verified: string;
    verification_code_expired: string;
  },
  reading_suggestion: {
    new_testament: string;
    old_testament: string;
    wisdom: string;
    date_you_read_passage: string;
  },
};

export type Locales = {
  [key: string]: Translation;
};
