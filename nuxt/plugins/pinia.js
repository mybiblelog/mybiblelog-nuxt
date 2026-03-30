import Vue from 'vue';
import { PiniaVuePlugin, createPinia, setActivePinia } from 'pinia';

Vue.use(PiniaVuePlugin);

export default function(context, inject) {
  const pinia = createPinia();

  // Mirror Nuxt injections (e.g. `$http`) into Pinia stores.
  // This keeps store actions consistent with existing Vuex modules.
  pinia.use(() => ({
    $http: context.$http,
    $vuex: context.store,
    $i18n: context.app?.i18n,
  }));

  // Make Pinia available in Nuxt context/app and as this.$pinia.
  context.app.pinia = pinia;
  inject('pinia', pinia);

  // Ensure stores can be created without explicitly passing the instance.
  setActivePinia(pinia);

  // SSR: serialize state into nuxtState; Client: hydrate it back.
  if (process.server) {
    context.beforeNuxtRender(({ nuxtState }) => {
      nuxtState.pinia = pinia.state.value;
    });
  }
  else if (process.client && context.nuxtState && context.nuxtState.pinia) {
    pinia.state.value = context.nuxtState.pinia;
  }
}
