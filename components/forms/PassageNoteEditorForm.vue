<template>
  <form @submit.prevent="handleSubmit">
    <div v-if="errors._form" class="help is-danger">
      <div class="help is-danger">
        {{ errors._form }}
      </div>
    </div>
    <div class="field passages-title">
      <label class="label">{{ $t('passage') }}</label>
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
            <button class="button" @click.prevent="startEditPassage(index)">
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
        <textarea v-model="passageNote.content" class="textarea" :disabled="editingPassage > -1" maxlength="3000" />
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
import Bible from '@/shared/bible';
import PassageSelector from '@/components/forms/PassageSelector';
import PassageNoteTagSelector from '@/components/forms/PassageNoteTagSelector';

export default {
  name: 'PassageNoteEditorForm',
  components: {
    PassageSelector,
    PassageNoteTagSelector,
  },
  props: {
    populateWith: {
      type: Object,
      default: () => ({ empty: true }),
    },
    errors: {
      type: Object,
      default: () => {},
    },
    passageNoteTags: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      passageNote: {
        id: null,
        passages: [],
        content: '',
        tags: [],
      },
      cleanFormValue: null,
      editingPassage: -1, // index of passage being edited
      editingPassageOriginalValue: null, // original value of passage being edited
      editingNewPassage: false, // if editor passage has not been saved yet
    };
  },
  computed: {
    // Used by parent component directly -- this is an antipattern
    isDirty() {
      return JSON.stringify(this.passageNote) !== this.cleanFormValue;
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
      this.$emit('validStateChange', valid);
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
  created() {
    if (!this.populateWith.empty) {
      // ensure our data is cleanly re-created and totally separate
      // we don't want to modify Vuex store data or have any other side effects
      this.passageNote = JSON.parse(JSON.stringify(this.populateWith));
    }
    this.cleanFormValue = JSON.stringify(this.passageNote);
  },
  methods: {
    displayVerseRange(startVerseId, endVerseId) {
      return Bible.displayVerseRange(startVerseId, endVerseId, this.$i18n.locale);
    },
    passageSelectorChange(index, { startVerseId, endVerseId }) {
      this.$set(this.passageNote.passages, index, { startVerseId, endVerseId });
    },
    addPassage() {
      this.passageNote.passages.push({ empty: true });
      this.editingPassage = this.passageNote.passages.length - 1;
      this.editingNewPassage = true;
    },
    startEditPassage(index) {
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
        const originalValue = JSON.parse(this.editingPassageOriginalValue);
        this.$set(this.passageNote.passages, index, originalValue);
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
      this.passageNote.passages.splice(index, 1);
      this.editingNewPassage = false;
      this.editingPassageOriginalValue = null;
    },
    updateSelectedTags(tags) {
      this.$set(this.passageNote, 'tags', tags);
    },
    handleSubmit() {
      this.$emit('submit', this.passageNote);
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
    "passage": "Passage",
    "add_passage": "Passage hinzufügen",
    "done": "Fertig",
    "cancel": "Abbrechen",
    "remove": "Entfernen",
    "no_passages": "Noch keine Passagen hinzugefügt",
    "content": "Inhalt (Markdown)",
    "tags": "Tags",
    "characters": "Zeichen",
    "are_you_sure": "Sind Sie sicher, dass Sie diese Passage entfernen möchten?"
  },
  "en": {
    "passage": "Passage",
    "add_passage": "Add Passage",
    "done": "Done",
    "cancel": "Cancel",
    "remove": "Remove",
    "no_passages": "No passages added yet",
    "content": "Content (Markdown)",
    "tags": "Tags",
    "characters": "characters",
    "are_you_sure": "Are you sure you want to remove this passage?"
  },
  "es": {
    "passage": "Pasaje",
    "add_passage": "Añadir Pasaje",
    "done": "Hecho",
    "cancel": "Cancelar",
    "remove": "Eliminar",
    "no_passages": "No hay pasajes",
    "content": "Contenido (Markdown)",
    "tags": "Etiquetas",
    "characters": "caracteres",
    "are_you_sure": "¿Estás seguro de que quieres eliminar este pasaje?"
  },
  "fr": {
    "passage": "Passage",
    "add_passage": "Ajouter un passage",
    "done": "Terminé",
    "cancel": "Annuler",
    "remove": "Supprimer",
    "no_passages": "Aucun passage",
    "content": "Contenu (Markdown)",
    "tags": "Étiquettes",
    "characters": "caractères",
    "are_you_sure": "Êtes-vous sûr de vouloir supprimer ce passage ?"
  },
  "pt": {
    "passage": "Passagem",
    "add_passage": "Adicionar Passagem",
    "done": "Concluído",
    "cancel": "Cancelar",
    "remove": "Remover",
    "no_passages": "Nenhuma passagem adicionada ainda",
    "content": "Conteúdo (Markdown)",
    "tags": "Tags",
    "characters": "caracteres",
    "are_you_sure": "Tem certeza de que deseja remover esta passagem?"
  },
  "uk": {
    "passage": "Пасаж",
    "add_passage": "Додати пасаж",
    "done": "Готово",
    "cancel": "Скасувати",
    "remove": "Видалити",
    "no_passages": "Немає пасажів",
    "content": "Зміст (Markdown)",
    "tags": "Теги",
    "characters": "символи",
    "are_you_sure": "Ви впевнені, що хочете видалити цей пасаж?"
  }
}
</i18n>
