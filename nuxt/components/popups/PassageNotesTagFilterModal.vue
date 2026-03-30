<template>
  <transition name="fade">
    <app-modal v-if="open" :title="$t('tag_filters.title')" @close="$emit('close')">
      <template slot="content">
        <passage-note-tag-selector
          :passage-note-tags="passageNoteTags"
          :selected-tag-ids="selectedTagIds"
          @change="(tagIds) => $emit('change', tagIds)"
        />
      </template>
      <template slot="footer">
        <button class="button is-primary" type="button" @click="$emit('close')">
          {{ $t('tag_filters.done') }}
        </button>
      </template>
    </app-modal>
  </transition>
</template>

<script>
import AppModal from '@/components/popups/AppModal';
import PassageNoteTagSelector from '@/components/forms/PassageNoteTagSelector';

export default {
  name: 'PassageNotesTagFilterModal',
  components: {
    AppModal,
    PassageNoteTagSelector,
  },
  props: {
    open: { type: Boolean, default: false },
    passageNoteTags: { type: Array, default: () => [] },
    selectedTagIds: { type: Array, default: () => [] },
  },
};
</script>

<style lang="scss" scoped>
/* css class for the transition */
.fade-enter-active,
.fade-leave-active {
  transition: $transition-fade;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>

<i18n locale="en" lang="json" src="@/locales/sfc/en/components/popups/PassageNotesTagFilterModal.json" />
<i18n locale="de" lang="json" src="@/locales/sfc/de/components/popups/PassageNotesTagFilterModal.json" />
<i18n locale="es" lang="json" src="@/locales/sfc/es/components/popups/PassageNotesTagFilterModal.json" />
<i18n locale="fr" lang="json" src="@/locales/sfc/fr/components/popups/PassageNotesTagFilterModal.json" />
<i18n locale="ko" lang="json" src="@/locales/sfc/ko/components/popups/PassageNotesTagFilterModal.json" />
<i18n locale="pt" lang="json" src="@/locales/sfc/pt/components/popups/PassageNotesTagFilterModal.json" />
<i18n locale="uk" lang="json" src="@/locales/sfc/uk/components/popups/PassageNotesTagFilterModal.json" />
