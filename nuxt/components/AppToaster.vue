<template>
  <div class="toaster">
    <div class="mbl-container">
      <div class="mbl-centered-column mbl-centered-column--constrained">
        <div class="mbl-py-0">
          <div v-for="message in messages" :key="message.id" class="mbl-notification" :class="messageClass(message.type)">
            <button class="mbl-delete" @click="closeToast(message.id)" />{{ message.text }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useToastStore } from '~/stores/toast';

export default {
  name: 'AppToaster',
  computed: {
    toastStore() {
      return useToastStore();
    },
    messages() {
      return this.toastStore.messages;
    },
  },
  methods: {
    closeToast(id) {
      this.toastStore.close(id);
    },
    messageClass(type) {
      switch (type) {
      case 'info':
        return 'mbl-notification--info';
      case 'success':
        return 'mbl-notification--success';
      case 'warning':
        return 'mbl-notification--warning';
      case 'error':
        return 'mbl-notification--danger';
      default:
        return '';
      }
    },
  },
};
</script>

<style scoped>
.toaster {
  position: fixed;
  top: 72px; /* clear the nav bar */
  left: 1rem;
  right: 1rem;
  z-index: var(--z-index-toast);
  pointer-events: none;
}

.mbl-notification {
  box-shadow: 0 0 0 2px #fff, 0 0 5px #000;
  pointer-events: auto;
}
</style>
