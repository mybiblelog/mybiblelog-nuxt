<template>
  <transition name="fade">
    <app-modal v-if="open" :title="modalTitle" @close="handleClose">
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
    </app-modal>
  </transition>
</template>

<script>
import AppModal from '@/components/popups/AppModal';
import LogEntryEditorForm from '@/components/forms/LogEntryEditorForm';
import { useLogEntryEditorStore } from '~/stores/log-entry-editor';

export default {
  name: 'LogEntryEditorModal',
  components: {
    AppModal,
    LogEntryEditorForm,
  },
  computed: {
    logEntryEditorStore() {
      return useLogEntryEditorStore();
    },
    open() {
      return this.logEntryEditorStore.open;
    },
    isValid() {
      return this.logEntryEditorStore.isValid;
    },
    logEntry() {
      return this.logEntryEditorStore.logEntry;
    },
    modalTitle() {
      if (this.logEntry && this.logEntry.id) {
        return this.$t('edit_entry');
      }
      return this.$t('add_entry');
    },
  },
  methods: {
    handleClose() {
      this.logEntryEditorStore.closeEditor({
        confirmMessage: this.$t('messaging.are_you_sure_close_editor'),
      });
    },
    handleSave() {
      this.logEntryEditorStore.saveLogEntry();
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

<i18n locale="en" lang="json" src="@/locales/sfc/en/components/popups/LogEntryEditorModal.json" />
<i18n locale="de" lang="json" src="@/locales/sfc/de/components/popups/LogEntryEditorModal.json" />
<i18n locale="es" lang="json" src="@/locales/sfc/es/components/popups/LogEntryEditorModal.json" />
<i18n locale="fr" lang="json" src="@/locales/sfc/fr/components/popups/LogEntryEditorModal.json" />
<i18n locale="pt" lang="json" src="@/locales/sfc/pt/components/popups/LogEntryEditorModal.json" />
<i18n locale="uk" lang="json" src="@/locales/sfc/uk/components/popups/LogEntryEditorModal.json" />
