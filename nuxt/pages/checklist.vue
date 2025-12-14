<template>
  <div class="content-column">
    <busy-bar :busy="busy" />
    <header class="page-header">
      <h2 class="title">
        {{ $t('chapter_checklist') }}
        <info-link :to="localePath('/about/page-features--chapter-checklist')" />
      </h2>
    </header>
    <br>
    <div>
      <div v-if="!bookReports.length" class="loading-card">
        <strong>{{ $t('loading') }}</strong>
      </div>
      <div v-for="bookReport in bookReports" :key="bookReport.bookIndex" class="book-card">
        <div class="book-card--header">
          <div class="book-card--completion-indicator">
            <check-mark-icon width="100%" height="100%" :fill="bookReport.complete ? '#0c0' : 'transparent'" />
          </div>
          <div class="book-card--book-name">
            {{ bookReport.bookName }}
          </div>
          <div class="book-card--completion-fraction">
            {{ bookReport.chaptersRead }} / {{ bookReport.totalChapters }}
          </div>
          <div class="book-card--chapter-toggle" :class="{ flipped: expandedBooks[bookReport.bookIndex] }" @click="toggleBook(bookReport.bookIndex)">
            <caret-down-icon width="2rem" height="2rem" fill="#ccc" />
          </div>
          <div class="book-card--completion-bar">
            <completion-bar :percentage="bookReport.percentage" foreground-color="#0c0" />
          </div>
        </div>
        <div v-if="expandedBooks[bookReport.bookIndex]" class="book-card--chapters">
          <div v-for="chapterReport in bookReport.chapterReports" :key="chapterReport.chapterIndex" class="chapter-card" @click="toggleChapter(chapterReport.bookIndex, chapterReport.chapterIndex)">
            <div class="chapter-card--chapter-number">
              {{ chapterReport.chapterIndex }}
            </div>
            <div class="chapter-card--completion-indicator">
              <spinner-icon v-if="busyChapter === `${bookReport.bookIndex}.${chapterReport.chapterIndex}`" width="100%" height="100%" :fill="chapterReport.complete ? '#ddd' : '#0c0'" />
              <check-mark-icon v-else width="100%" height="100%" :fill="chapterReport.complete ? '#0c0' : 'transparent'" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import * as dayjs from 'dayjs';
import { Bible, BrowserCache } from '@mybiblelog/shared';
import BusyBar from '@/components/BusyBar';
import CompletionBar from '@/components/CompletionBar';
import CheckMarkIcon from '@/components/svg/CheckMarkIcon';
import CaretDownIcon from '@/components/svg/CaretDownIcon';
import SpinnerIcon from '@/components/svg/SpinnerIcon';
import InfoLink from '@/components/InfoLink';
const CHAPTER_CHECKLIST_CACHE_KEY = 'chapterChecklist';
const CHAPTER_CHECKLIST_CACHE_MINUTES = 60;

const calcPercent = (numerator, denominator) => {
  return Math.floor(numerator / denominator * 100);
};

export default {
  components: {
    BusyBar,
    CompletionBar,
    CheckMarkIcon,
    CaretDownIcon,
    SpinnerIcon,
    InfoLink,
  },
  data() {
    const expandedBooks = {};
    const bookCount = Bible.getBookCount();
    for (let i = 1; i <= bookCount; i++) {
      expandedBooks[i] = false;
    }
    return {
      computeBusy: false,
      busyChapter: null,
      expandedBooks,
      readChapters: {},
      bookReports: [],
    };
  },
  async fetch() {
  },
  computed: {
    ...mapGetters({
      logEntries: 'log-entries/currentLogEntries',
    }),
    busy() {
      return Boolean(this.busyChapter || this.computeBusy);
    },
  },
  mounted() {
    setTimeout(this.getBookReports);
  },
  methods: {
    async getReadChapters() {
      const ranges = Bible.consolidateRanges(this.logEntries);
      const readChapters = {}; // { [`${bookIndex}.${chapterIndex}`]: boolean }
      function markRead(bookIndex, chapterIndex) { readChapters[`${bookIndex}.${chapterIndex}`] = true; }

      for (const range of ranges) {
        const { book, chapter: startChapter, verse: startVerse } = Bible.parseVerseId(range.startVerseId);
        const { chapter: endChapter, verse: endVerse } = Bible.parseVerseId(range.endVerseId);

        if (startVerse === 1) {
          if (endChapter > startChapter || Bible.getChapterVerseCount(book, startChapter) === endVerse) {
            markRead(book, startChapter);
          }
        }
        if (endChapter > startChapter && Bible.getChapterVerseCount(book, endChapter) === endVerse) {
          markRead(book, endChapter);
        }
        if (endChapter > startChapter + 1) {
          for (let c = startChapter + 1; c < endChapter; c++) {
            markRead(book, c);
          }
        }

        // Give up the event loop to let other things happen
        await new Promise(resolve => setImmediate(resolve));
      }
      this.readChapters = readChapters;
    },
    getBookReport(bookIndex, readChapters) {
      const bookName = Bible.getBookName(bookIndex, this.$i18n.locale);
      const totalChapters = Bible.getBookChapterCount(bookIndex);
      const chapterReports = [];
      let chaptersRead = 0;
      for (let chapterIndex = 1, l = totalChapters; chapterIndex <= l; chapterIndex++) {
        const totalVerses = Bible.getChapterVerseCount(bookIndex, chapterIndex);
        const versesRead = Bible.countUniqueBookChapterRangeVerses(bookIndex, chapterIndex, this.logEntries);
        const complete = readChapters[`${bookIndex}.${chapterIndex}`];
        if (complete) {
          chaptersRead++;
        }
        chapterReports.push({ totalVerses, versesRead, bookIndex, chapterIndex, complete });
      }
      const percentage = calcPercent(chaptersRead, totalChapters);
      const complete = percentage === 100;
      return { bookIndex, bookName, totalChapters, chaptersRead, percentage, complete, chapterReports };
    },
    async getBookReports() {
      this.computeBusy = true;

      // Check for cached data to give an immediate visual response
      const cachedBookReports = BrowserCache.get(CHAPTER_CHECKLIST_CACHE_KEY);
      if (cachedBookReports) {
        this.bookReports = cachedBookReports;
      }

      await this.getReadChapters();
      const bookReports = [];
      for (let i = 1, l = Bible.getBookCount(); i <= l; i++) {
        bookReports.push(this.getBookReport(i, this.readChapters));

        // Give up the event loop to let other things happen
        await new Promise(resolve => setImmediate(resolve));
      }

      // Cache book reports
      BrowserCache.set(CHAPTER_CHECKLIST_CACHE_KEY, bookReports, CHAPTER_CHECKLIST_CACHE_MINUTES);

      this.bookReports = bookReports;
      this.computeBusy = false;
    },
    toggleBook(bookIndex) {
      if (this.expandedBooks[bookIndex]) {
        this.expandedBooks[bookIndex] = false;
      }
      else {
        this.expandedBooks[bookIndex] = true;
      }
    },
    async toggleChapter(bookIndex, chapterIndex) {
      if (this.busyChapter) {
        return;
      }
      this.busyChapter = `${bookIndex}.${chapterIndex}`;

      const date = dayjs().format('YYYY-MM-DD');
      const startVerseId = Bible.makeVerseId(bookIndex, chapterIndex, 1);
      const endVerseId = Bible.makeVerseId(bookIndex, chapterIndex, Bible.getChapterVerseCount(bookIndex, chapterIndex));

      const isComplete = this.readChapters[`${bookIndex}.${chapterIndex}`] === true;
      if (isComplete) {
        const matchingLogEntry = this.logEntries.find(logEntry => (
          logEntry.date === date &&
          logEntry.startVerseId === startVerseId &&
          logEntry.endVerseId === endVerseId
        ));
        if (matchingLogEntry) {
          const success = await this.$store.dispatch('log-entries/deleteLogEntry', matchingLogEntry.id);
          if (success) {
            await this.getBookReports();
          }
          else {
            this.$store.dispatch('toast/add', {
              type: 'error',
              text: this.$t('unable_to_mark_incomplete'),
            });
          }
        }
        else {
          this.$store.dispatch('toast/add', {
            type: 'info',
            text: this.$t('logged_before_today'),
          });
        }
      }
      else {
        const newLogEntry = { date, startVerseId, endVerseId };
        const createdEntry = await this.$store.dispatch('log-entries/createLogEntry', newLogEntry);
        if (createdEntry) {
          await this.getBookReports();
        }
        else {
          this.$store.dispatch('toast/add', {
            type: 'error',
            text: this.$t('unable_to_mark_complete'),
          });
        }
      }
      this.busyChapter = null;
    },
  },
  head() {
    return {
      title: this.$t('chapter_checklist'),
    };
  },
  middleware: ['auth'],
};
</script>

<style lang="scss" scoped>
.loading-card {
  padding: 1rem 2rem;
  border-radius: 0.25rem;
  box-shadow: 0 1px 7px #999;
  margin: 0.5rem 0;
}

.book-card {
  user-select: none;
}

.book-card--header {
  display: grid;
  grid-template-columns: 2rem 1fr 1fr 2rem;
  grid-template-rows: auto auto;

  padding: 0.5rem;
  border-radius: 0.25rem;
  box-shadow: 0 1px 7px #999;
  margin: 0.5rem 0;

  font-size: 0.8rem;
  font-weight: bold;
}

.book-card--completion-indicator {
  grid-area: 1 / 1 / 3 / 2;
  width: 1.5rem;
  margin-right: 0.5rem;
  display: flex;
}

.book-card--book-name {
  grid-area: 1 / 2 / 2 / 3;
}

.book-card--completion-fraction {
  grid-area: 1 / 3 / 2 / 4;
  text-align: right;
}

.book-card--completion-bar {
  grid-area: 2 / 2 / 3 / 4;
}

.book-card--chapter-toggle {
  grid-area: 1 / 4 / 3 / 5;
  display: flex;
  cursor: pointer;
  &.flipped {
    transform: rotate(180deg);
  }
}

.book-card--chapters {
  display: grid;
  gap: 0.5rem;
  grid-template-columns: repeat(5, 1fr);
  @media screen and (min-width: 769px) {
    grid-template-columns: repeat(6, 1fr);
  }
  @media screen and (min-width: 1024px) {
    grid-template-columns: repeat(8, 1fr);
  }
  @media screen and (min-width: 1216px) {
    grid-template-columns: repeat(10, 1fr);
  }
  @media screen and (min-width: 1408px) {
    grid-template-columns: repeat(12, 1fr);
  }

  // margin: -5px;
}

.chapter-card {
  // margin: 0.5rem;
  padding: 0.5rem;
  border-radius: 0.25rem;
  box-shadow: 0 1px 7px #999;

  flex-basis: calc(25% - 1rem);
  position: relative;

  cursor: pointer;

  transition: 0.1s;
  &:hover {
    transition: 0.2s;
    box-shadow: 0 1px 9px #333;
  }
}

.chapter-card--chapter-number {
  text-align: center;
  font-weight: bold;
}

.chapter-card--completion-indicator {
  //
}
</style>

<i18n lang="json">
{
  "de": {
    "chapter_checklist": "Kapitelliste",
    "loading": "Laden...",
    "logged_before_today": "Dieses Kapitel wurde vor heute protokolliert. Sie können frühere Protokolleinträge auf der Kalenderseite bearbeiten.",
    "unable_to_mark_complete": "Kann das Kapitel nicht als abgeschlossen markieren.",
    "unable_to_mark_incomplete": "Kann das Kapitel nicht als unvollständig markieren."
  },
  "en": {
    "chapter_checklist": "Chapter Checklist",
    "loading": "Loading...",
    "logged_before_today": "This chapter was logged before today. You can edit previous log entries on the Calendar page.",
    "unable_to_mark_complete": "Unable to mark the chapter complete.",
    "unable_to_mark_incomplete": "Unable to mark the chapter incomplete."
  },
  "es": {
    "chapter_checklist": "Lista de capítulos",
    "loading": "Cargando...",
    "logged_before_today": "Este capítulo se registró antes de hoy. Puede editar las entradas de registro anteriores en la página del calendario.",
    "unable_to_mark_complete": "No se puede marcar el capítulo como completo.",
    "unable_to_mark_incomplete": "No se puede marcar el capítulo como incompleto."
  },
  "fr": {
    "chapter_checklist": "Liste de contrôle",
    "loading": "Chargement...",
    "logged_before_today": "Ce chapitre a été enregistré avant aujourd'hui. Vous pouvez modifier les entrées de journal précédentes sur la page du calendrier.",
    "unable_to_mark_complete": "Impossible de marquer le chapitre comme terminé.",
    "unable_to_mark_incomplete": "Impossible de marquer le chapitre comme incomplet."
  },
  "pt": {
    "chapter_checklist": "Lista de Capítulos",
    "loading": "Carregando...",
    "logged_before_today": "Este capítulo foi registrado antes de hoje. Você pode editar entradas de log anteriores na página do Calendário.",
    "unable_to_mark_complete": "Não é possível marcar o capítulo como completo.",
    "unable_to_mark_incomplete": "Não é possível marcar o capítulo como incompleto."
  },
  "uk": {
    "chapter_checklist": "Перелік розділів",
    "loading": "Завантаження...",
    "logged_before_today": "Цей розділ був зареєстрований до сьогодні. Ви можете редагувати попередні записи в календарній сторінці.",
    "unable_to_mark_complete": "Не вдалося позначити розділ як завершений.",
    "unable_to_mark_incomplete": "Не вдалося позначити розділ як незавершений."
  }
}
</i18n>
