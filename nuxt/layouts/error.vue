<template>
  <main>
    <section class="mbl-hero mbl-hero--large mbl-hero--dark mbl-hero--bold">
      <div class="mbl-hero__body">
        <div class="mbl-container">
          <h1 class="mbl-title">
            {{ error.statusCode }}
          </h1>
          <p class="mbl-subtitle">
            {{ error.message }}
          </p>
        </div>
      </div>
    </section>
    <floating-feedback-button />
  </main>
</template>

<script>
import FloatingFeedbackButton from '@/components/FloatingFeedbackButton.vue';

export default {
  components: {
    FloatingFeedbackButton,
  },
  props: {
    error: {
      type: Object,
      default: () => ({
        statusCode: 500,
        message: 'No error information is available.',
      }),
    },
  },
  head() {
    return {
      title: this.$t('my_bible_log'),
    };
  },
};
</script>

<style scoped>

</style>
