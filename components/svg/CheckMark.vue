<template lang="xml">
  <svg xmlns="http://www.w3.org/2000/svg" :width="width" :height="height" viewBox="0 0 24 24">
    <path :fill="fill" d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"/>
  </svg>
</template>

<script>
export default {
  name: 'CheckMark',
  props: {
    width: {
      type: String,
      default: '24px',
    },
    height: {
      type: String,
      default: '24px',
    },
    fill: {
      type: String,
      default: '#ddd',
    },
  },
};
</script>
