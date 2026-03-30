<template>
  <transition name="fade">
    <app-modal v-if="open" :title="modalTitle" :z-index="60" @close="handleClose">
      <template slot="content">
        <passage-note-tag-editor-form />
      </template>
      <template slot="footer">
        <button class="button is-primary" :disabled="!isValid" @click="handleSave">
          {{ $t('tag_editor.save') }}
        </button>
        <button class="button is-light" @click="handleClose">
          {{ $t('tag_editor.close') }}
        </button>
      </template>
    </app-modal>
  </transition>
</template>

<script>
import AppModal from '@/components/popups/AppModal';
import PassageNoteTagEditorForm from '@/components/forms/PassageNoteTagEditorForm';
import { usePassageNoteTagEditorStore } from '~/stores/passage-note-tag-editor';

export default {
  name: 'PassageNoteTagEditorModal',
  components: {
    AppModal,
    PassageNoteTagEditorForm,
  },
  computed: {
    passageNoteTagEditorStore() {
      return usePassageNoteTagEditorStore();
    },
    open() {
      return this.passageNoteTagEditorStore.open;
    },
    isValid() {
      return this.passageNoteTagEditorStore.isValid;
    },
    modalTitle() {
      // Check if we're editing an existing tag or creating a new one
      const passageNoteTag = this.passageNoteTagEditorStore.passageNoteTag;
      if (passageNoteTag && passageNoteTag.id) {
        return this.$t('tag_editor.edit_tag');
      }
      return this.$t('tag_editor.add_tag');
    },
  },
  methods: {
    handleClose() {
      this.passageNoteTagEditorStore.closeEditor({
        confirmMessage: this.$t('messaging.are_you_sure_close_tag_editor'),
      });
    },
    handleSave() {
      // Trigger form submission
      this.passageNoteTagEditorStore.savePassageNoteTag();
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

<i18n locale="en" lang="json" src="@/locales/sfc/en/components/popups/PassageNoteTagEditorModal.json" />
<i18n locale="de" lang="json" src="@/locales/sfc/de/components/popups/PassageNoteTagEditorModal.json" />
<i18n locale="es" lang="json" src="@/locales/sfc/es/components/popups/PassageNoteTagEditorModal.json" />
<i18n locale="fr" lang="json" src="@/locales/sfc/fr/components/popups/PassageNoteTagEditorModal.json" />
<i18n locale="pt" lang="json" src="@/locales/sfc/pt/components/popups/PassageNoteTagEditorModal.json" />
<i18n locale="uk" lang="json" src="@/locales/sfc/uk/components/popups/PassageNoteTagEditorModal.json" />
