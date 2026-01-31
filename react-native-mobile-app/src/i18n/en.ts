export const en = {
  start_tab_title: "Start",
  log_tab_title: "Log",
  settings_tab_title: "Settings",

  start_title: "Start",
  start_subtitle: "Use the tabs below to navigate.",

  log_title: "Log",
  add: "Add",

  loading_log_entries: "Loading log entries…",

  empty_title: "No log entries yet",
  empty_text: 'Tap “Add” to create your first entry.',
  empty_cta: "Add a log entry",

  add_log_entry_title: "Add Log Entry",
  edit_log_entry_title: "Edit Log Entry",
  save: "Save",
  cancel: "Cancel",

  start_verse_id_label: "Start verse ID",
  end_verse_id_label: "End verse ID",
  date_label: "Date",
  start_verse_id_placeholder: "e.g. 1001001",
  end_verse_id_placeholder: "e.g. 1001005",
  date_placeholder: "YYYY-MM-DD",

  verses: "Verses",

  menu_edit: "Edit",
  menu_delete: "Delete",

  delete_confirm_title: "Delete log entry?",
  delete_confirm_message: "This cannot be undone.",

  error_invalid_entry_title: "Invalid entry",
  error_invalid_entry_message: "Please fill out all fields.",
  error_invalid_verses_title: "Invalid verses",
  error_invalid_verses_message: "Verse IDs must be positive numbers.",
  error_invalid_range_title: "Invalid range",
  error_invalid_range_message:
    "End verse ID must be greater than or equal to start verse ID.",

  settings_title: "Settings",
  settings_language_label: "Language",
  language_english: "English",
  language_spanish: "Español",
  settings_language_help: "Changes apply immediately.",

  settings_theme_label: "Theme",
  theme_system: "System",
  theme_light: "Light",
  theme_dark: "Dark",
  settings_theme_help: "System follows your device setting.",

  settings_auth_label: "Account",
  auth_loading: "Checking login…",
  auth_logged_in_as: "Signed in as",
  auth_login: "Login",
  auth_logout: "Logout",

  login_title: "Login",
  auth_email: "Email",
  auth_password: "Password",
  login_button: "Login",
  auth_invalid_credentials: "Invalid email or password.",
  auth_generic_error: "Something went wrong. Please try again.",
  auth_login_hint: "Sign in with the same account you use on the web app.",

  // log entry editor (mirrors Nuxt)
  preview_passage: "Preview passage",
  date: "Date",
  book: "Book",
  choose_book: "Choose Book",
  start_chapter: "Start Chapter",
  choose_start_chapter: "Choose Start Chapter",
  start_verse: "Start Verse",
  choose_start_verse: "Choose Start Verse",
  end_chapter: "End Chapter",
  choose_end_chapter: "Choose End Chapter",
  end_verse: "End Verse",
  choose_end_verse: "Choose End Verse",
  close: "Close",
  discard: "Discard",
  discard_changes_title: "Discard changes?",
  discard_changes_message: "Close without saving your changes?",

  settings_connectivity_label: "Connectivity",
  connectivity_online: "Online",
  connectivity_offline: "Offline",
  connectivity_unknown: "Unknown",
} as const;

