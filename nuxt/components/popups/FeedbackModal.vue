<template>
  <transition name="fade">
    <app-modal v-if="isVisible" :title="$t('feedback_form')" @close="close">
      <template slot="content">
        <div class="content">
          <p>{{ $t('feedback_form_intro.p1') }}</p>
          <p>{{ $t('feedback_form_intro.p2') }}</p>
        </div>
        <feedback-form @success="handleSuccess" />
      </template>
    </app-modal>
  </transition>
</template>

<script>
import FeedbackForm from '@/components/forms/FeedbackForm.vue';
import AppModal from '@/components/popups/AppModal.vue';

export default {
  name: 'FeedbackModal',
  components: {
    FeedbackForm,
    AppModal,
  },
  props: {
    isVisible: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    close() {
      this.$emit('close');
    },
    handleSuccess() {
      // Close modal after successful submission
      this.close();
    },
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

<i18n locale="en" lang="json" src="@/locales/sfc/en/components/popups/FeedbackModal.json" />
<i18n locale="de" lang="json" src="@/locales/sfc/de/components/popups/FeedbackModal.json" />
<i18n locale="es" lang="json" src="@/locales/sfc/es/components/popups/FeedbackModal.json" />
<i18n locale="fr" lang="json" src="@/locales/sfc/fr/components/popups/FeedbackModal.json" />
<i18n locale="ko" lang="json" src="@/locales/sfc/ko/components/popups/FeedbackModal.json" />
<i18n locale="pt" lang="json" src="@/locales/sfc/pt/components/popups/FeedbackModal.json" />
<i18n locale="uk" lang="json" src="@/locales/sfc/uk/components/popups/FeedbackModal.json" />
