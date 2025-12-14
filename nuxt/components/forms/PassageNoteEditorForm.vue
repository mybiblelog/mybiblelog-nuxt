<template>
  <form @submit.prevent="handleSubmit">
    <div v-if="errors._form" class="help is-danger">
      <div class="help is-danger">
        {{ errors._form }}
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
      <passage-note-tag-selector :passage-note-tags="passageNoteTags" :selected-tag-ids="passageNote.tags" @change="updateSelectedTags" />
    </div>
    <!-- ensures property will be computed because it is accessed-->
    <p hidden="hidden">
      {{ isValid }}
    </p>
  </form>
</template>

<script>
import { mapState } from 'vuex';
import { Bible } from '@mybiblelog/shared';
import PassageSelector from '@/components/forms/PassageSelector';
import PassageNoteTagSelector from '@/components/forms/PassageNoteTagSelector';

export default {
  name: 'PassageNoteEditorForm',
  components: {
    PassageSelector,
    PassageNoteTagSelector,
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
    };
  },
  computed: {
    ...mapState('passage-note-editor', {
      passageNote: state => state.passageNote,
      errors: state => state.errors,
    }),
    isValid() {
      let valid = true;
      if (this.editingPassage > -1) {
        valid = false;
      }
      // notes require at least `passages` OR `content` to be populated
      if (!this.passageNote.content.length && !this.passageNote.passages.length) {
        valid = false;
      }
      this.$store.dispatch('passage-note-editor/setValid', valid);
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
      this.$store.dispatch('passage-note-editor/updatePassageNote', updatedPassageNote);
    },
    addPassage() {
      const updatedPassageNote = JSON.parse(JSON.stringify(this.passageNote));
      updatedPassageNote.passages.push({ empty: true });
      this.$store.dispatch('passage-note-editor/updatePassageNote', updatedPassageNote);
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
        this.$store.dispatch('passage-note-editor/updatePassageNote', updatedPassageNote);
      }
      this.editingPassage = -1;
      this.editingNewPassage = false;
      this.editingPassageOriginalValue = null;
    },
    async removePassage(index) {
      // only require confirmation if the passage is already valid (new or existing)
      if (!this.editingNewPassage) {
        const confirmed = await this.$store.dispatch('dialog/confirm', {
          message: this.$t('are_you_sure'),
        });
        if (!confirmed) {
          return;
        }
      }
      if (this.editingPassage === index) {
        this.editingPassage = -1;
      }
      const updatedPassageNote = JSON.parse(JSON.stringify(this.passageNote));
      updatedPassageNote.passages.splice(index, 1);
      this.$store.dispatch('passage-note-editor/updatePassageNote', updatedPassageNote);
      this.editingNewPassage = false;
      this.editingPassageOriginalValue = null;
    },
    updateContent(event) {
      const updatedPassageNote = JSON.parse(JSON.stringify(this.passageNote));
      updatedPassageNote.content = event.target.value;
      this.$store.dispatch('passage-note-editor/updatePassageNote', updatedPassageNote);
    },
    updateSelectedTags(tags) {
      const updatedPassageNote = JSON.parse(JSON.stringify(this.passageNote));
      updatedPassageNote.tags = tags;
      this.$store.dispatch('passage-note-editor/updatePassageNote', updatedPassageNote);
    },
    handleSubmit() {
      this.$store.dispatch('passage-note-editor/savePassageNote');
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
</style>

<i18n lang="json">
{
  "de": {
    "passages": "Passagen",
    "add_passage": "Passage hinzufügen",
    "done": "Fertig",
    "cancel": "Abbrechen",
    "remove": "Entfernen",
    "no_passages": "Noch keine Passagen hinzugefügt",
    "content": "Inhalt",
    "tags": "Tags",
    "characters": "Zeichen",
    "are_you_sure": "Sind Sie sicher, dass Sie diese Passage entfernen möchten?"
  },
  "en": {
    "passages": "Passages",
    "add_passage": "Add Passage",
    "done": "Done",
    "cancel": "Cancel",
    "remove": "Remove",
    "no_passages": "No passages added yet",
    "content": "Content",
    "tags": "Tags",
    "characters": "characters",
    "are_you_sure": "Are you sure you want to remove this passage?"
  },
  "es": {
    "passages": "Pasajes",
    "add_passage": "Añadir Pasaje",
    "done": "Hecho",
    "cancel": "Cancelar",
    "remove": "Eliminar",
    "no_passages": "No hay pasajes",
    "content": "Contenido",
    "tags": "Etiquetas",
    "characters": "caracteres",
    "are_you_sure": "¿Estás seguro de que quieres eliminar este pasaje?"
  },
  "fr": {
    "passages": "Passages",
    "add_passage": "Ajouter un passage",
    "done": "Terminé",
    "cancel": "Annuler",
    "remove": "Supprimer",
    "no_passages": "Aucun passage",
    "content": "Contenu",
    "tags": "Étiquettes",
    "characters": "caractères",
    "are_you_sure": "Êtes-vous sûr de vouloir supprimer ce passage ?"
  },
  "pt": {
    "passages": "Passagens",
    "add_passage": "Adicionar Passagem",
    "done": "Concluído",
    "cancel": "Cancelar",
    "remove": "Remover",
    "no_passages": "Nenhuma passagem adicionada ainda",
    "content": "Conteúdo",
    "tags": "Tags",
    "characters": "caracteres",
    "are_you_sure": "Tem certeza de que deseja remover esta passagem?"
  },
  "uk": {
    "passages": "Пасажі",
    "add_passage": "Додати пасаж",
    "done": "Готово",
    "cancel": "Скасувати",
    "remove": "Видалити",
    "no_passages": "Немає пасажів",
    "content": "Зміст",
    "tags": "Теги",
    "characters": "символи",
    "are_you_sure": "Ви впевнені, що хочете видалити цей пасаж?"
  }
}
</i18n>
