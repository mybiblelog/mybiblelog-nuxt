import type { Context } from '@nuxt/types';

import { useAppInitStore } from '~/stores/app-init';

export default async (context: Context): Promise<void> => {
  const store = useAppInitStore(context.app.pinia);
  await store.serverInit({ req: context.req, app: context.app });
};
