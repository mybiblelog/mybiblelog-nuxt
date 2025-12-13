<template>
  <modal v-if="open" :title="modalTitle" @close="handleClose">
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
  </modal>
</template>

<script>
import { mapState } from 'vuex';
import Modal from '@/components/popups/Modal';
import PassageNoteEditorForm from '@/components/forms/PassageNoteEditorForm';

export default {
  name: 'PassageNoteEditorModal',
  components: {
    Modal,
    PassageNoteEditorForm,
  },
  computed: {
    ...mapState('passage-note-editor', {
      open: state => state.open,
      isValid: state => state.isValid,
    }),
    ...mapState('passage-note-tags', {
      passageNoteTags: state => state.passageNoteTags,
    }),
    modalTitle() {
      // Check if we're editing an existing note or creating a new one
      const passageNote = this.$store.state['passage-note-editor'].passageNote;
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
        this.$store.dispatch('passage-note-tags/loadPassageNoteTags');
      }
    },
  },
  methods: {
    handleClose() {
      this.$store.dispatch('passage-note-editor/closeEditor', {
        confirmMessage: this.$t('messaging.are_you_sure_close_editor'),
      });
    },
    handleSave() {
      // Trigger form submission
      this.$store.dispatch('passage-note-editor/savePassageNote');
    },
  },
};
</script>

<style lang="scss" scoped>
//
</style>

<i18n lang="json">
{
  "de": {
    "note_editor": {
      "edit_note": "Notiz bearbeiten",
      "add_note": "Notiz hinzufügen",
      "save": "Speichern",
      "close": "Schließen"
    },
    "messaging": {
      "are_you_sure_close_editor": "Möchten Sie den Noteneditor wirklich schließen? Alle ungespeicherten Änderungen gehen verloren."
    }
  },
  "en": {
    "note_editor": {
      "edit_note": "Edit Note",
      "add_note": "Add Note",
      "save": "Save",
      "close": "Close"
    },
    "messaging": {
      "are_you_sure_close_editor": "Are you sure you want to close the note editor? All unsaved changes will be lost."
    }
  },
  "es": {
    "note_editor": {
      "edit_note": "Editar Nota",
      "add_note": "Agregar Nota",
      "save": "Guardar",
      "close": "Cerrar"
    },
    "messaging": {
      "are_you_sure_close_editor": "¿Estás seguro de que quieres cerrar el editor de notas? Todas las modificaciones no guardadas se perderán."
    }
  },
  "fr": {
    "note_editor": {
      "edit_note": "Modifier la note",
      "add_note": "Ajouter une note",
      "save": "Enregistrer",
      "close": "Fermer"
    },
    "messaging": {
      "are_you_sure_close_editor": "Êtes-vous sûr de vouloir fermer l'éditeur de notes? Toutes les modifications non enregistrées seront perdues."
    }
  },
  "pt": {
    "note_editor": {
      "edit_note": "Editar Nota",
      "add_note": "Adicionar Nota",
      "save": "Salvar",
      "close": "Fechar"
    },
    "messaging": {
      "are_you_sure_close_editor": "Tem certeza de que deseja fechar o editor de notas? Todas as modificações não salvas serão perdidas."
    }
  },
  "uk": {
    "note_editor": {
      "edit_note": "Редагувати Ноту",
      "add_note": "Додати Ноту",
      "save": "Зберегти",
      "close": "Закрити"
    },
    "messaging": {
      "are_you_sure_close_editor": "Ви впевнені, що хочете закрити редактор нотатків? Всі незбережені зміни будуть втрачені."
    }
  }
}
</i18n>
