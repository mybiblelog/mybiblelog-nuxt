<template>
  <transition name="fade">
    <div v-if="visible" class="popup-modal">
      <div class="window" role="dialog">
        <slot />
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'PopUpModal',

  props: {
    /** Bind to a store flag or other reactive open state */
    visible: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style scoped>
.popup-modal {
  background-color: var(--mbl-overlay-50);
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  z-index: var(--z-index-popup);
  user-select: none;
}

.popup-modal.fade-enter-active,
.popup-modal.fade-leave-active {
  transition: var(--transition-fade);
}

.popup-modal.fade-enter-active .window,
.popup-modal.fade-leave-active .window {
  transition: var(--transition-modal);
}

.popup-modal.fade-enter,
.popup-modal.fade-leave-to {
  opacity: 0;
}

.popup-modal.fade-enter .window,
.popup-modal.fade-leave-to .window {
  transform: var(--modal-scale);
}

.window {
  background: var(--mbl-bg);
  padding: 2rem;
  border: 1px solid var(--mbl-border);
  border-radius: var(--modal-card-border-radius);
  box-shadow: 0 0 0.5rem var(--mbl-overlay-20);
  max-width: 480px;
  margin-left: auto;
  margin-right: auto;
  overflow: hidden;
}
</style>
