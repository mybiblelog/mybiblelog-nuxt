<template>
  <app-modal :open="open" :title="$t('tag_filters.title')" @close="$emit('close')">
    <template slot="content">
      <passage-note-tag-selector
        :passage-note-tags="passageNoteTags"
        :selected-tag-ids="selectedTagIds"
        @change="(tagIds) => $emit('change', tagIds)"
      />
    </template>
    <template slot="footer">
      <button class="button is-primary" type="button" @click="$emit('close')">
        {{ $t('tag_filters.done') }}
      </button>
    </template>
  </app-modal>
</template>

<script>
import AppModal from '@/components/popups/AppModal';
import PassageNoteTagSelector from '@/components/forms/PassageNoteTagSelector';

export default {
  name: 'PassageNotesTagFilterModal',
  components: {
    AppModal,
    PassageNoteTagSelector,
  },
  props: {
    open: { type: Boolean, default: false },
    passageNoteTags: { type: Array, default: () => [] },
    selectedTagIds: { type: Array, default: () => [] },
  },
};
</script>

<i18n lang="json">
{
  "en": {
    "tag_filters": {
      "title": "Choose Tags",
      "done": "Done"
    }
  },
  "de": {
    "tag_filters": {
      "title": "Tags auswählen",
      "done": "Fertig"
    }
  },
  "es": {
    "tag_filters": {
      "title": "Elegir etiquetas",
      "done": "Hecho"
    }
  },
  "fr": {
    "tag_filters": {
      "title": "Choisir des étiquettes",
      "done": "Terminé"
    }
  },
  "ko": {
    "tag_filters": {
      "title": "태그 선택",
      "done": "완료"
    }
  },
  "pt": {
    "tag_filters": {
      "title": "Escolher Tags",
      "done": "Concluído"
    }
  },
  "uk": {
    "tag_filters": {
      "title": "Вибрати теги",
      "done": "Готово"
    }
  }
}
</i18n>
