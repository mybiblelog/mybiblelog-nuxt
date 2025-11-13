<template>
  <main>
    <section class="hero is-large is-dark is-bold">
      <div class="hero-body">
        <div class="container">
          <h1 class="title">
            {{ error.statusCode }}
          </h1>
          <p class="subtitle">
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

<style lang="scss" scoped>
//
</style>
