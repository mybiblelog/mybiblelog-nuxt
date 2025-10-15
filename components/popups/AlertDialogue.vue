<template>
  <popup-modal ref="popup" class="no-select">
    <div v-if="title" class="title is-4">
      {{ title }}
    </div>
    <div class="content">
      <p>{{ message }}</p>
    </div>
    <div class="buttons">
      <a class="button" :class="buttonClass" @click="_clear">{{ buttonText }}</a>
    </div>
  </popup-modal>
</template>

<script>
import PopupModal from '@/components/popups/PopUpModal.vue';

export default {
  name: 'AlertDialogue',

  components: { PopupModal },

  data: () => ({
    // Parameters that change depending on the type of dialogue
    title: undefined,
    message: undefined, // Main text content
    buttonText: 'Ok', // Text for button

    // Use any Bulma color helper class here:
    // 'is-light', 'is-primary', 'is-info', 'is-success', 'is-danger'...
    buttonType: 'is-primary',

    // Private variables
    resolvePromise: undefined,
  }),

  computed: {
    buttonClass() {
      return {
        [this.buttonType]: true,
      };
    },
  },

  methods: {
    show(options = {}) {
      this.title = options.title;
      this.message = options.message;
      if (options.buttonText) {
        this.buttonText = options.buttonText;
      }
      if (options.buttonType) {
        this.buttonType = options.buttonType;
      }
      // Once we set our config, we tell the popup modal to open
      this.$refs.popup.open();
      // Return promise so the caller can get results
      return new Promise((resolve) => {
        this.resolvePromise = resolve;
      });
    },

    _clear() {
      this.$refs.popup.close();
      this.resolvePromise(true);
    },
  },
};
</script>

<style lang="scss" scoped>
.no-select {
  user-select: none;
}
</style>
