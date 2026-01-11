<template>
  <div>
    <site-nav />
    <div class="site-container">
      <nuxt />
    </div>
    <app-toaster />
    <pop-ups />
    <app-achievements />
    <passage-note-editor-modal />
    <passage-note-tag-editor-modal />
    <log-entry-editor-modal />
    <action-sheet-modal />
    <floating-feedback-button />
  </div>
</template>

<script>
import SiteNav from '@/components/SiteNav.vue';
import FloatingFeedbackButton from '@/components/FloatingFeedbackButton.vue';
import AppToaster from '@/components/AppToaster.vue';
import PopUps from '@/components/popups/PopUps.vue';
import AppAchievements from '~/components/popups/AppAchievements.vue';
import PassageNoteEditorModal from '@/components/popups/PassageNoteEditorModal.vue';
import PassageNoteTagEditorModal from '@/components/popups/PassageNoteTagEditorModal.vue';
import LogEntryEditorModal from '@/components/popups/LogEntryEditorModal.vue';
import ActionSheetModal from '@/components/popups/ActionSheetModal.vue';

export default {
  components: {
    SiteNav,
    FloatingFeedbackButton,
    AppToaster,
    PopUps,
    AppAchievements,
    PassageNoteEditorModal,
    PassageNoteTagEditorModal,
    LogEntryEditorModal,
    ActionSheetModal,
  },
  head() {
    return {
      htmlAttrs: {
        lang: this.$i18n.locale,
      },
      link: [
        {
          rel: 'stylesheet',
          type: 'text/css',
          href: 'https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css',
        },
      ],
    };
  },
};
</script>

<style lang="scss" scoped>
/* no scoped styles */
</style>
