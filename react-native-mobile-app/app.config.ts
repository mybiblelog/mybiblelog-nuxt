import type { ExpoConfig } from "expo/config";

// Build-time config. For client-side values, prefer EXPO_PUBLIC_* env vars.
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  process.env.API_BASE_URL ??
  "http://localhost:3000";

export default ({ config }: { config: ExpoConfig }): ExpoConfig => ({
  ...config,
  extra: {
    ...config.extra,
    apiBaseUrl: API_BASE_URL,
  },
});

