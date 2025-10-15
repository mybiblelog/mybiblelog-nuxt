<template>
  <div class="passage-note-tag-selector">
    <label v-for="tag in selectorTags" :key="tag.id" class="passage-note-tag-option" :style="passageNoteTagStyle(tag)">
      <input v-model="tag.selected" type="checkbox" @change="checkboxChanged">{{ tag.label }}
    </label>
    <em v-if="!selectorTags.length">{{ $t('create_a_tag_to_select_it_here') }}</em>
  </div>
</template>

<script>
export default {
  name: 'PassageNoteTagSelector',
  props: {
    passageNoteTags: {
      type: Array,
      default: () => [],
    },
    selectedTagIds: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    // this is the full list of tag options with a `selected` property added
    selectorTags() {
      const passageNoteTags = JSON.parse(JSON.stringify(this.passageNoteTags));
      return passageNoteTags.map((tag) => {
        tag.selected = !!this.selectedTagIds.find(selectedTagId => selectedTagId === tag.id);
        return tag;
      });
    },
  },
  methods: {
    passageNoteTagStyle(tag) {
      return {
        'background-color': tag.color,
      };
    },
    checkboxChanged() {
      const currentSelectedTagIds =
        this.selectorTags.filter(tag => tag.selected)
          .map(selectedTag => selectedTag.id);
      this.$emit('change', currentSelectedTagIds);
    },
  },
};
</script>

<style lang="scss" scoped>
.passage-note-tag-selector {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
}
.passage-note-tag-option {
  display: flex;
  align-items: center;
  color: #fff;
  text-shadow: 0 0 2px #000, 1px 1px 0 rgba(0,0,0,0.5);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  margin-right: 0.25rem;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow-x: hidden;

  input[type='checkbox'] {
    margin-right: 0.25rem;
  }
}
</style>

<i18n lang="json">
{
  "de": {
    "create_a_tag_to_select_it_here": "Erstellen Sie ein Tag, um es hier auszuwählen."
  },
  "en": {
    "create_a_tag_to_select_it_here": "Create a tag to select it here."
  },
  "es": {
    "create_a_tag_to_select_it_here": "Crea una etiqueta para seleccionarla aquí."
  },
  "fr": {
    "create_a_tag_to_select_it_here": "Créez une étiquette pour la sélectionner ici."
  },
  "pt": {
    "create_a_tag_to_select_it_here": "Crie uma tag para selecioná-la aqui."
  },
  "uk": {
    "create_a_tag_to_select_it_here": "Створіть тег, щоб вибрати його тут."
  }
}
</i18n>
