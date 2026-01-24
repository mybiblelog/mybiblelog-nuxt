<template>
  <div class="bible-report">
    <header class="page-header">
      <h2 class="title">
        {{ $t('bible_books') }}
        <info-link :to="localePath('/about/page-features--bible-books')" />
      </h2>
      <nuxt-link class="button" :to="localePath('/progress')">
        {{ $t('progress') }}
        <caret-right-icon style="margin-left: 0.2rem;" />
      </nuxt-link>
    </header>
    <div class="plaque">
      <p>
        <span>{{ $n(percentageRead / 100, 'percent') }}</span>
      </p>
      <segment-bar thick="thick" :segments="bibleReadingSegments" />
    </div>
    <div class="progress-list">
      <div v-for="report in allBookReports" :key="report.bookIndex" class="progress-card" @click="$emit('view-book-report', report.bookIndex)">
        <span class="progress-card-icon">
          <star-icon :fill="report.percentage == 100 ? '#ffd700' : '#ddd'" />
        </span>
        <span class="progress-card-book">{{ report.bookName }}</span>
        <span v-if="anyBooksHaveNotes" class="progress-card-note-count-badge" @click="viewBookNotes(report.bookIndex)">
          {{ report.notesCount }} {{ $tc('note', report.notesCount) }}
        </span>
        <span class="progress-card-percentage">{{ $n(report.percentage / 100, 'percent') }}</span>
        <div class="progress-card-progress">
          <segment-bar :segments="bookReadingSegments(report.bookIndex)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Bible } from '@mybiblelog/shared';
import SegmentBar from '@/components/SegmentBar';
import StarIcon from '@/components/svg/StarIcon';
import InfoLink from '@/components/InfoLink';
import CaretRightIcon from '@/components/svg/CaretRightIcon';
const calcPercent = (numerator, denominator) => {
  return Math.floor(numerator / denominator * 100);
};

export default {
  name: 'BibleReport',
  components: {
    SegmentBar,
    StarIcon,
    InfoLink,
    CaretRightIcon,
  },
  props: {
    logEntries: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      bookNotesCounts: {},
      anyBooksHaveNotes: false,
    };
  },
  computed: {
    totalBibleVerses() {
      return Bible.getTotalVerseCount();
    },
    totalVersesRead() {
      return Bible.countUniqueRangeVerses(this.logEntries);
    },
    percentageRead() {
      return calcPercent(this.totalVersesRead, this.totalBibleVerses);
    },
    allBookReports() {
      const reports = [];
      for (let i = 1, l = Bible.getBookCount(); i <= l; i++) {
        reports.push(this.bookReport(i));
      }
      return reports;
    },
    bibleReadingSegments() {
      const totalBibleVerses = Bible.getTotalVerseCount();

      const segments = Bible.generateBibleSegments(this.logEntries);

      // let sum = 0;
      segments.forEach((segment) => {
        // sum += segment.verseCount;
        // segment.startPercentage = sum * 100 / totalBibleVerses;
        segment.percentage = segment.verseCount * 100 / totalBibleVerses;
        return segment;
      });
      // console.log(`Whole Bible verse count: ${sum}`);

      return segments;
    },
  },
  async mounted() {
    try {
      const { data: bookNotesCounts } = await this.$http.get('/api/passage-notes/count/books');
      this.bookNotesCounts = bookNotesCounts;
      for (let i = 1, l = Bible.getBookCount(); i <= l; i++) {
        if (this.bookNotesCounts[i] > 0) {
          this.anyBooksHaveNotes = true;
          break;
        }
      }
    }
    catch {
      // Leave bookNotesCounts as {} on error
    }
  },
  methods: {
    bookReport(bookIndex) {
      const bookName = Bible.getBookName(bookIndex, this.$i18n.locale);
      const totalVerses = Bible.getBookVerseCount(bookIndex);
      const versesRead = Bible.countUniqueBookRangeVerses(bookIndex, this.logEntries);
      const percentage = calcPercent(versesRead, totalVerses);
      const notesCount = this.bookNotesCounts[bookIndex] || 0;
      return { bookIndex, bookName, totalVerses, versesRead, percentage, notesCount };
    },
    bookReadingSegments(bookIndex) {
      const totalBookVerses = Bible.getBookVerseCount(bookIndex);

      const segments = Bible.generateBookSegments(bookIndex, this.logEntries);

      // let sum = 0;
      segments.forEach((segment) => {
        segment.percentage = segment.verseCount * 100 / totalBookVerses;
        // sum += segment.verseCount;
        return segment;
      });
      // console.log(`Book ${bookIndex} verse count: ${sum}`);

      return segments;
    },
    viewBookNotes(bookIndex) {
      // Same as in _book.vue
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
.bible-report {
  user-select: none;
}
.plaque {
  margin-bottom: 2rem;
  p {
    text-align: right;
  }
}
.progress-list {
  .progress-card {
    margin: 0.5rem 0;
    padding: 0.5rem;
    border-radius: 0.25rem;
    box-shadow: 0 1px 7px #999;

    display: grid;
    grid-template-columns: auto auto 1fr 3rem;
    grid-template-rows: auto auto;
    grid-template-areas:
      "icon title notes percentage"
      "icon bar   bar   bar";

    cursor: pointer;
    transition: 0.1s;
    &:hover {
      transition: 0.2s;
      box-shadow: 0 1px 9px #333;
    }

    &-icon {
      grid-area: icon;

      margin-right: 0.5rem;
      display: flex;
      align-items: center;
    }

    &-book,
    &-percentage {
      font-size: 0.8rem;
      font-weight: bold;
      padding-bottom: 0.5rem;
    }

    &-icon {
      grid-area: icon;
    }
    &-book {
      grid-area: title;
    }
    &-note-count-badge {
      grid-area: notes;
      justify-self: end;
      align-self: baseline;
      width: fit-content;
      margin-right: 1rem;
      font-size: 0.8em;
      color: #666;
      background: #efefef;
      margin-left: 1em;
      padding: 0 0.5em;
      border-radius: 0.5em;
      font-weight: normal;
      transition: 0.2s ease-in-out;

      &:hover {
        background: #999;
        color: #fff;
      }

      // Make the badge easier to click on mobile
      @media screen and (max-width: 600px) {
        position: relative;
        &::after {
          content: ' ';
          position: absolute;
          top: -1em;
          left: 0;
          right: 0;
          bottom: -1em;
        }
      }
    }
    &-percentage {
      grid-area: percentage;
      text-align: right;
    }
    &-progress {
      grid-area: bar;
    }
  }
}
</style>

<i18n lang="json">
{
  "de": {
    "bible_books": "Bücher der Bibel",
    "progress": "Fortschritt",
    "note": "Notiz | Notizen"
  },
  "en": {
    "bible_books": "Bible Books",
    "progress": "Progress",
    "note": "Note | Notes"
  },
  "es": {
    "bible_books": "Libros de la Biblia",
    "progress": "Progreso",
    "note": "Nota | Notas"
  },
  "fr": {
    "bible_books": "Livres de la Bible",
    "progress": "Progrès",
    "note": "Note | Notes"
  },
  "pt": {
    "bible_books": "Livros da Bíblia",
    "progress": "Progresso",
    "note": "Nota | Notas"
  },
  "uk": {
    "bible_books": "Книги Біблії",
    "progress": "Прогрес",
    "note": "Примітка | Примітки"
  }
}
</i18n>
