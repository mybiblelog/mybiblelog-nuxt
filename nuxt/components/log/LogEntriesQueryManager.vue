<template>
  <div class="log-entries-query-manager">
    <div>
      <div class="field">
        <label class="label">{{ $t('first_date') }}</label>
        <div class="control">
          <input
            v-model.trim="draft.startDate"
            class="input"
            type="date"
            :max="draft.endDate || null"
          >
        </div>
      </div>

      <div class="field">
        <label class="label">{{ $t('last_date') }}</label>
        <div class="control">
          <input
            v-model.trim="draft.endDate"
            class="input"
            type="date"
            :min="draft.startDate || null"
          >
        </div>
      </div>

      <hr class="log-entries-query-manager__divider">

      <div class="field">
        <label class="label">{{ $t('passage') }}</label>
        <verse-input v-model="passageRangeModel" :multi-verse="true" />
      </div>

      <hr class="log-entries-query-manager__divider">

      <div class="field">
        <label class="label">{{ $t('sort') }}</label>
        <div class="control">
          <label class="radio">
            <input v-model="draft.sortDirection" type="radio" value="descending">
            {{ $t('sort_newest_first') }}
          </label>
        </div>
        <div class="control">
          <label class="radio">
            <input v-model="draft.sortDirection" type="radio" value="ascending">
            {{ $t('sort_oldest_first') }}
          </label>
        </div>
      </div>

      <hr class="log-entries-query-manager__divider">

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

      <div class="log-entries-query-manager__actions">
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
import { SimpleDate } from '@mybiblelog/shared';
import VerseInput from '@/components/forms/VerseInput';
import { useDialogStore } from '~/stores/dialog';

const DEFAULT_DRAFT = {
  limit: 10,
  sortDirection: 'descending',
  startDate: '',
  endDate: '',
  filterPassageStartVerseId: 0,
  filterPassageEndVerseId: 0,
};

function normalizeDateString(value) {
  const v = `${value ?? ''}`.trim();
  if (!v) { return ''; }
  return SimpleDate.validateString(v) ? v : '';
}

function pickManagedQuery(query) {
  const q = query || {};
  return {
    limit: Number(q.limit ?? DEFAULT_DRAFT.limit),
    sortDirection: q.sortDirection ?? DEFAULT_DRAFT.sortDirection,
    startDate: normalizeDateString(q.startDate ?? DEFAULT_DRAFT.startDate),
    endDate: normalizeDateString(q.endDate ?? DEFAULT_DRAFT.endDate),
    filterPassageStartVerseId: Number(q.filterPassageStartVerseId ?? DEFAULT_DRAFT.filterPassageStartVerseId),
    filterPassageEndVerseId: Number(q.filterPassageEndVerseId ?? DEFAULT_DRAFT.filterPassageEndVerseId),
  };
}

function deepEqualManaged(a, b) {
  const aa = pickManagedQuery(a);
  const bb = pickManagedQuery(b);
  return JSON.stringify(aa) === JSON.stringify(bb);
}

export default {
  name: 'LogEntriesQueryManager',
  components: {
    VerseInput,
  },
  props: {
    appliedQuery: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    const baseline = pickManagedQuery(this.appliedQuery);
    return {
      baseline,
      draft: pickManagedQuery(this.appliedQuery),
    };
  },
  computed: {
    isDirty() {
      return !deepEqualManaged(this.draft, this.baseline);
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
.log-entries-query-manager__divider {
  margin: 1rem 0;
}

.log-entries-query-manager__actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.log-entries-query-manager__passage-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

</style>

<i18n locale="en" lang="json" src="@/locales/sfc/en/components/log/LogEntriesQueryManager.json" />
<i18n locale="de" lang="json" src="@/locales/sfc/de/components/log/LogEntriesQueryManager.json" />
<i18n locale="es" lang="json" src="@/locales/sfc/es/components/log/LogEntriesQueryManager.json" />
<i18n locale="fr" lang="json" src="@/locales/sfc/fr/components/log/LogEntriesQueryManager.json" />
<i18n locale="ko" lang="json" src="@/locales/sfc/ko/components/log/LogEntriesQueryManager.json" />
<i18n locale="pt" lang="json" src="@/locales/sfc/pt/components/log/LogEntriesQueryManager.json" />
<i18n locale="uk" lang="json" src="@/locales/sfc/uk/components/log/LogEntriesQueryManager.json" />
