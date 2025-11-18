<template>
  <div v-if="isVisible" class="modal is-active" role="dialog">
    <div class="modal-background" @click="close" />
    <div class="modal-card">
      <section class="modal-card-body">
        <GetStartedStep
          :previous-button-text="$t('start_page.back')"
          @previous="close"
        />
      </section>
    </div>
  </div>
</template>

<script>
import GetStartedStep from '@/components/forms/settings/GetStartedStep.vue';

export default {
  name: 'GetStartedModal',
  components: {
    GetStartedStep,
  },
  props: {
    isVisible: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    close() {
      this.$emit('close');
    },
  },
};
</script>

<style lang="scss" scoped>
.modal-card-body {
  padding: 2rem;
}
</style>
