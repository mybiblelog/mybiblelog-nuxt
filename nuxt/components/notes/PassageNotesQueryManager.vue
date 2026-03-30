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
        <div v-if="hasSelectedTags" class="passage-notes-query-manager__selected-tags">
          <span
            v-for="tag in selectedTags"
            :key="tag.id"
            class="passage-notes-query-manager__selected-tag"
            :style="{ '--tag-color': tag?.color || '#999' }"
          >
            {{ tag.label || tag.id }}
          </span>
        </div>
        <div class="passage-notes-query-manager__tag-actions">
          <button class="button is-light" type="button" @click="openTagFilterModal">
            {{ $t('tag_select.choose') }}
          </button>
          <button
            v-if="hasSelectedTags"
            class="button is-light"
            type="button"
            @click="clearTagSelection"
          >
            {{ $t('tag_select.clear') }}
          </button>
        </div>
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
        <verse-input v-model="passageRangeModel" :multi-verse="true" />
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

      <hr class="passage-notes-query-manager__divider">

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

    <passage-notes-tag-filter-modal
      :open="showTagFilterModal"
      :passage-note-tags="passageNoteTags"
      :selected-tag-ids="draft.filterTags"
      @change="onTagIdsChange"
      @close="closeTagFilterModal"
    />
  </div>
</template>

<script>
import VerseInput from '@/components/forms/VerseInput';
import PassageNotesTagFilterModal from '@/components/popups/PassageNotesTagFilterModal';
import { useDialogStore } from '~/stores/dialog';

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
    VerseInput,
    PassageNotesTagFilterModal,
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
      showTagFilterModal: false,
    };
  },
  computed: {
    isDirty() {
      return !deepEqualManaged(this.draft, this.baseline);
    },
    hasSelectedTags() {
      return Array.isArray(this.draft.filterTags) && this.draft.filterTags.length > 0;
    },
    selectedTags() {
      const selectedIds = Array.isArray(this.draft.filterTags) ? this.draft.filterTags : [];
      const byId = new Map((this.passageNoteTags || []).map(t => [t.id, t]));
      return selectedIds
        .map(id => byId.get(id) || { id, label: `${id}`, color: '#999' })
        .filter(Boolean);
    },
    hasSelectedPassage() {
      return !!(this.draft.filterPassageStartVerseId && this.draft.filterPassageEndVerseId);
    },
    passageRangeModel: {
      get() {
        const startVerseId = Number(this.draft.filterPassageStartVerseId || 0);
        const endVerseId = Number(this.draft.filterPassageEndVerseId || 0);
        if (!startVerseId || !endVerseId) { return null; }
        return { startVerseId, endVerseId };
      },
      set(range) {
        if (!range) {
          this.setDraft({ filterPassageStartVerseId: 0, filterPassageEndVerseId: 0 });
          return;
        }
        this.setDraft({
          filterPassageStartVerseId: Number(range.startVerseId),
          filterPassageEndVerseId: Number(range.endVerseId),
        });
      },
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
  },
  watch: {
    appliedQuery: {
      deep: true,
      handler(nextAppliedQuery) {
        if (this.isDirty) { return; }
        this.baseline = pickManagedQuery(nextAppliedQuery);
        this.draft = pickManagedQuery(nextAppliedQuery);
      },
    },
  },
  methods: {
    setDraft(update) {
      this.draft = { ...this.draft, ...update };
    },
    openTagFilterModal() {
      this.showTagFilterModal = true;
    },
    closeTagFilterModal() {
      this.showTagFilterModal = false;
    },
    clearTagSelection() {
      this.setDraft({ filterTags: [], filterTagMatching: 'any' });
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
    },
    async confirmAndReset() {
      const dialogStore = useDialogStore();
      const confirmed = await dialogStore.confirm({ message: this.$t('reset_confirm') });
      if (!confirmed) { return; }

      const update = pickManagedQuery(JSON.parse(JSON.stringify(DEFAULT_DRAFT)));
      this.baseline = pickManagedQuery(update);
      this.draft = pickManagedQuery(update);
      this.$emit('apply', update);
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

.passage-notes-query-manager__tag-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.passage-notes-query-manager__selected-tags {
  margin-bottom: 0.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.passage-notes-query-manager__selected-tag {
  display: inline-flex;
  align-items: center;
  max-width: 100%;

  font-size: 0.85rem;
  line-height: 1.2;
  padding: 0.15rem 0.5rem;
  border-radius: 0.25rem;

  color: #363636;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-left: 0.25rem solid var(--tag-color);

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

<i18n locale="en" lang="json" src="@/locales/sfc/en/components/notes/PassageNotesQueryManager.json" />
<i18n locale="de" lang="json" src="@/locales/sfc/de/components/notes/PassageNotesQueryManager.json" />
<i18n locale="es" lang="json" src="@/locales/sfc/es/components/notes/PassageNotesQueryManager.json" />
<i18n locale="fr" lang="json" src="@/locales/sfc/fr/components/notes/PassageNotesQueryManager.json" />
<i18n locale="ko" lang="json" src="@/locales/sfc/ko/components/notes/PassageNotesQueryManager.json" />
<i18n locale="pt" lang="json" src="@/locales/sfc/pt/components/notes/PassageNotesQueryManager.json" />
<i18n locale="uk" lang="json" src="@/locales/sfc/uk/components/notes/PassageNotesQueryManager.json" />
