<template>
  <div class="tap-range-selector" :style="rangeSelectorStyle">
    <div
      v-for="(option, index) in options"
      :key="index"
      class="tap-range-selector--option"
      :class="tapRangeSelectorOptionClass(option)"
      @click="handleClick(option)"
    >
      {{ option }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'TapRangeSelector',
  props: {
    min: {
      type: Number,
      default: () => 0,
    },
    max: {
      type: Number,
      required: true,
    },
    multi: {
      type: Boolean,
      default: true,
    },
    columns: {
      type: Number,
      default: 6,
    },
  },
  data() {
    return {
      startValue: null,
      endValue: null,
      waitingForEnd: false,
    };
  },
  computed: {
    options() {
      const options = [];
      if (this.min <= this.max) {
        let current = this.min;
        while (current <= this.max) {
          options.push(current);
          current++;
        }
      }
      return options;
    },
    rangeSelectorStyle() {
      return {
        'grid-template-columns': `repeat(${this.columns}, 1fr)`,
      };
    },
  },
  methods: {
    tapRangeSelectorOptionClass(option) {
      if (!this.multi || !this.startValue) {
        return {
          selected: option === this.startValue,
        };
      }

      const from = Math.min(this.startValue, this.endValue || this.startValue);
      const to = Math.max(this.startValue, this.endValue || this.startValue);

      return {
        first: option === from,
        last: option === to,
        selected: option >= from && option <= to,
        waiting: this.waitingForEnd && option === this.startValue,
      };
    },
    handleClick(value) {
      if (!this.multi) {
        // Single selection mode
        this.startValue = value;
        this.endValue = value;
        this.waitingForEnd = false;
        this.emit();
        return;
      }

      // Multi selection mode
      if (this.startValue === null) {
        // First click - set start value
        this.startValue = value;
        this.endValue = null;
        this.waitingForEnd = true;
      }
      else if (this.waitingForEnd) {
        // Second click - set end value
        if (value === this.startValue) {
          // Same value clicked twice - single value selection
          this.endValue = this.startValue;
        }
        else {
          this.endValue = value;
        }
        this.waitingForEnd = false;
        this.emit();
      }
      else {
        // Reset and start new selection
        this.startValue = value;
        this.endValue = null;
        this.waitingForEnd = true;
      }
    },
    emit() {
      const from = this.startValue;
      const to = this.endValue !== null ? this.endValue : this.startValue;
      this.$emit('selection', {
        from: Math.min(from, to),
        to: Math.max(from, to),
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.tap-range-selector {
  display: grid;
  padding: 1px;
  font-size: 0.8rem;
  user-select: none;
}

.tap-range-selector--option {
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem 0;
  position: relative;
  transition: 0.2s;
  border: 2px solid transparent;
  border-radius: 5px;

  &:hover:not(.selected) {
    color: #fff;
    background: #999;
  }

  &.selected {
    color: #09f;
    border-color: #09f;
  }

  &.waiting {
    animation: pulseBorder 1.5s ease-in-out infinite;
  }
}

@keyframes pulseBorder {
  0%, 100% {
    border-color: #09f;
  }
  50% {
    border-color: #0cf;
  }
}
</style>
