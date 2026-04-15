<template>
  <div class="app-modal-root">
    <transition name="fade" appear>
      <div
        v-if="open"
        class="modal is-active"
        role="dialog"
        :style="modalInlineStyle"
      >
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
    </transition>
  </div>
</template>

<script>
export default {
  name: 'AppModal',
  props: {
    title: { type: String, default: '' },
    open: { type: Boolean, default: false },
    /** Optional stacking order for the modal root (Bulma default may be insufficient in some stacks). */
    zIndex: { type: [Number, String], default: null },
  },
  computed: {
    modalInlineStyle() {
      if (this.zIndex === null || this.zIndex === '' || this.zIndex === undefined) {
        return {};
      }
      return { zIndex: this.zIndex };
    },
  },
  /**
   * This component’s root is rendered into the body of the document, rather than into the parent’s DOM.
   * This is a workaround for the fact that we cannot use the teleport component in Vue 2.
   * In Vue 3 we will be able to use the teleport component to achieve this,
   * but for now we need to manually append and remove the root from the body.
   * This frees the modal from any ancestor stacking context, avoiding z-index conflicts.
   * Specifically, this was needed to break the component out of a `sticky` stacking context.
   *
   * The root is a stable wrapper so `mounted` always has a real DOM node even when `open` is false
   * (the inner modal is gated by `open` inside a `<transition>`).
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

<style scoped>
.app-modal-root {
  pointer-events: none;
}

.modal.is-active {
  pointer-events: auto;
}

.modal .modal-background {
  /*  help ensure modal background covers the entire viewport */
  height: 100dvh;
}

.modal .modal-card {
  padding: 0 1rem;
}

.modal .modal-card-body:last-child {
  border-bottom-left-radius: var(--modal-card-border-radius);
  border-bottom-right-radius: var(--modal-card-border-radius);
}

.modal.fade-enter-active,
.modal.fade-appear-active,
.modal.fade-leave-active {
  transition: var(--transition-fade);
}

.modal.fade-enter-active .modal-card,
.modal.fade-appear-active .modal-card,
.modal.fade-leave-active .modal-card {
  transition: var(--transition-modal);
}

.modal.fade-enter,
.modal.fade-appear,
.modal.fade-leave-to {
  opacity: 0;
}

.modal.fade-enter .modal-card,
.modal.fade-appear .modal-card,
.modal.fade-leave-to .modal-card {
  transform: var(--modal-scale);
}
</style>
