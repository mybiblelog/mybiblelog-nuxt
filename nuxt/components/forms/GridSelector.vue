<template>
  <div class="grid-selector" :style="gridSelectorStyle">
    <div v-for="option in options" :key="option.value" class="grid-selector--option" @click="selectValue(option.value)">
      {{ option.label }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'GridSelector',
  props: {
    options: {
      type: Array,
      default: () => [],
    },
    columns: {
      type: Number,
      default: 2,
    },
  },
  computed: {
    gridRows() {
      return Math.ceil(this.options.length / this.columns);
    },
    gridSelectorStyle() {
      return {
        'grid-template-columns': `repeat(${this.columns}, 1fr)`,
        'grid-template-rows': `repeat(${this.gridRows}, 1fr)`,
      };
    },
  },
  methods: {
    selectValue(value) {
      this.$emit('selection', value);
    },
  },
};
</script>

<style lang="scss" scoped>
.grid-selector {
  display: grid;
  padding: 1px;
  font-size: 0.8rem;
  user-select: none;
  grid-auto-flow: column;
}

.grid-selector--option {
  cursor: pointer;
  position: relative;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 1rem;
  transition: 0.2s;

  &::before {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    right: 2px;
    bottom: 2px;
    border: 2px solid #ccc;
    border-radius: 5px;
    transition: 0.2s;
  }

  &:hover {
    color: #000;
    &::before {
      border-color: #09f;
    }
  }
}
</style>
