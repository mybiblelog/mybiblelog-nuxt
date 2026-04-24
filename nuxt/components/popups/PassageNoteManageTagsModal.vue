<template>
  <app-modal :open="open" :title="$t('manage_tags')" @close="cancel">
    <template slot="content">
      <div :class="{ 'manage-tags__disabled': tagEditorOpen }">
        <passage-note-tag-selector
          :passage-note-tags="passageNoteTags"
          :selected-tag-ids="selectedTagIds"
          @change="updateSelectedTagIds"
        />

        <div class="manage-tags__new-row">
          <button class="mbl-button mbl-button--sm mbl-button--info" type="button" @click="openNewTagEditor">
            {{ $t('new') }}
          </button>
        </div>
      </div>
    </template>

    <template slot="footer">
      <button class="mbl-button mbl-button--primary" type="button" :disabled="tagEditorOpen" @click="done">
        {{ $t('done') }}
      </button>
      <button class="mbl-button mbl-button--light" type="button" :disabled="tagEditorOpen" @click="cancel">
        {{ $t('close') }}
      </button>
    </template>
  </app-modal>
</template>

<script>
import AppModal from '@/components/popups/AppModal';
import PassageNoteTagSelector from '@/components/forms/PassageNoteTagSelector';
import { usePassageNoteTagEditorStore } from '~/stores/passage-note-tag-editor';

export default {
  name: 'PassageNoteManageTagsModal',
  components: {
    AppModal,
    PassageNoteTagSelector,
  },
  props: {
    open: { type: Boolean, default: false },
    passageNoteTags: { type: Array, default: () => [] },
    selectedTagIds: { type: Array, default: () => [] },
  },
  data() {
    return {
      pendingCreateTag: false,
      baselineTagIds: [],
    };
  },
  computed: {
    passageNoteTagEditorStore() {
      return usePassageNoteTagEditorStore();
    },
    tagEditorOpen() {
      return this.passageNoteTagEditorStore.open;
    },
  },
  watch: {
    tagEditorOpen(next, prev) {
      if (prev && !next && this.pendingCreateTag) {
        this.pendingCreateTag = false;
        this.selectNewlyCreatedTagIfAny();
      }
    },
  },
  methods: {
    updateSelectedTagIds(tagIds) {
      this.$emit('change', tagIds);
    },
    openNewTagEditor() {
      this.baselineTagIds = (this.passageNoteTags ?? []).map(t => t.id);
      this.pendingCreateTag = true;
      this.passageNoteTagEditorStore.openEditor(null);
    },
    selectNewlyCreatedTagIfAny() {
      const currentIds = new Set((this.passageNoteTags ?? []).map(t => t.id));
      const baseline = new Set(this.baselineTagIds ?? []);
      const addedIds = [...currentIds].filter(id => !baseline.has(id));

      if (addedIds.length !== 1) {
        this.baselineTagIds = [];
        return;
      }

      const createdId = addedIds[0];
      const nextIds = [...(this.selectedTagIds ?? [])];
      if (!nextIds.includes(createdId)) {
        nextIds.push(createdId);
        this.$emit('change', nextIds);
      }
      this.baselineTagIds = [];
    },
    done() {
      this.$emit('done', this.selectedTagIds);
    },
    cancel() {
      this.pendingCreateTag = false;
      this.baselineTagIds = [];
      this.$emit('cancel');
    },
  },
};
</script>

<style scoped>
.manage-tags__new-row {
  margin-top: 0.75rem;
}
.manage-tags__disabled {
  pointer-events: none;
  opacity: 0.6;
}
</style>

<i18n lang="json">
{
  "en": {
    "manage_tags": "Choose Tags",
    "new": "Create Tag",
    "done": "Done",
    "close": "Close"
  },
  "de": {
    "manage_tags": "Tags auswählen",
    "new": "Tag erstellen",
    "done": "Fertig",
    "close": "Schließen"
  },
  "es": {
    "manage_tags": "Elegir etiquetas",
    "new": "Crear etiqueta",
    "done": "Hecho",
    "close": "Cerrar"
  },
  "fr": {
    "manage_tags": "Choisir des étiquettes",
    "new": "Créer une étiquette",
    "done": "Terminé",
    "close": "Fermer"
  },
  "ko": {
    "manage_tags": "태그 선택",
    "new": "태그 생성",
    "done": "완료",
    "close": "닫기"
  },
  "pt": {
    "manage_tags": "Escolher Tags",
    "new": "Criar tag",
    "done": "Concluído",
    "close": "Fechar"
  },
  "uk": {
    "manage_tags": "Вибрати теги",
    "new": "Створити тег",
    "done": "Готово",
    "close": "Закрити"
  }
}
</i18n>
