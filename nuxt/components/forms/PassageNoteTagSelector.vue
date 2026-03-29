<template>
  <div class="passage-note-tag-selector">
    <div class="passage-note-tag-selector__grid">
      <label
        v-for="tag in selectorTags"
        :key="tag.id"
        class="passage-note-tag-option"
        :class="{ 'passage-note-tag-option--selected': tag.selected }"
        :style="passageNoteTagStyle(tag)"
      >
        <input v-model="tag.selected" type="checkbox" @change="checkboxChanged">
        <span class="passage-note-tag-option__label">{{ tag.label }}</span>
      </label>
      <em v-if="!selectorTags.length" class="passage-note-tag-selector__empty">
        {{ $t('create_a_tag_to_select_it_here') }}
      </em>
    </div>
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
        '--tag-color': tag?.color || '#999',
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
  /* stylelint-disable-next-line property-no-unknown */
  container-type: inline-size;
  max-width: 100%;
}

.passage-note-tag-selector__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.25rem;
  max-width: 100%;
}

/* stylelint-disable-next-line at-rule-no-unknown */
@container (max-width: 300px) {
  .passage-note-tag-selector__grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

.passage-note-tag-selector__empty {
  grid-column: 1 / -1;
}
.passage-note-tag-option {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  cursor: pointer;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  box-sizing: border-box;

  color: #363636;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-left: 0.35rem solid var(--tag-color);
  padding: 0.25rem 0.6rem;
  border-radius: 0.25rem;

  -webkit-user-select: none;
  user-select: none;

  input[type='checkbox'] {
    flex: 0 0 auto;
  }
}

.passage-note-tag-option__label {
  flex: 1 1 auto;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.passage-note-tag-option--selected {
  background: rgba(238, 238, 238, 1);
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
