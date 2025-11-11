<template lang="xml">
  <svg xmlns="http://www.w3.org/2000/svg" :width="width" :height="height" viewBox="0 0 24 24" fill="none">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" :fill="fill"/>
    <path d="M7 9h2v2H7zm4 0h6v2h-6zm-4 4h6v2H7zm8 0h2v2h-2z" :fill="fill" opacity="0.6"/>
  </svg>
</template>

<script>
export default {
  name: 'Feedback',
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
      default: 'currentColor',
    },
  },
};
</script>
