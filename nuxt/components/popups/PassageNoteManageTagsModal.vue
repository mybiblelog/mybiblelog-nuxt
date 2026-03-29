<template>
  <transition name="fade" appear>
    <app-modal v-if="open" :title="$t('manage_tags')" @close="cancel">
      <template slot="content">
        <div :class="{ 'manage-tags__disabled': tagEditorOpen }">
          <passage-note-tag-selector
            :passage-note-tags="passageNoteTags"
            :selected-tag-ids="selectedTagIds"
            @change="updateSelectedTagIds"
          />

          <div class="manage-tags__new-row">
            <button class="button is-small is-info" type="button" @click="openNewTagEditor">
              {{ $t('new') }}
            </button>
          </div>
        </div>
      </template>

      <template slot="footer">
        <button class="button is-primary" type="button" :disabled="tagEditorOpen" @click="done">
          {{ $t('done') }}
        </button>
        <button class="button is-light" type="button" :disabled="tagEditorOpen" @click="cancel">
          {{ $t('close') }}
        </button>
      </template>
    </app-modal>
  </transition>
</template>

<script>
import { mapState } from 'vuex';
import AppModal from '@/components/popups/AppModal';
import PassageNoteTagSelector from '@/components/forms/PassageNoteTagSelector';

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
    ...mapState('passage-note-tag-editor', {
      tagEditorOpen: state => state.open,
    }),
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
      this.$store.dispatch('passage-note-tag-editor/openEditor', null);
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
  "de": {
    "manage_tags": "Tags auswählen",
    "new": "Tag erstellen",
    "done": "Fertig",
    "close": "Schließen"
  },
  "en": {
    "manage_tags": "Choose Tags",
    "new": "Create Tag",
    "done": "Done",
    "close": "Close"
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
