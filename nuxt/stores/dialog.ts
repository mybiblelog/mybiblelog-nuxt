import { defineStore } from 'pinia';

export type DialogType = '' | 'alert' | 'confirm';

export type BaseDialogOptions = {
  title?: string;
  message?: string;
};

export type AlertOptions = BaseDialogOptions & {
  buttonText?: string;
  buttonType?: string;
};

export type ConfirmOptions = BaseDialogOptions & {
  confirmButtonText?: string;
  confirmButtonType?: string;
  cancelButtonText?: string;
};

export type DialogState = {
  open: boolean;
  type: DialogType;

  title: string;
  message: string;

  buttonText: string;
  buttonType: string;

  confirmButtonText: string;
  confirmButtonType: string;
  cancelButtonText: string;

  resolvePromise?: (value?: unknown) => void;
};

const emptyState: Omit<DialogState, 'resolvePromise'> = {
  open: false,
  type: '',

  title: '',
  message: '',

  buttonText: '',
  buttonType: 'is-primary',

  confirmButtonText: '',
  confirmButtonType: 'is-primary',
  cancelButtonText: '',
};

export const useDialogStore = defineStore('dialog', {
  state: (): DialogState => ({
    ...emptyState,
    resolvePromise: undefined,
  }),
  actions: {
    alert(options: AlertOptions = {}): Promise<void> {
      return new Promise((resolve) => {
        this.title = options.title || '';
        this.message = options.message || '';
        this.buttonText = options.buttonText || '';
        this.buttonType = options.buttonType || 'is-primary';
        this.type = 'alert';
        this.open = true;
        this.resolvePromise = () => resolve();
      });
    },
    confirm(options: ConfirmOptions = {}): Promise<boolean> {
      return new Promise((resolve) => {
        this.title = options.title || '';
        this.message = options.message || '';
        this.confirmButtonText = options.confirmButtonText || '';
        this.confirmButtonType = options.confirmButtonType || 'is-primary';
        this.cancelButtonText = options.cancelButtonText || '';
        this.type = 'confirm';
        this.open = true;
        this.resolvePromise = value => resolve(Boolean(value));
      });
    },
    closeAlert(): void {
      if (this.resolvePromise) {
        this.resolvePromise();
      }
      this.$reset();
    },
    acceptConfirm(): void {
      if (this.resolvePromise) {
        this.resolvePromise(true);
      }
      this.$reset();
    },
    cancelConfirm(): void {
      if (this.resolvePromise) {
        this.resolvePromise(false);
      }
      this.$reset();
    },
  },
});
