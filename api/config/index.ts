import path from 'node:path';
import dotenv from 'dotenv';
import z from 'zod';


// Detect if we're running compiled JS or TS source
const isCompiled = __dirname.includes('dist');
const envPath = isCompiled
  // (root)/api/dist/config -> (root)/.env
  ? path.resolve(__dirname, '../../../.env')
  // (root)/api/config -> (root)/.env
  : path.resolve(__dirname, '../../.env');

dotenv.config({
  path: envPath,
});

const booleanStringDefaultingToTrue = z.enum(['true', 'false']).transform(val => val !== 'false');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  SITE_URL: z.string().url(),
  API_PORT: z.string().default('8080'),
  TEST_BYPASS_SECRET: z.string().optional(),
  JWT_SECRET: z.string().min(10, 'JWT_SECRET must be at least 10 characters long'),
  REQUIRE_EMAIL_VERIFICATION: booleanStringDefaultingToTrue,
  MAILGUN_API_KEY: z.string(),
  MAILGUN_DOMAIN: z.string(),
  MONGODB_URI: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_REDIRECT: z.string(),
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
  mailgun: {
    apiKey: result.data.MAILGUN_API_KEY,
    domain: result.data.MAILGUN_DOMAIN,
  },
  mongo: {
    uri: result.data.MONGODB_URI,
  },
  google: {
    clientId: result.data.GOOGLE_CLIENT_ID,
    clientSecret: result.data.GOOGLE_CLIENT_SECRET,
    redirectUri: result.data.GOOGLE_REDIRECT,
  },
};

export default config;
