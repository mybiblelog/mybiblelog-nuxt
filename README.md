# My Bible Log

My Bible Log is a free, open source web app for tracking personal Bible reading.

This is the code that runs the live [mybiblelog.com](https://www.mybiblelog.com/) web app.

## Build Setup

```bash
# use the correct NPM version, if applicable
# this is specified in package.json under "engines"
$ nvm use 24.2.0

# install dependencies
$ npm install

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm run start
```

For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).

## Environment Variables

In development, create a `.env` file at the root of the project:

```bash
# Base site URL (used for canonical links)
# Also used to resolve absolute URL links in emails and axios requests
SITE_URL=https://xxxxxxxxxx

# Connection URL for MongoDB
MONGODB_URI=mongodb://localhost:27017/xxxxxxxxxx

# JSON Web Token secret
JWT_SECRET=xxxxxxxxxx

# The Mailgun API key and domain for sending email
MAILGUN_API_KEY=xxxxxxxxxx
MAILGUN_DOMAIN=xxxxxxxxxx

# Whether email verification is required before users can sign in
REQUIRE_EMAIL_VERIFICATION=xxxxxxxxxx

# Google OAuth2
GOOGLE_CLIENT_ID=xxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxxxxxxx
GOOGLE_REDIRECT=http://xxxxxxxxxx:xxxx/google-login

# Google Analytics ID
GA_MEASUREMENT_ID=G-xxxxxxxxxx

# Open AI API Key (for automatic <i18n> block translations)
OPENAI_API_KEY=xxxxxxxxxx

# Test Data
TEST_SITE_URL=https://www.mybiblelog.com
TEST_BYPASS_SECRET=xxxxxxxxxx
```

For production deployment, ensure Heroku is configured before pushing:

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
npx jest -- ./shared/bible.test.js
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
```

## HTTPS on localhost

You may need to delete the localhost domain security policy in Chrome in order to use regular HTTP again: chrome://net-internals/#hsts

You will also want to comment out the `'redirect-ssl'` line in the `serverMiddleware` section of `nuxt.config.js` for local testing of production-built code.

Additionally, the API server has its own production HTTPS redirect middleware in `/api/index.js` to comment out for testing.

## Connecting to Google OAuth2

To allow users to sign in with their existing user accounts you will need to follow several steps:

* Set up an OAuth2 client with the Google credentials manager: `https://console.developers.google.com/apis/credentials/oauthclient/`
* Ensure all relevant hosts are set as allowed Google redirect URLs:
  * `http://localhost:3000/google-login`
  * `https://THISAPP.herokuapp.com/google-login`
  * `https://www.THISAPP.com/google-login`
* Get the `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` environment variables from Google
* Set up those variables in a `.env` file to run the project locally
* Set up those variables in Heroku to deploy the project

## Internationalization (i18n) Notes

### `$t` and `$terr` Behavior

The `$t` translation helper, provided by the i18n module, is used to translate messages.

It will first look for the given message in the `<i18n>` block of the current component, and will fall back to the global translations registered in `nuxt.config.js` if the local `<i18n>` block is missing that message.

Note that since the global locale files are loaded from `nuxt.config.js`, updating them will not trigger a hot reload. The entire app will need to be restarted to see global locale updates.

The `$terr` helper is a custom function that unwraps server errors. It is defined in `plugins/translate-api.js`.

### Adding a Locale

These are the steps to adding an entirely new locale to the site (along with any relevant helper tools):

1. Define the locale in `i18n.config.js` (manual)
1. Add the locale to `locales/locales.js` (use Cursor)
1. Import the locale for `dayjs` in `shared/date-helpers.js` (manual)
1. Add Bible book title translations to `shared/static/bible-books.js` (_translate.js)
1. Each component manages its own translation messages in an `<i18n>` block, so add the locale to all `.vue` files in the `pages` and `components` directories.  (_translate.js)
1. Email templates manage their own translation messages, so add the locale to each `api/services/email-templates/*.js` file. (use Cursor)
1. The email service manages translations for several emails inline, so add the locale to `api/services/mailgun.service.js`. (use Cursor)
1. The reminder service translates the title to the email, so add that to `api/services/reminder.service.js`.
1. Each language has its own `/content` directory with markdown files that back the `/about` and `/policy` pages.  (_translate.js)
1. Each language currently has its own printable reading tracker PDF in `/static/downloads` which is manually listed in the XML sitemap route, `/api/router/routes/sitemap.js`. (manually "print as PDF", update sitemap route, and update `/resources/printable-bible-reading-tracker.vue`)
1. Add at least one preferred Bible translation option for the new language in both `shared/util.js` and `pages/settings/reading.vue`.
