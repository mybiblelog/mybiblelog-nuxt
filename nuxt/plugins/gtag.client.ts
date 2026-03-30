import Vue from 'vue';
import VueGtag from 'vue-gtag';

import type { Plugin } from '@nuxt/types';

const plugin: Plugin = (context) => {
  type ContextWithConfig = {
    $config: {
      googleAnalytics4MeasurementId?: string;
    };
  };

  const { googleAnalytics4MeasurementId } = (context as unknown as ContextWithConfig).$config;

  if (googleAnalytics4MeasurementId) {
    Vue.use(VueGtag, {
      config: {
        id: googleAnalytics4MeasurementId,
      },
    });
  }
};

export default plugin;
