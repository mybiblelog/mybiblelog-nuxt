<template>
  <div class="content-column">
    <bible-report :log-entries="logEntries" @view-book-report="viewBookReport($event)" />
  </div>
</template>

<script>
import BibleReport from '@/components/BibleReport';
import { useLogEntriesStore } from '~/stores/log-entries';
import { useAppInitStore } from '~/stores/app-init';

export default {
  components: {
    BibleReport,
  },
  middleware: ['auth'],
  async fetch() {
    await useAppInitStore().loadUserData();
  },
  head() {
    return {
      title: this.$t('page_title'),
    };
  },
  computed: {
    logEntriesStore() {
      return useLogEntriesStore();
    },
    logEntries() {
      return this.logEntriesStore.currentLogEntries;
    },
  },
  methods: {
    viewBookReport(bookIndex) {
      this.$router.push(this.localePath('/books/' + bookIndex));
    },
  },
};
</script>

<style lang="scss">
</style>

<i18n locale="en" lang="json" src="@/locales/sfc/en/pages/books/index.json" />
<i18n locale="de" lang="json" src="@/locales/sfc/de/pages/books/index.json" />
<i18n locale="es" lang="json" src="@/locales/sfc/es/pages/books/index.json" />
<i18n locale="fr" lang="json" src="@/locales/sfc/fr/pages/books/index.json" />
<i18n locale="ko" lang="json" src="@/locales/sfc/ko/pages/books/index.json" />
<i18n locale="pt" lang="json" src="@/locales/sfc/pt/pages/books/index.json" />
<i18n locale="uk" lang="json" src="@/locales/sfc/uk/pages/books/index.json" />
