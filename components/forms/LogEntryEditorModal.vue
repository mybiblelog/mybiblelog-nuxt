<template>
  <div id="modal-overlay">
    <form id="model" :class="{ 'busy': busy }" role="dialog" @submit.prevent="onSubmitLogEntryForm">
      <div class="form-header">
        <h2 class="title is-4">
          {{ model.id ? $t('edit_entry') : $t('add_entry') }}
        </h2>
        <button class="delete is-medium" :aria-label="$t('close')" @click.prevent="() => closeEditor()" />
      </div>
      <div class="passage-preview">
        {{ displayEditorVerseRange || $t('preview_passage') }}
      </div>
      <div>
        <label for="model-date">{{ $t('date') }}</label>
        <input id="model-date" v-model="model.date" type="date">
      </div>
      <div>
        <label for="model-book">{{ $t('book') }}</label>
        <select id="model-book" ref="book" v-model="model.book" @change="onSelectBook">
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
        <select id="model-startChapter" ref="startChapter" v-model="model.startChapter" :disabled="model.book === 0" @change="onSelectStartChapter">
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
        <select id="model-startVerse" ref="startVerse" v-model="model.startVerse" :disabled="model.startChapter === 0" @change="onSelectStartVerse">
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
        <select id="model-endChapter" ref="endChapter" v-model="model.endChapter" :disabled="model.startVerse === 0" @change="onSelectEndChapter">
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
        <select id="model-endVerse" ref="endVerse" v-model="model.endVerse" :disabled="model.endChapter === 0" @change="onSelectEndVerse">
          <option disabled="" value="0" selected="">
            {{ $t('choose_end_verse') }}
          </option>
          <option v-for="verse in endVerses" :key="verse" :value="verse">
            {{ verse }}
          </option>
        </select>
      </div>
      <button ref="submit" type="submit" :disabled="busy || model.endVerse === 0 || model.date === ''">
        <template v-if="!busy">
          {{ model.id ? $t('save') : $t('add') }}
        </template>
        <busy-spinner v-if="busy" />
      </button>
    </form>
  </div>
</template>

<script>
import * as dayjs from 'dayjs';
import Bible from '@/shared/bible';
import BusySpinner from '@/components/BusySpinner';

export default {
  name: 'LogEntryEditorModal',
  components: {
    BusySpinner,
  },
  props: {
    populateWith: {
      type: Object,
      default: () => ({ empty: true }),
    },
  },
  data() {
    return {
      busy: false,

      model: {
        id: null,
        date: dayjs().format('YYYY-MM-DD'),
        book: 0,
        startChapter: 0,
        startVerse: 0,
        endChapter: 0,
        endVerse: 0,
      },

      chapterVerses: {},

      books: [],
      startChapters: [],
      startVerses: [],
      endChapters: [],
      endVerses: [],
    };
  },
  computed: {
    displayEditorVerseRange() {
      const startVerseId = Bible.makeVerseId(this.model.book, this.model.startChapter, this.model.startVerse);
      const endVerseId = Bible.makeVerseId(this.model.book, this.model.endChapter, this.model.endVerse);
      return Bible.displayVerseRange(startVerseId, endVerseId, this.$i18n.locale);
    },
  },
  mounted() {
    this.books = Bible.getBooks();
    if (this.populateWith.empty) {
      this.resetForm();
      if (this.populateWith.date) {
        this.model.date = this.populateWith.date;
      }
    }
    else {
      const { id, date, startVerseId, endVerseId } = this.populateWith;
      const start = Bible.parseVerseId(startVerseId);
      const end = Bible.parseVerseId(endVerseId);
      Object.assign(this.model, {
        id,
        date,
        book: start.book,
      });
      this.onSelectBook();
      this.model.startChapter = start.chapter;
      this.onSelectStartChapter();
      this.model.startVerse = start.verse;
      this.onSelectStartVerse();
      this.model.endChapter = end.chapter;
      this.onSelectEndChapter();
      this.model.endVerse = end.verse;
      this.onSelectEndVerse();
    }
  },
  created() {
  },
  methods: {
    displayBookName(bookIndex) {
      return Bible.getBookName(bookIndex, this.$i18n.locale);
    },
    closeEditor() {
      this.$emit('closed');
    },
    resetStartChapter() {
      this.model.startChapter = 0;
      this.startChapters = [];
    },
    resetStartVerse() {
      this.model.startVerse = 0;
      this.startVerses = [];
    },
    resetEndChapter() {
      this.model.endChapter = 0;
      this.endChapters = [];
    },
    resetEndVerse() {
      this.model.endVerse = 0;
      this.endVerses = [];
    },
    resetForm() {
      this.model.id = null;
      this.model.date = dayjs().format('YYYY-MM-DD');
      this.model.book = 0;
      this.resetStartChapter();
      this.resetStartVerse();
      this.resetEndChapter();
      this.resetEndVerse();
    },
    onSelectBook() {
      this.resetStartChapter();
      this.resetStartVerse();
      this.resetEndChapter();
      this.resetEndVerse();

      const bookIndex = this.model.book;
      const chapterCount = Bible.getBookChapterCount(bookIndex);
      const chapters = [];
      for (let i = 1; i <= chapterCount; i++) { chapters.push(i); }
      this.startChapters = chapters;

      // Make it easier to log an entry in a book with only one chapter
      if (chapterCount === 1) {
        this.model.startChapter = 1;
        this.onSelectStartChapter();
      }

      this.$nextTick(() => this.$refs.startChapter.focus());
    },
    onSelectStartChapter() {
      this.resetStartVerse();
      this.resetEndChapter();
      this.resetEndVerse();

      const chapterVerseCount = Bible.getChapterVerseCount(this.model.book, this.model.startChapter);
      const verses = [];
      for (let i = 1; i <= chapterVerseCount; i++) { verses.push(i); }
      this.startVerses = verses;
      this.$nextTick(() => this.$refs.endVerse.focus());

      // Make it easier to log an entry that begins at the beginning of a chapter
      this.model.startVerse = 1;
      this.onSelectStartVerse();

      // Make it easier to log an entry that consists of a single chapter
      this.model.endChapter = this.model.startChapter;
      this.onSelectEndChapter();
    },
    onSelectStartVerse() {
      this.resetEndChapter();
      this.resetEndVerse();

      const bookIndex = this.model.book;
      const chapterCount = Bible.getBookChapterCount(bookIndex);
      const chapters = [];
      for (let i = this.model.startChapter; i <= chapterCount; i++) { chapters.push(i); }
      this.endChapters = chapters;

      // Make it easier to log an entry that consists of a single chapter
      if (!this.model.endChapter) {
        this.model.endChapter = this.model.startChapter;
        this.onSelectEndChapter();
      }
    },
    onSelectEndChapter() {
      this.resetEndVerse();

      const chapterVerseCount = Bible.getChapterVerseCount(this.model.book, this.model.endChapter);
      const verses = [];
      let i = 1;
      if (this.model.startChapter === this.model.endChapter) { i = this.model.startVerse; }
      for (; i <= chapterVerseCount; i++) { verses.push(i); }
      this.endVerses = verses;
      this.$nextTick(() => this.$refs.endVerse.focus());

      // Make it easier to log an entry that ends at the end of a chapter
      this.model.endVerse = this.endVerses[this.endVerses.length - 1];
      this.onSelectEndVerse();
    },
    onSelectEndVerse() {
      this.$nextTick(() => this.$refs.submit.focus());
    },
    onSubmitLogEntryForm() {
      if (this.model.id) {
        this.processEditEntryForm();
      }
      else {
        this.processAddEntryForm();
      }
    },
    async processAddEntryForm() {
      this.busy = true;
      const startVerseId = Bible.makeVerseId(this.model.book, this.model.startChapter, this.model.startVerse);
      const endVerseId = Bible.makeVerseId(this.model.book, this.model.endChapter, this.model.endVerse);
      const newLogEntry = {
        date: this.model.date,
        startVerseId,
        endVerseId,
      };
      const createdEntry = await this.$store.dispatch('log-entries/createLogEntry', newLogEntry);
      if (!createdEntry) {
        await this.$store.dispatch('dialog/alert', {
          message: this.$t('unable_to_add_entry'),
        });
      }
      else {
        this.closeEditor();
      }
      this.busy = false;
    },
    async processEditEntryForm() {
      this.busy = true;
      const startVerseId = Bible.makeVerseId(this.model.book, this.model.startChapter, this.model.startVerse);
      const endVerseId = Bible.makeVerseId(this.model.book, this.model.endChapter, this.model.endVerse);
      const logEntryUpdate = {
        id: this.model.id,
        date: this.model.date,
        startVerseId,
        endVerseId,
      };
      const updatedLogEntry = await this.$store.dispatch('log-entries/updateLogEntry', logEntryUpdate);
      if (!updatedLogEntry) {
        await this.$store.dispatch('dialog/alert', {
          message: this.$t('unable_to_update_entry'),
        });
      }
      else {
        this.closeEditor();
      }
      this.busy = false;
    },
  },
};
</script>

<style lang="scss" scoped>
#modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: $zIndexModal;
}

#model {
  background: #fff;
  max-width: 30rem;
  padding: 1rem;
  margin: 1rem 0;
  border-radius: 0.5rem;
  box-shadow: 0 0 1rem #000;

  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-column-gap: 1rem;
  grid-row-gap: 1rem;
}

#model .form-header {
  grid-column: span 2;
  flex-direction: row;
  justify-content: space-between;

  .title {
    margin-bottom: 0;
  }
}

.passage-preview {
  grid-column: span 2;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 -1em;

  color: #09f;
  background: #def;
  border-radius: 3px;
  font-weight: bold;
}

#model > div {
  display: flex;
  flex-direction: column;
}

#model label {
  font-size: 14px;
}

#model input,
#model select,
#model button[type="submit"] {
  font-size: 16px;
  height: 2.5rem;
  padding: 0.5rem;
  border: 2px solid #333;
  width: unset;
  border-radius: 0.25rem;
}

#model input:not(:disabled),
#model select:not(:disabled) {
  background-color: #fff;
}

#model button[type="submit"]:not(:disabled) {
  color: #fff;
  background-color: #000;
}

#model button[type="submit"] {
  grid-column: span 2;
  display: flex;
  justify-content: center;
  align-items: center;
}

#model.busy button[type="submit"]:disabled {
  background: #000;
  color: #fff;
}

@media screen and (max-width: 550px) {
  #model {
    display: flex;
    flex-direction: column;
  }

  #model > div:not(:last-child) {
    margin-bottom: -0.5rem;
  }

  #model button[type="submit"] {
    margin-top: 21px; // to match labels
  }
}

</style>

<i18n lang="json">
{
  "de": {
    "add_entry": "Eintrag hinzufügen",
    "edit_entry": "Eintrag bearbeiten",
    "preview_passage": "Passage Vorschau",
    "date": "Datum",
    "save": "Speichern",
    "add": "Hinzufügen",
    "close": "Schließen",
    "book": "Buch",
    "choose_book": "Buch auswählen",
    "start_chapter": "Kapitel starten",
    "choose_start_chapter": "Kapitel auswählen",
    "start_verse": "Startvers",
    "choose_start_verse": "Vers auswählen",
    "end_chapter": "Endkapitel",
    "choose_end_chapter": "Kapitel auswählen",
    "end_verse": "Endvers",
    "choose_end_verse": "Vers auswählen",
    "unable_to_add_entry": "Eintrag konnte nicht hinzugefügt werden.",
    "unable_to_update_entry": "Eintrag konnte nicht aktualisiert werden."
  },
  "en": {
    "add_entry": "Add Entry",
    "edit_entry": "Edit Entry",
    "preview_passage": "preview passage",
    "date": "Date",
    "save": "Save",
    "add": "Add",
    "close": "Close",
    "book": "Book",
    "choose_book": "Choose Book",
    "start_chapter": "Start Chapter",
    "choose_start_chapter": "Choose Start Chapter",
    "start_verse": "Start Verse",
    "choose_start_verse": "Choose Start Verse",
    "end_chapter": "End Chapter",
    "choose_end_chapter": "Choose End Chapter",
    "end_verse": "End Verse",
    "choose_end_verse": "Choose End Verse",
    "unable_to_add_entry": "Unable to add entry.",
    "unable_to_update_entry": "Unable to update entry."
  },
  "es": {
    "add_entry": "Añadir entrada",
    "edit_entry": "Editar entrada",
    "preview_passage": "vista previa del pasaje",
    "date": "Fecha",
    "save": "Guardar",
    "add": "Añadir",
    "close": "Cerrar",
    "book": "Libro",
    "choose_book": "Elegir libro",
    "start_chapter": "Capítulo de inicio",
    "choose_start_chapter": "Elegir capítulo de inicio",
    "start_verse": "Versículo de inicio",
    "choose_start_verse": "Elegir versículo de inicio",
    "end_chapter": "Capítulo final",
    "choose_end_chapter": "Elegir capítulo final",
    "end_verse": "Versículo final",
    "choose_end_verse": "Elegir versículo final",
    "unable_to_add_entry": "No se puede agregar la entrada.",
    "unable_to_update_entry": "No se puede actualizar la entrada."
  },
  "fr": {
    "add_entry": "Ajouter une entrée",
    "edit_entry": "Modifier l'entrée",
    "preview_passage": "Aperçu du passage",
    "date": "Date",
    "save": "Sauvegarder",
    "add": "Ajouter",
    "close": "Fermer",
    "book": "Livre",
    "choose_book": "Livre",
    "start_chapter": "Chapitre de départ",
    "choose_start_chapter": "Chapitre de départ",
    "start_verse": "Verset de départ",
    "choose_start_verse": "Verset de départ",
    "end_chapter": "Chapitre de fin",
    "choose_end_chapter": "Chapitre de fin",
    "end_verse": "Verset de fin",
    "choose_end_verse": "Verset de fin",
    "unable_to_add_entry": "Impossible d'ajouter une entrée.",
    "unable_to_update_entry": "Impossible de mettre à jour l'entrée."
  },
  "pt": {
    "add_entry": "Adicionar Entrada",
    "edit_entry": "Editar Entrada",
    "preview_passage": "visualização do trecho",
    "date": "Data",
    "save": "Salvar",
    "add": "Adicionar",
    "close": "Fechar",
    "book": "Livro",
    "choose_book": "Escolher Livro",
    "start_chapter": "Iniciar Capítulo",
    "choose_start_chapter": "Escolher Capítulo",
    "start_verse": "Versículo Inicial",
    "choose_start_verse": "Escolher Versículo",
    "end_chapter": "Capítulo Final",
    "choose_end_chapter": "Escolher Capítulo",
    "end_verse": "Versículo Final",
    "choose_end_verse": "Escolher Versículo",
    "unable_to_add_entry": "Não foi possível adicionar a entrada.",
    "unable_to_update_entry": "Não foi possível atualizar a entrada."
  },
  "uk": {
    "add_entry": "Додати запис",
    "edit_entry": "Редагувати запис",
    "preview_passage": "попередній перегляд пасажу",
    "date": "Дата",
    "save": "Зберегти",
    "add": "Додати",
    "close": "Закрити",
    "book": "Книга",
    "choose_book": "Виберіть",
    "start_chapter": "Почати розділ",
    "choose_start_chapter": "Виберіть",
    "start_verse": "Почати вірш",
    "choose_start_verse": "Виберіть",
    "end_chapter": "Закінчити розділ",
    "choose_end_chapter": "Виберіть",
    "end_verse": "Закінчити вірш",
    "choose_end_verse": "Виберіть",
    "unable_to_add_entry": "Не вдалося додати запис.",
    "unable_to_update_entry": "Не вдалося оновити запис."
  }
}
</i18n>
