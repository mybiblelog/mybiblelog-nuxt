import { defineStore } from 'pinia';

export const useDemoStore = defineStore('demo', {
  state: () => ({
    count: 0,
    name: 'Pinia (Nuxt 2)',
  }),
  getters: {
    doubleCount: state => state.count * 2,
  },
  actions: {
    increment() {
      this.count += 1;
    },
    reset() {
      this.count = 0;
    },
    setName(name) {
      this.name = name;
    },
  },
});
