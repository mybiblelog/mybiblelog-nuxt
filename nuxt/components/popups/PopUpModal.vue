<template>
  <transition name="fade">
    <div v-if="isVisible" class="popup-modal">
      <div class="window">
        <slot />
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'PopupModal',

  data: () => ({
    isVisible: false,
  }),

  methods: {
    open() {
      this.isVisible = true;
    },

    close() {
      this.isVisible = false;
    },
  },
};
</script>

<style lang="scss" scoped>
/* css class for the transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.popup-modal {
  background-color: rgba(0, 0, 0, 0.5);
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  z-index: $zIndexPopUp;
}

.window {
  background: #fff;

  padding: 2rem;
  border-radius: 0.25rem;
  box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.2);

  max-width: 480px;
  margin-left: auto;
  margin-right: auto;
}
</style>
