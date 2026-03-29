import { defineStore } from 'pinia';

export type ActionSheetItem = {
  label: string;
  callback?: () => void;
} & Record<string, unknown>;

export type ActionSheetState = {
  open: boolean;
  title: string | null;
  actions: ActionSheetItem[];
};

const emptyState: ActionSheetState = {
  open: false,
  title: null,
  actions: [],
};

export const useActionSheetStore = defineStore('action-sheet', {
  state: (): ActionSheetState => ({ ...emptyState }),
  actions: {
    openSheet(payload: { title?: string | null; actions?: ActionSheetItem[] }): void {
      this.title = payload?.title || null;
      this.actions = Array.isArray(payload?.actions) ? payload.actions : [];
      this.open = true;
    },
    closeSheet(): void {
      this.$reset();
    },
  },
});
