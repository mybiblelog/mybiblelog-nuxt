export default ({ app, $auth }) => {
  // Ensures that when the auth module redirects to a page, it uses the correct locale
  $auth.onRedirect((to, from) => {
    return app.localePath(to);
  });

  // Below is an example of: https://i18n.nuxtjs.org/v7/callbacks#usage

  // onBeforeLanguageSwitch called right before setting a new locale
  app.i18n.onBeforeLanguageSwitch = (oldLocale, newLocale, isInitialSetup, context) => {
    // console.log(oldLocale, newLocale, isInitialSetup);
  };
  // onLanguageSwitched called right after a new locale has been set
  app.i18n.onLanguageSwitched = (oldLocale, newLocale) => {
    // console.log(oldLocale, newLocale);
  };
};
