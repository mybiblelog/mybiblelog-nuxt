<template>
  <div class="read-page content-column">
    <div class="read-page__translation-bar">
      <div class="select is-fullwidth">
        <select
          id="read-translation-select"
          class="read-page__translation-select"
          :aria-label="$t('read.translation_aria')"
          :value="readTranslationKey"
          @change="onTranslationChange"
        >
          <option
            v-for="opt in readTranslationSelectOptions"
            :key="opt.value"
            :value="opt.value"
          >
            {{ opt.text }}
          </option>
        </select>
      </div>
    </div>

    <nav
      class="read-page__nav"
      :aria-label="$t('read.nav_label')"
    >
      <button
        type="button"
        class="read-page__nav-btn read-page__nav-btn--prev"
        :disabled="!canGoPrev"
        :aria-label="$t('read.prev_chapter')"
        @click="goPrevChapter"
      >
        <caret-left-icon width="14px" height="22px" fill="currentColor" />
      </button>
      <h1 class="read-page__title title is-5">
        <template v-if="queryIsValid">
          <button
            type="button"
            class="read-page__title-book"
            :aria-label="$t('read.choose_book')"
            :aria-haspopup="'dialog'"
            :aria-expanded="bookPickerOpen ? 'true' : 'false'"
            @click="openBookPicker"
          >
            {{ localizedBookName }}
          </button>
          <button
            type="button"
            class="read-page__title-chapter"
            :aria-label="$t('read.choose_chapter')"
            :aria-haspopup="'dialog'"
            :aria-expanded="chapterPickerOpen ? 'true' : 'false'"
            @click="openChapterPicker"
          >
            {{ chapterIndex }}
          </button>
        </template>
        <template v-else>
          {{ $t('read.page_title') }}
        </template>
      </h1>
      <button
        type="button"
        class="read-page__nav-btn read-page__nav-btn--next"
        :disabled="!canGoNext"
        :aria-label="$t('read.next_chapter')"
        @click="goNextChapter"
      >
        <caret-right-icon width="14px" height="22px" fill="currentColor" />
      </button>
    </nav>

    <div v-if="queryIsValid" class="read-page__body">
      <bible-verse-range
        :key="verseRangeKey"
        :start-verse-id="startVerseId"
        :end-verse-id="endVerseId"
        :bible-version="readTranslationKey"
      />
    </div>

    <transition name="fade" appear>
      <app-modal
        v-if="bookPickerOpen"
        :title="$t('read.choose_book')"
        @close="bookPickerOpen = false"
      >
        <template slot="content">
          <div class="read-page__modal-scroll">
            <grid-selector
              :options="bookGridOptions"
              :columns="2"
              @selection="onSelectBook"
            />
          </div>
        </template>
      </app-modal>
    </transition>

    <transition name="fade" appear>
      <app-modal
        v-if="chapterPickerOpen"
        :title="$t('read.choose_chapter')"
        @close="chapterPickerOpen = false"
      >
        <template slot="content">
          <div class="read-page__modal-scroll read-page__modal-scroll--chapters">
            <grid-selector
              :options="chapterGridOptions"
              :columns="6"
              flow="row"
              @selection="onSelectChapter"
            />
          </div>
        </template>
      </app-modal>
    </transition>
  </div>
</template>

<script>
import {
  Bible,
  BibleVersions,
  getDefaultBibleVersionForUiLocale,
  isBibleVersionKey,
} from '@mybiblelog/shared';
import BibleVerseRange from '@/components/BibleVerseRange';
import CaretLeftIcon from '@/components/svg/CaretLeftIcon';
import CaretRightIcon from '@/components/svg/CaretRightIcon';
import AppModal from '@/components/popups/AppModal';
import GridSelector from '@/components/forms/GridSelector';
import { useAppInitStore } from '~/stores/app-init';

const readPageBibleVersionLabels = {
  [BibleVersions.NASB2020]: 'New American Standard Bible (NASB)',
  [BibleVersions.NASB1995]: 'New American Standard Bible 1995 (NASB 1995)',
  [BibleVersions.AMP]: 'Amplified Bible (AMP)',
  [BibleVersions.KJV]: 'King James Version (KJV)',
  [BibleVersions.NKJV]: 'New King James Version (NKJV)',
  [BibleVersions.NIV]: 'New International Version (NIV)',
  [BibleVersions.ESV]: 'English Standard Version (ESV)',
  [BibleVersions.NABRE]: 'New American Bible Revised Edition (NABRE)',
  [BibleVersions.NLT]: 'New Living Translation (NLT)',
  [BibleVersions.TPT]: 'The Passion Translation (TPT)',
  [BibleVersions.MSG]: 'The Message (MSG)',
  [BibleVersions.RVR1960]: 'Reina-Valera 1960 (RVR1960)',
  [BibleVersions.RVR2020]: 'Reina-Valera 2020 (RVR2020)',
  [BibleVersions.UKR]: 'українська (UKR)',
  [BibleVersions.BDS]: 'Bible du Semeur (BDS)',
  [BibleVersions.LSG]: 'Louis Segond (LSG)',
  [BibleVersions.ARC]: 'Almeida Revista e Corrigida (ARC)',
  [BibleVersions.LUT]: 'Luther 1545 (LUT)',
  [BibleVersions.KRV]: '개역한글 (KRV)',
  [BibleVersions.KLB]: 'Korean Living Bible (KLB)',
};

const readTranslationSelectOptions = Object.keys(readPageBibleVersionLabels).map(key => ({
  value: key,
  text: readPageBibleVersionLabels[key],
}));

export default {
  name: 'ReadPage',
  components: {
    BibleVerseRange,
    CaretLeftIcon,
    CaretRightIcon,
    AppModal,
    GridSelector,
  },
  middleware: ['auth'],
  data() {
    return {
      normalizingQuery: false,
      bookPickerOpen: false,
      chapterPickerOpen: false,
      readTranslationSelectOptions,
    };
  },
  head() {
    return {
      title: this.queryIsValid ? this.chapterHeading : this.$t('read.page_title'),
    };
  },
  computed: {
    bookIndex() {
      return parseInt(String(this.$route.query.book), 10);
    },
    chapterIndex() {
      return parseInt(String(this.$route.query.chapter), 10);
    },
    queryIsValid() {
      const b = this.bookIndex;
      const c = this.chapterIndex;
      if (!Number.isFinite(b) || b < 1 || b > Bible.getBookCount()) {
        return false;
      }
      const max = Bible.getBookChapterCount(b);
      return Number.isFinite(c) && c >= 1 && c <= max;
    },
    maxChapterInBook() {
      if (!this.queryIsValid) {
        return 1;
      }
      return Bible.getBookChapterCount(this.bookIndex);
    },
    localizedBookName() {
      if (!this.queryIsValid) {
        return '';
      }
      return Bible.getBookName(this.bookIndex, this.$i18n.locale);
    },
    chapterHeading() {
      if (!this.queryIsValid) {
        return this.$t('read.page_title');
      }
      return this.$t('read.chapter_title', {
        book: this.localizedBookName,
        chapter: this.chapterIndex,
      });
    },
    bookGridOptions() {
      const lang = this.$i18n.locale;
      return Bible.getBooks()
        .slice()
        .sort((a, b) => a.bibleOrder - b.bibleOrder)
        .map(b => ({
          value: b.bibleOrder,
          label: b.locales[lang]?.name || b.locales.en.name,
        }));
    },
    chapterGridOptions() {
      if (!this.queryIsValid) {
        return [];
      }
      const n = this.maxChapterInBook;
      const opts = [];
      for (let i = 1; i <= n; i += 1) {
        opts.push({ value: i, label: String(i) });
      }
      return opts;
    },
    canGoPrev() {
      return this.queryIsValid && (this.chapterIndex > 1 || this.bookIndex > 1);
    },
    canGoNext() {
      if (!this.queryIsValid) {
        return false;
      }
      const bookCount = Bible.getBookCount();
      return this.chapterIndex < this.maxChapterInBook || this.bookIndex < bookCount;
    },
    startVerseId() {
      if (!this.queryIsValid) {
        return Bible.makeVerseId(1, 1, 1);
      }
      return Bible.makeVerseId(this.bookIndex, this.chapterIndex, 1);
    },
    endVerseId() {
      if (!this.queryIsValid) {
        return Bible.makeVerseId(1, 1, 1);
      }
      const last = Bible.getChapterVerseCount(this.bookIndex, this.chapterIndex);
      return Bible.makeVerseId(this.bookIndex, this.chapterIndex, last);
    },
    readTranslationKey() {
      const q = this.$route.query.translation;
      const raw = Array.isArray(q) ? '' : String(q ?? '');
      if (isBibleVersionKey(raw)) {
        return raw;
      }
      return getDefaultBibleVersionForUiLocale(this.$i18n.locale);
    },
    verseRangeKey() {
      return `${this.bookIndex}-${this.chapterIndex}-${this.readTranslationKey}`;
    },
  },
  watch: {
    '$route.query': {
      handler() {
        this.normalizeRouteQuery();
        this.bookPickerOpen = false;
        this.chapterPickerOpen = false;
      },
      deep: true,
    },
    '$i18n.locale'() {
      this.normalizeRouteQuery();
    },
  },
  mounted() {
    useAppInitStore().loadUserData();
    this.normalizeRouteQuery();
  },
  methods: {
    openBookPicker() {
      this.chapterPickerOpen = false;
      this.bookPickerOpen = true;
    },
    openChapterPicker() {
      this.bookPickerOpen = false;
      this.chapterPickerOpen = true;
    },
    normalizeRouteQuery() {
      if (this.normalizingQuery) {
        return;
      }
      const q = this.$route.query;
      const rawBook = parseInt(String(q.book), 10);
      const rawChapter = parseInt(String(q.chapter), 10);
      const rawTranslation = Array.isArray(q.translation) ? '' : String(q.translation ?? '');
      const bookCount = Bible.getBookCount();

      let book = rawBook;
      let chapter = rawChapter;

      if (!Number.isFinite(book) || book < 1 || book > bookCount) {
        book = 1;
        chapter = 1;
      }
      else {
        const maxCh = Bible.getBookChapterCount(book);
        if (!Number.isFinite(chapter) || chapter < 1 || chapter > maxCh) {
          chapter = 1;
        }
      }

      const localeDefault = getDefaultBibleVersionForUiLocale(this.$i18n.locale);
      const translation = isBibleVersionKey(rawTranslation) ? rawTranslation : localeDefault;

      const nextQuery = {
        book: String(book),
        chapter: String(chapter),
        translation,
      };

      if (
        String(q.book) === nextQuery.book &&
        String(q.chapter) === nextQuery.chapter &&
        String(q.translation ?? '') === nextQuery.translation
      ) {
        return;
      }

      this.normalizingQuery = true;
      const done = () => {
        this.normalizingQuery = false;
      };
      const nav = this.$router.replace({
        path: this.localePath('/read'),
        query: nextQuery,
      });
      if (nav !== undefined && typeof (nav).catch === 'function') {
        nav.catch(() => {}).finally(done);
      }
      else {
        this.$nextTick(done);
      }
    },
    goToRead(book, chapter) {
      this.$router.push({
        path: this.localePath('/read'),
        query: {
          book: String(book),
          chapter: String(chapter),
          translation: this.readTranslationKey,
        },
      });
    },
    onTranslationChange(event) {
      const v = event.target.value;
      if (!isBibleVersionKey(v)) {
        return;
      }
      const book = Number.isFinite(this.bookIndex) && this.bookIndex >= 1 ? this.bookIndex : 1;
      const chapter = Number.isFinite(this.chapterIndex) && this.chapterIndex >= 1 ? this.chapterIndex : 1;
      this.$router.push({
        path: this.localePath('/read'),
        query: {
          book: String(book),
          chapter: String(chapter),
          translation: v,
        },
      });
    },
    onSelectBook(bookOrder) {
      const b = Number(bookOrder);
      if (!Number.isFinite(b) || b < 1 || b > Bible.getBookCount()) {
        return;
      }
      this.bookPickerOpen = false;
      if (b === this.bookIndex) {
        return;
      }
      this.goToRead(b, 1);
    },
    onSelectChapter(chapterNum) {
      const c = Number(chapterNum);
      if (!this.queryIsValid || !Number.isFinite(c) || c < 1 || c > this.maxChapterInBook) {
        return;
      }
      this.chapterPickerOpen = false;
      if (c === this.chapterIndex) {
        return;
      }
      this.goToRead(this.bookIndex, c);
    },
    goPrevChapter() {
      if (!this.canGoPrev) {
        return;
      }
      if (this.chapterIndex > 1) {
        this.goToRead(this.bookIndex, this.chapterIndex - 1);
        return;
      }
      const prevBook = this.bookIndex - 1;
      const lastChapter = Bible.getBookChapterCount(prevBook);
      this.goToRead(prevBook, lastChapter);
    },
    goNextChapter() {
      if (!this.canGoNext) {
        return;
      }
      if (this.chapterIndex < this.maxChapterInBook) {
        this.goToRead(this.bookIndex, this.chapterIndex + 1);
        return;
      }
      this.goToRead(this.bookIndex + 1, 1);
    },
  },
};
</script>

<style lang="scss" scoped>
.read-page {
  /* Match .content-column horizontal padding (1rem); keep extra space below for floating feedback */
  padding-top: 1rem;
  padding-bottom: 4rem;
}

.read-page__translation-bar {
  margin: 0 0 0.75rem;
}

.read-page__nav {
  position: sticky;
  /* Below Bulma fixed navbar (has-navbar-fixed-top) */
  top: 3.25rem;
  z-index: 19;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin: 0 -0.5rem 1rem;
  padding: 0.65rem 0.35rem;
  background: var(--body-background, #fff);
  border-bottom: 1px solid #e8e8e8;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.03);
}

.read-page__title {
  flex: 1;
  margin: 0 !important;
  text-align: center;
  line-height: 1.3;
  font-weight: 600;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: center;
  gap: 0.25rem;
}

.read-page__title-book,
.read-page__title-chapter {
  font: inherit;
  font-weight: inherit;
  font-size: inherit;
  margin: 0;
  padding: 0.12em 0.28em;
  border: none;
  border-radius: 0.2rem;
  background: transparent;
  color: inherit;
  cursor: pointer;
  max-width: 100%;
  text-align: center;
  transition: background 0.15s ease, text-decoration 0.15s ease;

  &:hover {
    text-decoration: underline;
    text-decoration-thickness: 1px;
    background: rgba(0, 0, 0, 0.05);
  }

  &:focus {
    outline: 2px solid #209cee;
    outline-offset: 2px;
  }
}

.read-page__nav-btn {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2.5rem;
  min-height: 2.5rem;
  padding: 0.25rem;
  border: none;
  border-radius: 0.25rem;
  background: transparent;
  color: #363636;
  cursor: pointer;
  transition: background 0.15s ease, opacity 0.15s ease;

  &:hover:not(:disabled) {
    background: rgba(0, 0, 0, 0.06);
  }

  &:focus {
    outline: 2px solid #209cee;
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
}

.read-page__body {
  max-width: 42rem;
}

.read-page__modal-scroll {
  max-height: min(65vh, 28rem);
  overflow-y: auto;
  margin: -0.5rem -0.25rem;
  padding: 0.5rem 0.25rem;
}

.read-page__modal-scroll--chapters {
  max-height: min(50vh, 22rem);
}
</style>

<i18n lang="json">
{
  "en": {
    "read": {
      "page_title": "Read",
      "nav_label": "Chapter",
      "chapter_title": "{book} {chapter}",
      "prev_chapter": "Previous chapter",
      "next_chapter": "Next chapter",
      "choose_book": "Choose a book",
      "choose_chapter": "Choose a chapter",
      "translation_aria": "Bible translation"
    }
  },
  "de": {
    "read": {
      "page_title": "Lesen",
      "nav_label": "Kapitel",
      "chapter_title": "{book} {chapter}",
      "prev_chapter": "Vorheriges Kapitel",
      "next_chapter": "Nächstes Kapitel",
      "choose_book": "Buch wählen",
      "choose_chapter": "Kapitel wählen",
      "translation_aria": "Bibelübersetzung"
    }
  },
  "es": {
    "read": {
      "page_title": "Leer",
      "nav_label": "Capítulo",
      "chapter_title": "{book} {chapter}",
      "prev_chapter": "Capítulo anterior",
      "next_chapter": "Capítulo siguiente",
      "choose_book": "Elegir un libro",
      "choose_chapter": "Elegir un capítulo",
      "translation_aria": "Traducción bíblica"
    }
  },
  "fr": {
    "read": {
      "page_title": "Lire",
      "nav_label": "Chapitre",
      "chapter_title": "{book} {chapter}",
      "prev_chapter": "Chapitre précédent",
      "next_chapter": "Chapitre suivant",
      "choose_book": "Choisir un livre",
      "choose_chapter": "Choisir un chapitre",
      "translation_aria": "Traduction biblique"
    }
  },
  "ko": {
    "read": {
      "page_title": "읽기",
      "nav_label": "장",
      "chapter_title": "{book} {chapter}",
      "prev_chapter": "이전 장",
      "next_chapter": "다음 장",
      "choose_book": "책 선택",
      "choose_chapter": "장 선택",
      "translation_aria": "성경 번역본"
    }
  },
  "pt": {
    "read": {
      "page_title": "Ler",
      "nav_label": "Capítulo",
      "chapter_title": "{book} {chapter}",
      "prev_chapter": "Capítulo anterior",
      "next_chapter": "Próximo capítulo",
      "choose_book": "Escolher um livro",
      "choose_chapter": "Escolher um capítulo",
      "translation_aria": "Tradução bíblica"
    }
  },
  "uk": {
    "read": {
      "page_title": "Читання",
      "nav_label": "Розділ",
      "chapter_title": "{book} {chapter}",
      "prev_chapter": "Попередній розділ",
      "next_chapter": "Наступний розділ",
      "choose_book": "Оберіть книгу",
      "choose_chapter": "Оберіть розділ",
      "translation_aria": "Переклад Біблії"
    }
  }
}
</i18n>
