export default function({ store, redirect, error }) {
  if (!store.$auth.loggedIn) {
    return redirect('/login');
  }
  else if (!store.$auth.user.isAdmin) {
    error({ statusCode: 403, message: 'You do not have permission to access this page' });
  }
}
