import type { ExpoConfig } from "expo/config";
import dotenv from 'dotenv';

dotenv.config({
  path: '.env',
  quiet: true,
});

// Expo/Metro automatically loads .env from the project root (same directory as this file).
// Place your .env file at: react-native-mobile-app/.env

// FIXME: this validation should probably live in config.ts instead:
// - this file is loaded by `expo config` before uploading files to EAS
// - env vars aren't loaded from .env automatically for that command
// - this file requires those env vars to be set or it will error
// - using dotenv to load .env is a workaround, and those loaded env vars aren't even used in the build
// - so actually, we should move validation to config.ts so we don't need a .env locally to perform a build that doesn't use it

const requiredEnvVars = [
  "EXPO_PUBLIC_API_BASE_URL",
  "EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID",
] as const;

const missing = requiredEnvVars.filter(
  (key) => !process.env[key]?.trim()
);

if (missing.length > 0) {
  throw new Error(
    `Missing required env vars at build time: ${missing.join(", ")}. Set them in your .env file or EAS secrets.`
  );
}

const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL!;
const googleExpoClientId = process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID!;
const googleWebClientId =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim() || googleExpoClientId;

export default ({ config }: { config: ExpoConfig }): ExpoConfig => ({
  ...config,
  extra: {
    ...config.extra,
    apiBaseUrl,
    googleExpoClientId,
    googleWebClientId,
  },
});
