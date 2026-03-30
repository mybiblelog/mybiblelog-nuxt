<template>
  <main>
    <div class="content-column">
      <section class="no-print">
        <header class="page-header">
          <h1 class="title">
            {{ $t('meta.title') }}
          </h1>
          <div class="buttons is-align-items-flex-start">
            <button class="button is-info" @click="print">
              {{ $t('print') }}
            </button>
          </div>
        </header>
        <div class="content">
          <p>{{ $t('content.this_is') }}</p>
          <p>{{ $t('content.printer_friendly') }}</p>
          <p v-html="$t('content.download_directly')" />
          <h2>{{ $t('content.chapters_in_the_bible') }}</h2>
          <p>{{ $t('content.there_are_66_books') }}</p>
          <h2>{{ $t('content.track_your_progress_online') }}</h2>
          <p v-html="$t('content.if_you_would_like')" />
        </div>
      </section>
    </div>
    <div class="container">
      <div class="book-grid">
        <div v-for="book in books" :key="book.id" class="book-box">
          <div class="chapter-checkboxes">
            <span class="book-title">{{ book.locales[$i18n.locale].name }}</span>
            <div v-for="chapter in Array.from({ length: book.chapterCount }, (_, i) => i + 1)" :key="chapter" class="chapter-checkbox-container">
              <div class="chapter-checkbox" />
              <span> {{ chapter }}</span>
            </div>
          </div>
        </div>
        <div class="attribution">
          <p>{{ $t('site_title') }}</p>
          <p>{{ $t('site_description') }}</p>
          <p>{{ siteUrl }}</p>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import { Bible } from '@mybiblelog/shared';

export default {
  data() {
    return {
      siteUrl: this.$config.siteUrl,
      books: Bible.getBooks(),
    };
  },
  head() {
    const localePathSegment = this.$i18n.locale === 'en' ? '' : `/${this.$i18n.locale}`;
    return {
      title: this.$t('meta.title'),
      link: [
        { rel: 'canonical', href: `${this.$config.siteUrl}${localePathSegment}/resources/printable-bible-reading-tracker` },
      ],
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: this.$t('meta.description'),
        },
        {
          hid: 'og:title',
          name: 'og:title',
          content: this.$t('meta.title'),
        },
        {
          hid: 'og:description',
          name: 'og:description',
          content: this.$t('meta.description'),
        },
        {
          hid: 'og:image',
          name: 'og:image',
          content: `${this.$config.siteUrl}/share.jpg`,
        },
      ],
    };
  },
  methods: {
    print() {
      window.print();
    },
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
  },
  auth: false,
};
</script>

<style lang="scss">
@media print {
  body.has-navbar-fixed-top {
    padding-top: 0;
  }

  .container {
    max-width: 100%;
    margin: 0;
    padding: 0;
  }
}

.book-grid {
  columns: 12rem 4;
  column-gap: 0.1rem;
}

.book-box {
  border: 1px solid #000;
  margin-bottom: -1px;
  line-height: 1;
}

.book-title {
  font-weight: bold;
  font-size: 0.8rem;
  white-space: nowrap;
  padding-right: 0.2rem;
}

.chapter-checkboxes {
  display: inline-flex;
  flex-wrap: wrap;
  line-height: 0.5rem;

  @media print {
    break-inside: avoid;
  }
}

.chapter-checkbox-container {
  display: inline-flex;
  align-items: center;
  margin: 0 0.1rem;
  font-size: 0.8rem;
}

.chapter-checkbox {
  display: inline-block;
  width: 0.6rem;
  height: 0.6rem;
  border: 1px solid #000;
  margin: 0.1rem;
  text-align: center;
}

.attribution {
  padding: 0.5rem;
  text-align: right;

  p {
    margin: 0;
    font-size: 0.8rem;
  }
}
</style>

<i18n locale="en" lang="json" src="@/locales/sfc/en/pages/resources/printable-bible-reading-tracker.json" />
<i18n locale="de" lang="json" src="@/locales/sfc/de/pages/resources/printable-bible-reading-tracker.json" />
<i18n locale="es" lang="json" src="@/locales/sfc/es/pages/resources/printable-bible-reading-tracker.json" />
<i18n locale="fr" lang="json" src="@/locales/sfc/fr/pages/resources/printable-bible-reading-tracker.json" />
<i18n locale="pt" lang="json" src="@/locales/sfc/pt/pages/resources/printable-bible-reading-tracker.json" />
<i18n locale="uk" lang="json" src="@/locales/sfc/uk/pages/resources/printable-bible-reading-tracker.json" />
