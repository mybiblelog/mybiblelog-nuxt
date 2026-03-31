import type { Context } from '@nuxt/types';

import { useAuthStore } from '~/stores/auth';

export default function({ route, redirect, error, app }: Context): void {
  const authStore = useAuthStore(app.pinia);
  const authRule = route.meta?.[0]?.auth;

  const isLoggedIn = authStore.loggedIn;
  const isAdmin = Boolean(isLoggedIn && authStore.user?.isAdmin);

  if (authRule === 'guest') {
    if (isLoggedIn) {
      redirect(app.localePath('/start'));
    }
  }
  else if (authRule === 'admin' && !isAdmin) {
    error({ statusCode: 403, message: 'You do not have permission to access this page' });
  }
  // default to login if no auth rule is specified
  else if (!authRule && !isLoggedIn) {
    redirect(app.localePath('/login'));
  }
}
