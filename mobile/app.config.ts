import type { ExpoConfig } from "expo/config";

// EXPO_PUBLIC_API_BASE_URL is automatically inlined by Metro from .env at bundle time.
// Validation runs at app startup in src/config.ts rather than here so that
// `expo config` / EAS build commands work without a local .env file.
const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL ?? "";

export default ({ config }: { config: ExpoConfig }): ExpoConfig => ({
  ...config,
  extra: {
    ...config.extra,
    apiBaseUrl,
  },
});
