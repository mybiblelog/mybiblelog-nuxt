<template>
  <form @submit.prevent="handleSubmit">
    <div v-if="errors._form" class="help is-danger">
      <div class="help is-danger">
        {{ errors._form }}
      </div>
    </div>
    <div class="field">
      <div class="label">
        {{ $t('label') }}
      </div>
      <div v-if="errors.label" class="help is-danger">
        {{ $terr(errors.label, { field: $t('label') }) }}
      </div>
      <div class="control">
        <input :value="passageNoteTag.label" class="input" type="text" maxlength="32" @input="updateLabel">
      </div>
    </div>
    <div class="field">
      <div class="label">
        {{ $t('color') }}
      </div>
      <div class="control">
        <input :value="passageNoteTag.color" class="input" type="color" @input="updateColor">
      </div>
    </div>
    <div class="field">
      <div class="label">
        {{ $t('description') }}
      </div>
      <div class="control">
        <textarea :value="passageNoteTag.description" class="textarea" maxlength="1500" @input="updateDescription" />
      </div>
    </div>
    <!-- ensures property will be computed because it is accessed-->
    <p hidden="hidden">
      {{ isValid }}
    </p>
  </form>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'PassageNoteTagEditorForm',
  computed: {
    ...mapState('passage-note-tag-editor', {
      passageNoteTag: state => state.passageNoteTag,
      errors: state => state.errors,
    }),
    isValid() {
      const valid = this.validatePassageNoteTag(this.passageNoteTag);
      this.$store.dispatch('passage-note-tag-editor/setValid', valid);
      return valid;
    },
  },
  methods: {
    validatePassageNoteTag(passageNoteTag) {
      if (passageNoteTag.label.trim().length < 1 || passageNoteTag.label.length > 32) {
        return false;
      }
      if (!/^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/.test(passageNoteTag.color)) {
        return false;
      }
      return true;
    },
    updateLabel(event) {
      const updatedPassageNoteTag = JSON.parse(JSON.stringify(this.passageNoteTag));
      updatedPassageNoteTag.label = event.target.value;
      this.$store.dispatch('passage-note-tag-editor/updatePassageNoteTag', updatedPassageNoteTag);
    },
    updateColor(event) {
      const updatedPassageNoteTag = JSON.parse(JSON.stringify(this.passageNoteTag));
      updatedPassageNoteTag.color = event.target.value;
      this.$store.dispatch('passage-note-tag-editor/updatePassageNoteTag', updatedPassageNoteTag);
    },
    updateDescription(event) {
      const updatedPassageNoteTag = JSON.parse(JSON.stringify(this.passageNoteTag));
      updatedPassageNoteTag.description = event.target.value;
      this.$store.dispatch('passage-note-tag-editor/updatePassageNoteTag', updatedPassageNoteTag);
    },
    handleSubmit() {
      this.$store.dispatch('passage-note-tag-editor/savePassageNoteTag');
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
    "label": "Label",
    "color": "Farbe",
    "description": "Beschreibung"
  },
  "en": {
    "label": "Label",
    "color": "Color",
    "description": "Description"
  },
  "es": {
    "label": "Etiqueta",
    "color": "Color",
    "description": "Descripción"
  },
  "fr": {
    "label": "Étiquette",
    "color": "Couleur",
    "description": "Description"
  },
  "pt": {
    "label": "Nome",
    "color": "Cor",
    "description": "Descrição"
  },
  "uk": {
    "label": "Мітка",
    "color": "Колір",
    "description": "Опис"
  }
}
</i18n>
