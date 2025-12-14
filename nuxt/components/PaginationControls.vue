<template>
  <ul class="pagination">
    <li>
      <button class="button is-small is-light" type="button" :disabled="isInFirstPage" @click="onClickFirstPage">
        {{ $t('first') }}
      </button>
    </li>
    <li>
      <button class="button is-small is-light" type="button" :disabled="isInFirstPage" @click="onClickPreviousPage">
        {{ $t('prev') }}
      </button>
    </li>
    <li v-for="page in pages" :key="page.number" class="pagination-item">
      <button class="button is-small is-light" type="button" :disabled="page.isDisabled" :class="{ 'is-dark': isPageActive(page.number) }" @click="onClickPage(page.number)">
        {{ page.number }}
      </button>
    </li>
    <li>
      <button class="button is-small is-light" type="button" :disabled="isInLastPage" @click="onClickNextPage">
        {{ $t('next') }}
      </button>
    </li>
    <li>
      <button class="button is-small is-light" type="button" :disabled="isInLastPage" @click="onClickLastPage">
        {{ $t('last') }}
      </button>
    </li>
  </ul>
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
  list-style-type: none;
  margin: 1rem 0;
}

.pagination-item {
  display: inline-block;
}
</style>

<i18n lang="json">
{
  "de": {
    "first": "Erste",
    "prev": "Zurück",
    "next": "Weiter",
    "last": "Letzte"
  },
  "en": {
    "first": "First",
    "prev": "Prev",
    "next": "Next",
    "last": "Last"
  },
  "es": {
    "first": "Primero",
    "prev": "Anterior",
    "next": "Siguiente",
    "last": "Último"
  },
  "fr": {
    "first": "Premier",
    "prev": "Précédent",
    "next": "Suivant",
    "last": "Dernier"
  },
  "pt": {
    "first": "Primeiro",
    "prev": "Anterior",
    "next": "Próximo",
    "last": "Último"
  },
  "uk": {
    "first": "Перша",
    "prev": "Попередня",
    "next": "Наступна",
    "last": "Остання"
  }
}
</i18n>
