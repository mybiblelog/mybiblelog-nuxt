<template>
  <transition name="fade">
    <div v-if="isVisible" class="modal is-active" role="dialog">
      <div class="modal-background" @click="close" />
      <div class="modal-card">
        <section class="modal-card-body">
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
.modal.fade-enter-active,
.modal.fade-leave-active {
  transition: var(--transition-fade);
}

.modal.fade-enter-active .modal-card,
.modal.fade-leave-active .modal-card {
  transition: var(--transition-modal);
}

.modal.fade-enter,
.modal.fade-leave-to {
  opacity: 0;
}

.modal.fade-enter .modal-card,
.modal.fade-leave-to .modal-card {
  transform: var(--modal-scale);
}

.modal-card-body {
  padding: 2rem;
}
</style>
