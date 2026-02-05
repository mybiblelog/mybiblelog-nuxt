import path from 'node:path';
import dotenv from 'dotenv';
import z from 'zod';

// Detect if we're running compiled JS or TS source
const isCompiled = __dirname.includes('dist');
const envPath = isCompiled ?
  // (root)/api/dist/config -> (root)/.env
  path.resolve(__dirname, '../../../.env') :
  // (root)/api/config -> (root)/.env
  path.resolve(__dirname, '../../.env');

dotenv.config({
  path: envPath,
  quiet: true,
});

const booleanStringDefaultingToTrue = z.enum(['true', 'false']).transform((val) => val !== 'false');
const emptyStringToUndefined = z.preprocess(
  (val) => (typeof val === 'string' && val.trim() === '' ? undefined : val),
  z.string().optional()
);
const emptyStringUrlToUndefined = z.preprocess(
  (val) => (typeof val === 'string' && val.trim() === '' ? undefined : val),
  z.string().url().optional()
);

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  SITE_URL: z.string().url(),
  API_PORT: z.string().default('8080'),
  TEST_BYPASS_SECRET: z.string().optional(),
  JWT_SECRET: z.string().min(10, 'JWT_SECRET must be at least 10 characters long'),
  REQUIRE_EMAIL_VERIFICATION: booleanStringDefaultingToTrue,
  EMAIL_SENDING_DOMAIN: z.string(),
  EMAIL_UNSUBSCRIBE_ADDRESS: z.email(),
  RESEND_API_KEY: z.string(),
  MONGODB_URI: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  // Comma-separated list of additional Google OAuth client IDs that are allowed
  // to mint Google ID tokens for this backend (useful for mobile clients).
  GOOGLE_ALLOWED_CLIENT_IDS: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_REDIRECT: z.string(),
  // React Native app support / force-upgrade controls
  MOBILE_IOS_MIN_VERSION: z.string().default('0.0.0'),
  MOBILE_ANDROID_MIN_VERSION: z.string().default('0.0.0'),
  MOBILE_IOS_LATEST_VERSION: emptyStringToUndefined,
  MOBILE_ANDROID_LATEST_VERSION: emptyStringToUndefined,
  MOBILE_IOS_STORE_URL: emptyStringUrlToUndefined,
  MOBILE_ANDROID_STORE_URL: emptyStringUrlToUndefined,
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error('❌ Invalid environment variables:', result.error.flatten().fieldErrors);
  process.exit(1);
}

const config = {
  nodeEnv: result.data.NODE_ENV,
  siteUrl: result.data.SITE_URL,
  apiPort: result.data.API_PORT || '8080',
  testBypassSecret: result.data.TEST_BYPASS_SECRET,
  jwtSecret: result.data.NODE_ENV === 'production' ? result.data.JWT_SECRET : 'secret',
  requireEmailVerification: result.data.REQUIRE_EMAIL_VERIFICATION !== false,
  emailSendingDomain: result.data.EMAIL_SENDING_DOMAIN,
  emailUnsubscribeAddress: result.data.EMAIL_UNSUBSCRIBE_ADDRESS,
  resendApiKey: result.data.RESEND_API_KEY,
  mongo: {
    uri: result.data.MONGODB_URI,
  },
  google: {
    clientId: result.data.GOOGLE_CLIENT_ID,
    allowedClientIds: [
      result.data.GOOGLE_CLIENT_ID,
      ...(result.data.GOOGLE_ALLOWED_CLIENT_IDS
        ? result.data.GOOGLE_ALLOWED_CLIENT_IDS.split(',').map((s) => s.trim()).filter(Boolean)
        : []),
    ],
    clientSecret: result.data.GOOGLE_CLIENT_SECRET,
    redirectUri: result.data.GOOGLE_REDIRECT,
  },
  mobileApp: {
    minVersion: {
      ios: result.data.MOBILE_IOS_MIN_VERSION,
      android: result.data.MOBILE_ANDROID_MIN_VERSION,
    },
    latestVersion: {
      ios: result.data.MOBILE_IOS_LATEST_VERSION,
      android: result.data.MOBILE_ANDROID_LATEST_VERSION,
    },
    storeUrl: {
      ios: result.data.MOBILE_IOS_STORE_URL,
      android: result.data.MOBILE_ANDROID_STORE_URL,
    },
  },
};

export default config;
