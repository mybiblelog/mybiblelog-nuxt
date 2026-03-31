import type { Pinia } from 'pinia';
import type { Plugin } from '@nuxt/types';

import { useAppInitStore } from '~/stores/app-init';

const plugin: Plugin = (context) => {
  const pinia = (context.app as unknown as { pinia?: Pinia }).pinia;
  if (!pinia) {
    return;
  }

  useAppInitStore(pinia).clientInit();
};

export default plugin;
