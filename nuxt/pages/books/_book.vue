<template>
  <div class="content-column">
    <book-report :log-entries="logEntries" :book-index="bookIndex" @exit-book-report="viewBibleReport" @view-book-notes="viewBookNotes(bookIndex)" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { Bible } from '@mybiblelog/shared';
import BookReport from '@/components/BookReport';

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
    ...mapGetters({
      logEntries: 'log-entries/currentLogEntries',
    }),
    book() {
      return Bible.getBooks().find(b => b.bibleOrder === this.bookIndex);
    },
  },
  mounted() {
    this.$store.dispatch('log-entries/loadLogEntries');
  },
  methods: {
    viewBibleReport() {
      this.$router.push(this.localePath('/books'));
    },
    viewBookNotes(bookIndex) {
      // Same as in BibleReport.vue
      const bookStartVerseId = Bible.getFirstBookVerseId(bookIndex);
      const bookEndVerseId = Bible.getLastBookVerseId(bookIndex);
      this.$store.dispatch('passage-notes/stageQuery', {
        filterPassageStartVerseId: bookStartVerseId,
        filterPassageEndVerseId: bookEndVerseId,
        filterPassageMatching: 'exclusive',
      });
      this.$router.push(this.localePath('/notes'));
    },
  },
};
</script>

<style lang="scss">
</style>

<i18n lang="json">
{
  "de": {},
  "en": {},
  "es": {},
  "fr": {},
  "pt": {},
  "uk": {}
}
</i18n>
