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

<i18n lang="json">
{
  "en": {
    "title": "View Options",
    "reset": "Reset",
    "reset_confirm": "Are you sure you want to reset search/filter/sort settings?",
    "first_date": "First Date",
    "last_date": "Last Date",
    "passage": "Filter by Passage",
    "clear": "Clear",
    "sort": "Sort",
    "sort_newest_first": "Newest First",
    "sort_oldest_first": "Oldest First",
    "page_size": "Page Size",
    "apply": "Apply",
    "cancel": "Cancel"
  },
  "de": {
    "title": "Ansichtsoptionen",
    "reset": "Zurücksetzen",
    "reset_confirm": "Möchten Sie die Such-/Filter-/Sortiereinstellungen wirklich zurücksetzen?",
    "first_date": "Von (Datum)",
    "last_date": "Bis (Datum)",
    "passage": "Nach Passage filtern",
    "clear": "Löschen",
    "sort": "Sortieren",
    "sort_newest_first": "Neueste zuerst",
    "sort_oldest_first": "Älteste zuerst",
    "page_size": "Seitengröße",
    "apply": "Anwenden",
    "cancel": "Abbrechen"
  },
  "es": {
    "title": "Opciones de vista",
    "reset": "Restablecer",
    "reset_confirm": "¿Está seguro de que desea restablecer la búsqueda / filtros / orden?",
    "first_date": "Primera fecha",
    "last_date": "Última fecha",
    "passage": "Filtrar por pasaje",
    "clear": "Limpiar",
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
    "first_date": "Première date",
    "last_date": "Dernière date",
    "passage": "Filtrer par passage",
    "clear": "Effacer",
    "sort": "Trier",
    "sort_newest_first": "Le plus récent d'abord",
    "sort_oldest_first": "Plus ancien en premier",
    "page_size": "Taille de page",
    "apply": "Appliquer",
    "cancel": "Annuler"
  },
  "ko": {
    "title": "보기 옵션",
    "reset": "초기화",
    "reset_confirm": "검색·필터·정렬 설정을 초기화할까요?",
    "first_date": "시작 일자",
    "last_date": "종료 일자",
    "passage": "구절로 필터",
    "clear": "지우기",
    "sort": "정렬",
    "sort_newest_first": "최신순",
    "sort_oldest_first": "오래된순",
    "page_size": "페이지 크기",
    "apply": "적용",
    "cancel": "취소"
  },
  "pt": {
    "title": "Opções de visualização",
    "reset": "Reiniciar",
    "reset_confirm": "Tem certeza de que deseja reiniciar as configurações de busca / filtro / ordenação?",
    "first_date": "Primeira data",
    "last_date": "Última data",
    "passage": "Filtrar por passagem",
    "clear": "Limpar",
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
    "first_date": "Перша дата",
    "last_date": "Остання дата",
    "passage": "Фільтрувати за уривком",
    "clear": "Очистити",
    "sort": "Сортувати",
    "sort_newest_first": "Спочатку нові",
    "sort_oldest_first": "Спочатку старі",
    "page_size": "Розмір сторінки",
    "apply": "Застосувати",
    "cancel": "Скасувати"
  }
}
</i18n>
