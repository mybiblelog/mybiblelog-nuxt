<template>
  <section class="section">
    <div class="container">
      <div class="columns is-centered">
        <div class="column is-two-thirds-tablet is-half-desktop">
          <book-report :log-entries="logEntries" :book-index="bookIndex" @exit-book-report="viewBibleReport" @view-book-notes="viewBookNotes(bookIndex)" />
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { mapGetters } from 'vuex';
import Bible from '@shared/bible';
import BookReport from '@/components/BookReport';

export default {
  components: {
    BookReport,
  },
  asyncData({ params }) {
    return {
      bookIndex: +params.book,
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
  head() {
    return {
      title: Bible.getBookName(this.bookIndex, this.$i18n.locale),
    };
  },
  middleware: ['auth'],
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
