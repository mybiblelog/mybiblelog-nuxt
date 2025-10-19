<template>
  <main>
    <section class="section">
      <div class="container">
        <div class="columns is-centered">
          <div class="column is-two-thirds-tablet is-half-desktop">
            <header class="page-header">
              <h2 class="title">
                {{ $t('notes') }}
                <info-link :to="localePath('/about/page-features--notes')" />
              </h2>
              <div class="buttons is-align-items-flex-start">
                <nuxt-link class="button" :to="localePath('/tags')">
                  {{ $t('tags') }}
                  <CaretRight style="margin-left: 0.2rem;" />
                </nuxt-link>
                <button class="button is-info" @click="openPassageNoteEditor({ empty: true })">
                  {{ $t('new') }}
                </button>
              </div>
            </header>
            <div class="buttons">
              <button class="button is-light is-small" @click="openSearchModal">
                {{ $t('query.search') }} {{ query.searchText.length ? $t('query.active') : '' }}
              </button>
              <button class="button is-light is-small" @click="openTagFilterModal">
                {{ $t('query.tag_filters') }} ({{ query.filterTags.length }})
              </button>
              <button class="button is-light is-small" @click="openPassageFilterModal">
                {{ $t('query.passage') }}<span v-if="query.filterPassageStartVerseId && query.filterPassageEndVerseId">&nbsp;(&nbsp;
                  <span v-if="query.filterPassageMatching === 'inclusive'">~</span>
                  <span v-if="query.filterPassageMatching === 'exclusive'">{{ $t('query.in') }}</span>
                  &nbsp;{{ displayVerseRange(query.filterPassageStartVerseId, query.filterPassageEndVerseId) }}
                  )</span>
              </button>
              <button class="button is-light is-small" @click="openSortModal">
                <span>{{ $t('query.sort') }}</span>
                <span v-if="querySort === 'createdAt:descending'">: {{ $t('query.newest_first') }}</span>
                <span v-if="querySort === 'createdAt:ascending'">: {{ $t('query.oldest_first') }}</span>
              </button>
              <button class="button is-light is-small" @click="resetQuery">
                {{ $t('query.reset') }}
              </button>
            </div>
            <div class="query-summary content">
              <p>{{ querySummary }}</p>
              <div v-if="query.filterTags.length" class="query-summary--tag-filters">
                <div v-for="tag in populatedTags(query.filterTags)" :key="tag.id" class="passage-note-tag" :style="passageNoteTagStyle(tag)">
                  {{ tag.label }}
                </div>
              </div>
            </div>
            <div>
              <template v-if="loading">
                <div class="passage-note">
                  <div class="passage-note--content has-text-centered">
                    {{ $t('results.loading') }}
                  </div>
                </div>
              </template>
              <template v-else-if="!passageNotes.length">
                <div class="passage-note">
                  <div class="passage-note--content has-text-centered">
                    {{ $t('results.no_results') }}
                  </div>
                </div>
              </template>
              <template v-else>
                <div v-for="note in passageNotes" :key="note.id" class="passage-note">
                  <div class="passage-note--passages">
                    <ul>
                      <li v-for="passage in note.passages" :key="passage.id">
                        <!-- FIXME: we could allow the user to touch here to open the passage in the reading view, with the option to open the full chapter externally -->
                        <a :href="readingUrl(passage)" target="_blank">
                          <strong>{{ displayVerseRange(passage.startVerseId, passage.endVerseId) }}</strong>
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div class="passage-note--created-date">
                    <span class="has-text-grey is-size-7" :title="displayDateTime(note.createdAt)">{{ displayTimeSince(note.createdAt) }}</span>
                  </div>
                  <div class="passage-note--content">
                    <hyperlinked-text :text="note.content" />
                  </div>
                  <div class="passage-note--tags">
                    <div v-for="tag in populatedTags(note.tags)" :key="tag.id" class="passage-note-tag" :style="passageNoteTagStyle(tag)">
                      {{ tag.label }}
                    </div>
                  </div>
                  <div class="passage-note--controls">
                    <div class="buttons is-right">
                      <button class="button is-small" @click="openPassageNoteEditor(note)">
                        {{ $t('note.edit') }}
                      </button>
                      <button class="button is-small" @click="deletePassageNote(note.id)">
                        {{ $t('note.delete') }}
                      </button>
                    </div>
                  </div>
                </div>
                <pagination v-if="pagination.totalPages > 1" :total-pages="pagination.totalPages" :current-page="pagination.page" @pagechanged="onPageChanged" />
              </template>
            </div>
          </div>
        </div>
      </div>
    </section>
    <modal v-if="showSearchModal" :title="$t('search_modal.search_notes')" @close="closeSearchModal()">
      <template slot="content">
        <div>
          <strong>{{ $t('search_modal.search_text') }}</strong>
          <input v-model="searchModal.searchText" class="input" type="text" :placeholder="$t('search_modal.enter_search_text')">
        </div>
      </template>
      <template slot="footer">
        <button class="button is-primary" @click="closeSearchModal(true)">
          {{ $t('search_modal.search') }}
        </button>
        <button class="button is-light" @click="closeSearchModal()">
          {{ $t('search_modal.cancel') }}
        </button>
      </template>
    </modal>
    <modal v-if="showTagFilterModal" :title="$t('tag_filter_modal.tag_filters')" @close="closeTagFilterModal()">
      <template slot="content">
        <div>
          <strong>{{ $t("tag_filter_modal.tag_filters") }}</strong>
          <passage-note-tag-selector :passage-note-tags="passageNoteTags" :selected-tag-ids="query.filterTags" @change="updateQueryFilterTags" />
          <br>
          <strong>{{ $t("tag_filter_modal.match") }}</strong>
          <div class="control">
            <label class="radio">
              <input v-model="filterTagMatching" type="radio" value="any"> {{ $t("tag_filter_modal.any") }}
            </label>
          </div>
          <div class="control">
            <label class="radio">
              <input v-model="filterTagMatching" type="radio" value="all"> {{ $t("tag_filter_modal.all") }}
            </label>
          </div>
          <div class="control">
            <label class="radio">
              <input v-model="filterTagMatching" type="radio" value="exact"> {{ $t("tag_filter_modal.exact") }}
            </label>
          </div>
        </div>
      </template>
      <template slot="footer">
        <button class="button is-light" @click="closeTagFilterModal()">
          {{ $t("tag_filter_modal.done") }}
        </button>
      </template>
    </modal>
    <modal v-if="showPassageFilterModal" :title="$t('passage_filter_modal.passage_filters')" @close="closePassageFilterModal()">
      <template slot="content">
        <div>
          <strong>{{ $t("passage_filter_modal.passage") }}</strong>
          <div class="passage">
            <passage-selector @change="(newFilterPassage) => passageSelectorChange(newFilterPassage)" />
          </div>
          <br>
          <strong>{{ $t("passage_filter_modal.match") }}</strong>
          <div class="control">
            <label class="radio">
              <input v-model="filterPassageMatching" type="radio" value="inclusive"> {{ $t("passage_filter_modal.inclusive") }}
            </label>
          </div>
          <div class="control">
            <label class="radio">
              <input v-model="filterPassageMatching" type="radio" value="exclusive"> {{ $t("passage_filter_modal.exclusive") }}
            </label>
          </div>
          <br>
          <div class="content">
            <ul>
              <li v-html="$t('passage_filter_modal.inclusive_description')" />
              <li v-html="$t('passage_filter_modal.exclusive_description')" />
            </ul>
          </div>
        </div>
      </template>
      <template slot="footer">
        <button class="button is-light" @click="closePassageFilterModal()">
          {{ $t("passage_filter_modal.done") }}
        </button>
      </template>
    </modal>
    <modal v-if="showSortModal" :title="$t('sort_modal.sort_results')" @close="closeSortModal()">
      <template slot="content">
        <div>
          <strong>{{ $t("sort_modal.sort") }}</strong>
          <div class="control">
            <label class="radio">
              <input v-model="querySort" type="radio" value="createdAt:descending"> {{ $t("sort_modal.newest_first") }}
            </label>
          </div>
          <div class="control">
            <label class="radio">
              <input v-model="querySort" type="radio" value="createdAt:ascending"> {{ $t("sort_modal.oldest_first") }}
            </label>
          </div>
        </div>
      </template>
      <template slot="footer">
        <button class="button is-light" @click="closeSortModal()">
          {{ $t("sort_modal.done") }}
        </button>
      </template>
    </modal>
    <modal v-if="editorOpen" :title="modalTitle" @close="closePassageNoteEditor()">
      <template slot="content">
        <passage-note-editor-form
          ref="passageNoteEditorForm"
          :populate-with="editorPassageNote"
          :passage-note-tags="passageNoteTags"
          :errors="editorErrors"
          @submit="savePassageNoteEditor"
          @validStateChange="onEditorValidStateChange"
        />
      </template>
      <template slot="footer">
        <button class="button is-primary" :disabled="!editorCanSave" @click="submitPassageNoteEditor">
          {{ $t('note_editor.save') }}
        </button>
        <button class="button is-light" @click="closePassageNoteEditor()">
          {{ $t('note_editor.close') }}
        </button>
      </template>
    </modal>
  </main>
</template>

<script>
import { mapState } from 'vuex';
import Bible from '@shared/bible';
import { displayDateTime, displayTimeSince } from '@shared/date-helpers';
import HyperlinkedText from '@/components/HyperlinkedText';
import PassageNoteTagSelector from '@/components/forms/PassageNoteTagSelector';
import PassageSelector from '@/components/forms/PassageSelector';
import Modal from '@/components/popups/Modal';
import PassageNoteEditorForm from '@/components/forms/PassageNoteEditorForm';
import Pagination from '@/components/Pagination';
import InfoLink from '@/components/InfoLink';
import CaretRight from '@/components/svg/CaretRight';

export default {
  name: 'NotesListPage',
  components: {
    HyperlinkedText,
    PassageNoteTagSelector,
    PassageSelector,
    Modal,
    PassageNoteEditorForm,
    Pagination,
    InfoLink,
    CaretRight,
  },
  data() {
    return {
      showSearchModal: false,
      showTagFilterModal: false,
      showPassageFilterModal: false,
      showSortModal: false,

      searchModal: {
        searchText: '',
      },

      querySort: 'createdAt:descending',
      queryLimit: 10, // TODO: change when a pagination component emits an event

      editorOpen: false,
      editorPassageNote: null,
      editorErrors: {},

      editorCanSave: false,
    };
  },
  computed: {
    ...mapState({
      loading: state => state['passage-notes'].loading,
      query: state => state['passage-notes'].query,
      passageNotes: state => state['passage-notes'].passageNotes,
      pagination: state => state['passage-notes'].pagination,
      passageNoteTags: state => state['passage-note-tags'].passageNoteTags,
    }),
    modalTitle() {
      return this.editorPassageNote.id ? this.$t('note_editor.edit_note') : this.$t('note_editor.add_note');
    },
    filterTagMatching: {
      get() {
        return this.query.filterTagMatching;
      },
      set(value) {
        this.$store.dispatch('passage-notes/updateQuery', { filterTagMatching: value });
      },
    },
    filterPassageMatching: {
      get() {
        return this.query.filterPassageMatching;
      },
      set(value) {
        this.$store.dispatch('passage-notes/updateQuery', { filterPassageMatching: value });
      },
    },
    querySummary() {
      const pageLength = this.passageNotes.length;
      const first = (this.pagination.page - 1) * 10 + 1;
      const last = first + pageLength - 1;
      const total = this.pagination.size;

      let prefix = 'Showing';
      let bearings = 'notes';
      let hasHave = 'have';
      if (!total) {
        prefix = 'There are no';
      }
      else if (total === 1) {
        bearings = 'the only note';
        hasHave = 'has';
      }
      else if (total <= this.pagination.limit) {
        if (total === 2) {
          bearings = `both notes`;
        }
        else {
          bearings = `all ${total} notes`;
        }
      }
      else {
        bearings = `${first} - ${last} of ${total} notes`;
      }

      const matchMatches = hasHave === 'have' ? 'match' : 'matches';
      let matchQuery = '';
      if (this.query.searchText) {
        matchQuery = `${matchMatches} the search "${this.query.searchText}"`;
      }

      if (this.query.filterPassageStartVerseId) {
        const passageString = Bible.displayVerseRange(this.query.filterPassageStartVerseId, this.query.filterPassageEndVerseId);
        let inclusiveExclusive;
        if (this.query.filterPassageMatching === 'inclusive') {
          if (hasHave === 'has') {
            inclusiveExclusive = 'overlaps';
          }
          else {
            inclusiveExclusive = 'overlap';
          }
        }
        if (this.query.filterPassageMatching === 'exclusive') {
          if (hasHave === 'has') {
            inclusiveExclusive = 'is within';
          }
          else {
            inclusiveExclusive = 'are within';
          }
        }
        matchQuery += `${inclusiveExclusive} ${passageString}`;
      }

      if (this.query.filterTags.length) {
        if (matchQuery) {
          matchQuery += ' and ';
        };
        const summaryMap = {
          any: `${prefix} ${bearings} that ${matchQuery} ${hasHave} at least one of these tags:`,
          all: `${prefix} ${bearings} that ${matchQuery} ${hasHave} all of these tags:`,
          exact: `${prefix} ${bearings} that ${matchQuery} ${hasHave} this exact combination of tags:`,
        };
        return summaryMap[this.query.filterTagMatching];
      }
      else {
        if (this.query.filterTagMatching === 'exact') {
          if (matchQuery) {
            matchQuery += ' and ';
          };
          return `${prefix} ${bearings} that ${matchQuery} ${hasHave} no tags.`;
        }
        if (matchQuery) {
          return `${prefix} ${bearings} that ${matchQuery}.`;
        }
        return `${prefix} ${bearings}.`;
      }
    },
  },
  watch: {
    pagination() {
      // AFTER new page data loads, causing a pagination update, smooth scroll to top
      // Avoids a jarring page length change from doing this too soon
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    querySort(newValue) {
      const [sortOn, sortDirection] = newValue.split(':');
      this.$store.dispatch('passage-notes/updateQuery', { sortOn, sortDirection });
    },
  },
  mounted() {
    this.$store.dispatch('passage-notes/resetQuery');
    this.$store.dispatch('passage-notes/loadPassageNotesPage');
    this.$store.dispatch('passage-note-tags/loadPassageNoteTags');
  },
  methods: {
    displayVerseRange(startVerseId, endVerseId) {
      return Bible.displayVerseRange(startVerseId, endVerseId, this.$i18n.locale);
    },
    displayDateTime(date) {
      return displayDateTime(date, this.$i18n.locale);
    },
    displayTimeSince(date) {
      return displayTimeSince(date, this.$i18n.locale);
    },
    getReadingUrl(bookIndex, chapterIndex) {
      return this.$store.getters['user-settings/getReadingUrl'](bookIndex, chapterIndex);
    },
    openSearchModal() {
      this.showSearchModal = true;
    },
    closeSearchModal(apply = false) {
      if (apply) {
        this.$store.dispatch('passage-notes/updateQuery', {
          searchText: this.searchModal.searchText,
        });
      }
      this.searchModal.searchText = '';
      this.showSearchModal = false;
    },
    openTagFilterModal() {
      this.showTagFilterModal = true;
    },
    closeTagFilterModal() {
      this.showTagFilterModal = false;
    },
    openPassageFilterModal() {
      this.showPassageFilterModal = true;
    },
    closePassageFilterModal() {
      this.showPassageFilterModal = false;
    },
    openSortModal() {
      this.showSortModal = true;
    },
    closeSortModal() {
      this.showSortModal = false;
    },
    updateQueryFilterTags(tagIds) {
      this.$store.dispatch('passage-notes/updateQuery', { filterTags: tagIds });
    },
    passageSelectorChange({ startVerseId, endVerseId }) {
      this.$store.dispatch('passage-notes/updateQuery', {
        filterPassageStartVerseId: startVerseId,
        filterPassageEndVerseId: endVerseId,
      });
    },
    resetQuery() {
      this.$store.dispatch('passage-notes/resetQuery');

      // When query is reset, sort order resets to "newest first".
      // However, that change isn't automatically reflected in the local "querySort" variable.
      // We have to manually reset the sort order so it displays correctly on the notes page.
      // This wouldn't be necessary if the sort order was kept completely in the store.
      this.querySort = 'createdAt:descending';
    },
    populatedTags(tagIds) {
      if (!this.passageNoteTags.length) {
        return tagIds.map(id => ({ id, label: 'Loading', color: '#333' }));
      }
      return tagIds.map(id => this.passageNoteTags.find(tag => tag.id === id));
    },
    passageNoteTagStyle(tag) {
      return {
        'background-color': tag.color,
      };
    },
    readingUrl(passage) {
      const { book, chapter } = Bible.parseVerseId(passage.startVerseId);
      return this.getReadingUrl(book, chapter);
    },
    openPassageNoteEditor(passageNote) {
      this.editorOpen = true;
      this.editorPassageNote = passageNote;
      this.editorCanSave = true;
    },
    onEditorValidStateChange(valid) {
      this.editorCanSave = valid;
    },
    submitPassageNoteEditor() {
      this.$refs.passageNoteEditorForm.handleSubmit();
    },
    async savePassageNoteEditor(formPassageNote) {
      try {
        if (formPassageNote.id) {
          await this.$store.dispatch('passage-notes/updatePassageNote', formPassageNote);
        }
        else {
          await this.$store.dispatch('passage-notes/createPassageNote', formPassageNote);
        }
        this.closePassageNoteEditor(true);
      }
      catch (err) {
        const unknownError = { _form: this.$t('messaging.unknown_error') };
        this.editorErrors = err.response.data.errors || unknownError;
      }
      await this.$store.dispatch('passage-notes/loadPassageNotesPage');
    },
    async closePassageNoteEditor(force = false) {
      if (this.$refs.passageNoteEditorForm.isDirty && !force) {
        const confirmed = await this.$store.dispatch('dialog/confirm', {
          message: this.$t('messaging.are_you_sure_close_editor'),
        });
        if (!confirmed) { return; }
      }
      this.editorErrors = {};
      this.editorOpen = false;
    },
    async deletePassageNote(id) {
      const confirmed = await this.$store.dispatch('dialog/confirm', {
        message: this.$t('messaging.are_you_sure_delete_note'),
      });
      if (!confirmed) { return; }

      const success = await this.$store.dispatch('passage-notes/deletePassageNote', id);
      if (!success) {
        this.$store.dispatch('toast/add', {
          type: 'error',
          text: this.$t('messaging.note_could_not_be_deleted'),
        });
      }
      await this.$store.dispatch('passage-notes/loadPassageNotesPage');
    },
    onPageChanged(newPage) {
      const limit = this.queryLimit;
      const offset = (newPage - 1) * limit;
      this.$store.dispatch('passage-notes/updateQuery', { offset, limit });
    },
  },
  head() {
    return {
      title: this.$t('notes'),
    };
  },
  middleware: ['auth'],
};
</script>

<style lang="scss" scoped>
.query-summary {
  background: #efefef;
  padding: 0.5em 1em;
  margin: 0.5em -0.5em;
  border-radius: 0.25em;
}

.query-summary--tag-filters {
  display: flex;
  flex-wrap: wrap;
}

.passage-note {
  padding: 0.5rem 1rem;
  margin: 1rem -0.5rem;
  border-radius: 0.25rem;
  box-shadow: 0 1px 7px #999;

  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(4, auto);
}

.passage-note--passages {
  grid-area: 1 / 1 / 2 / 3;
}

.passage-note--created-date {
  grid-area: 1 / 2 / 2 / 3;
  text-align: right;
  cursor: default;
  & > span {
    border-bottom: 1px dotted #ccc;
  }
}

.passage-note--content {
  overflow-wrap:break-word;
  white-space: pre-line;
  margin: 0.5rem 0;
  grid-area: 2 / 1 / 3 / 3;
}

.passage-note--tags {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  grid-area: 3 / 1 / 4 / 2;
}

.passage-note-tag {
  font-size: 0.8em;
  color: #fff;
  text-shadow: 0 0 2px #000, 1px 1px 0 rgba(0,0,0,0.5);
  padding: 0 0.5rem;
  border-radius: 0.25rem;
  margin-right: 0.25rem;
  margin-bottom: 0.25rem;
  max-width: 10rem;
  overflow-x: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
}

.passage-note--controls {
  display: flex;
  flex-direction: column-reverse;
  grid-area: 3 / 2 / 4 / 3;
}
</style>

<i18n lang="json">
{
  "de": {
    "notes": "Notizen",
    "tags": "Tags",
    "new": "Neu",
    "query": {
      "search": "Suche",
      "active": "(Aktiv)",
      "tag_filters": "Tag-Filter",
      "passage": "Passage",
      "in": "in",
      "sort": "Sortieren",
      "newest_first": "Neueste zuerst",
      "oldest_first": "Älteste zuerst",
      "reset": "Zurücksetzen"
    },
    "results": {
      "loading": "Laden...",
      "tag_loading_label": "Laden",
      "no_results": "Keine Ergebnisse"
    },
    "note": {
      "edit": "Bearbeiten",
      "delete": "Löschen"
    },
    "search_modal": {
      "search_notes": "Notizen durchsuchen",
      "search_text": "Text durchsuchen",
      "enter_search_text": "Geben Sie hier den Text ein, den Sie suchen möchten.",
      "search": "Suche",
      "cancel": "Abbrechen"
    },
    "tag_filter_modal": {
      "tag_filters": "Schlagwortfilter",
      "match": "Übereinstimmung",
      "any": "Beliebig",
      "all": "Alle",
      "exact": "Exakt",
      "done": "Fertig"
    },
    "passage_filter_modal": {
      "passage_filters": "Passagenfilter",
      "passage": "Passage",
      "match": "Übereinstimmung",
      "inclusive": "Inklusiv",
      "exclusive": "Exklusiv",
      "inclusive_description": "<strong>Inklusive</strong> Filterung stimmt mit einer Notiz überein, wenn einer der Verse dieser Notiz sich mit Ihrem Filtervers überschneidet.",
      "exclusive_description": "<strong>Exklusive</strong> Filterung stimmt mit einer Notiz überein, wenn einer der Verse dieser Notiz innerhalb Ihres Filterverses liegt.",
      "done": "Fertig"
    },
    "sort_modal": {
      "sort_results": "Ergebnisse sortieren",
      "sort": "Sortieren",
      "newest_first": "Neueste zuerst",
      "oldest_first": "Älteste zuerst",
      "done": "Fertig"
    },
    "note_editor": {
      "edit_note": "Notiz bearbeiten",
      "add_note": "Notiz hinzufügen",
      "save": "Speichern",
      "close": "Schließen"
    },
    "messaging": {
      "unknown_error": "Ein unbekannter Fehler ist aufgetreten.",
      "are_you_sure_close_editor": "Möchten Sie den Editor wirklich schließen? Alle ungespeicherten Änderungen gehen verloren.",
      "are_you_sure_delete_note": "Möchten Sie diese Notiz wirklich löschen?",
      "note_could_not_be_deleted": "Die Notiz konnte nicht gelöscht werden."
    }
  },
  "en": {
    "notes": "Notes",
    "tags": "Tags",
    "new": "New",
    "query": {
      "search": "Search",
      "active": "(Active)",
      "tag_filters": "Tag Filters",
      "passage": "Passage",
      "in": "in",
      "sort": "Sort",
      "newest_first": "Newest First",
      "oldest_first": "Oldest First",
      "reset": "Reset"
    },
    "results": {
      "loading": "Loading...",
      "tag_loading_label": "Loading",
      "no_results": "No Results"
    },
    "note": {
      "edit": "Edit",
      "delete": "Delete"
    },
    "search_modal": {
      "search_notes": "Search Notes",
      "search_text": "Search Text",
      "enter_search_text": "Enter the text you wish to find here.",
      "search": "Search",
      "cancel": "Cancel"
    },
    "tag_filter_modal": {
      "tag_filters": "Tag Filters",
      "match": "Match",
      "any": "Any",
      "all": "All",
      "exact": "Exact",
      "done": "Done"
    },
    "passage_filter_modal": {
      "passage_filters": "Passage Filters",
      "passage": "Passage",
      "match": "Match",
      "inclusive": "Inclusive",
      "exclusive": "Exclusive",
      "inclusive_description": "<strong>Inclusive</strong> filtering matches a note if any of that note's passages has a verse that overlaps your filter passage.",
      "exclusive_description": "<strong>Exclusive</strong> filtering matches a note if any of that note's passages is within your filter passage.",
      "done": "Done"
    },
    "sort_modal": {
      "sort_results": "Sort Results",
      "sort": "Sort",
      "newest_first": "Newest First",
      "oldest_first": "Oldest First",
      "done": "Done"
    },
    "note_editor": {
      "edit_note": "Edit Note",
      "add_note": "Add Note",
      "save": "Save",
      "close": "Close"
    },
    "messaging": {
      "unknown_error": "An unknown error occurred.",
      "are_you_sure_close_editor": "Are you sure you want to close the editor? You will lose any unsaved changes.",
      "are_you_sure_delete_note": "Are you sure you want to delete this note?",
      "note_could_not_be_deleted": "The note could not be deleted."
    }
  },
  "es": {
    "notes": "Notas",
    "tags": "Etiquetas",
    "new": "Nuevo",
    "query": {
      "search": "Buscar",
      "active": "(Activo)",
      "tag_filters": "Filtros de etiquetas",
      "passage": "Pasaje",
      "in": "en",
      "sort": "Ordenar",
      "newest_first": "Más reciente primero",
      "oldest_first": "Más antiguo primero",
      "reset": "Restablecer"
    },
    "results": {
      "loading": "Cargando...",
      "tag_loading_label": "Cargando",
      "no_results": "Sin resultados"
    },
    "note": {
      "edit": "Editar",
      "delete": "Eliminar"
    },
    "search_modal": {
      "search_notes": "Buscar notas",
      "search_text": "Texto de búsqueda",
      "enter_search_text": "Ingrese el texto que desea encontrar aquí.",
      "search": "Buscar",
      "cancel": "Cancelar"
    },
    "tag_filter_modal": {
      "tag_filters": "Filtros de etiquetas",
      "match": "Partido",
      "any": "Cualquier",
      "all": "Todas",
      "exact": "Exacto",
      "done": "Hecho"
    },
    "passage_filter_modal": {
      "passage_filters": "Filtros de pasaje",
      "passage": "Pasaje",
      "match": "Partido",
      "inclusive": "Inclusivo",
      "exclusive": "Exclusivo",
      "inclusive_description": "La filtración <strong>inclusiva</strong> coincide con una nota si cualquiera de los pasajes de esa nota tiene un versículo que se superpone a su pasaje de filtro.",
      "exclusive_description": "La filtración <strong>exclusiva</strong> coincide con una nota si cualquiera de los pasajes de esa nota está dentro de su pasaje de filtro.",
      "done": "Hecho"
    },
    "sort_modal": {
      "sort_results": "Ordenar resultados",
      "sort": "Ordenar",
      "newest_first": "Más reciente primero",
      "oldest_first": "Más antiguo primero",
      "done": "Hecho"
    },
    "note_editor": {
      "edit_note": "Editar nota",
      "add_note": "Agregar nota",
      "save": "Salvar",
      "close": "Cerrar"
    },
    "messaging": {
      "unknown_error": "Ocurrió un error desconocido.",
      "are_you_sure_close_editor": "¿Estás seguro de que quieres cerrar el editor? Perderá cualquier cambio no guardado.",
      "are_you_sure_delete_note": "¿Estás seguro de que quieres eliminar esta nota?",
      "note_could_not_be_deleted": "La nota no se pudo eliminar."
    }
  },
  "fr": {
    "notes": "Notes",
    "tags": "Tags",
    "new": "New",
    "query": {
      "search": "Rechercher",
      "active": "(Actives)",
      "tag_filters": "Filtres de tag",
      "passage": "Passage",
      "in": "dans",
      "sort": "Trier",
      "newest_first": "Le plus récent d'abord",
      "oldest_first": "Plus ancien d'abord",
      "reset": "Réinitialiser"
    },
    "results": {
      "loading": "Chargement...",
      "tag_loading_label": "Chargement",
      "no_results": "Aucun résultat"
    },
    "note": {
      "edit": "Éditer",
      "delete": "Effacer"
    },
    "search_modal": {
      "search_notes": "Rechercher des notes",
      "search_text": "Rechercher un texte",
      "enter_search_text": "Entrez le texte que vous souhaitez trouver ici.",
      "search": "Rechercher",
      "cancel": "Annuler"
    },
    "tag_filter_modal": {
      "tag_filters": "Filtres de Tag",
      "match": "Correspondance",
      "any": "Tous",
      "all": "Tout",
      "exact": "Exact",
      "done": "Terminé"
    },
    "passage_filter_modal": {
      "passage_filters": "Filtres de Passage",
      "passage": "Passage",
      "match": "Correspondance",
      "inclusive": "Inclusif",
      "exclusive": "Exclusif",
      "inclusive_description": "<strong>Inclusif</strong> La mise en correspondance filtre une note si l'un des passages de cette note chevauche un verset de votre passage de filtre.",
      "exclusive_description": "<strong>Exclusif</strong> La mise en correspondance filtre une note si l'un des passages de cette note se trouve entièrement dans votre passage de filtre.",
      "done": "Terminé"
    },
    "sort_modal": {
      "sort_results": "Trier les résultats",
      "sort": "Trier",
      "newest_first": "Plus récent en premier",
      "oldest_first": "Plus ancien en premier",
      "done": "Terminé"
    },
    "note_editor": {
      "edit_note": "Modifier la note",
      "add_note": "Ajouter une note",
      "save": "Enregistrer",
      "close": "Fermer"
    },
    "messaging": {
      "unknown_error": "Une erreur inconnue s'est produite.",
      "are_you_sure_close_editor": "Êtes-vous sûr de vouloir fermer l'éditeur ? Vous perdrez tout changement non enregistré.",
      "are_you_sure_delete_note": "Êtes-vous sûr de vouloir supprimer cette note ?",
      "note_could_not_be_deleted": "La note n'a pas pu être supprimée."
    }
  },
  "pt": {
    "notes": "Notas",
    "tags": "Tags",
    "new": "Novo",
    "query": {
      "search": "Buscar",
      "active": "(Ativo)",
      "tag_filters": "Filtros de Tag",
      "passage": "Passagem",
      "in": "em",
      "sort": "Ordenar",
      "newest_first": "Mais Recentes Primeiro",
      "oldest_first": "Do mais antigo para o mais recente",
      "reset": "Reiniciar"
    },
    "results": {
      "loading": "Carregando...",
      "tag_loading_label": "Carregando",
      "no_results": "Sem resultados"
    },
    "note": {
      "edit": "Editar",
      "delete": "Apagar"
    },
    "search_modal": {
      "search_notes": "Pesquisar Notas",
      "search_text": "Pesquisar Texto",
      "enter_search_text": "Digite o texto que deseja encontrar aqui.",
      "search": "Buscar",
      "cancel": "Cancelar"
    },
    "tag_filter_modal": {
      "tag_filters": "Filtros de Tag",
      "match": "Corresponder",
      "any": "Qualquer",
      "all": "Tudo",
      "exact": "Exato",
      "done": "Concluído"
    },
    "passage_filter_modal": {
      "passage_filters": "Filtros de Passagens",
      "passage": "Passagem",
      "match": "Corresponder",
      "inclusive": "Inclusivo",
      "exclusive": "Exclusivo",
      "inclusive_description": "<strong>Inclusivo</strong> a filtragem corresponde a uma nota se qualquer passagem dessa nota contiver um versículo que se sobrepõe à sua passagem de filtro.",
      "exclusive_description": "<strong>Exclusivo</strong> a filtragem corresponde a uma nota se qualquer passagem dessa nota estiver dentro da sua passagem de filtro.",
      "done": "Concluído"
    },
    "sort_modal": {
      "sort_results": "Ordenar Resultados",
      "sort": "Ordenar",
      "newest_first": "Mais Recentes Primeiro",
      "oldest_first": "Mais Antigos Primeiro",
      "done": "Concluído"
    },
    "note_editor": {
      "edit_note": "Editar Nota",
      "add_note": "Adicionar Nota",
      "save": "Salvar",
      "close": "Fechar"
    },
    "messaging": {
      "unknown_error": "Ocorreu um erro desconhecido.",
      "are_you_sure_close_editor": "Tem certeza de que deseja fechar o editor? Você perderá todas as alterações não salvas.",
      "are_you_sure_delete_note": "Tem certeza de que deseja excluir esta nota?",
      "note_could_not_be_deleted": "A nota não pôde ser excluída."
    }
  },
  "uk": {
    "notes": "Нотатки",
    "tags": "Теги",
    "new": "Нове",
    "query": {
      "search": "Пошук",
      "active": "(Активно)",
      "tag_filters": "Фільтри за тегами",
      "passage": "Вірш",
      "in": "в",
      "sort": "Сортувати",
      "newest_first": "Спочатку нові",
      "oldest_first": "Спочатку старі",
      "reset": "Скинути"
    },
    "results": {
      "loading": "Завантаження...",
      "tag_loading_label": "Завантаження",
      "no_results": "Немає результатів"
    },
    "note": {
      "edit": "Редагувати",
      "delete": "Видалити"
    },
    "search_modal": {
      "search_notes": "Пошук нотаток",
      "search_text": "Текст для пошуку",
      "enter_search_text": "Введіть текст, який ви хочете знайти тут.",
      "search": "Пошук",
      "cancel": "Скасувати"
    },
    "tag_filter_modal": {
      "tag_filters": "Фільтри за тегами",
      "match": "Співпадіння",
      "any": "Будь-який",
      "all": "Всі",
      "exact": "Точний",
      "done": "Готово"
    },
    "passage_filter_modal": {
      "passage_filters": "Фільтри за віршами",
      "passage": "Вірш",
      "match": "Співпадіння",
      "inclusive": "Включно",
      "exclusive": "Виключно",
      "inclusive_description": "<strong>Включно</strong> фільтрування збігається з нотаткою, якщо будь-який вірш цієї нотатки перетинається з вашим фільтрованим віршем.",
      "exclusive_description": "<strong>Виключно</strong> фільтрування збігається з нотаткою, якщо будь-який вірш цієї нотатки знаходиться всередині вашого фільтрованого вірша.",
      "done": "Готово"
    },
    "sort_modal": {
      "sort_results": "Сортувати результати",
      "sort": "Сортувати",
      "newest_first": "Спочатку нові",
      "oldest_first": "Спочатку старі",
      "done": "Готово"
    },
    "note_editor": {
      "edit_note": "Редагувати нотатку",
      "add_note": "Додати нотатку",
      "save": "Зберегти",
      "close": "Закрити"
    },
    "messaging": {
      "unknown_error": "Сталася невідома помилка.",
      "are_you_sure_close_editor": "Ви впевнені, що хочете закрити редактор? Ви втратите всі незбережені зміни.",
      "are_you_sure_delete_note": "Ви впевнені, що хочете видалити цю нотатку?",
      "note_could_not_be_deleted": "Нотатку не вдалося видалити."
    }
  }
}
</i18n>
