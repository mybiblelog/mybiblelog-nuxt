<template>
  <div class="content-column">
    <book-report
      :log-entries="logEntries"
      :book-index="bookIndex"
      @exit-book-report="viewBibleReport"
      @view-book-notes="viewBookNotes(bookIndex)"
      @view-book-log="viewBookLog(bookIndex)"
    />
  </div>
</template>

<script>
import { Bible } from '@mybiblelog/shared';
import { encodePassageNotesQueryToRoute } from '@/helpers/passage-notes-route-query';
import { encodeLogEntriesQueryToRoute } from '@/helpers/log-entries-route-query';
import BookReport from '@/components/BookReport';
import { useLogEntriesStore } from '~/stores/log-entries';
import { useAppInitStore } from '~/stores/app-init';

export default {
  components: {
    BookReport,
  },
  middleware: ['auth'],
  asyncData({ params }) {
    return {
      bookIndex: +params.book,
    };
  },
  head() {
    return {
      title: Bible.getBookName(this.bookIndex, this.$i18n.locale),
    };
  },
  computed: {
    logEntriesStore() {
      return useLogEntriesStore();
    },
    logEntries() {
      return this.logEntriesStore.currentLogEntries;
    },
    book() {
      return Bible.getBooks().find(b => b.bibleOrder === this.bookIndex);
    },
  },
  mounted() {
    useAppInitStore().loadUserData();
  },
  methods: {
    viewBibleReport() {
      this.$router.push(this.localePath('/books'));
    },
    viewBookNotes(bookIndex) {
      // Same as in BibleReport.vue
      const bookStartVerseId = Bible.getFirstBookVerseId(bookIndex);
      const bookEndVerseId = Bible.getLastBookVerseId(bookIndex);
      const query = encodePassageNotesQueryToRoute({
        filterPassageStartVerseId: bookStartVerseId,
        filterPassageEndVerseId: bookEndVerseId,
        filterPassageMatching: 'exclusive',
        offset: 0,
      });
      this.$router.push({ path: this.localePath('/notes'), query });
    },
    viewBookLog(bookIndex) {
      const bookStartVerseId = Bible.getFirstBookVerseId(bookIndex);
      const bookEndVerseId = Bible.getLastBookVerseId(bookIndex);
      const query = encodeLogEntriesQueryToRoute({
        filterPassageStartVerseId: bookStartVerseId,
        filterPassageEndVerseId: bookEndVerseId,
        offset: 0,
      });
      this.$router.push({ path: this.localePath('/log'), query });
    },
  },
};
</script>

<style lang="scss">
</style>

<i18n locale="en" lang="json" src="@/locales/sfc/en/pages/books/_book.json" />
<i18n locale="de" lang="json" src="@/locales/sfc/de/pages/books/_book.json" />
<i18n locale="es" lang="json" src="@/locales/sfc/es/pages/books/_book.json" />
<i18n locale="fr" lang="json" src="@/locales/sfc/fr/pages/books/_book.json" />
<i18n locale="ko" lang="json" src="@/locales/sfc/ko/pages/books/_book.json" />
<i18n locale="pt" lang="json" src="@/locales/sfc/pt/pages/books/_book.json" />
<i18n locale="uk" lang="json" src="@/locales/sfc/uk/pages/books/_book.json" />
