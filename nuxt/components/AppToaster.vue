<template>
  <div class="toaster">
    <div class="container">
      <div class="columns is-centered">
        <div class="column is-two-thirds-tablet py-0">
          <div v-for="message in messages" :key="message.id" class="notification" :class="messageClass(message.type)">
            <button class="delete" @click="closeToast(message.id)" />{{ message.text }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'AppToaster',
  computed: {
    messages() {
      return this.$store.state.toast.messages;
    },
  },
  methods: {
    closeToast(id) {
      this.$store.dispatch('toast/close', id);
    },
    messageClass(type) {
      switch (type) {
      case 'info':
        return 'is-info';
      case 'success':
        return 'is-success';
      case 'warning':
        return 'is-warning';
      case 'error':
        return 'is-danger';
      default:
        return '';
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.toaster {
  position: fixed;
  top: 72px; // clear the nav bar
  left: 1rem;
  right: 1rem;
  z-index: $zIndexToast;
  pointer-events: none;
}

.notification {
  box-shadow: 0 0 0 2px #fff, 0 0 5px #000;
  pointer-events: auto;
}
</style>
