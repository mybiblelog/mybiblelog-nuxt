<template>
  <div class="content-column">
    <bible-report :log-entries="logEntries" @view-book-report="viewBookReport($event)" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import BibleReport from '@/components/BibleReport';

export default {
  components: {
    BibleReport,
  },
  middleware: ['auth'],
  async fetch() {
    await this.$store.dispatch('loadUserData');
  },
  head() {
    return {
      title: this.$t('page_title'),
    };
  },
  computed: {
    ...mapGetters({
      logEntries: 'log-entries/currentLogEntries',
    }),
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

<i18n lang="json">
{
  "de": {
    "page_title": "Bibelbücher"
  },
  "en": {
    "page_title": "Bible Books"
  },
  "es": {
    "page_title": "Libros de la Biblia"
  },
  "fr": {
    "page_title": "Livres de la Bible"
  },
  "pt": {
    "page_title": "Livros da Bíblia"
  },
  "uk": {
    "page_title": "Книги Біблії"
  }
}
</i18n>
