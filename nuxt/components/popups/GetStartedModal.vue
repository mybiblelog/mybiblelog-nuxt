<template>
  <transition name="fade">
    <div v-if="isVisible" class="modal is-active" role="dialog">
      <div class="modal-background" @click="close" />
      <div class="modal-card">
        <section class="modal-card-body">
          <GetStartedStep
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

<style lang="scss" scoped>
/* css class for the transition */
.modal {
  &.fade-enter-active,
  &.fade-leave-active {
    transition: $transition-fade;

    .modal-card {
      transition: $transition-modal;
    }
  }

  &.fade-enter,
  &.fade-leave-to {
    opacity: 0;

    .modal-card {
      transform: $modal-scale;
    }
  }
}

.modal-card-body {
  padding: 2rem;
}
</style>
