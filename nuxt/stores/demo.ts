import { defineStore } from 'pinia';

export type DemoState = {
  count: number;
  name: string;
};

export const useDemoStore = defineStore('demo', {
  state: (): DemoState => ({
    count: 0,
    name: 'Pinia (Nuxt 2)',
  }),
  getters: {
    doubleCount: (state): number => state.count * 2,
  },
  actions: {
    increment(): void {
      this.count += 1;
    },
    reset(): void {
      this.count = 0;
    },
    setName(name: string): void {
      this.name = name;
    },
  },
});
