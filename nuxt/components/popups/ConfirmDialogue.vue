<template>
  <popup-modal ref="popup" class="no-select">
    <div v-if="title" class="title is-4">
      {{ title }}
    </div>
    <div class="content">
      <p>{{ message }}</p>
    </div>
    <div class="buttons">
      <a class="button" :class="confirmButtonClass" @click="_confirm">{{ confirmButtonText }}</a>
      <a class="button is-light" @click="_cancel">{{ cancelButtonText }}</a>
    </div>
  </popup-modal>
</template>

<script>
import PopupModal from '@/components/popups/PopUpModal.vue';

export default {
  name: 'ConfirmDialogue',

  components: { PopupModal },

  data: () => ({
    // Parameters that change depending on the type of dialogue
    title: undefined,
    message: undefined, // Main text content
    confirmButtonText: 'Confirm', // Text for confirm button; leave it empty because we don't know what we're using it for
    cancelButtonText: 'Cancel', // text for cancel button

    // Use any Bulma color helper class here:
    // 'is-light', 'is-primary', 'is-info', 'is-success', 'is-danger'...
    confirmType: 'is-primary',

    // Private variables
    resolvePromise: undefined,
    rejectPromise: undefined,
  }),

  computed: {
    confirmButtonClass() {
      return {
        [this.confirmType]: true,
      };
    },
  },

  methods: {
    show(options = {}) {
      this.title = options.title;
      this.message = options.message;
      if (options.confirmButtonText) {
        this.confirmButtonText = options.confirmButtonText;
      }
      if (options.confirmType) {
        this.confirmType = options.confirmType;
      }
      if (options.cancelButtonText) {
        this.cancelButtonText = options.cancelButtonText;
      }
      // Once we set our config, we tell the popup modal to open
      this.$refs.popup.open();
      // Return promise so the caller can get results
      return new Promise((resolve, reject) => {
        this.resolvePromise = resolve;
        this.rejectPromise = reject;
      });
    },

    _confirm() {
      this.$refs.popup.close();
      this.resolvePromise(true);
    },

    _cancel() {
      this.$refs.popup.close();
      this.resolvePromise(false);
    },
  },
};
</script>

<style lang="scss" scoped>
.no-select {
  user-select: none;
}
</style>
