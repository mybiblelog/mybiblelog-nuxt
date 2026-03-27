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
      <section class="modal-card-body">
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
