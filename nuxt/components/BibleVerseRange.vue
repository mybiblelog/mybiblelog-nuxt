<template>
  <div class="bible-verse-range">
    <p v-if="loading" class="is-size-7 has-text-grey">
      {{ $t('scripture_passage.loading') }}
    </p>
    <p v-else-if="loadError" class="is-size-7 has-text-danger">
      {{ $t('scripture_passage.error') }}
    </p>
    <template v-else>
      <template v-for="(row, rowIdx) in displayRows">
        <div
          v-if="row.type === 'chapter_label'"
          :key="rowDisplayKey(row, rowIdx)"
          class="bible-verse-range__chapter-label"
        >
          {{ row.text }}
        </div>
        <div
          v-else-if="row.type === 'section_heading'"
          :key="rowDisplayKey(row, rowIdx)"
          class="bible-verse-range__section-heading"
        >
          {{ row.text }}
        </div>
        <div
          v-else
          :key="rowDisplayKey(row, rowIdx)"
          class="bible-verse-range__verse"
        >
          <span class="bible-verse-range__ref">{{ row.chapter }}:{{ row.number }}</span>
          <span class="bible-verse-range__body">
            <template v-for="(seg, sIdx) in row.segments">
              <br v-if="seg.kind === 'line_break'" :key="'br-' + rowDisplayKey(row, rowIdx) + '-' + sIdx">
              <span
                v-else
                :key="'t-' + rowDisplayKey(row, rowIdx) + '-' + sIdx"
                :class="segmentClass(seg)"
              >{{ seg.text }}</span>
            </template>
          </span>
        </div>
      </template>
      <button
        v-if="showReadMore"
        type="button"
        class="button is-small is-text bible-verse-range__read-more"
        :disabled="loadingMore"
        @click="loadNextChapter"
      >
        {{ loadingMore ? $t('scripture_passage.loading') : $t('scripture_passage.read_more') }}
      </button>
      <p v-if="readMoreError" class="is-size-7 has-text-danger bible-verse-range__read-more-error">
        {{ $t('scripture_passage.error') }}
      </p>
      <p v-if="licenseUrl && !showReadMore && hasVerseLines" class="bible-verse-range__attr is-size-7 has-text-grey">
        <a :href="licenseUrl" target="_blank" rel="noopener noreferrer">{{ translationName }}</a>
      </p>
    </template>
  </div>
</template>

<script>
import { Bible, getHelloaoChapterFetchPlan, shouldUseChapterByChapterReadMore } from '@mybiblelog/shared';

export default {
  name: 'BibleVerseRange',
  props: {
    startVerseId: {
      type: Number,
      required: true,
    },
    endVerseId: {
      type: Number,
      required: true,
    },
    /** PreferredBibleVersion key (e.g. NASB2020) from user settings */
    bibleVersion: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      loading: true,
      loadingMore: false,
      loadError: false,
      passageBlocks: [],
      licenseUrl: '',
      translationName: '',
      passagePlan: null,
      useReadMoreMode: false,
      /** Index in passagePlan.chapters for the next chapter to fetch (read-more path). */
      nextChapterIndex: 0,
      readMoreError: false,
    };
  },
  computed: {
    showReadMore() {
      if (!this.useReadMoreMode || !this.passagePlan) {
        return false;
      }
      return this.nextChapterIndex < this.passagePlan.chapters.length;
    },
    hasVerseLines() {
      return this.passageBlocks.some(b => b.type === 'verse');
    },
    displayRows() {
      const blocks = this.passageBlocks;
      if (!blocks.length) {
        return [];
      }
      const bookIndex = Bible.parseVerseId(this.startVerseId).book;
      const lang = this.$i18n.locale;
      const labeledChapters = new Set();
      const out = [];
      for (let i = 0; i < blocks.length; i += 1) {
        const b = blocks[i];
        const ch = b.chapter;
        if (!labeledChapters.has(ch)) {
          labeledChapters.add(ch);
          out.push({
            type: 'chapter_label',
            chapter: ch,
            text: `${Bible.getBookName(bookIndex, lang)} ${ch}`,
          });
        }
        if (b.type === 'section_heading') {
          out.push({ type: 'section_heading', text: b.text });
        }
        else {
          out.push(b);
        }
      }
      return out;
    },
  },
  watch: {
    startVerseId: 'reloadPassage',
    endVerseId: 'reloadPassage',
    bibleVersion: 'reloadPassage',
  },
  mounted() {
    this.loadPassage();
  },
  methods: {
    rowDisplayKey(row, idx) {
      if (row.type === 'chapter_label') {
        return `cl-${row.chapter}-${idx}`;
      }
      if (row.type === 'section_heading') {
        return `sh-${idx}-${String(row.text).slice(0, 40)}`;
      }
      return `v-${row.chapter}-${row.number}-${idx}`;
    },
    normalizeApiBlocks(data) {
      if (data && Array.isArray(data.blocks)) {
        return data.blocks;
      }
      if (data && Array.isArray(data.verses)) {
        return data.verses.map(v => ({
          type: 'verse',
          chapter: v.chapter,
          number: v.number,
          segments: v.segments,
        }));
      }
      return [];
    },
    segmentClass(seg) {
      if (seg.kind !== 'text') {
        return {};
      }
      return {
        'bible-verse-range__jesus': Boolean(seg.wordsOfJesus),
        [`bible-verse-range__poem bible-verse-range__poem--${seg.poem}`]: typeof seg.poem === 'number',
      };
    },
    passageQuery(chapter) {
      const params = new URLSearchParams({
        startVerseId: String(this.startVerseId),
        endVerseId: String(this.endVerseId),
        bibleVersion: String(this.bibleVersion),
        chapter: String(chapter),
      });
      return `/api/scripture/passage?${params.toString()}`;
    },
    async fetchChapter(chapter) {
      const { data } = await this.$http.get(this.passageQuery(chapter));
      return data;
    },
    applyTranslationMeta(data) {
      if (data.licenseUrl) {
        this.licenseUrl = data.licenseUrl;
      }
      if (data.translationName) {
        this.translationName = data.translationName;
      }
    },
    reloadPassage() {
      this.loadPassage();
    },
    async loadPassage() {
      this.loading = true;
      this.loadingMore = false;
      this.loadError = false;
      this.passageBlocks = [];
      this.licenseUrl = '';
      this.translationName = '';
      this.passagePlan = null;
      this.useReadMoreMode = false;
      this.nextChapterIndex = 0;
      this.readMoreError = false;

      const plan = getHelloaoChapterFetchPlan(this.startVerseId, this.endVerseId);
      if (!plan) {
        this.loadError = true;
        this.loading = false;
        return;
      }
      this.passagePlan = plan;
      this.useReadMoreMode = shouldUseChapterByChapterReadMore(plan);

      try {
        if (this.useReadMoreMode) {
          await this.loadFirstChapterOnly();
        }
        else {
          await this.loadAllChaptersImmediate();
        }
      }
      catch {
        this.loadError = true;
        this.passageBlocks = [];
      }
      finally {
        this.loading = false;
      }
    },
    async loadFirstChapterOnly() {
      const chapter = this.passagePlan.chapters[0];
      const data = await this.fetchChapter(chapter);
      this.passageBlocks = [...this.normalizeApiBlocks(data)];
      this.applyTranslationMeta(data);
      this.nextChapterIndex = 1;
    },
    async loadAllChaptersImmediate() {
      const chapters = this.passagePlan.chapters;
      const results = await Promise.all(chapters.map(ch => this.fetchChapter(ch)));
      const merged = [];
      for (let i = 0; i < chapters.length; i += 1) {
        merged.push(...this.normalizeApiBlocks(results[i]));
        if (i === 0) {
          this.applyTranslationMeta(results[i]);
        }
      }
      this.passageBlocks = merged;
      this.nextChapterIndex = chapters.length;
    },
    async loadNextChapter() {
      if (!this.showReadMore || !this.passagePlan) {
        return;
      }
      this.loadingMore = true;
      this.readMoreError = false;
      try {
        const chapter = this.passagePlan.chapters[this.nextChapterIndex];
        const data = await this.fetchChapter(chapter);
        this.passageBlocks = [...this.passageBlocks, ...this.normalizeApiBlocks(data)];
        this.applyTranslationMeta(data);
        this.nextChapterIndex += 1;
      }
      catch {
        this.readMoreError = true;
      }
      finally {
        this.loadingMore = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.bible-verse-range {
  margin-top: 0.35rem;
  padding: 0.35rem 0 0.25rem;
  line-height: 1.45;
}

.bible-verse-range__chapter-label {
  font-size: 0.88rem;
  font-weight: 600;
  margin: 0.55rem 0 0.4rem;
  color: #4a4a4a;

  &:first-child {
    margin-top: 0;
  }
}

.bible-verse-range__section-heading {
  font-size: 0.82rem;
  font-weight: 600;
  font-style: italic;
  margin: 0.4rem 0 0.3rem;
  color: #555;
}

.bible-verse-range__verse {
  margin-bottom: 0.35rem;
}

.bible-verse-range__ref {
  font-weight: 600;
  font-size: 0.75rem;
  color: #666;
  margin-right: 0.35rem;
}

.bible-verse-range__body {
  font-size: 0.9rem;
}

.bible-verse-range__jesus {
  color: #6b2d1b;
}

.bible-verse-range__poem {
  display: inline-block;
}

.bible-verse-range__poem--1 {
  padding-left: 0.75rem;
}

.bible-verse-range__poem--2 {
  padding-left: 1.5rem;
}

.bible-verse-range__read-more {
  margin-top: 0.25rem;
  padding-left: 0 !important;
  height: auto;
}

.bible-verse-range__attr {
  margin-top: 0.5rem;
  margin-bottom: 0;

  a {
    text-decoration: underline;
    text-decoration-style: dotted;
  }
}
</style>

<i18n lang="json">
{
  "en": {
    "scripture_passage": {
      "loading": "Loading passage…",
      "error": "Could not load this passage. Try again later.",
      "read_more": "Read more"
    }
  },
  "de": {
    "scripture_passage": {
      "loading": "Abschnitt wird geladen…",
      "error": "Dieser Abschnitt konnte nicht geladen werden. Bitte später erneut versuchen.",
      "read_more": "Mehr lesen"
    }
  },
  "es": {
    "scripture_passage": {
      "loading": "Cargando pasaje…",
      "error": "No se pudo cargar este pasaje. Inténtalo de nuevo más tarde.",
      "read_more": "Leer más"
    }
  },
  "fr": {
    "scripture_passage": {
      "loading": "Chargement du passage…",
      "error": "Impossible de charger ce passage. Réessayez plus tard.",
      "read_more": "Lire la suite"
    }
  },
  "ko": {
    "scripture_passage": {
      "loading": "구절 불러오는 중…",
      "error": "이 구절을 불러올 수 없습니다. 나중에 다시 시도해 주세요.",
      "read_more": "더 보기"
    }
  },
  "pt": {
    "scripture_passage": {
      "loading": "Carregando passagem…",
      "error": "Não foi possível carregar esta passagem. Tente novamente mais tarde.",
      "read_more": "Ler mais"
    }
  },
  "uk": {
    "scripture_passage": {
      "loading": "Завантаження уривка…",
      "error": "Не вдалося завантажити цей уривок. Спробуйте пізніше.",
      "read_more": "Читати далі"
    }
  }
}
</i18n>
