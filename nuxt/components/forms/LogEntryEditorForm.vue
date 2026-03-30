<template>
  <form>
    <div class="passage-preview">
      {{ displayEditorVerseRange || $t('preview_passage') }}
    </div>
    <div>
      <label for="model-date">{{ $t('date') }}</label>
      <input id="model-date" :value="logEntry.date || defaultDate" type="date" @input="updateDate">
    </div>
    <div>
      <label for="model-book">{{ $t('book') }}</label>
      <select
        id="model-book"
        ref="book"
        :key="`book-${formBook}`"
        :value="formBook"
        @change="onSelectBook"
      >
        <option disabled="" value="0" selected="">
          {{ $t('choose_book') }}
        </option>
        <option v-for="book in books" :key="book.bibleOrder" :value="book.bibleOrder">
          {{ displayBookName(book.bibleOrder) }}
        </option>
      </select>
    </div>
    <div>
      <label for="model-startChapter">{{ $t('start_chapter') }}</label>
      <select
        id="model-startChapter"
        ref="startChapter"
        :key="`start-chapter-${formBook}-${formStartChapter}`"
        :value="formStartChapter"
        :disabled="formBook === 0"
        @change="onSelectStartChapter"
      >
        <option disabled="" value="0" selected="">
          {{ $t('choose_start_chapter') }}
        </option>
        <option v-for="chapter in startChapters" :key="chapter" :value="chapter">
          {{ chapter }}
        </option>
      </select>
    </div>
    <div>
      <label for="model-startVerse">{{ $t('start_verse') }}</label>
      <select
        id="model-startVerse"
        ref="startVerse"
        :key="`start-verse-${formStartChapter}-${formStartVerse}`"
        :value="formStartVerse"
        :disabled="formStartChapter === 0"
        @change="onSelectStartVerse"
      >
        <option disabled="" value="0" selected="">
          {{ $t('choose_start_verse') }}
        </option>
        <option v-for="verse in startVerses" :key="verse" :value="verse">
          {{ verse }}
        </option>
      </select>
    </div>
    <div>
      <label for="model-endChapter">{{ $t('end_chapter') }}</label>
      <select
        id="model-endChapter"
        ref="endChapter"
        :key="`end-chapter-${formStartChapter}-${formEndChapter}`"
        :value="formEndChapter"
        :disabled="formStartVerse === 0"
        @change="onSelectEndChapter"
      >
        <option disabled="" value="0" selected="">
          {{ $t('choose_end_chapter') }}
        </option>
        <option v-for="chapter in endChapters" :key="chapter" :value="chapter">
          {{ chapter }}
        </option>
      </select>
    </div>
    <div>
      <label for="model-endVerse">{{ $t('end_verse') }}</label>
      <select
        id="model-endVerse"
        ref="endVerse"
        :key="`end-verse-${formEndChapter}`"
        :value="formEndVerse"
        :disabled="formEndChapter === 0"
        @change="onSelectEndVerse"
      >
        <option disabled="" value="0" selected="">
          {{ $t('choose_end_verse') }}
        </option>
        <option v-for="verse in endVerses" :key="verse" :value="verse">
          {{ verse }}
        </option>
      </select>
    </div>
    <!-- ensures property will be computed because it is accessed-->
    <p hidden="hidden">
      {{ isValid }}
    </p>
  </form>
</template>

<script>
import * as dayjs from 'dayjs';
import { Bible } from '@mybiblelog/shared';
import { useLogEntryEditorStore } from '~/stores/log-entry-editor';

export default {
  name: 'LogEntryEditorForm',
  components: {
  },
  data() {
    return {
      books: Bible.getBooks(),
    };
  },
  computed: {
    logEntryEditorStore() {
      return useLogEntryEditorStore();
    },
    logEntry() {
      return this.logEntryEditorStore.logEntry;
    },
    isValid() {
      return this.logEntryEditorStore.isValid;
    },
    defaultDate() {
      return dayjs().format('YYYY-MM-DD');
    },
    formBook() {
      // First check if we have a book stored directly
      if (this.logEntry && this.logEntry.book) {
        return this.logEntry.book;
      }
      // Otherwise derive from verse ID
      if (this.logEntry && this.logEntry.startVerseId) {
        const start = Bible.parseVerseId(this.logEntry.startVerseId);
        return start.book;
      }
      return 0;
    },
    formStartChapter() {
      if (this.logEntry && this.logEntry.startVerseId) {
        const start = Bible.parseVerseId(this.logEntry.startVerseId);
        return start.chapter;
      }
      return 0;
    },
    formStartVerse() {
      if (this.logEntry && this.logEntry.startVerseId) {
        const start = Bible.parseVerseId(this.logEntry.startVerseId);
        return start.verse;
      }
      return 0;
    },
    formEndChapter() {
      if (this.logEntry && this.logEntry.endVerseId) {
        const end = Bible.parseVerseId(this.logEntry.endVerseId);
        return end.chapter;
      }
      return 0;
    },
    formEndVerse() {
      if (this.logEntry && this.logEntry.endVerseId) {
        const end = Bible.parseVerseId(this.logEntry.endVerseId);
        return end.verse;
      }
      return 0;
    },
    startChapters() {
      const bookIndex = this.formBook;
      if (bookIndex > 0) {
        const chapterCount = Bible.getBookChapterCount(bookIndex);
        const chapters = [];
        for (let i = 1; i <= chapterCount; i++) { chapters.push(i); }
        return chapters;
      }
      return [];
    },
    startVerses() {
      const bookIndex = this.formBook;
      const chapterIndex = this.formStartChapter;
      if (bookIndex > 0 && chapterIndex > 0) {
        const chapterVerseCount = Bible.getChapterVerseCount(bookIndex, chapterIndex);
        const verses = [];
        for (let i = 1; i <= chapterVerseCount; i++) { verses.push(i); }
        return verses;
      }
      return [];
    },
    endChapters() {
      const bookIndex = this.formBook;
      const startChapter = this.formStartChapter;
      if (bookIndex > 0 && startChapter > 0) {
        const chapterCount = Bible.getBookChapterCount(bookIndex);
        const chapters = [];
        for (let i = startChapter; i <= chapterCount; i++) { chapters.push(i); }
        return chapters;
      }
      return [];
    },
    endVerses() {
      const bookIndex = this.formBook;
      const endChapter = this.formEndChapter;
      const startChapter = this.formStartChapter;
      const startVerse = this.formStartVerse;
      if (bookIndex > 0 && endChapter > 0) {
        const chapterVerseCount = Bible.getChapterVerseCount(bookIndex, endChapter);
        const verses = [];
        let i = 1;
        if (startChapter === endChapter) { i = startVerse; }
        for (; i <= chapterVerseCount; i++) { verses.push(i); }
        return verses;
      }
      return [];
    },
    displayEditorVerseRange() {
      if (this.logEntry && this.logEntry.startVerseId && this.logEntry.endVerseId) {
        return Bible.displayVerseRange(this.logEntry.startVerseId, this.logEntry.endVerseId, this.$i18n.locale);
      }
      return null;
    },
  },
  methods: {
    displayBookName(bookIndex) {
      return Bible.getBookName(bookIndex, this.$i18n.locale);
    },
    updateDate(event) {
      this.logEntryEditorStore.updateDate(event.target.value);
    },
    onSelectBook(event) {
      const bookIndex = parseInt(event.target.value, 10);
      this.logEntryEditorStore.selectBook(bookIndex);
      this.$nextTick(() => {
        this.$refs.startChapter?.focus();
      });
    },
    onSelectStartChapter(event) {
      const chapterIndex = parseInt(event.target.value, 10);
      this.logEntryEditorStore.selectStartChapter(chapterIndex);
      this.$nextTick(() => {
        this.$refs.endVerse?.focus();
      });
    },
    onSelectStartVerse(event) {
      const verseIndex = parseInt(event.target.value, 10);
      this.logEntryEditorStore.selectStartVerse(verseIndex);
    },
    onSelectEndChapter(event) {
      const chapterIndex = parseInt(event.target.value, 10);
      this.logEntryEditorStore.selectEndChapter(chapterIndex);
      this.$nextTick(() => {
        this.$refs.endVerse?.focus();
      });
    },
    onSelectEndVerse(event) {
      const verseIndex = parseInt(event.target.value, 10);
      this.logEntryEditorStore.selectEndVerse(verseIndex);
    },
  },
};
</script>

<style lang="scss" scoped>
$breakpoint: 550px;

form {
  margin: 0 auto;
  max-width: 200px;

  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-column-gap: 1rem;
  @media screen and (min-width: $breakpoint) {
    max-width: 400px;
    grid-row-gap: 1rem;
  }
}

.passage-preview {
  grid-column: span 2;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.5rem;
  margin-bottom: 0.5rem;

  color: #fff;
  background: #09f;
  border-radius: 3px;
  font-weight: bold;
}

form > div {
  display: flex;
  flex-direction: column;
  position: relative;
}

form label {
  position: absolute;
  top: -0.5rem;
  left: 0.75rem;
  color: #09f;
  background-color: #fff;
  padding: 0 0.25rem;
  z-index: 1;
  pointer-events: none;
}

form input {
  font-size: 16px;
  min-height: 3rem;
  padding: 0.5rem;
  padding-top: 1.125rem;
  border: 2px solid #333;
  width: unset;
  border-radius: 0.25rem;
  box-sizing: border-box;
}

form select {
  font-size: 16px;
  height: 3rem;
  padding: 0.5rem;
  padding-top: 1.125rem;
  border: 2px solid #333;
  width: unset;
  border-radius: 0.25rem;
  box-sizing: border-box;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  padding-right: 2rem;
}

form input:not(:disabled),
form select:not(:disabled) {
  background-color: #fff;
}

@media screen and (max-width: $breakpoint) {
  form {
    display: flex;
    flex-direction: column;
  }

  form > div:not(:last-child) {
    margin-bottom: 0.5rem;
  }
}
</style>

<i18n locale="en" lang="json" src="@/locales/sfc/en/components/forms/LogEntryEditorForm.json" />
<i18n locale="de" lang="json" src="@/locales/sfc/de/components/forms/LogEntryEditorForm.json" />
<i18n locale="es" lang="json" src="@/locales/sfc/es/components/forms/LogEntryEditorForm.json" />
<i18n locale="fr" lang="json" src="@/locales/sfc/fr/components/forms/LogEntryEditorForm.json" />
<i18n locale="ko" lang="json" src="@/locales/sfc/ko/components/forms/LogEntryEditorForm.json" />
<i18n locale="pt" lang="json" src="@/locales/sfc/pt/components/forms/LogEntryEditorForm.json" />
<i18n locale="uk" lang="json" src="@/locales/sfc/uk/components/forms/LogEntryEditorForm.json" />
