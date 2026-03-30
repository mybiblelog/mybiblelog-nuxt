<template>
  <nav class="pagination" role="navigation" aria-label="Pagination">
    <div class="pagination__side pagination__side--left">
      <button class="button is-small is-light" type="button" :disabled="isInFirstPage" :aria-label="$t('first')" @click="onClickFirstPage">
        {{ $t('first') }}
      </button>
      <button class="button is-small is-light" type="button" :disabled="isInFirstPage" :aria-label="$t('prev')" @click="onClickPreviousPage">
        {{ $t('prev') }}
      </button>
    </div>

    <div class="pagination__numbers" aria-label="Pages">
      <button
        v-for="page in pages"
        :key="page.number"
        class="button is-small is-light pagination__number-button"
        type="button"
        :disabled="page.isDisabled"
        :class="{ 'is-dark': isPageActive(page.number) }"
        :aria-current="isPageActive(page.number) ? 'page' : null"
        @click="onClickPage(page.number)"
      >
        {{ page.number }}
      </button>
    </div>

    <div class="pagination__side pagination__side--right">
      <button class="button is-small is-light" type="button" :disabled="isInLastPage" :aria-label="$t('next')" @click="onClickNextPage">
        {{ $t('next') }}
      </button>
      <button class="button is-small is-light" type="button" :disabled="isInLastPage" :aria-label="$t('last')" @click="onClickLastPage">
        {{ $t('last') }}
      </button>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'PaginationControls',
  props: {
    maxVisibleButtons: {
      type: Number,
      required: false,
      default: 3,
    },
    totalPages: {
      type: Number,
      required: true,
    },
    currentPage: {
      type: Number,
      required: true,
    },
  },
  computed: {
    startPage() {
      // When on the first page
      if (this.currentPage === 1) {
        return 1;
      }
      // When on the last page
      if (this.currentPage === this.totalPages) {
        return Math.max(1, this.totalPages - this.maxVisibleButtons + 1);
      }
      // When in between
      const visibleButtonCount = Math.min(this.totalPages, this.maxVisibleButtons);
      let initialButton = this.currentPage - Math.floor(visibleButtonCount / 2);
      if (initialButton + this.maxVisibleButtons - 1 > this.totalPages) {
        initialButton = this.totalPages - this.maxVisibleButtons + 1;
      }
      initialButton = Math.max(1, initialButton);
      return initialButton;
    },
    pages() {
      const range = [];
      const lastPage = Math.min(this.startPage + this.maxVisibleButtons - 1, this.totalPages);
      for (let i = this.startPage; i <= lastPage; i += 1) {
        range.push({
          number: i,
          isDisabled: i === this.currentPage,
        });
      }
      return range;
    },
    isInFirstPage() {
      return this.currentPage === 1;
    },
    isInLastPage() {
      return this.currentPage === this.totalPages;
    },
  },
  methods: {
    onClickFirstPage() {
      this.$emit('pagechanged', 1);
    },
    onClickPreviousPage() {
      this.$emit('pagechanged', this.currentPage - 1);
    },
    onClickPage(page) {
      this.$emit('pagechanged', page);
    },
    onClickNextPage() {
      this.$emit('pagechanged', this.currentPage + 1);
    },
    onClickLastPage() {
      this.$emit('pagechanged', this.totalPages);
    },
    isPageActive(page) {
      return this.currentPage === page;
    },
  },
};
</script>

<style lang="scss" scoped>
.pagination {
  margin: 1rem 0;
  padding: 0;

  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.5rem 0.75rem;

  @media (min-width: 480px) {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    column-gap: 1rem;
  }
}

.pagination__side {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pagination__side--left {
  justify-content: center;

  @media (min-width: 480px) {
    justify-content: flex-start;
  }
}

.pagination__side--right {
  justify-content: center;

  @media (min-width: 480px) {
    justify-content: flex-end;
  }
}

.pagination__numbers {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem; /* tighter for number buttons */
}

.pagination__number-button {
  min-width: 2.25rem; /* consistent tap target width for numbers */
}
</style>

<i18n locale="en" lang="json" src="@/locales/sfc/en/components/PaginationControls.json" />
<i18n locale="de" lang="json" src="@/locales/sfc/de/components/PaginationControls.json" />
<i18n locale="es" lang="json" src="@/locales/sfc/es/components/PaginationControls.json" />
<i18n locale="fr" lang="json" src="@/locales/sfc/fr/components/PaginationControls.json" />
<i18n locale="ko" lang="json" src="@/locales/sfc/ko/components/PaginationControls.json" />
<i18n locale="pt" lang="json" src="@/locales/sfc/pt/components/PaginationControls.json" />
<i18n locale="uk" lang="json" src="@/locales/sfc/uk/components/PaginationControls.json" />
