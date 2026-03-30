import { defineStore } from 'pinia';
import { ApiError, UnknownApiError } from '@/helpers/api-error';
import mapFormErrors from '@/helpers/map-form-errors';
import { useDialogStore } from '~/stores/dialog';

export type PassageRange = {
  startVerseId: number;
  endVerseId: number;
};

export type PassageNoteModel = {
  id: number | string | null;
  passages: Array<PassageRange | { empty: true }>;
  content: string;
  tags: Array<number | string>;
  [key: string]: unknown;
};

export type PassageNoteEditorErrors = Record<string, unknown>;

export type PassageNoteEditorState = {
  open: boolean;
  cleanFormValue: string | null;
  passageNote: PassageNoteModel;
  errors: PassageNoteEditorErrors;
  isValid: boolean;
};

export type PassageNoteEditorOpenPayload =
  | (Partial<PassageNoteModel> & { empty?: false })
  | ({ empty: true } & Partial<PassageNoteModel>)
  | null
  | undefined;

const newPassageNote: PassageNoteModel = {
  id: null,
  passages: [],
  content: '',
  tags: [],
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export const usePassageNoteEditorStore = defineStore('passage-note-editor', {
  state: (): PassageNoteEditorState => ({
    open: false,
    cleanFormValue: null,
    passageNote: clone(newPassageNote),
    errors: {},
    isValid: false,
  }),
  actions: {
    openEditor(passageNote: PassageNoteEditorOpenPayload = null): void {
      if (passageNote && typeof passageNote === 'object' && !('empty' in passageNote)) {
        this.passageNote = clone({ ...newPassageNote, ...passageNote });
      }
      else {
        this.passageNote = clone(newPassageNote);
      }
      this.cleanFormValue = JSON.stringify(this.passageNote);
      this.errors = {};
      this.isValid = false;
      this.open = true;
    },

    async closeEditor(options: { force?: boolean; confirmMessage?: string } = {}): Promise<boolean> {
      const { force = false, confirmMessage } = options;
      if (!force && this.cleanFormValue) {
        const currentValue = JSON.stringify(this.passageNote);
        const isDirty = currentValue !== this.cleanFormValue;
        if (isDirty) {
          const message = confirmMessage || 'Are you sure you want to close without saving?';
          const confirmed = await useDialogStore().confirm({ message });
          if (!confirmed) {
            return false;
          }
        }
      }

      this.$reset();
      return true;
    },

    updatePassageNote(passageNote: PassageNoteModel): void {
      this.passageNote = clone(passageNote);
    },

    setErrors(errors: PassageNoteEditorErrors): void {
      this.errors = errors || {};
    },

    setValid(isValid: boolean): void {
      this.isValid = Boolean(isValid);
    },

    async savePassageNote(): Promise<unknown | null> {
      try {
        const vuex = this.$vuex;

        let savedPassageNote: unknown;
        if (this.passageNote.id) {
          savedPassageNote = await vuex.dispatch('passage-notes/updatePassageNote', this.passageNote, { root: true });
        }
        else {
          savedPassageNote = await vuex.dispatch('passage-notes/createPassageNote', this.passageNote, { root: true });
        }

        if (savedPassageNote) {
          this.$reset();
          // Reload passage notes list if it exists
          if ((vuex.state as Record<string, unknown>)['passage-notes']) {
            await vuex.dispatch('passage-notes/loadPassageNotesPage', null, { root: true });
          }
          return savedPassageNote;
        }

        return null;
      }
      catch (err: unknown) {
        if (err instanceof ApiError) {
          this.errors = mapFormErrors(err) || {};
        }
        else {
          this.errors = mapFormErrors(new UnknownApiError()) || {};
        }
        return null;
      }
    },
  },
});
