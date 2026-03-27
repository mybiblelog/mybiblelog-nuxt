<template>
  <div class="modal is-active" role="dialog">
    <div class="modal-background" @click="close" />
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">
          {{ title }}
        </p>
        <button class="delete" type="button" aria-label="close" @click.prevent="close" />
      </header>
      <section
        class="modal-card-body"
      >
        <slot name="content" />
      </section>
      <footer v-if="$slots.footer" class="modal-card-foot">
        <slot name="footer" />
      </footer>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AppModal',
  props: {
    title: { type: String, default: '' },
  },
  /**
   * This modal is rendered into the body of the document, rather than into the DOM of the parent component.
   * This is a workaround for the fact that we cannot use the teleport component in Vue 2.
   * In Vue 3 we will be able to use the teleport component to achieve this,
   * but for now we need to manually append and remove the modal from the body.
   * This frees the component from any ancestor stacking context, avoiding z-index conflicts.
   * Specifically, this was needed to break the component out of a `sticky` stacking context.
   */
  mounted() {
    // (remove in Vue 3 and use teleport component instead)
    if (typeof document === 'undefined') { return; }
    if (this.$el && this.$el.parentNode !== document.body) {
      document.body.appendChild(this.$el);
    }
  },
  beforeDestroy() {
    // (remove in Vue 3 and use teleport component instead)
    if (typeof document === 'undefined') { return; }
    if (this.$el && this.$el.parentNode === document.body) {
      document.body.removeChild(this.$el);
    }
  },
  methods: {
    close() {
      this.$emit('close');
    },
  },
};
</script>

<style lang="scss" scoped>
.modal {
  .modal-card {
    padding: 0 1rem;
  }

  .modal-card-body {
    &:last-child {
      border-bottom-left-radius: $modal-card-border-radius;
      border-bottom-right-radius: $modal-card-border-radius;
    }
  }

  &.fade-enter-active,
  &.fade-appear-active,
  &.fade-leave-active {
    .modal-card {
      transition: $transition-modal;
    }
  }

  &.fade-enter,
  &.fade-appear,
  &.fade-leave-to {
    .modal-card {
      transform: $modal-scale;
    }
  }
}
</style>
