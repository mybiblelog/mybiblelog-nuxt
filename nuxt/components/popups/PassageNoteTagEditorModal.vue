<template>
  <transition name="fade">
    <app-modal v-if="open" :title="modalTitle" @close="handleClose">
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
import { mapState } from 'vuex';
import AppModal from '@/components/popups/AppModal';
import PassageNoteTagEditorForm from '@/components/forms/PassageNoteTagEditorForm';

export default {
  name: 'PassageNoteTagEditorModal',
  components: {
    AppModal,
    PassageNoteTagEditorForm,
  },
  computed: {
    ...mapState('passage-note-tag-editor', {
      open: state => state.open,
      isValid: state => state.isValid,
    }),
    modalTitle() {
      // Check if we're editing an existing tag or creating a new one
      const passageNoteTag = this.$store.state['passage-note-tag-editor'].passageNoteTag;
      if (passageNoteTag && passageNoteTag.id) {
        return this.$t('tag_editor.edit_tag');
      }
      return this.$t('tag_editor.add_tag');
    },
  },
  methods: {
    handleClose() {
      this.$store.dispatch('passage-note-tag-editor/closeEditor', {
        confirmMessage: this.$t('messaging.are_you_sure_close_tag_editor'),
      });
    },
    handleSave() {
      // Trigger form submission
      this.$store.dispatch('passage-note-tag-editor/savePassageNoteTag');
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

<i18n lang="json">
{
  "de": {
    "tag_editor": {
      "edit_tag": "Tag bearbeiten",
      "add_tag": "Tag hinzufügen",
      "save": "Speichern",
      "close": "Schließen"
    },
    "messaging": {
      "are_you_sure_close_tag_editor": "Möchten Sie den Tag-Editor wirklich schließen? Alle ungespeicherten Änderungen gehen verloren."
    }
  },
  "en": {
    "tag_editor": {
      "edit_tag": "Edit Tag",
      "add_tag": "Add Tag",
      "save": "Save",
      "close": "Close"
    },
    "messaging": {
      "are_you_sure_close_tag_editor": "Are you sure you want to close the tag editor? All unsaved changes will be lost."
    }
  },
  "es": {
    "tag_editor": {
      "edit_tag": "Editar Etiqueta",
      "add_tag": "Añadir Etiqueta",
      "save": "Guardar",
      "close": "Cerrar"
    },
    "messaging": {
      "are_you_sure_close_tag_editor": "¿Estás seguro de que quieres cerrar el editor de etiquetas? Todas las modificaciones no guardadas se perderán."
    }
  },
  "fr": {
    "tag_editor": {
      "edit_tag": "Éditer le tag",
      "add_tag": "Ajouter un tag",
      "save": "Enregistrer",
      "close": "Fermer"
    },
    "messaging": {
      "are_you_sure_close_tag_editor": "Êtes-vous sûr de vouloir fermer l'éditeur de tags? Toutes les modifications non enregistrées seront perdues."
    }
  },
  "pt": {
    "tag_editor": {
      "edit_tag": "Editar Tag",
      "add_tag": "Adicionar Tag",
      "save": "Salvar",
      "close": "Fechar"
    },
    "messaging": {
      "are_you_sure_close_tag_editor": "Tem certeza de que deseja fechar o editor de tags? Todas as modificações não salvas serão perdidas."
    }
  },
  "uk": {
    "tag_editor": {
      "edit_tag": "Редагувати Тег",
      "add_tag": "Додати Тег",
      "save": "Зберегти",
      "close": "Закрити"
    },
    "messaging": {
      "are_you_sure_close_tag_editor": "Ви впевнені, що хочете закрити редактор тегів? Всі незбережені зміни будуть втрачені."
    }
  }
}
</i18n>
