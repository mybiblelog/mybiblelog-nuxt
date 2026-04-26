<template>
  <transition name="fade">
    <div v-if="isVisible" class="mbl-modal mbl-modal--active" role="dialog">
      <div class="mbl-modal__backdrop" @click="close" />
      <div class="mbl-modal__card">
        <section class="mbl-modal__body">
          <get-started-step
            :previous-button-text="$t('start_page.back')"
            @previous="close"
          />
        </section>
      </div>
    </div>
  </transition>
</template>

<script>
import GetStartedStep from '@/components/forms/settings/GetStartedStep.vue';

export default {
  name: 'GetStartedModal',
  components: {
    GetStartedStep,
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
  },
};
</script>

<style scoped>
/* css class for the transition */
.mbl-modal.fade-enter-active,
.mbl-modal.fade-leave-active {
  transition: var(--transition-fade);
}

.mbl-modal.fade-enter-active .mbl-modal__card,
.mbl-modal.fade-leave-active .mbl-modal__card {
  transition: var(--transition-modal);
}

.mbl-modal.fade-enter,
.mbl-modal.fade-leave-to {
  opacity: 0;
}

.mbl-modal.fade-enter .mbl-modal__card,
.mbl-modal.fade-leave-to .mbl-modal__card {
  transform: var(--modal-scale);
}

.mbl-modal__body {
  padding: 2rem;
}
</style>
