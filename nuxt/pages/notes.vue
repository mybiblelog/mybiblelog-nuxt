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
        <button class="button is-light is-small notes-page__query-button" type="button" @click="openQueryManagerModal">
          {{ $t('query_manager.open') }}
          <span v-if="hasAppliedViewOptions" class="notes-page__query-badge" aria-hidden="true" />
        </button>
        <button v-if="hasAppliedViewOptions" class="button is-light is-small" type="button" @click="resetViewOptions">
          {{ $t('query_manager.reset_button') }}
        </button>
      </div>

      <div class="columns">
        <aside class="column is-4 notes-page__sidebar">
          <div class="box notes-page__query-manager-box">
            <div class="notes-page__query-manager-actions">
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
          <div>
            <template v-if="loading">
              <div class="passage-note">
                <div class="passage-note--content has-text-centered">
                  {{ $t('results.loading') }}
                </div>
              </div>
            </template>
            <template v-else-if="!passageNotes.length">
              <div class="has-background-light p-5">
                <div class="has-text-centered">
                  {{ $t('results.no_results') }}
                </div>
              </div>
            </template>
            <template v-else>
              <div class="notes-page__results-bar">
                <div class="notes-page__results-summary">
                  {{ querySummary }}
                </div>

                <div v-if="pagerTotalPages > 1" class="notes-page__results-pager">
                  <div class="field has-addons is-marginless" role="group" :aria-label="$t('pagination.label')">
                    <p class="control">
                      <button
                        class="button is-small is-light"
                        type="button"
                        :disabled="pagerPage <= 1"
                        :aria-label="$t('pagination.prev')"
                        @click="onPageChanged(pagerPage - 1)"
                      >
                        <caret-left-icon width="10px" height="18px" fill="currentColor" />
                      </button>
                    </p>

                    <div class="control">
                      <div class="select is-small">
                        <select
                          :value="pagerPage"
                          :aria-label="$t('pagination.page')"
                          @change="onPageChanged(Number($event.target.value))"
                        >
                          <option v-for="p in pagerTotalPages" :key="p" :value="p">
                            {{ $t('pagination.page') }} {{ p }}
                          </option>
                        </select>
                      </div>
                    </div>

                    <p class="control">
                      <button
                        class="button is-small is-light"
                        type="button"
                        :disabled="pagerPage >= pagerTotalPages"
                        :aria-label="$t('pagination.next')"
                        @click="onPageChanged(pagerPage + 1)"
                      >
                        <caret-right-icon width="10px" height="18px" fill="currentColor" />
                      </button>
                    </p>
                  </div>
                </div>
              </div>
              <passage-note
                v-for="note in passageNotes"
                :key="note.id"
                :note="note"
                :actions="actionsForNote(note)"
                :get-reading-url="getReadingUrl"
              />
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
import { Bible } from '@mybiblelog/shared';
import { decodePassageNotesRouteQuery, encodePassageNotesQueryToRoute } from '@/helpers/passage-notes-route-query';
import PassageNote from '@/components/PassageNote';
import PassageNotesQueryManager from '@/components/notes/PassageNotesQueryManager';
import AppModal from '@/components/popups/AppModal';
import InfoLink from '@/components/InfoLink';
import CaretLeftIcon from '@/components/svg/CaretLeftIcon';
import CaretRightIcon from '@/components/svg/CaretRightIcon';
import { useDialogStore } from '~/stores/dialog';
import { useToastStore } from '~/stores/toast';
import { usePassageNoteEditorStore } from '~/stores/passage-note-editor';
import { usePassageNotesStore } from '~/stores/passage-notes';
import { usePassageNoteTagsStore } from '~/stores/passage-note-tags';
import { useUserSettingsStore } from '~/stores/user-settings';

export default {
  name: 'NotesListPage',
  components: {
    PassageNote,
    PassageNotesQueryManager,
    AppModal,
    InfoLink,
    CaretLeftIcon,
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
    passageNotesStore() {
      return usePassageNotesStore();
    },
    passageNoteTagsStore() {
      return usePassageNoteTagsStore();
    },
    passageNoteTags() {
      return this.passageNoteTagsStore.passageNoteTags;
    },
    loading() {
      return this.passageNotesStore.loading;
    },
    query() {
      return this.passageNotesStore.query;
    },
    passageNotes() {
      return this.passageNotesStore.passageNotes;
    },
    pagination() {
      return this.passageNotesStore.pagination;
    },
    pagerPage() {
      return Number((this.pagination && this.pagination.page) || 1);
    },
    pagerTotalPages() {
      return Math.max(1, Number((this.pagination && this.pagination.totalPages) || 1));
    },
    hasAppliedViewOptions() {
      const q = this.query || {};
      const hasSearchText = !!(q.searchText && String(q.searchText).trim().length);
      const hasTagFilters = Array.isArray(q.filterTags) && q.filterTags.length > 0;
      const hasTagMatchingOverride = q.filterTagMatching && q.filterTagMatching !== 'any';
      const hasPassageFilter = !!(q.filterPassageStartVerseId && q.filterPassageEndVerseId);
      const hasSortOverride = (q.sortOn && q.sortOn !== 'createdAt') || (q.sortDirection && q.sortDirection !== 'descending');
      const hasPageSizeOverride = Number(q.limit || 10) !== 10;

      return hasSearchText || hasTagFilters || hasTagMatchingOverride || hasPassageFilter || hasSortOverride || hasPageSizeOverride;
    },
    hasAppliedFilters() {
      const q = this.query || {};
      const hasSearchText = !!(q.searchText && String(q.searchText).trim().length);
      const hasTagFilters = Array.isArray(q.filterTags) && q.filterTags.length > 0;
      const hasPassageFilter = !!(q.filterPassageStartVerseId && q.filterPassageEndVerseId);
      const isOnlyUntagged = (q.filterTagMatching === 'exact') && (!Array.isArray(q.filterTags) || q.filterTags.length === 0);
      return hasSearchText || hasTagFilters || hasPassageFilter || isOnlyUntagged;
    },
    querySummary() {
      const pagination = this.pagination || {};
      const q = this.query || {};

      const total = Number(pagination.size || 0);
      const page = Number(pagination.page || 1);
      const limit = Number(pagination.limit || q.limit || 10);
      const pageLength = Array.isArray(this.passageNotes) ? this.passageNotes.length : 0;

      const noun = this.hasAppliedFilters ? 'results' : 'notes';

      if (!total) {
        return this.$t(`query_summary.none.${noun}`);
      }

      if (total <= limit) {
        return this.$tc(`query_summary.showing_all.${noun}`, total, {
          total: this.$n(total, 'grouped'),
        });
      }

      const first = (page - 1) * limit + 1;
      const last = Math.min(first + Math.max(pageLength, 1) - 1, total);
      return this.$tc(`query_summary.showing_range.${noun}`, total, {
        first: this.$n(first, 'grouped'),
        last: this.$n(last, 'grouped'),
        total: this.$n(total, 'grouped'),
      });
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
        await this.passageNotesStore.resetQuery(decoded);
      },
    },
    pagination() {
      // AFTER new page data loads, causing a pagination update, smooth scroll to top
      // Avoids a jarring page length change from doing this too soon
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
  },
  mounted() {
    this.passageNoteTagsStore.loadPassageNoteTags();
  },
  methods: {
    pushNotesQuery(nextQuery, { replace = false } = {}) {
      const path = this.localePath('/notes');
      const query = encodePassageNotesQueryToRoute(nextQuery);
      const nav = { path, query };
      return replace ? this.$router.replace(nav) : this.$router.push(nav);
    },
    getReadingUrl(bookIndex, chapterIndex) {
      return useUserSettingsStore().getReadingUrl(bookIndex, chapterIndex);
    },
    displayVerseRange(startVerseId, endVerseId) {
      return Bible.displayVerseRange(startVerseId, endVerseId, this.$i18n.locale);
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
      usePassageNoteEditorStore().openEditor(noteToEdit);
    },
    async deletePassageNote(id) {
      const dialogStore = useDialogStore();
      const toastStore = useToastStore();
      const confirmed = await dialogStore.confirm({ message: this.$t('messaging.are_you_sure_delete_note') });
      if (!confirmed) { return; }

      const success = await this.passageNotesStore.deletePassageNote(id);
      if (!success) {
        toastStore.add({
          type: 'error',
          text: this.$t('messaging.note_could_not_be_deleted'),
        });
      }
    },
    onPageChanged(newPage) {
      const clampedPage = Math.min(Math.max(Number(newPage || 1), 1), this.pagerTotalPages);
      if (clampedPage === this.pagerPage) { return; }
      const limit = this.pagination.limit || (this.query && this.query.limit) || 10;
      const offset = (clampedPage - 1) * limit;
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

.notes-page__query-button {
  position: relative;
  padding-right: 1.25rem; /* room for badge */
}

.notes-page__query-badge {
  position: absolute;
  top: 0.35rem;
  right: 0.35rem;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 999px;
  background: #3273dc; /* Bulma primary */
  box-shadow: 0 0 0 2px white;
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

.notes-page__query-manager-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: $transition-fade;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.notes-page__results-bar {
  position: sticky;
  top: calc(#{$header-height} + 0.5rem - 1px);
  z-index: 10;

  background: white;
  padding: 0.5rem 1rem;
  margin-left:  -0.5rem;
  margin-right:  -0.5rem;
  border-bottom: 1px solid #eee;

  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.25rem; /* tighter row gap on small screens */

  @media (min-width: 600px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
  }
}

.notes-page__results-summary {
  white-space: normal;
  word-break: break-word;
}

.notes-page__results-pager {
  display: flex;
  justify-content: flex-start;

  @media (min-width: 600px) {
    justify-content: flex-end;
  }
}

</style>

<i18n locale="en" lang="json" src="@/locales/sfc/en/pages/notes.json" />
<i18n locale="de" lang="json" src="@/locales/sfc/de/pages/notes.json" />
<i18n locale="es" lang="json" src="@/locales/sfc/es/pages/notes.json" />
<i18n locale="fr" lang="json" src="@/locales/sfc/fr/pages/notes.json" />
<i18n locale="pt" lang="json" src="@/locales/sfc/pt/pages/notes.json" />
<i18n locale="uk" lang="json" src="@/locales/sfc/uk/pages/notes.json" />
