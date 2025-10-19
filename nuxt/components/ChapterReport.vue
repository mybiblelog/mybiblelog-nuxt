<template>
  <div class="chapter-report">
    <div class="chapter-report--indicator">
      <div class="chapter-report--indicator--icon">
        <star width="100%" height="100%" :fill="report.percentage == 100 ? '#ffd700' : '#ddd'" />
      </div>
      <div class="chapter-report--index">
        {{ report.chapterIndex }}
      </div>
      <div class="chapter-report--fraction">
        {{ report.versesRead }} / {{ report.totalVerses }}
      </div>
    </div>
    <segment-bar class="chapter-report--completion" :segments="report.segments" />
    <div class="chapter-report--actions">
      <div class="chapter-report--actions--option" @click="openChapterInBible">
        {{ $t('open') }}
      </div>
      <div class="chapter-report--actions--option" @click="createLogEntry(report.bookIndex, report.chapterIndex)">
        {{ $t('track') }}
      </div>
    </div>
  </div>
</template>

<script>
import SegmentBar from '@/components/SegmentBar';
import Star from '@/components/svg/Star';

export default {
  components: {
    SegmentBar,
    Star,
  },
  props: {
    report: {
      type: Object,
      default: null,
    },
  },
  methods: {
    getReadingUrl(bookIndex, chapterIndex) {
      return this.$store.getters['user-settings/getReadingUrl'](bookIndex, chapterIndex);
    },
    openChapterInBible() {
      const { bookIndex, chapterIndex } = this.report;
      const url = this.getReadingUrl(bookIndex, chapterIndex);
      window.open(url, '_blank');

      // When a chapter is opened in the Bible,
      // go ahead and open the log entry modal
      // so it's easy to log reading upon return
      setTimeout(() => this.createLogEntry(bookIndex, chapterIndex), 500);
    },
    createLogEntry(bookIndex, chapterIndex) {
      this.$emit('createLogEntry', bookIndex, chapterIndex);
    },
  },
};
</script>

<style lang="scss">
.chapter-report {
  margin: 0.5rem;
  padding: 0.5rem;
  border-radius: 0.25rem;
  box-shadow: 0 1px 7px #999;

  flex-basis: calc(25% - 1rem);
  position: relative;

  transition: 0.1s;
  &:hover {
    transition: 0.2s;
    box-shadow: 0 1px 9px #333;
  }

  &--indicator {
    position: relative;
    width: 100%;
    padding-bottom: 100%;
    min-height: 3.5rem;

    &--icon {
      position: absolute;
      left: 20%;
      top: 20%;
      bottom: 20%;
      right: 20%;

      img {
        width: 100%;
      }
    }
  }

  &--index {
    position: absolute;
    top: 0;
    left: 0;

    font-weight: bold;
    font-size: 1.2rem;
    font-family: monospace;
  }

  &--fraction {
    position: absolute;
    bottom: 0;
    right: 0;

    font-size: 0.8rem;
    font-weight: bold;
    white-space: nowrap;
  }

  &--completion {
    //
  }

  &--actions {
    display: none;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    border-radius: inherit;

    display: none;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    @media screen and (max-width: 620px) {
      z-index: 1;
      top: 100%;
      height: auto;
      padding: 10% 0;
      background: #fff;
      box-shadow: inherit;
    }

    &--option {
      color: #fff;
      width: 90%;
      text-align: center;
      padding: 0.5em 0;
      border-radius: 3px;
      cursor: pointer;

      &:hover {
        background: #000;
      }
      @media screen and (max-width: 620px) {
        color: #000;
        &:hover {
          color: #fff;
        }
      }
    }
  }
  &:hover &--actions {
    display: flex;
  }
}
</style>

<i18n lang="json">
{
  "de": {
    "open": "Öffnen",
    "track": "Verfolgen"
  },
  "en": {
    "open": "Open",
    "track": "Track"
  },
  "es": {
    "open": "Abrir",
    "track": "Seguir"
  },
  "fr": {
    "open": "Ouvrir",
    "track": "Suivre"
  },
  "pt": {
    "open": "Abrir",
    "track": "Rastrear"
  },
  "uk": {
    "open": "Відкрити",
    "track": "Відстежити"
  }
}
</i18n>
