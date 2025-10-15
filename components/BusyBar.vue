<template>
  <div class="busy-bar" :class="{ 'is-busy': busy }" />
</template>

<script>
export default {
  name: 'BusyBar',
  props: {
    busy: {
      type: Boolean,
      required: true,
    },
  },
};
</script>

<style lang="scss">
@keyframes busyAnimation {
  100% {
    background-position: 100% 100%;
  }
}

$busyBarHeight: 5px;

.busy-bar {
  position: fixed;
  z-index: $zIndexBusyBar;
  top: 52px;
  left: 0;
  width: 100vw;
  height: $busyBarHeight;
  background: transparent;
  pointer-events: none;
  transform: translateY(-$busyBarHeight);
  transition: 0.2s;

  &.is-busy {
    background: #ccc;
    background-image:
      repeating-linear-gradient(
        -45deg,
        transparent,
        transparent 1rem,
        #ddd 1rem,
        #ddd 2rem
      );
    background-size: 200% 200%;
    animation: busyAnimation 10s linear infinite;
    transform: translateY(0);
  }
}
</style>
