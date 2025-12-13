<template>
  <div class="modal is-active" role="dialog">
    <div class="modal-background" @click="close" />
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">
          {{ title }}
        </p>
        <button class="delete" aria-label="close" @click="close" />
      </header>
      <section class="modal-card-body">
        <slot name="content" />
      </section>
      <footer class="modal-card-foot">
        <slot name="footer" />
      </footer>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Modal',
  props: {
    title: { type: String, default: '' },
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
  &.fade-enter-active,
  &.fade-leave-active {
    .modal-card {
      transition: $transition-modal;
    }
  }

  &.fade-enter,
  &.fade-leave-to {
    .modal-card {
      transform: $modal-scale;
    }
  }
}
</style>
