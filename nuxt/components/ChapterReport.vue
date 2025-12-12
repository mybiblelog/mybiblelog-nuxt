<template>
  <button class="chapter-report" @click="openActionSheet">
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
  </button>
</template>

<script>
import { Bible } from '@mybiblelog/shared';
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
  computed: {
    actions() {
      return [
        {
          label: this.$t('open_bible'),
          callback: () => this.openChapterInBible(),
        },
        {
          label: this.$t('log_reading'),
          callback: () => this.createLogEntry(this.report.bookIndex, this.report.chapterIndex),
        },
        {
          label: this.$t('take_note'),
          callback: () => this.takeNoteOnChapter(),
        },
        {
          label: this.$t('view_notes'),
          callback: () => this.viewNotesForChapter(),
        },
      ];
    },
    sheetTitle() {
      if (!this.report) {
        return null;
      }
      const bookName = Bible.getBookName(this.report.bookIndex, this.$i18n.locale);
      return `${bookName} ${this.report.chapterIndex}`;
    },
  },
  methods: {
    openActionSheet() {
      this.$store.dispatch('action-sheet/openSheet', {
        title: this.sheetTitle,
        actions: this.actions,
      });
    },
    getReadingUrl(bookIndex, chapterIndex) {
      return this.$store.getters['user-settings/getReadingUrl'](bookIndex, chapterIndex);
    },
    openChapterInBible() {
      const { bookIndex, chapterIndex } = this.report;
      const url = this.getReadingUrl(bookIndex, chapterIndex);
      window.open(url, '_blank');
    },
    createLogEntry(bookIndex, chapterIndex) {
      this.$emit('createLogEntry', bookIndex, chapterIndex);
    },
    takeNoteOnChapter() {
      this.$emit('takeNoteOnChapter', this.report.bookIndex, this.report.chapterIndex);
    },
    viewNotesForChapter() {
      this.$emit('viewNotesForChapter', this.report.bookIndex, this.report.chapterIndex);
    },
  },
};
</script>

<style lang="scss">
.chapter-report {
  // override button styles
  border: none;
  background: #fff;
  cursor: pointer;

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
    margin-bottom: 5px;

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
  }

  &--fraction {
    position: absolute;
    bottom: 0;
    right: 0;

    font-size: 0.8rem;
    font-weight: bold;
    white-space: nowrap;
  }
}
</style>

<i18n lang="json">
{
  "de": {
    "open_bible": "Bibel öffnen",
    "log_reading": "Lesen protokollieren",
    "take_note": "Notiz hinzufügen",
    "view_notes": "Notizen ansehen"
  },
  "en": {
    "open_bible": "Open Bible",
    "log_reading": "Log Reading",
    "take_note": "Take Note",
    "view_notes": "View Notes"
  },
  "es": {
    "open_bible": "Abrir en la Biblia",
    "log_reading": "Agregar lectura a registro",
    "take_note": "Tomar nota",
    "view_notes": "Ver notas"
  },
  "fr": {
    "open_bible": "Ouvrir dans la Bible",
    "log_reading": "Ajouter lecture à registre",
    "take_note": "Prendre note",
    "view_notes": "Voir les notes"
  },
  "pt": {
    "open_bible": "Ler na Biblia",
    "log_reading": "Adicionar leitura a registro",
    "take_note": "Tomar nota",
    "view_notes": "Ver notas"
  },
  "uk": {
    "open_bible": "Читати в Біблії",
    "log_reading": "Додати читання до журналу",
    "take_note": "Записати",
    "view_notes": "Переглянути записи"
  }
}
</i18n>
