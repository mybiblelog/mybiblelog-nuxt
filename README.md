# My Bible Log

My Bible Log is a free, open source web app for tracking personal Bible reading.

This is the code that runs the live [mybiblelog.com](https://www.mybiblelog.com/) web app.

## Development, Build, and Deployment Scripts

```bash
# use the correct NPM version, if applicable
# this is specified in package.json under "engines"
$ nvm use 24.2.0

# install root project dependencies
$ npm install

# install nuxt and express (/api) project dependencies
$ npm run heroku-prebuild

# make sure MongoDB is running
# docker-compose.yml is one option
$ docker compose up

# ensure env vars are set: see below example
# both /nuxt and /api projects check for the .env in this root directory
$ touch .env

# serve both with hot reload
# nuxt project served at localhost:3000
# express api project served at localhost:8080
# nuxt project proxies /api/* requests to express api
$ npm run dev

# build both for production and launch servers
$ npm run build
$ npm run start
```

## Environment Variables

In development, create a `.env` file at the root of the project:

```bash
# Base site URL (used for canonical links)
# Also used to resolve absolute URL links in emails and axios requests
SITE_URL=https://xxxxxxxxxx

# Optional: set a custom API port
# Below values are used if no env var is set
# the Express API listens on this port
API_PORT=8080
# Nuxt proxies /api/* requests here
API_BASE_URL=http://localhost:8080

# Connection URL for MongoDB (example matches docker-compose.yml file)
MONGODB_URI=mongodb://root:examplepassword@localhost:27017

# JSON Web Token secret
JWT_SECRET=xxxxxxxxxx

# Whether email verification is required before users can sign in
REQUIRE_EMAIL_VERIFICATION=xxxxxxxxxx

# The Mailgun API key and domain for sending email
# Only needed if developing/using email features
# (pre-login email verification, reminder emails, password reset)
MAILGUN_API_KEY=xxxxxxxxxx
MAILGUN_DOMAIN=xxxxxxxxxx

# Google OAuth2 (only needed if using Google login)
GOOGLE_CLIENT_ID=xxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxxxxxxx
GOOGLE_REDIRECT=http://xxxxxxxxxx:xxxx/google-login

# Google Analytics ID (only needed if verifying GA connection)
GA_MEASUREMENT_ID=G-xxxxxxxxxx

# Open AI API Key (for scripted <i18n> block translations)
OPENAI_API_KEY=xxxxxxxxxx

# Test Data
TEST_SITE_URL=http://localhost:3000 # for e2e tests
TEST_BYPASS_SECRET=xxxxxxxxxx # for api tests (do NOT set in prod)
```

For deployment to Heroku, ensure these env vars are set before pushing:

```bash
$ heroku config:set HOST=0.0.0.0
$ heroku config:set NODE_ENV=production
```

## Testing

Be sure the local dev server is running before running these scripts against it.

Also be sure to connect to a local MongoDB instance when running the dev server locally. This dramatically increases test speed and avoids wasting Atlas resources.

```bash
# Run Jest API tests against the Express app
$ npm run test:api

# Run Playwright E2E tests against the Nuxt app
$ npm run test:e2e
```

To run a single test file:

```sh
# Shared project
cd shared
npx jest -- ./shared/bible.test.ts

# API project
cd api
npx jest -- ./test/auth.test.ts
```

## Custom Scripts

```bash
# Delete existing collections and create a demo user and admin account
$ npm run script:seed

# Save all MongoDB collections locally as JSON
$ npm run script:backup

# Delete all test user accounts
$ npm run script:delete-test-users

# Delete orphaned user data
$ npm run script:delete-stranded-data

# Migrate MongoDB to latest schema
$ npm run script:migrate
```

## HTTPS on localhost

You may need to delete the localhost domain security policy in Chrome in order to use regular HTTP again: chrome://net-internals/#hsts

You will also want to comment out the `'redirect-ssl'` line in the `serverMiddleware` section of `nuxt.config.js` for local testing of production-built code.

Additionally, the API server has its own production HTTPS redirect middleware in `/api/index.js` to comment out for testing.

## Connecting to Google OAuth2

To allow users to sign in with their existing user accounts you will need to follow several steps:

- Set up an OAuth2 client with the Google credentials manager: `https://console.developers.google.com/apis/credentials/oauthclient/`
- Ensure all relevant hosts are set as allowed Google redirect URLs:
  - `http://localhost:3000/google-login`
  - `https://THISAPP.herokuapp.com/google-login`
  - `https://www.THISAPP.com/google-login`
- Get the `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` environment variables from Google
- Set up those variables in a `.env` file to run the project locally
- Set up those variables in Heroku to deploy the project

## Internationalization (i18n) Notes

### `$t` and `$terr` Behavior

The `$t` translation helper, provided by the i18n module, is used to translate messages.

It will first look for the given message in the `<i18n>` block of the current component, and will fall back to the global translations registered in `nuxt.config.js` if the local `<i18n>` block is missing that message.

Note that since the global locale files are loaded from `nuxt.config.js`, updating them will not trigger a hot reload. The entire app will need to be restarted to see global locale updates.

The `$terr` helper is a custom function that unwraps server errors. It is defined in `plugins/translate-api.js`.

### Adding a Locale

These are the steps to adding an entirely new locale to the site (along with any relevant helper tools):

1. Add the locale to `shared/i18n.ts` (manual)
1. Define the locale in `nuxt/i18n.config.js` (manual)
1. Add the locale to `nuxt/locales/locales.js` (use Cursor)
1. Import the locale for `dayjs` in `shared/date-helpers.ts` (manual)
1. Add Bible book title translations to `shared/static/bible-books.ts` (\_translate.js)
1. Each component manages its own translation messages in an `<i18n>` block, so add the locale to all `.vue` files in the `pages` and `components` directories. (\_translate.js)
1. Email templates manage their own translation messages, so add the locale to each `api/services/email-templates/*.ts` file. (use Cursor)
1. The email service manages translations for several emails inline, so add the locale to `api/services/mailgun.service.ts`. (use Cursor)
1. The reminder service translates the title to the email, so add that to `api/services/reminder.service.ts`.
1. Each locale has its own `nuxt/content` directory with markdown files that back the `/about` and `/policy` pages. (`nuxt/_translate.js`)
1. Each locale currently has its own printable reading tracker PDF in `nuxt/static/downloads` which is manually listed in the XML sitemap route, `/api/router/routes/sitemap.ts`. (manually "print as PDF", update sitemap route, and update `nuxt/pages/resources/printable-bible-reading-tracker.vue`)
1. Add at least one preferred Bible translation option for the new locale in both `shared/util.ts` and `pages/settings/reading.vue`.
1. Add a default Bible translation for the new locale to the `defaultLocaleBibleVersions` constant in `shared/util.ts` in.

## Adding support for a new Bible translation

1. Define the translation in `shared/util.ts` by adding it to the `BibleVersions` constant.
1. Also in in `shared/util.ts`: for each of the supported apps, there is a `BibleVersionsType` constant containing that app's internal code/tag/label for that translation. Find and add the code for the translation in each app. (Typescript will raise an error to highlight where these updates are needed.)
1. In the `nuxt/pages/settings/reading.vue` file, add the display name of the translation to the `bibleVersionNames` constant.

NOTE: you will need to run `npm run heroku-prebuild` before running `npm run dev` to see your changes, as this will require rebuilding the `shared` project and installing it as a dependency in the other projects.

## Adding support for a new Bible reading app or website

1. Define the app in `shared/util.ts` by adding it to the `BibleApps` constant.
1. Also in `shared/util.ts`: define a new function like `get{NewAppName}ReadingURL` that accepts a Bible version, book index, and chapter index, and returns a URL to directly open that chapter in the app.
1. Also in `shared/util.ts`: update the `getAppReadingUrl` function to use your new function to generate the external reading URL for the app.
1. In the `nuxt/pages/settings/reading.vue` file, add the display name of the app to the `bibleAppNames` constant.

NOTE: you will need to run `npm run heroku-prebuild` before running `npm run dev` to see your changes, as this will require rebuilding the `shared` project and installing it as a dependency in the other projects.
