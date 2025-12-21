<template>
  <div class="content-column">
    Demo Component: "{{ message }}"
    <ul>
      <li v-for="item in list" :key="item">
        {{ item }}
      </li>
    </ul>
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
    list: {
      type: Array,
      default: () => [],
    },
  },
};

</script>

<style scoped>
div {
  color: #09f;
}
</style>
