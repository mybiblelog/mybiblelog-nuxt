export default function({ store, route, redirect, error, app }) {
  const authRule = route.meta[0]?.auth;
  const isLoggedIn = store.state.auth2.loggedIn;
  const isAdmin = isLoggedIn && store.state.auth2.user.isAdmin;

  if (authRule === 'guest') {
    if (isLoggedIn) {
      return redirect(app.localePath('/start'));
    }
  }
  else if (authRule === 'admin' && !isAdmin) {
    error({ statusCode: 403, message: 'You do not have permission to access this page' });
  }
  // default to login if no auth rule is specified
  else if (!authRule && !isLoggedIn) {
    return redirect(app.localePath('/login'));
  }
}
