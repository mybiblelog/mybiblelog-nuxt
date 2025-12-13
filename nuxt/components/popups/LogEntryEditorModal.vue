<template>
  <transition name="fade">
    <modal v-if="open" :title="modalTitle" @close="handleClose">
      <template slot="content">
        <log-entry-editor-form />
      </template>
      <template slot="footer">
        <button class="button is-primary" :disabled="!isValid" @click="handleSave">
          {{ logEntry.id ? $t('save') : $t('add') }}
        </button>
        <button class="button is-light" @click="handleClose">
          {{ $t('close') }}
        </button>
      </template>
    </modal>
  </transition>
</template>

<script>
import { mapState } from 'vuex';
import Modal from '@/components/popups/Modal';
import LogEntryEditorForm from '@/components/forms/LogEntryEditorForm';

export default {
  name: 'LogEntryEditorModal',
  components: {
    Modal,
    LogEntryEditorForm,
  },
  computed: {
    ...mapState('log-entry-editor', {
      open: state => state.open,
      isValid: state => state.isValid,
      logEntry: state => state.logEntry,
    }),
    modalTitle() {
      if (this.logEntry && this.logEntry.id) {
        return this.$t('edit_entry');
      }
      return this.$t('add_entry');
    },
  },
  methods: {
    handleClose() {
      this.$store.dispatch('log-entry-editor/closeEditor', {
        confirmMessage: this.$t('messaging.are_you_sure_close_editor'),
      });
    },
    handleSave() {
      this.$store.dispatch('log-entry-editor/saveLogEntry');
    },
  },
};
</script>

<style lang="scss" scoped>
/* css class for the transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>

<i18n lang="json">
{
  "de": {
    "add_entry": "Eintrag hinzufügen",
    "edit_entry": "Eintrag bearbeiten",
    "save": "Speichern",
    "add": "Hinzufügen",
    "close": "Schließen",
    "messaging": {
      "are_you_sure_close_editor": "Möchten Sie den Editor wirklich schließen? Alle ungespeicherten Änderungen gehen verloren."
    }
  },
  "en": {
    "add_entry": "Add Entry",
    "edit_entry": "Edit Entry",
    "save": "Save",
    "add": "Add",
    "close": "Close",
    "messaging": {
      "are_you_sure_close_editor": "Are you sure you want to close the editor? All unsaved changes will be lost."
    }
  },
  "es": {
    "add_entry": "Añadir entrada",
    "edit_entry": "Editar entrada",
    "save": "Guardar",
    "add": "Añadir",
    "close": "Cerrar",
    "messaging": {
      "are_you_sure_close_editor": "¿Estás seguro de que quieres cerrar el editor? Todas las modificaciones no guardadas se perderán."
    }
  },
  "fr": {
    "add_entry": "Ajouter une entrée",
    "edit_entry": "Modifier l'entrée",
    "save": "Sauvegarder",
    "add": "Ajouter",
    "close": "Fermer",
    "messaging": {
      "are_you_sure_close_editor": "Êtes-vous sûr de vouloir fermer l'éditeur? Toutes les modifications non enregistrées seront perdues."
    }
  },
  "pt": {
    "add_entry": "Adicionar Entrada",
    "edit_entry": "Editar Entrada",
    "save": "Salvar",
    "add": "Adicionar",
    "close": "Fechar",
    "messaging": {
      "are_you_sure_close_editor": "Tem certeza de que deseja fechar o editor? Todas as modificações não salvas serão perdidas."
    }
  },
  "uk": {
    "add_entry": "Додати запис",
    "edit_entry": "Редагувати запис",
    "save": "Зберегти",
    "add": "Додати",
    "close": "Закрити",
    "messaging": {
      "are_you_sure_close_editor": "Ви впевнені, що хочете закрити редактор? Всі незбережені зміни будуть втрачені."
    }
  }
}
</i18n>
