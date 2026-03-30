<template>
  <transition name="fade">
    <app-modal v-if="open" :title="modalTitle" @close="handleClose">
      <template slot="content">
        <passage-note-editor-form
          :passage-note-tags="passageNoteTags"
        />
      </template>
      <template slot="footer">
        <button class="button is-primary" :disabled="!isValid" @click="handleSave">
          {{ $t('note_editor.save') }}
        </button>
        <button class="button is-light" @click="handleClose">
          {{ $t('note_editor.close') }}
        </button>
      </template>
    </app-modal>
  </transition>
</template>

<script>
import AppModal from '@/components/popups/AppModal';
import PassageNoteEditorForm from '@/components/forms/PassageNoteEditorForm';
import { usePassageNoteEditorStore } from '~/stores/passage-note-editor';
import { usePassageNoteTagsStore } from '~/stores/passage-note-tags';

export default {
  name: 'PassageNoteEditorModal',
  components: {
    AppModal,
    PassageNoteEditorForm,
  },
  computed: {
    passageNoteEditorStore() {
      return usePassageNoteEditorStore();
    },
    passageNoteTagsStore() {
      return usePassageNoteTagsStore();
    },
    open() {
      return this.passageNoteEditorStore.open;
    },
    isValid() {
      return this.passageNoteEditorStore.isValid;
    },
    passageNoteTags() {
      return this.passageNoteTagsStore.passageNoteTags;
    },
    modalTitle() {
      // Check if we're editing an existing note or creating a new one
      const passageNote = this.passageNoteEditorStore.passageNote;
      if (passageNote && passageNote.id) {
        return this.$t('note_editor.edit_note');
      }
      return this.$t('note_editor.add_note');
    },
  },
  watch: {
    open(newValue) {
      // Load passage note tags when modal opens
      if (newValue) {
        this.passageNoteTagsStore.loadPassageNoteTags();
      }
    },
  },
  methods: {
    handleClose() {
      this.passageNoteEditorStore.closeEditor({
        confirmMessage: this.$t('messaging.are_you_sure_close_editor'),
      });
    },
    handleSave() {
      // Trigger form submission
      this.passageNoteEditorStore.savePassageNote();
    },
  },
};
</script>

<style lang="scss" scoped>
/* css class for the transition */
.fade-enter-active,
.fade-leave-active {
  transition: $transition-fade;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>

<i18n locale="en" lang="json" src="@/locales/sfc/en/components/popups/PassageNoteEditorModal.json" />
<i18n locale="de" lang="json" src="@/locales/sfc/de/components/popups/PassageNoteEditorModal.json" />
<i18n locale="es" lang="json" src="@/locales/sfc/es/components/popups/PassageNoteEditorModal.json" />
<i18n locale="fr" lang="json" src="@/locales/sfc/fr/components/popups/PassageNoteEditorModal.json" />
<i18n locale="pt" lang="json" src="@/locales/sfc/pt/components/popups/PassageNoteEditorModal.json" />
<i18n locale="uk" lang="json" src="@/locales/sfc/uk/components/popups/PassageNoteEditorModal.json" />
