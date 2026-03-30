<template>
  <form @submit.prevent="handleSubmit">
    <div v-if="errors._form" class="help is-danger">
      <div class="help is-danger">
        {{ $terr(errors._form) }}
      </div>
    </div>
    <div class="field passages-title">
      <label class="label">{{ $t('passages') }}</label>
      <button class="button is-primary is-small" :disabled="editingPassage > -1" @click.prevent="addPassage">
        {{ $t('add_passage') }}
      </button>
    </div>
    <div class="passage-list">
      <div v-for="(passage, index) in passageNote.passages" :key="index" class="passage-line">
        <div class="passage">
          <template v-if="editingPassage === index">
            <passage-selector :populate-with="passage" @change="(updatedPassage) => passageSelectorChange(index, updatedPassage)" />
          </template>
          <template v-else>
            <button class="button" :disabled="editingPassage > -1 || editingNewPassage" @click.prevent="startEditPassage(index)">
              {{ displayVerseRange(passage.startVerseId, passage.endVerseId) }}
            </button>
          </template>
        </div>
        <div class="buttons">
          <template v-if="editingPassage === index">
            <button class="button is-primary is-small" :disabled="!editingPassageIsDirty" @click.prevent="saveAndStopEditPassage(index)">
              {{ $t('done') }}
            </button>
            <button class="button is-small" :disabled="editingPassage > -1 && editingPassage !== index" @click.prevent="cancelAndStopEditPassage(index)">
              {{ $t('cancel') }}
            </button>
          </template>
          <template v-else>
            <button class="button is-danger is-small" :disabled="editingPassage > -1 && editingPassage !== index" @click.prevent="removePassage(index)">
              {{ $t('remove') }}
            </button>
          </template>
        </div>
      </div>
      <div v-if="!passageNote.passages.length" class="passage-line">
        <div>{{ $t('no_passages') }}</div>
      </div>
    </div>
    <div class="field">
      <label class="label">{{ $t('content') }}</label>
      <div class="control">
        <textarea :value="passageNote.content" class="textarea" :disabled="editingPassage > -1" maxlength="3000" @input="updateContent" />
        <p v-if="errors.content" class="help is-danger">
          {{ errors.content }}
        </p>
        <p class="help">
          {{ passageNote.content.length }}/3000 {{ $t('characters') }}
        </p>
      </div>
    </div>
    <div class="field">
      <label class="label">{{ $t('tags') }}</label>
      <div class="passage-note-editor-tags">
        <div class="passage-note-editor-tags__selected">
          <passage-note-tag-pill
            v-for="tag in selectedTags"
            :key="tag.id"
            :tag="tag"
          />
          <em v-if="!selectedTags.length" class="passage-note-editor-tags__none">
            {{ $t('no_tags_selected') }}
          </em>
        </div>
        <div class="passage-note-editor-tags__actions">
          <button class="button is-small" type="button" @click.prevent="openManageTags">
            {{ $t('manage_tags') }}
          </button>
        </div>
      </div>
      <passage-note-manage-tags-modal
        v-if="showManageTagsModal"
        :open="showManageTagsModal"
        :passage-note-tags="passageNoteTags"
        :selected-tag-ids="draftSelectedTagIds"
        @change="draftSelectedTagIds = $event"
        @done="applyManageTags"
        @cancel="closeManageTags"
      />
    </div>
    <!-- ensures property will be computed because it is accessed-->
    <p hidden="hidden">
      {{ isValid }}
    </p>
  </form>
</template>

<script>
import { Bible } from '@mybiblelog/shared';
import PassageSelector from '@/components/forms/PassageSelector';
import PassageNoteTagPill from '@/components/PassageNoteTagPill';
import PassageNoteManageTagsModal from '@/components/popups/PassageNoteManageTagsModal';
import { useDialogStore } from '~/stores/dialog';
import { usePassageNoteEditorStore } from '~/stores/passage-note-editor';

export default {
  name: 'PassageNoteEditorForm',
  components: {
    PassageSelector,
    PassageNoteTagPill,
    PassageNoteManageTagsModal,
  },
  props: {
    passageNoteTags: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      editingPassage: -1, // index of passage being edited
      editingPassageOriginalValue: null, // original value of passage being edited
      editingNewPassage: false, // if editor passage has not been saved yet
      showManageTagsModal: false,
      draftSelectedTagIds: [],
    };
  },
  computed: {
    passageNoteEditorStore() {
      return usePassageNoteEditorStore();
    },
    passageNote() {
      return this.passageNoteEditorStore.passageNote;
    },
    errors() {
      return this.passageNoteEditorStore.errors;
    },
    selectedTags() {
      const tagIds = this.passageNote?.tags ?? [];
      if (!this.passageNoteTags?.length) {
        return tagIds.map(id => ({ id, label: this.$t('loading'), color: '#333' }));
      }
      return tagIds.map(id => this.passageNoteTags.find(tag => tag.id === id)).filter(Boolean);
    },
    isValid() {
      let valid = true;
      if (this.editingPassage > -1) {
        valid = false;
      }
      // notes require at least `passages` OR `content` to be populated
      if (!this.passageNote.content.length && !this.passageNote.passages.length) {
        valid = false;
      }
      this.passageNoteEditorStore.setValid(valid);
      return valid;
    },
    editingPassageIsDirty() {
      // If no passage is being edited, it can't be dirty
      if (this.editingPassage === -1) {
        return false;
      }
      const passage = this.passageNote.passages[this.editingPassage];
      // If we are editing a new passage, check if it is valid yet
      if (this.editingNewPassage) {
        // Check if the passage being edited is valid
        const { startVerseId, endVerseId } = passage;
        const valid = Bible.validateRange(startVerseId, endVerseId);
        return valid;
      }
      // If we are editing an existing passage, check if it has changed
      return JSON.stringify(passage) !== this.editingPassageOriginalValue;
    },
  },
  methods: {
    displayVerseRange(startVerseId, endVerseId) {
      return Bible.displayVerseRange(startVerseId, endVerseId, this.$i18n.locale);
    },
    passageSelectorChange(index, { startVerseId, endVerseId }) {
      const updatedPassageNote = JSON.parse(JSON.stringify(this.passageNote));
      this.$set(updatedPassageNote.passages, index, { startVerseId, endVerseId });
      this.passageNoteEditorStore.updatePassageNote(updatedPassageNote);
    },
    addPassage() {
      const updatedPassageNote = JSON.parse(JSON.stringify(this.passageNote));
      updatedPassageNote.passages.push({ empty: true });
      this.passageNoteEditorStore.updatePassageNote(updatedPassageNote);
      this.editingPassage = updatedPassageNote.passages.length - 1;
      this.editingNewPassage = true;
    },
    startEditPassage(index) {
      // Prevent editing existing passages when a new passage is being added
      // or when another passage is already being edited
      if (this.editingNewPassage || this.editingPassage > -1) {
        return;
      }
      this.editingPassageOriginalValue = JSON.stringify(this.passageNote.passages[index]);
      this.editingPassage = index;
    },
    saveAndStopEditPassage(index) {
      // Only allow a valid passage to be "saved" to the passageNote
      const { startVerseId, endVerseId } = this.passageNote.passages[index];
      if (Bible.validateRange(startVerseId, endVerseId)) {
        this.editingPassage = -1;
        this.editingNewPassage = false;
        this.editingPassageOriginalValue = null;
      }
    },
    cancelAndStopEditPassage(index) {
      // if a new passage, remove it
      if (this.editingNewPassage) {
        this.removePassage(this.editingPassage);
      }
      // if an existing passage, return to original value
      else {
        const updatedPassageNote = JSON.parse(JSON.stringify(this.passageNote));
        const originalValue = JSON.parse(this.editingPassageOriginalValue);
        this.$set(updatedPassageNote.passages, index, originalValue);
        this.passageNoteEditorStore.updatePassageNote(updatedPassageNote);
      }
      this.editingPassage = -1;
      this.editingNewPassage = false;
      this.editingPassageOriginalValue = null;
    },
    async removePassage(index) {
      // only require confirmation if the passage is already valid (new or existing)
      if (!this.editingNewPassage) {
        const dialogStore = useDialogStore();
        const confirmed = await dialogStore.confirm({ message: this.$t('are_you_sure') });
        if (!confirmed) {
          return;
        }
      }
      if (this.editingPassage === index) {
        this.editingPassage = -1;
      }
      const updatedPassageNote = JSON.parse(JSON.stringify(this.passageNote));
      updatedPassageNote.passages.splice(index, 1);
      this.passageNoteEditorStore.updatePassageNote(updatedPassageNote);
      this.editingNewPassage = false;
      this.editingPassageOriginalValue = null;
    },
    updateContent(event) {
      const updatedPassageNote = JSON.parse(JSON.stringify(this.passageNote));
      updatedPassageNote.content = event.target.value;
      this.passageNoteEditorStore.updatePassageNote(updatedPassageNote);
    },
    updateSelectedTags(tags) {
      const updatedPassageNote = JSON.parse(JSON.stringify(this.passageNote));
      updatedPassageNote.tags = tags;
      this.passageNoteEditorStore.updatePassageNote(updatedPassageNote);
    },
    openManageTags() {
      this.draftSelectedTagIds = JSON.parse(JSON.stringify(this.passageNote?.tags ?? []));
      this.showManageTagsModal = true;
    },
    closeManageTags() {
      this.showManageTagsModal = false;
    },
    applyManageTags(tagIds) {
      this.updateSelectedTags(tagIds);
      this.closeManageTags();
    },
    handleSubmit() {
      this.passageNoteEditorStore.savePassageNote();
    },
  },
};
</script>

<style lang="scss" scoped>
.passages-title {
  display: flex;
  justify-content: space-between;
}
.passage-list {
  margin-bottom: 0.5rem;
}
.passage-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  padding: 0.25rem 0;
  border: 0px dashed #ccc;
  border-top-width: 1px;
  &:first-child {
    border-top-style: solid;
  }
  &:last-child {
    border-bottom-width: 1px;
    border-bottom-style: solid;
  }

  .passage,
  .controls {
    margin: 0.25rem 0;
  }
}
.passage-note-editor-tags {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
}
.passage-note-editor-tags__selected {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  flex: 1;
}
.passage-note-editor-tags__actions {
  flex-shrink: 0;
}
.passage-note-editor-tags__none {
  opacity: 0.8;
}
</style>

<i18n locale="en" lang="json" src="@/locales/sfc/en/components/forms/PassageNoteEditorForm.json" />
<i18n locale="de" lang="json" src="@/locales/sfc/de/components/forms/PassageNoteEditorForm.json" />
<i18n locale="es" lang="json" src="@/locales/sfc/es/components/forms/PassageNoteEditorForm.json" />
<i18n locale="fr" lang="json" src="@/locales/sfc/fr/components/forms/PassageNoteEditorForm.json" />
<i18n locale="pt" lang="json" src="@/locales/sfc/pt/components/forms/PassageNoteEditorForm.json" />
<i18n locale="uk" lang="json" src="@/locales/sfc/uk/components/forms/PassageNoteEditorForm.json" />
