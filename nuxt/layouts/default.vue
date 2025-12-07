<template>
  <div>
    <site-nav />
    <div class="site-container">
      <nuxt />
    </div>
    <toaster />
    <pop-ups />
    <passage-note-editor-modal />
    <floating-feedback-button />
  </div>
</template>

<script>
import SiteNav from '@/components/SiteNav.vue';
import FloatingFeedbackButton from '@/components/FloatingFeedbackButton.vue';
import Toaster from '@/components/Toaster.vue';
import PopUps from '@/components/popups/PopUps.vue';
import PassageNoteEditorModal from '@/components/popups/PassageNoteEditorModal.vue';

export default {
  components: {
    SiteNav,
    FloatingFeedbackButton,
    Toaster,
    PopUps,
    PassageNoteEditorModal,
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
.site-container {
  min-height: 80vh;
  padding-bottom: 2rem;
}
</style>
