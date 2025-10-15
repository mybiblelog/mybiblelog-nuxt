import Vue from 'vue';
import VueGtag from 'vue-gtag';

export default ({ $config: { googleAnalytics4MeasurementId } }) => {
  if (googleAnalytics4MeasurementId) {
    Vue.use(VueGtag, {
      config: {
        id: googleAnalytics4MeasurementId,
      },
    });
  }
};
