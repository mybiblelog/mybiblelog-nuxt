<template>
  <div class="passage-notes-query-manager">
    <div>
      <div class="field">
        <label class="label">{{ $t('search_text') }}</label>
        <div class="control">
          <input
            v-model.trim="draft.searchText"
            class="input"
            type="text"
            :placeholder="$t('search_placeholder')"
          >
        </div>
      </div>

      <hr class="passage-notes-query-manager__divider">

      <div class="field">
        <label class="label">{{ $t('tag_filters') }}</label>
        <passage-note-tag-selector
          :passage-note-tags="passageNoteTags"
          :selected-tag-ids="draft.filterTags"
          @change="onTagIdsChange"
        />
      </div>

      <div v-if="!hasSelectedTags" class="field">
        <div class="control">
          <label class="checkbox">
            <input v-model="onlyUntaggedNotes" type="checkbox">
            {{ $t('tag_only_untagged') }}
          </label>
        </div>
      </div>

      <div v-if="hasSelectedTags" class="field">
        <label class="label">{{ $t('tag_match') }}</label>
        <div class="control">
          <label class="radio">
            <input v-model="draft.filterTagMatching" type="radio" value="any">
            {{ $t('tag_match_any') }}
          </label>
        </div>
        <div class="control">
          <label class="radio">
            <input v-model="draft.filterTagMatching" type="radio" value="all">
            {{ $t('tag_match_all') }}
          </label>
        </div>
        <div class="control">
          <label class="radio">
            <input v-model="draft.filterTagMatching" type="radio" value="exact">
            {{ $t('tag_match_exact') }}
          </label>
        </div>
      </div>

      <hr class="passage-notes-query-manager__divider">

      <div class="field">
        <label class="label">{{ $t('passage') }}</label>
        <div class="passage-notes-query-manager__passage-row">
          <passage-selector
            :key="passageSelectorKey"
            :populate-with="passageSelectorPopulateWith"
            @change="({ startVerseId, endVerseId }) => setDraft({ filterPassageStartVerseId: startVerseId, filterPassageEndVerseId: endVerseId })"
          />
          <button
            v-if="hasSelectedPassage"
            class="button is-light passage-notes-query-manager__clear-button"
            type="button"
            @click="clearDraftPassage"
          >
            {{ $t('clear') }}
          </button>
        </div>
      </div>

      <div v-if="hasSelectedPassage" class="field">
        <label class="label">{{ $t('passage_match') }}</label>
        <div class="control">
          <label class="radio passage-notes-query-manager__radio-option">
            <input v-model="draft.filterPassageMatching" type="radio" value="inclusive">
            <span class="passage-notes-query-manager__radio-title">{{ $t('passage_match_inclusive') }}</span>
            <span class="passage-notes-query-manager__radio-help" v-html="$t('passage_match_inclusive_description')" />
          </label>
        </div>
        <div class="control">
          <label class="radio passage-notes-query-manager__radio-option">
            <input v-model="draft.filterPassageMatching" type="radio" value="exclusive">
            <span class="passage-notes-query-manager__radio-title">{{ $t('passage_match_exclusive') }}</span>
            <span class="passage-notes-query-manager__radio-help" v-html="$t('passage_match_exclusive_description')" />
          </label>
        </div>
      </div>

      <hr class="passage-notes-query-manager__divider">

      <div class="field">
        <label class="label">{{ $t('sort') }}</label>
        <div class="control">
          <label class="radio">
            <input v-model="draftSort" type="radio" value="createdAt:descending">
            {{ $t('sort_newest_first') }}
          </label>
        </div>
        <div class="control">
          <label class="radio">
            <input v-model="draftSort" type="radio" value="createdAt:ascending">
            {{ $t('sort_oldest_first') }}
          </label>
        </div>
      </div>

      <div class="field">
        <label class="label">{{ $t('page_size') }}</label>
        <div class="control">
          <div class="select">
            <select :value="draft.limit" @change="setDraft({ limit: Number($event.target.value) })">
              <option :value="10">
                10
              </option>
              <option :value="20">
                20
              </option>
              <option :value="50">
                50
              </option>
            </select>
          </div>
        </div>
      </div>

      <div class="passage-notes-query-manager__actions">
        <button class="button is-primary" type="button" :disabled="!isDirty" @click="applyDraft">
          {{ $t('apply') }}
        </button>
        <button class="button is-light" type="button" :disabled="!isDirty" @click="cancelDraft">
          {{ $t('cancel') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import PassageNoteTagSelector from '@/components/forms/PassageNoteTagSelector';
import PassageSelector from '@/components/forms/PassageSelector';

const DEFAULT_DRAFT = {
  limit: 10,
  sortOn: 'createdAt',
  sortDirection: 'descending',
  filterTags: [],
  filterTagMatching: 'any',
  searchText: '',
  filterPassageStartVerseId: 0,
  filterPassageEndVerseId: 0,
  filterPassageMatching: 'inclusive',
};

function pickManagedQuery(query) {
  const q = query || {};
  return {
    limit: q.limit ?? DEFAULT_DRAFT.limit,
    sortOn: q.sortOn ?? DEFAULT_DRAFT.sortOn,
    sortDirection: q.sortDirection ?? DEFAULT_DRAFT.sortDirection,
    filterTags: Array.isArray(q.filterTags) ? [...q.filterTags] : [...DEFAULT_DRAFT.filterTags],
    filterTagMatching: q.filterTagMatching ?? DEFAULT_DRAFT.filterTagMatching,
    searchText: q.searchText ?? DEFAULT_DRAFT.searchText,
    filterPassageStartVerseId: q.filterPassageStartVerseId ?? DEFAULT_DRAFT.filterPassageStartVerseId,
    filterPassageEndVerseId: q.filterPassageEndVerseId ?? DEFAULT_DRAFT.filterPassageEndVerseId,
    filterPassageMatching: q.filterPassageMatching ?? DEFAULT_DRAFT.filterPassageMatching,
  };
}

function deepEqualManaged(a, b) {
  const aa = pickManagedQuery(a);
  const bb = pickManagedQuery(b);
  return JSON.stringify(aa) === JSON.stringify(bb);
}

export default {
  name: 'PassageNotesQueryManager',
  components: {
    PassageNoteTagSelector,
    PassageSelector,
  },
  props: {
    appliedQuery: {
      type: Object,
      default: () => ({}),
    },
    passageNoteTags: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    const baseline = pickManagedQuery(this.appliedQuery);
    return {
      baseline,
      draft: pickManagedQuery(this.appliedQuery),
      passageSelectorKey: 0,
    };
  },
  computed: {
    isDirty() {
      return !deepEqualManaged(this.draft, this.baseline);
    },
    hasSelectedTags() {
      return Array.isArray(this.draft.filterTags) && this.draft.filterTags.length > 0;
    },
    hasSelectedPassage() {
      return !!(this.draft.filterPassageStartVerseId && this.draft.filterPassageEndVerseId);
    },
    onlyUntaggedNotes: {
      get() {
        return this.draft.filterTagMatching === 'exact' &&
          Array.isArray(this.draft.filterTags) &&
          this.draft.filterTags.length === 0;
      },
      set(enabled) {
        if (enabled) {
          this.setDraft({ filterTags: [], filterTagMatching: 'exact' });
          return;
        }
        if (this.draft.filterTagMatching === 'exact' && (!this.draft.filterTags || this.draft.filterTags.length === 0)) {
          this.setDraft({ filterTagMatching: 'any' });
        }
      },
    },
    draftSort: {
      get() {
        return `${this.draft.sortOn}:${this.draft.sortDirection}`;
      },
      set(value) {
        const [sortOn, sortDirection] = (value || '').split(':');
        this.setDraft({ sortOn, sortDirection });
      },
    },
    passageSelectorPopulateWith() {
      if (this.draft.filterPassageStartVerseId && this.draft.filterPassageEndVerseId) {
        return {
          empty: false,
          startVerseId: this.draft.filterPassageStartVerseId,
          endVerseId: this.draft.filterPassageEndVerseId,
        };
      }
      return { empty: true };
    },
  },
  watch: {
    appliedQuery: {
      deep: true,
      handler(nextAppliedQuery) {
        if (this.isDirty) { return; }
        this.baseline = pickManagedQuery(nextAppliedQuery);
        this.draft = pickManagedQuery(nextAppliedQuery);
        this.passageSelectorKey += 1;
      },
    },
  },
  methods: {
    setDraft(update) {
      this.draft = { ...this.draft, ...update };
    },
    onTagIdsChange(tagIds) {
      const nextTagIds = Array.isArray(tagIds) ? tagIds : [];
      const hadNoTags = !Array.isArray(this.draft.filterTags) || this.draft.filterTags.length === 0;
      if (nextTagIds.length && this.draft.filterTagMatching === 'exact' && hadNoTags) {
        this.setDraft({ filterTags: nextTagIds, filterTagMatching: 'any' });
        return;
      }
      this.setDraft({ filterTags: nextTagIds });
    },
    resetDraftToApplied() {
      this.baseline = pickManagedQuery(this.appliedQuery);
      this.draft = pickManagedQuery(this.appliedQuery);
      this.passageSelectorKey += 1;
    },
    async confirmAndReset() {
      const confirmed = await this.$store.dispatch('dialog/confirm', {
        message: this.$t('reset_confirm'),
      });
      if (!confirmed) { return; }

      const update = pickManagedQuery(JSON.parse(JSON.stringify(DEFAULT_DRAFT)));
      this.baseline = pickManagedQuery(update);
      this.draft = pickManagedQuery(update);
      this.passageSelectorKey += 1;
      this.$emit('apply', update);
    },
    clearDraftPassage() {
      this.setDraft({
        filterPassageStartVerseId: 0,
        filterPassageEndVerseId: 0,
      });
      this.passageSelectorKey += 1;
    },
    applyDraft() {
      const update = pickManagedQuery(this.draft);
      this.baseline = pickManagedQuery(update);
      this.draft = pickManagedQuery(update);
      this.$emit('apply', update);
    },
    cancelDraft() {
      this.resetDraftToApplied();
      this.$emit('cancel');
    },
  },
};
</script>

<style lang="scss" scoped>
.passage-notes-query-manager__divider {
  margin: 1rem 0;
}

.passage-notes-query-manager__actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.passage-notes-query-manager__passage-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.passage-notes-query-manager__clear-button {
  font-size: 0.85rem;
  padding: 0.3rem 0.55rem;
  line-height: 1.2;
  white-space: nowrap;
}

.passage-notes-query-manager__radio-option {
  display: grid;
  grid-template-columns: 1.25rem 1fr;
  grid-template-rows: auto auto;
  column-gap: 0.35rem;
  row-gap: 0.1rem;
  align-items: start;

  input {
    grid-column: 1;
    grid-row: 1 / span 2;
    margin-top: 0.2rem;
  }
}

.passage-notes-query-manager__radio-title {
  grid-column: 2;
  grid-row: 1;
}

.passage-notes-query-manager__radio-help {
  grid-column: 2;
  grid-row: 2;
  font-size: 0.9em;
  color: rgba(54, 54, 54, 0.85);
}
</style>

<i18n lang="json">
{
  "de": {
    "title": "Ansichtsoptionen",
    "reset": "Zurücksetzen",
    "reset_confirm": "Möchten Sie die Such-/Filter-/Sortiereinstellungen wirklich zurücksetzen?",
    "search_text": "Suchtext",
    "search_placeholder": "Text eingeben…",
    "tag_filters": "Tag-Filter",
    "tag_only_untagged": "Nur ungetaggte Notizen",
    "tag_match": "Übereinstimmung",
    "tag_match_any": "Beliebig",
    "tag_match_all": "Alle",
    "tag_match_exact": "Exakt",
    "passage": "Passage",
    "clear": "Löschen",
    "passage_match": "Übereinstimmung",
    "passage_match_inclusive": "Inklusiv",
    "passage_match_exclusive": "Exklusiv",
    "passage_match_inclusive_description": "Stimmt mit einer Notiz überein, wenn sich einer ihrer Verse mit Ihrer Filterpassage überschneidet.",
    "passage_match_exclusive_description": "Stimmt mit einer Notiz überein, wenn einer ihrer Verse innerhalb Ihrer Filterpassage liegt.",
    "sort": "Sortieren",
    "sort_newest_first": "Neueste zuerst",
    "sort_oldest_first": "Älteste zuerst",
    "page_size": "Seitengröße",
    "apply": "Anwenden",
    "cancel": "Abbrechen"
  },
  "en": {
    "title": "View Options",
    "reset": "Reset",
    "reset_confirm": "Are you sure you want to reset search/filter/sort settings?",
    "search_text": "Search Text",
    "search_placeholder": "Enter text…",
    "tag_filters": "Tag Filters",
    "tag_only_untagged": "Only untagged notes",
    "tag_match": "Match",
    "tag_match_any": "Any",
    "tag_match_all": "All",
    "tag_match_exact": "Exact",
    "passage": "Passage",
    "clear": "Clear",
    "passage_match": "Match",
    "passage_match_inclusive": "Inclusive",
    "passage_match_exclusive": "Exclusive",
    "passage_match_inclusive_description": "Matches a note if any of its verses overlap your filter passage.",
    "passage_match_exclusive_description": "Matches a note if any of its verses are within your filter passage.",
    "sort": "Sort",
    "sort_newest_first": "Newest First",
    "sort_oldest_first": "Oldest First",
    "page_size": "Page size",
    "apply": "Apply",
    "cancel": "Cancel"
  },
  "es": {
    "title": "Opciones de vista",
    "reset": "Restablecer",
    "reset_confirm": "¿Está seguro de que desea restablecer la búsqueda / filtros / orden?",
    "search_text": "Texto de búsqueda",
    "search_placeholder": "Ingrese texto…",
    "tag_filters": "Filtros de etiquetas",
    "tag_only_untagged": "Solo notas sin etiquetas",
    "tag_match": "Partido",
    "tag_match_any": "Cualquier",
    "tag_match_all": "Todas",
    "tag_match_exact": "Exacto",
    "passage": "Pasaje",
    "clear": "Limpiar",
    "passage_match": "Partido",
    "passage_match_inclusive": "Inclusivo",
    "passage_match_exclusive": "Exclusivo",
    "passage_match_inclusive_description": "Coincide con una nota si alguno de sus versículos se superpone a su pasaje de filtro.",
    "passage_match_exclusive_description": "Coincide con una nota si alguno de sus versículos está dentro de su pasaje de filtro.",
    "sort": "Ordenar",
    "sort_newest_first": "Más reciente primero",
    "sort_oldest_first": "Más antiguo primero",
    "page_size": "Tamaño de página",
    "apply": "Aplicar",
    "cancel": "Cancelar"
  },
  "fr": {
    "title": "Options d’affichage",
    "reset": "Réinitialiser",
    "reset_confirm": "Êtes-vous sûr de vouloir réinitialiser la recherche / les filtres / le tri ?",
    "search_text": "Rechercher un texte",
    "search_placeholder": "Entrez le texte…",
    "tag_filters": "Filtres de tag",
    "tag_only_untagged": "Uniquement les notes sans tags",
    "tag_match": "Correspondance",
    "tag_match_any": "Tous",
    "tag_match_all": "Tout",
    "tag_match_exact": "Exact",
    "passage": "Passage",
    "clear": "Effacer",
    "passage_match": "Correspondance",
    "passage_match_inclusive": "Inclusif",
    "passage_match_exclusive": "Exclusif",
    "passage_match_inclusive_description": "Correspond si l’un de ses versets chevauche votre passage de filtre.",
    "passage_match_exclusive_description": "Correspond si l’un de ses versets se trouve dans votre passage de filtre.",
    "sort": "Trier",
    "sort_newest_first": "Le plus récent d'abord",
    "sort_oldest_first": "Plus ancien en premier",
    "page_size": "Taille de page",
    "apply": "Appliquer",
    "cancel": "Annuler"
  },
  "pt": {
    "title": "Opções de visualização",
    "reset": "Reiniciar",
    "reset_confirm": "Tem certeza de que deseja reiniciar as configurações de busca / filtro / ordenação?",
    "search_text": "Pesquisar Texto",
    "search_placeholder": "Digite o texto…",
    "tag_filters": "Filtros de Tag",
    "tag_only_untagged": "Apenas notas sem tags",
    "tag_match": "Corresponder",
    "tag_match_any": "Qualquer",
    "tag_match_all": "Tudo",
    "tag_match_exact": "Exato",
    "passage": "Passagem",
    "clear": "Limpar",
    "passage_match": "Corresponder",
    "passage_match_inclusive": "Inclusivo",
    "passage_match_exclusive": "Exclusivo",
    "passage_match_inclusive_description": "Corresponde se algum de seus versículos se sobrepõe à sua passagem de filtro.",
    "passage_match_exclusive_description": "Corresponde se algum de seus versículos está dentro da sua passagem de filtro.",
    "sort": "Ordenar",
    "sort_newest_first": "Mais Recentes Primeiro",
    "sort_oldest_first": "Mais Antigos Primeiro",
    "page_size": "Tamanho da página",
    "apply": "Aplicar",
    "cancel": "Cancelar"
  },
  "uk": {
    "title": "Параметри перегляду",
    "reset": "Скинути",
    "reset_confirm": "Ви впевнені, що хочете скинути налаштування пошуку / фільтра / сортування?",
    "search_text": "Текст для пошуку",
    "search_placeholder": "Введіть текст…",
    "tag_filters": "Фільтри за тегами",
    "tag_only_untagged": "Лише нотатки без тегів",
    "tag_match": "Співпадіння",
    "tag_match_any": "Будь-який",
    "tag_match_all": "Всі",
    "tag_match_exact": "Точний",
    "passage": "Вірш",
    "clear": "Очистити",
    "passage_match": "Співпадіння",
    "passage_match_inclusive": "Включно",
    "passage_match_exclusive": "Виключно",
    "passage_match_inclusive_description": "Збігається, якщо будь-який її вірш перетинається з вашим фільтрованим уривком.",
    "passage_match_exclusive_description": "Збігається, якщо будь-який її вірш знаходиться всередині вашого фільтрованого уривка.",
    "sort": "Сортувати",
    "sort_newest_first": "Спочатку нові",
    "sort_oldest_first": "Спочатку старі",
    "page_size": "Розмір сторінки",
    "apply": "Застосувати",
    "cancel": "Скасувати"
  }
}
</i18n>
