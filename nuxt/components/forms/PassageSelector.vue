<template>
  <div>
    <div class="passage-selector">
      <div class="part" @click="openSelectBook">
        <template v-if="!selected.book">
          {{ $t('select_book') }}
        </template>
        <template v-if="selected.book">
          {{ bookName }}
        </template>
      </div>
      <template v-if="selected.book">
        <div class="part" @click="openSelectChapters">
          <template v-if="!selected.startChapter">
            *
          </template>
          <template v-if="selected.startChapter">
            {{ selected.startChapter }}
          </template>
        </div>
        <template v-if="selected.startChapter">
          :
          <div class="part" @click="() => selected.endChapter === selected.startChapter ? openSelectVerses() : openSelectStartVerse()">
            <template v-if="!selected.startVerse">
              *
            </template>
            <template v-if="selected.startVerse">
              {{ selected.startVerse }}
            </template>
          </div>
          <template v-if="selected.endChapter === selected.startChapter && selected.startVerse && selected.endVerse !== selected.startVerse">
            -
            <div class="part" @click="openSelectEndVerse">
              <template v-if="!selected.endVerse">
                *
              </template>
              <template v-if="selected.endVerse">
                {{ selected.endVerse }}
              </template>
            </div>
          </template>
        </template>
        <template v-if="selected.endChapter && selected.endChapter !== selected.startChapter">
          -
          <div class="part" @click="openSelectEndChapter">
            {{ selected.endChapter }}
          </div>:
          <div class="part" @click="openSelectEndVerse">
            <template v-if="!selected.endVerse">
              *
            </template>
            <template v-if="selected.endVerse">
              {{ selected.endVerse }}
            </template>
          </div>
        </template>
      </template>
    </div>
    <app-modal v-if="selectionTarget" :title="modalTitle" @close="endSelection">
      <template slot="content">
        <template v-if="selectionTarget === SELECTION.BOOK">
          <div class="book-selector-controls">
            <div class="button-group">
              <button
                type="button"
                class="button-group--button button-group--button-left"
                :class="{ active: selectedTestament === 'old' }"
                @click="selectedTestament = 'old'"
              >
                {{ $t('old_testament') }}
              </button>
              <button
                type="button"
                class="button-group--button button-group--button-right"
                :class="{ active: selectedTestament === 'new' }"
                @click="selectedTestament = 'new'"
              >
                {{ $t('new_testament') }}
              </button>
            </div>
            <div class="button-group">
              <button
                type="button"
                class="button-group--button button-group--button-left"
                :class="{ active: bookSortOrder === 'numerical' }"
                @click="bookSortOrder = 'numerical'"
              >
                123
              </button>
              <button
                type="button"
                class="button-group--button button-group--button-right"
                :class="{ active: bookSortOrder === 'alphabetical' }"
                @click="bookSortOrder = 'alphabetical'"
              >
                ABC
              </button>
            </div>
          </div>
          <grid-selector :options="filteredBookOptions" :columns="2" @selection="selectBook" />
        </template>
        <template v-if="selectionTarget === SELECTION.CHAPTERS">
          <div class="selector-note">
            {{ $t('select_chapters_note') }}
          </div>
          <tap-range-selector :min="startChapters[0]" :max="startChapters[startChapters.length-1]" :columns="8" @selection="selectChapters" />
        </template>
        <tap-range-selector
          v-if="selectionTarget === SELECTION.END_CHAPTER"
          :min="endChapters[0]"
          :max="endChapters[endChapters.length-1]"
          :multi="false"
          :columns="8"
          @selection="selectEndChapter"
        />
        <template v-if="selectionTarget === SELECTION.VERSES">
          <div class="selector-note">
            {{ $t('select_verses_note') }}
          </div>
          <tap-range-selector :min="startVerses[0]" :max="startVerses[startVerses.length-1]" :columns="8" @selection="selectVerses" />
        </template>
        <tap-range-selector
          v-if="selectionTarget === SELECTION.START_VERSE"
          :min="startVerses[0]"
          :max="startVerses[startVerses.length-1]"
          :multi="false"
          :columns="8"
          @selection="selectStartVerse"
        />
        <tap-range-selector
          v-if="selectionTarget === SELECTION.END_VERSE"
          :min="endVerses[0]"
          :max="endVerses[endVerses.length-1]"
          :multi="false"
          :columns="8"
          @selection="selectEndVerse"
        />
      </template>
    </app-modal>
  </div>
</template>

<script>
import { Bible } from '@mybiblelog/shared';
import AppModal from '@/components/popups/AppModal';
import GridSelector from '@/components/forms/GridSelector';
import TapRangeSelector from '@/components/forms/TapRangeSelector';

const SELECTION = {
  BOOK: 'BOOK',
  CHAPTERS: 'CHAPTERS',
  END_CHAPTER: 'END_CHAPTER',
  VERSES: 'VERSES',
  START_VERSE: 'START_VERSE',
  END_VERSE: 'END_VERSE',
};

export default {
  name: 'PassageSelector',
  components: {
    AppModal,
    GridSelector,
    TapRangeSelector,
  },
  props: {
    populateWith: {
      type: Object,
      default: () => ({ empty: true }),
    },
  },
  data() {
    return {
      SELECTION,

      selected: {
        book: 0,
        startChapter: 0,
        startVerse: 0,
        endChapter: 0,
        endVerse: 0,
      },

      chapterVerses: {},

      selectionTarget: null,

      books: [],
      bookOptions: [],
      startChapters: [],
      startVerses: [],
      endChapters: [],
      endVerses: [],

      silent: false,
      currentValue: {
        startVerseId: null,
        endVerseId: null,
      },

      selectedTestament: 'old',
      bookSortOrder: 'numerical',
    };
  },
  computed: {
    bookName() {
      return Bible.getBookName(this.selected.book, this.$i18n.locale);
    },
    modalTitle() {
      switch (this.selectionTarget) {
      case SELECTION.BOOK:
        return this.$t('select_book');
      case SELECTION.CHAPTERS:
        return this.$t('select_chapters');
      case SELECTION.END_CHAPTER:
        return this.$t('select_end_chapter');
      case SELECTION.VERSES:
        return this.$t('select_verses');
      case SELECTION.START_VERSE:
        return this.$t('select_start_verse');
      case SELECTION.END_VERSE:
        return this.$t('select_end_verse');
      default:
        return '';
      }
    },
    filteredBookOptions() {
      let filtered = this.bookOptions.filter((book) => {
        const bookData = this.books.find(b => b.bibleOrder === book.value);
        if (!bookData) {
          return false;
        }
        if (this.selectedTestament === 'old') {
          return !bookData.newTestament;
        }
        else {
          return bookData.newTestament;
        }
      });

      if (this.bookSortOrder === 'alphabetical') {
        filtered = [...filtered].sort((a, b) => {
          // Strip leading numbers and whitespace for sorting
          const stripLeadingNumbers = (str) => {
            return str.replace(/^\d+\s*/, '').trim();
          };
          const aLabel = stripLeadingNumbers(a.label);
          const bLabel = stripLeadingNumbers(b.label);
          return aLabel.localeCompare(bLabel, this.$i18n.locale);
        });
      }
      else {
        // Numerical order (bible order)
        filtered = [...filtered].sort((a, b) => {
          return a.value - b.value;
        });
      }

      return filtered;
    },
  },
  created() {
    if (!this.populateWith.empty) {
      this.silent = true;

      const { startVerseId, endVerseId } = this.populateWith;
      const start = Bible.parseVerseId(startVerseId);
      const book = start.book;
      const startChapter = start.chapter;
      const startVerse = start.verse;
      const end = Bible.parseVerseId(endVerseId);
      const endChapter = end.chapter;
      const endVerse = end.verse;

      this.selected.book = book;
      this.onSelectBook();
      this.selected.startChapter = startChapter;
      this.selected.endChapter = endChapter;
      this.onSelectChapters();
      this.selected.startVerse = startVerse;
      this.onSelectStartVerse();
      this.selected.endVerse = endVerse;

      this.silent = false;
    }
  },
  mounted() {
    this.books = Bible.getBooks();
    this.bookOptions = this.books.map(book => ({
      label: Bible.getBookName(book.bibleOrder, this.$i18n.locale),
      value: book.bibleOrder,
    }));
  },
  methods: {
    emitCurrentValue() {
      if (this.silent) { return; }
      const book = this.selected.book;
      const startChapter = this.selected.startChapter || 1;
      const endChapter = this.selected.endChapter || Bible.getBookChapterCount(book);
      const startVerse = this.selected.startVerse || 1;
      const endVerse = this.selected.endVerse || Bible.getChapterVerseCount(book, endChapter);
      const startVerseId = Bible.makeVerseId(book, startChapter, startVerse);
      const endVerseId = Bible.makeVerseId(book, endChapter, endVerse);
      this.$emit('change', { startVerseId, endVerseId });
    },
    resetStartChapter() {
      this.selected.startChapter = 0;
      this.startChapters = [];
    },
    resetStartVerse() {
      this.selected.startVerse = 0;
      this.startVerses = [];
    },
    resetEndChapter() {
      this.selected.endChapter = 0;
      this.endChapters = [];
    },
    resetEndVerse() {
      this.selected.endVerse = 0;
      this.endVerses = [];
    },
    onSelectBook() {
      this.resetStartChapter();
      this.resetStartVerse();
      this.resetEndChapter();
      this.resetEndVerse();

      const bookIndex = this.selected.book;
      const chapterCount = Bible.getBookChapterCount(bookIndex);
      const chapters = [];
      for (let i = 1; i <= chapterCount; i++) { chapters.push(i); }
      this.startChapters = chapters;

      // Make it easier to log an entry in a book with only one chapter
      if (chapterCount === 1) {
        this.selectChapters({ from: 1, to: 1 });
      }

      this.emitCurrentValue();
    },
    onSelectChapters() {
      this.resetStartVerse();
      this.resetEndVerse();

      const startChapterVerseCount = Bible.getChapterVerseCount(this.selected.book, this.selected.startChapter);
      const startVerses = [];
      for (let i = 1; i <= startChapterVerseCount; i++) { startVerses.push(i); }
      this.startVerses = startVerses;

      const bookIndex = this.selected.book;
      const chapterCount = Bible.getBookChapterCount(bookIndex);
      const chapters = [];
      for (let i = this.selected.startChapter; i <= chapterCount; i++) { chapters.push(i); }
      this.endChapters = chapters;

      const endChapterVerseCount = Bible.getChapterVerseCount(this.selected.book, this.selected.endChapter);
      const endVerses = [];
      for (let i = 1; i <= endChapterVerseCount; i++) { endVerses.push(i); }
      this.endVerses = endVerses;

      this.emitCurrentValue();
    },
    onSelectEndChapter() {
      this.resetEndVerse();

      const endChapterVerseCount = Bible.getChapterVerseCount(this.selected.book, this.selected.endChapter);
      const endVerses = [];
      const initialVerse = (this.selected.startChapter === this.selected.endChapter) ? (this.selected.startVerse || 1) : 1;
      for (let i = initialVerse; i <= endChapterVerseCount; i++) { endVerses.push(i); }
      this.endVerses = endVerses;

      this.emitCurrentValue();
    },
    onSelectVerses() {
      const chapterVerseCount = Bible.getChapterVerseCount(this.selected.book, this.selected.endChapter);
      const endVerses = [];
      for (let i = this.selected.startVerse; i <= chapterVerseCount; i++) { endVerses.push(i); }
      this.endVerses = endVerses;

      this.emitCurrentValue();
    },
    onSelectStartVerse() {
      if (this.selected.endChapter === this.selected.startChapter) {
        const chapterVerseCount = Bible.getChapterVerseCount(this.selected.book, this.selected.endChapter);
        const endVerses = [];
        for (let i = this.selected.startVerse; i <= chapterVerseCount; i++) { endVerses.push(i); }
        this.endVerses = endVerses;
      }

      this.emitCurrentValue();
    },
    onSelectEndVerse() {
      this.emitCurrentValue();
    },

    openSelectBook() {
      this.selectionTarget = SELECTION.BOOK;
    },
    openSelectChapters() {
      this.selectionTarget = SELECTION.CHAPTERS;
    },
    openSelectEndChapter() {
      this.selectionTarget = SELECTION.END_CHAPTER;
    },
    openSelectVerses() {
      this.selectionTarget = SELECTION.VERSES;
    },
    openSelectStartVerse() {
      this.selectionTarget = SELECTION.START_VERSE;
    },
    openSelectEndVerse() {
      this.selectionTarget = SELECTION.END_VERSE;
    },

    endSelection() {
      this.selectionTarget = null;
    },

    selectBook(bookIndex) {
      this.selected.book = bookIndex;
      this.onSelectBook();
      this.selectionTarget = null;
    },
    selectChapters({ from, to }) {
      this.selected.startChapter = from;
      this.selected.endChapter = to;
      this.onSelectChapters();
      this.selectionTarget = null;
    },
    selectEndChapter({ from, to }) {
      this.selected.endChapter = to || from;
      this.onSelectEndChapter();
      this.selectionTarget = null;
    },
    selectVerses({ from, to }) {
      this.selected.startVerse = from;
      this.selected.endVerse = to;
      this.onSelectVerses();
      this.selectionTarget = null;
    },
    selectStartVerse({ from, to }) {
      this.selected.startVerse = from || to;
      this.onSelectStartVerse();
      this.selectionTarget = null;
    },
    selectEndVerse({ from, to }) {
      this.selected.endVerse = to || from;
      this.onSelectEndVerse();
      this.selectionTarget = null;
    },
  },
};
</script>

<style lang="scss" scoped>

.selector-note {
  background: #eee;
  padding: 0.2em 0.5em;
  border-radius: 0.2em;
  margin-bottom: 0.5em;
  margin-top: -0.5em;
}
.passage-selector {
  display: flex;
  align-items: center;

  .part {
    display: inline;
    background: #ccc;
    padding: 0.5rem 0.75rem;
    margin: 0 0.25rem;
    border-radius: 3px;
    white-space: nowrap;
    cursor: pointer;
    transition: color 0.2s ease-out, background-color 0.2s ease-out;
    &:hover {
      color: #fff;
      background: #09f;
    }
    &:first-child {
      margin-left: 0;
    }
    &:last-child {
      margin-right: 0;
    }
  }
}

.book-selector-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
  justify-content: space-between;
}

.button-group {
  display: flex;
}

.button-group--button {
  padding: 0.5rem 1rem;
  border: 1px solid #ccc;
  background: #fff;
  cursor: pointer;
  transition: 0.2s;
  font-size: 0.9rem;
  white-space: nowrap;

  &:hover {
    border-color: #09f;
    background: #f0f8ff;
  }

  &.active {
    background: #09f;
    color: #fff;
    border-color: #09f;
  }

  &.button-group--button-left {
    border-top-left-radius: 5px;
    border-bottom-left-radius: 5px;
    border-right: none;
  }

  &.button-group--button-right {
    border-left: none;
    border-top-right-radius: 5px;
    border-bottom-right-radius: 5px;
  }
}
</style>

<i18n locale="en" lang="json" src="@/locales/sfc/en/components/forms/PassageSelector.json" />
<i18n locale="de" lang="json" src="@/locales/sfc/de/components/forms/PassageSelector.json" />
<i18n locale="es" lang="json" src="@/locales/sfc/es/components/forms/PassageSelector.json" />
<i18n locale="fr" lang="json" src="@/locales/sfc/fr/components/forms/PassageSelector.json" />
<i18n locale="ko" lang="json" src="@/locales/sfc/ko/components/forms/PassageSelector.json" />
<i18n locale="pt" lang="json" src="@/locales/sfc/pt/components/forms/PassageSelector.json" />
<i18n locale="uk" lang="json" src="@/locales/sfc/uk/components/forms/PassageSelector.json" />
