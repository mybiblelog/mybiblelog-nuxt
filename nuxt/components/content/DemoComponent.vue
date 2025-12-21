<template>
  <div>
    Demo Component: "{{ message }}"
  </div>
</template>

<script lang="ts">
export default {
  name: 'DemoComponent',
  props: {
    message: {
      type: String,
      default: '...',
    },
  },
};

</script>

<style scoped>
div {
  color: red;
}
</style>
