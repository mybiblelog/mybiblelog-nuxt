<template>
  <div class="book-report">
    <header class="book-report-header is-hidden-mobile">
      <h2 class="title mb-0">
        <span>{{ bookName }}</span>
      </h2>
      <div class="buttons">
        <button class="button" @click="$emit('view-book-notes')">
          {{ $t('notes') }}
          <CaretRight style="margin-left: 0.2rem;" />
        </button>
        <button class="button" @click="$emit('exit-book-report')">
          {{ $t('books') }}
          <CaretRight style="margin-left: 0.2rem;" />
        </button>
      </div>
    </header>
    <header class="book-report-header is-hidden-tablet">
      <h2 class="title is-5 mb-0">
        <span>{{ bookName }}</span>
      </h2>
      <div class="buttons">
        <button class="button is-small" @click="$emit('view-book-notes')">
          {{ $t('notes') }}
          <CaretRight style="margin-left: 0.2rem;" />
        </button>
        <button class="button is-small" @click="$emit('exit-book-report')">
          {{ $t('books') }}
          <CaretRight style="margin-left: 0.2rem;" />
        </button>
      </div>
    </header>
    <div class="plaque">
      <p>
        <span>{{ $n(percentageRead / 100, 'percent') }}</span>
      </p>
      <segment-bar thick="thick" :segments="bookReadingSegments(book.bibleOrder)" />
    </div>
    <div class="chapter-report-grid">
      <template v-for="report in allChapterReports">
        <chapter-report :key="report.chapterIndex" :report="report" @createLogEntry="openAddEntryForm" />
      </template>
    </div>
    <log-entry-editor-modal v-if="editorOpen" ref="logEntryEditorModal" :populate-with="editorLogEntry" @closed="logEntryEditorClosed" />
  </div>
</template>

<script>
import * as dayjs from 'dayjs';
import Bible from '@shared/bible';
import ChapterReport from '@/components/ChapterReport';
import SegmentBar from '@/components/SegmentBar';
import LogEntryEditorModal from '@/components/forms/LogEntryEditorModal';
import CaretRight from '@/components/svg/CaretRight';

const calcPercent = (numerator, denominator) => {
  return Math.floor(numerator / denominator * 100);
};

export default {
  name: 'BookReport',
  components: {
    ChapterReport,
    SegmentBar,
    LogEntryEditorModal,
    CaretRight,
  },
  props: {
    logEntries: {
      type: Array,
      default: () => [],
    },
    bookIndex: {
      type: Number,
      default: 1,
    },
  },
  data() {
    return {
      editorOpen: false,
      editorLogEntry: {
        id: null,
        date: dayjs().format('YYYY-MM-DD'),
        startVerseId: 0,
        endVerseId: 0,
      },
    };
  },
  computed: {
    book() {
      return Bible.getBooks().find(b => b.bibleOrder === this.bookIndex);
    },
    bookName() {
      return Bible.getBookName(this.bookIndex, this.$i18n.locale);
    },
    totalBookVerses() {
      return Bible.getBookVerseCount(this.bookIndex);
    },
    totalVersesRead() {
      return Bible.countUniqueBookRangeVerses(this.bookIndex, this.logEntries);
    },
    percentageRead() {
      return calcPercent(this.totalVersesRead, this.totalBookVerses);
    },
    allChapterReports() {
      const reports = [];
      for (let i = 1, l = Bible.getBookChapterCount(this.bookIndex); i <= l; i++) {
        reports.push(this.chapterReport(i));
      }
      return reports;
    },
  },
  methods: {
    chapterReport(chapterIndex) {
      const totalVerses = Bible.getChapterVerseCount(this.bookIndex, chapterIndex);
      const versesRead = Bible.countUniqueBookChapterRangeVerses(this.bookIndex, chapterIndex, this.logEntries);
      const percentage = calcPercent(versesRead, totalVerses);
      const segments = this.chapterReadingSegments(this.bookIndex, chapterIndex);
      return { totalVerses, versesRead, percentage, bookIndex: this.bookIndex, chapterIndex, segments };
    },
    bookReadingSegments(bookIndex) {
      const totalBookVerses = Bible.getBookVerseCount(bookIndex);

      const segments = Bible.generateBookSegments(bookIndex, this.logEntries);

      segments.forEach((segment) => {
        segment.percentage = segment.verseCount * 100 / totalBookVerses;
        return segment;
      });

      return segments;
    },
    chapterReadingSegments(bookIndex, chapterIndex) {
      const totalChapterVerses = Bible.getChapterVerseCount(bookIndex, chapterIndex);

      const segments = Bible.generateBookChapterSegments(bookIndex, chapterIndex, this.logEntries);

      segments.forEach((segment) => {
        segment.percentage = segment.verseCount * 100 / totalChapterVerses;
        return segment;
      });

      return segments;
    },
    openAddEntryForm(bookIndex, chapterIndex) {
      const chapterVerseCount = Bible.getChapterVerseCount(bookIndex, chapterIndex);
      this.editorLogEntry = {
        id: null,
        date: dayjs().format('YYYY-MM-DD'),
        startVerseId: Bible.makeVerseId(bookIndex, chapterIndex, 1),
        endVerseId: Bible.makeVerseId(bookIndex, chapterIndex, chapterVerseCount),
      };
      this.editorOpen = true;
    },
    logEntryEditorClosed() {
      this.editorOpen = false;
      this.editorLogEntry = { empty: true };
    },
  },
};
</script>

<style lang="scss">
.book-report {
  user-select: none;
}
.book-report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.plaque {
  margin-bottom: 2rem;
  p {
    text-align: right;
  }
}

.chapter-report-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
}
</style>

<i18n lang="json">
{
  "de": {
    "notes": "Notizen",
    "books": "Bücher"
  },
  "en": {
    "notes": "Notes",
    "books": "Books"
  },
  "es": {
    "notes": "Notas",
    "books": "Libros"
  },
  "fr": {
    "notes": "Notes",
    "books": "Books"
  },
  "pt": {
    "notes": "Notas",
    "books": "Livros"
  },
  "uk": {
    "notes": "Нотатки",
    "books": "Книги"
  }
}
</i18n>
