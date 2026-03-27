<template>
  <main>
    <div class="notes-page">
      <header class="page-header">
        <h2 class="title">
          {{ $t('notes') }}
          <info-link :to="localePath('/about/page-features--notes')" />
        </h2>
        <div class="buttons is-align-items-flex-start">
          <nuxt-link class="button" :to="localePath('/tags')">
            {{ $t('tags') }}
            <caret-right-icon style="margin-left: 0.2rem;" />
          </nuxt-link>
          <button class="button is-info" @click="openPassageNoteEditor({ empty: true })">
            {{ $t('new') }}
          </button>
        </div>
      </header>
      <div class="notes-page__mobile-query-button">
        <button class="button is-light is-small" type="button" @click="openQueryManagerModal">
          {{ $t('query_manager.open') }}
        </button>
        <button v-if="hasAppliedViewOptions" class="button is-light is-small" type="button" @click="resetViewOptions">
          {{ $t('query_manager.reset_button') }}
        </button>
      </div>

      <div class="columns notes-page__columns">
        <aside class="column is-4 notes-page__sidebar">
          <div class="box notes-page__query-manager-box">
            <div class="notes-page__query-manager-header">
              <div class="notes-page__query-manager-title">
                {{ $t('query_manager.title') }}
              </div>
              <button v-if="hasAppliedViewOptions" class="button is-light is-small" type="button" @click="resetViewOptions">
                {{ $t('query_manager.reset') }}
              </button>
            </div>
            <passage-notes-query-manager
              ref="sidebarQueryManager"
              :applied-query="query"
              :passage-note-tags="passageNoteTags"
              @apply="applyQueryManager"
            />
          </div>
        </aside>

        <section class="column notes-page__content">
          <div class="query-summary content">
            <p>{{ querySummary }}</p>
            <div v-if="query.filterTags.length" class="query-summary--tag-filters">
              <passage-note-tag-pill v-for="tag in populatedTags(query.filterTags)" :key="tag.id" :tag="tag" />
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
              <passage-note
                v-for="note in passageNotes"
                :key="note.id"
                :note="note"
                :actions="actionsForNote(note)"
                :get-reading-url="getReadingUrl"
              />
              <pagination-controls v-if="pagination.totalPages > 1" :total-pages="pagination.totalPages" :current-page="pagination.page" @pagechanged="onPageChanged" />
            </template>
          </div>
        </section>
      </div>

      <transition name="fade" appear>
        <app-modal v-if="showQueryManagerModal" :title="$t('query_manager.title')" @close="closeQueryManagerModal">
          <template slot="content">
            <passage-notes-query-manager
              :applied-query="query"
              :passage-note-tags="passageNoteTags"
              @apply="applyQueryManager"
              @cancel="closeQueryManagerModal"
            />
          </template>
        </app-modal>
      </transition>
    </div>
  </main>
</template>

<script>
import { mapState } from 'vuex';
import { Bible } from '@mybiblelog/shared';
import { decodePassageNotesRouteQuery, encodePassageNotesQueryToRoute } from '@/helpers/passage-notes-route-query';
import PassageNote from '@/components/PassageNote';
import PassageNoteTagPill from '@/components/PassageNoteTagPill';
import PassageNotesQueryManager from '@/components/notes/PassageNotesQueryManager';
import AppModal from '@/components/popups/AppModal';
import PaginationControls from '@/components/PaginationControls';
import InfoLink from '@/components/InfoLink';
import CaretRightIcon from '@/components/svg/CaretRightIcon';

export default {
  name: 'NotesListPage',
  components: {
    PassageNote,
    PassageNoteTagPill,
    PassageNotesQueryManager,
    AppModal,
    PaginationControls,
    InfoLink,
    CaretRightIcon,
  },
  middleware: ['auth'],
  data() {
    return {
      showQueryManagerModal: false,
      lastAppliedNotesRouteQueryKey: null,
    };
  },
  head() {
    return {
      title: this.$t('notes'),
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
    hasAppliedViewOptions() {
      const q = this.query || {};
      const hasSearchText = !!(q.searchText && String(q.searchText).trim().length);
      const hasTagFilters = Array.isArray(q.filterTags) && q.filterTags.length > 0;
      const hasTagMatchingOverride = q.filterTagMatching && q.filterTagMatching !== 'any';
      const hasPassageFilter = !!(q.filterPassageStartVerseId && q.filterPassageEndVerseId);
      const hasSortOverride = (q.sortOn && q.sortOn !== 'createdAt') || (q.sortDirection && q.sortDirection !== 'descending');

      return hasSearchText || hasTagFilters || hasTagMatchingOverride || hasPassageFilter || hasSortOverride;
    },
    querySummary() {
      const pageLength = this.passageNotes.length;
      const limit = this.pagination.limit || (this.query && this.query.limit) || 10;
      const first = (this.pagination.page - 1) * limit + 1;
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
        }
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
          }
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
    '$route.query': {
      deep: true,
      immediate: true,
      async handler() {
        const decoded = decodePassageNotesRouteQuery(this.$route.query);
        const key = JSON.stringify(decoded);
        if (key === this.lastAppliedNotesRouteQueryKey) { return; }
        this.lastAppliedNotesRouteQueryKey = key;
        await this.$store.dispatch('passage-notes/resetQuery', decoded);
      },
    },
    pagination() {
      // AFTER new page data loads, causing a pagination update, smooth scroll to top
      // Avoids a jarring page length change from doing this too soon
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
  },
  mounted() {
    this.$store.dispatch('passage-note-tags/loadPassageNoteTags');
  },
  methods: {
    pushNotesQuery(nextQuery, { replace = false } = {}) {
      const path = this.localePath('/notes');
      const query = encodePassageNotesQueryToRoute(nextQuery);
      const nav = { path, query };
      return replace ? this.$router.replace(nav) : this.$router.push(nav);
    },
    getReadingUrl(bookIndex, chapterIndex) {
      return this.$store.getters['user-settings/getReadingUrl'](bookIndex, chapterIndex);
    },
    displayVerseRange(startVerseId, endVerseId) {
      return Bible.displayVerseRange(startVerseId, endVerseId, this.$i18n.locale);
    },
    populatedTags(tagIds) {
      if (!this.passageNoteTags || !this.passageNoteTags.length) {
        return tagIds.map(id => ({ id, label: 'Loading', color: '#333' }));
      }
      return tagIds.map(id => this.passageNoteTags.find(tag => tag.id === id)).filter(Boolean);
    },
    actionsForNote(note) {
      return [
        { label: this.$t('note.edit'), callback: () => this.openPassageNoteEditor(note) },
        { label: this.$t('note.delete'), callback: () => this.deletePassageNote(note.id) },
      ];
    },
    openQueryManagerModal() {
      this.showQueryManagerModal = true;
    },
    closeQueryManagerModal() {
      this.showQueryManagerModal = false;
    },
    resetViewOptions() {
      if (!this.hasAppliedViewOptions) { return; }
      const mgr = this.$refs.sidebarQueryManager;
      if (!mgr || typeof mgr.confirmAndReset !== 'function') { return; }
      mgr.confirmAndReset();
    },
    async applyQueryManager(update) {
      await this.pushNotesQuery({ ...this.query, ...update, offset: 0 });
      if (this.showQueryManagerModal) {
        this.closeQueryManagerModal();
      }
    },
    openPassageNoteEditor(passageNote) {
      // If passageNote has empty: true, open for creating new note
      // Otherwise, open for editing existing note
      const noteToEdit = passageNote.empty ? null : passageNote;
      this.$store.dispatch('passage-note-editor/openEditor', noteToEdit);
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
    },
    onPageChanged(newPage) {
      const limit = this.pagination.limit || (this.query && this.query.limit) || 10;
      const offset = (newPage - 1) * limit;
      this.pushNotesQuery({ ...this.query, offset, limit });
    },
  },
};
</script>

<style lang="scss" scoped>
.notes-page {
  max-width: 1100px;
  min-height: 70vh;
  margin: 0 auto;
  padding: 3rem 1rem 5rem;
}

.notes-page header.page-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  align-items: flex-start;

  padding: 0; /* match global content-column header behavior */
}

.notes-page__mobile-query-button {
  margin-bottom: 1rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;

  @media (min-width: $breakpoint) {
    display: none;
  }
}

.notes-page__columns {
  margin-top: 0.5rem;
}

.notes-page__sidebar {
  display: none;

  @media (min-width: $breakpoint) {
    display: block;
    position: sticky;
    top: calc(#{$header-height} + 1rem);
    align-self: flex-start;
  }
}

.notes-page__content {
  @media (min-width: $breakpoint) {
    padding-left: 1rem;
  }
}

.notes-page__query-manager-box {
  padding: 1rem;
}

.notes-page__query-manager-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.notes-page__query-manager-title {
  font-weight: 600;
}

.fade-enter-active,
.fade-leave-active {
  transition: $transition-fade;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.query-summary {
  background: #efefef;
  padding: 0.5em 1em;
  margin: 0.5em 0;
  border-radius: 0.25em;
}

.query-summary--tag-filters {
  display: flex;
  flex-wrap: wrap;
}

</style>

<i18n lang="json">
{
  "de": {
    "notes": "Notizen",
    "tags": "Tags",
    "new": "Neu",
    "query_manager": {
      "open": "Ansichtsoptionen",
      "title": "Ansichtsoptionen",
      "reset": "Zurücksetzen",
      "reset_button": "Ansichtsoptionen zurücksetzen"
    },
    "results": {
      "loading": "Laden...",
      "no_results": "Keine Ergebnisse"
    },
    "note": {
      "edit": "Bearbeiten",
      "delete": "Löschen"
    },
    "messaging": {
      "are_you_sure_delete_note": "Möchten Sie diese Notiz wirklich löschen?",
      "note_could_not_be_deleted": "Die Notiz konnte nicht gelöscht werden."
    }
  },
  "en": {
    "notes": "Notes",
    "tags": "Tags",
    "new": "New",
    "query_manager": {
      "open": "View Options",
      "title": "View Options",
      "reset": "Reset",
      "reset_button": "Reset View Options"
    },
    "results": {
      "loading": "Loading...",
      "no_results": "No Results"
    },
    "note": {
      "edit": "Edit",
      "delete": "Delete"
    },
    "messaging": {
      "are_you_sure_delete_note": "Are you sure you want to delete this note?",
      "note_could_not_be_deleted": "The note could not be deleted."
    }
  },
  "es": {
    "notes": "Notas",
    "tags": "Etiquetas",
    "new": "Nuevo",
    "query_manager": {
      "open": "Opciones de vista",
      "title": "Opciones de vista",
      "reset": "Restablecer",
      "reset_button": "Restablecer opciones de vista"
    },
    "results": {
      "loading": "Cargando...",
      "no_results": "Sin resultados"
    },
    "note": {
      "edit": "Editar",
      "delete": "Eliminar"
    },
    "messaging": {
      "are_you_sure_delete_note": "¿Estás seguro de que quieres eliminar esta nota?",
      "note_could_not_be_deleted": "La nota no se pudo eliminar."
    }
  },
  "fr": {
    "notes": "Notes",
    "tags": "Tags",
    "new": "New",
    "query_manager": {
      "open": "Options d’affichage",
      "title": "Options d’affichage",
      "reset": "Réinitialiser",
      "reset_button": "Réinitialiser les options d’affichage"
    },
    "results": {
      "loading": "Chargement...",
      "no_results": "Aucun résultat"
    },
    "note": {
      "edit": "Éditer",
      "delete": "Effacer"
    },
    "messaging": {
      "are_you_sure_delete_note": "Êtes-vous sûr de vouloir supprimer cette note ?",
      "note_could_not_be_deleted": "La note n'a pas pu être supprimée."
    }
  },
  "pt": {
    "notes": "Notas",
    "tags": "Tags",
    "new": "Novo",
    "query_manager": {
      "open": "Opções de visualização",
      "title": "Opções de visualização",
      "reset": "Reiniciar",
      "reset_button": "Reiniciar opções de visualização"
    },
    "results": {
      "loading": "Carregando...",
      "no_results": "Sem resultados"
    },
    "note": {
      "edit": "Editar",
      "delete": "Apagar"
    },
    "messaging": {
      "are_you_sure_delete_note": "Tem certeza de que deseja excluir esta nota?",
      "note_could_not_be_deleted": "A nota não pôde ser excluída."
    }
  },
  "uk": {
    "notes": "Нотатки",
    "tags": "Теги",
    "new": "Нове",
    "query_manager": {
      "open": "Параметри перегляду",
      "title": "Параметри перегляду",
      "reset": "Скинути",
      "reset_button": "Скинути параметри перегляду"
    },
    "results": {
      "loading": "Завантаження...",
      "no_results": "Немає результатів"
    },
    "note": {
      "edit": "Редагувати",
      "delete": "Видалити"
    },
    "messaging": {
      "are_you_sure_delete_note": "Ви впевнені, що хочете видалити цю нотатку?",
      "note_could_not_be_deleted": "Нотатку не вдалося видалити."
    }
  }
}
</i18n>
