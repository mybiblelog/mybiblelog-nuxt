<template>
  <main>
    <div class="content-column">
      <header class="page-header">
        <h2 class="title">
          {{ $t('note_tags') }}
          <info-link :to="localePath('/about/page-features--notes')" />
        </h2>
        <div class="buttons is-align-items-flex-start">
          <nuxt-link class="button" :to="localePath('/notes')">
            {{ $t('notes') }}
            <caret-right-icon style="margin-left: 0.2rem;" />
          </nuxt-link>
          <button class="button is-info" @click="openPassageNoteTagEditor()">
            {{ $t('new') }}
          </button>
        </div>
      </header>
      <div class="tag-sort-row">
        <div class="field has-addons">
          <div class="control">
            <span class="button is-static">{{ $t('sort_by') }}</span>
          </div>
          <div class="control">
            <div class="select">
              <select v-model="sortOrder">
                <option value="label:ascending">
                  {{ $t('sort_az') }}
                </option>
                <option value="createdAt:descending">
                  {{ $t('sort_newest_first') }}
                </option>
                <option value="createdAt:ascending">
                  {{ $t('sort_oldest_first') }}
                </option>
                <option value="noteCount:descending">
                  {{ $t('sort_most_notes') }}
                </option>
                <option value="noteCount:ascending">
                  {{ $t('sort_fewest_notes') }}
                </option>
                <option value="color:hue">
                  {{ $t('sort_color') }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div v-for="tag in passageNoteTags" :key="tag.id" class="tag-line">
          <div>
            <div class="passage-note-tag" :style="passageNoteTagStyle(tag)">
              {{ tag.label }}
            </div>
            <div class="tag-description">
              <hyperlinked-text :text="tag.description" />
            </div>
          </div>
          <div class="tag-footer">
            <div v-if="displayTagTimeSince(tag)" class="tag-footer--created">
              <span class="has-text-grey is-size-7" :title="displayTagDateTime(tag)">{{ $t('created') }} {{ displayTagTimeSince(tag) }}</span>
            </div>
            <div class="buttons is-right tag-footer--buttons">
              <button class="button is-small" @click="viewTagNotes(tag)">
                {{ $t('notes_count', { count: tag.noteCount }) }}
              </button>
              <button class="button is-small" @click="openPassageNoteTagEditor(tag)">
                {{ $t('edit') }}
              </button>
              <button class="button is-small" @click="deletePassageNoteTag(tag.id)">
                {{ $t('delete') }}
              </button>
            </div>
          </div>
        </div>
        <div v-if="!passageNoteTags.length" class="tag-line">
          <div class="has-text-centered">
            {{ $t('no_tags') }}
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import { displayDateTime, displayTimeSince } from '@mybiblelog/shared';
import { encodePassageNotesQueryToRoute } from '@/helpers/passage-notes-route-query';
import HyperlinkedText from '@/components/HyperlinkedText';
import InfoLink from '@/components/InfoLink';
import CaretRightIcon from '@/components/svg/CaretRightIcon';
import { useDialogStore } from '~/stores/dialog';
import { useToastStore } from '~/stores/toast';
import { usePassageNoteTagEditorStore } from '~/stores/passage-note-tag-editor';
import { usePassageNoteTagsStore } from '~/stores/passage-note-tags';

export default {
  name: 'NoteTagsListPage',
  components: {
    HyperlinkedText,
    InfoLink,
    CaretRightIcon,
  },
  middleware: ['auth'],
  head() {
    return {
      title: this.$t('note_tags'),
    };
  },
  computed: {
    passageNoteTagsStore() {
      return usePassageNoteTagsStore();
    },
    passageNoteTags() {
      return this.passageNoteTagsStore.passageNoteTags;
    },
    sortOrder: {
      get() {
        return this.passageNoteTagsStore.sortOrder;
      },
      set(value) {
        this.passageNoteTagsStore.setPassageNoteTagSortOrder({ sortOrder: value, persist: true });
      },
    },
  },
  mounted() {
    this.passageNoteTagsStore.loadPassageNoteTags();
  },
  methods: {
    tagCreatedAtDate(tag) {
      const ms = this.passageNoteTagsStore.tagCreatedAtMs(tag);
      return ms ? new Date(ms) : null;
    },
    displayTagDateTime(tag) {
      const date = this.tagCreatedAtDate(tag);
      if (!date) { return ''; }
      return displayDateTime(date, this.$i18n.locale);
    },
    displayTagTimeSince(tag) {
      const date = this.tagCreatedAtDate(tag);
      if (!date) { return ''; }
      return displayTimeSince(date, this.$i18n.locale);
    },
    viewTagNotes(tag) {
      const query = encodePassageNotesQueryToRoute({ filterTags: [tag.id], offset: 0 });
      this.$router.push({ path: this.localePath('/notes'), query });
    },
    openPassageNoteTagEditor(passageNoteTag = null) {
      usePassageNoteTagEditorStore().openEditor(passageNoteTag);
    },
    async deletePassageNoteTag(id) {
      const dialogStore = useDialogStore();
      const toastStore = useToastStore();
      if (this.passageNoteTags.find(tag => tag.id === id).noteCount > 0) {
        await dialogStore.alert({ message: this.$t('cannot_delete_tag_in_use') });
        return;
      }
      const confirmed = await dialogStore.confirm({ message: this.$t('confirm_delete_tag') });
      if (!confirmed) { return; }

      const success = await this.passageNoteTagsStore.deletePassageNoteTag(id);
      if (!success) {
        toastStore.add({
          type: 'error',
          text: this.$t('tag_not_deleted'),
        });
      }
    },
    passageNoteTagStyle(tag) {
      return {
        'background-color': tag.color,
      };
    },
  },
};
</script>

<style lang="scss" scoped>
.tag-sort-row {
  margin: 0.25rem 0 1rem;
}
.tag-line {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  margin: 1rem -0.5rem;
  border-radius: 0.25rem;
  box-shadow: 0 1px 7px #999;
}
.tag-footer {
  margin-top: 0.25rem;
  padding: 0 0.5rem;

  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-areas: "created buttons";
  align-items: center;
  gap: 0 0.5rem;
}
.tag-footer--created {
  grid-area: created;
  justify-self: start;
}
.tag-footer--buttons {
  grid-area: buttons;
  justify-self: end;
  margin-bottom: 0;
}
.tag-footer--buttons.buttons {
  margin-bottom: 0;
}

@media (max-width: 520px) {
  .tag-footer {
    grid-template-columns: 1fr;
    grid-template-areas:
      "buttons"
      "created";
  }
  .tag-footer--created {
    justify-self: end;
  }
}
.passage-note-tag {
  color: #fff;
  text-shadow: 0 0 2px #000;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  overflow-x: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.tag-description {
  white-space: pre-wrap;
  margin: 0.5rem 0;
  padding: 0 0.5rem;
}
</style>

<i18n locale="en" lang="json" src="@/locales/sfc/en/pages/tags.json" />
<i18n locale="de" lang="json" src="@/locales/sfc/de/pages/tags.json" />
<i18n locale="es" lang="json" src="@/locales/sfc/es/pages/tags.json" />
<i18n locale="fr" lang="json" src="@/locales/sfc/fr/pages/tags.json" />
<i18n locale="ko" lang="json" src="@/locales/sfc/ko/pages/tags.json" />
<i18n locale="pt" lang="json" src="@/locales/sfc/pt/pages/tags.json" />
<i18n locale="uk" lang="json" src="@/locales/sfc/uk/pages/tags.json" />
