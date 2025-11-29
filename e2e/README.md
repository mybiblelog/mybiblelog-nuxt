# End-to-End Test Suite

These tests use Playwright to test the app as a user would, accessing the Nuxt web app with a browser while both the API and web app are running.

## Manual Testing

Some important flows do not yet have automation coverage. Noted here for easy manual regression testing:

* Authentication
  * User can log in with correct credentials
  * New user can register account
  * New user receives email verification link in email
  * User can change their password
  * User can initiate an email change
  * User receives an email verification link for new email
  * User can cancel an in-progress email change
  * User can click valid email verification link to complete email change
