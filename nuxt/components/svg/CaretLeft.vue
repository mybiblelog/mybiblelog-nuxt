<template lang="xml">
<svg :width="width" :height="height" viewBox="8 8 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g id="Arrow / Caret_Left_SM">
    <path id="Vector" d="M14 9L11 12L14 15" :stroke="fill" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>
</template>

<script>
export default {
  name: 'CaretLeft',
  props: {
    width: {
      type: String,
      default: '10px',
    },
    height: {
      type: String,
      default: '20px',
    },
    fill: {
      type: String,
      default: '#c4c4c4',
    },
  },
};
</script>
