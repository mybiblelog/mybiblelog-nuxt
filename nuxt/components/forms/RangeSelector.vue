<template>
  <div
    class="range-selector"
    :class="rangeSelectorClass"
    :style="rangeSelectorStyle"
    @mouseleave="endSelection()"
    @mouseup="endSelection()"
    @touchend="endSelection()"
    @touchcancel="endSelection()"
    @touchmove.passive="move"
  >
    <div
      v-for="(option, index) in options"
      :key="index"
      ref="option"
      class="range-selector--option"
      :data-index="index"
      :class="rangeSelectorOptionClass(option)"
      @mousedown="startSelection(option)"
      @touchstart="startSelection(option)"
      @mousemove="adjustSelection(option)"
    >
      {{ option }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'RangeSelector',
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
      selectionInProgress: false,
      selectionFrom: null,
      selectionTo: null,
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
    rangeSelectorClass() {
      return {
        'in-progress': this.selectionInProgress,
      };
    },
    rangeSelectorStyle() {
      return {
        'grid-template-columns': `repeat(${this.columns}, 1fr)`,
      };
    },
  },
  methods: {
    rangeSelectorOptionClass(option) {
      return {
        first: option === Math.min(this.selectionFrom, this.selectionTo),
        last: option === Math.max(this.selectionFrom, this.selectionTo),
        selected: this.optionInRange(option, this.selectionFrom, this.selectionTo),
      };
    },
    optionInRange(option, from, to) {
      if (to === null) {
        return option === from;
      }
      return (option >= from && option <= to) || (option <= from && option >= to);
    },
    startSelection(value) {
      this.selectionInProgress = true;
      this.selectionFrom = value;
      this.selectionTo = value;
    },
    move(event) {
      const touch = event.touches[0];
      const touchElement = document.elementFromPoint(touch.clientX, touch.clientY);
      const element = this.$refs.option.find(optionElem => optionElem === touchElement);
      if (element) {
        const index = element.dataset.index;
        const option = this.options[index];
        this.adjustSelection(option);
      }
    },
    adjustSelection(value) {
      if (!this.selectionInProgress) {
        return;
      }
      if (!this.multi) {
        this.selectionFrom = value;
      }
      this.selectionTo = value;
    },
    endSelection() {
      if (!this.selectionInProgress) {
        return;
      }
      this.selectionInProgress = false;
      if (this.selectionTo === null) {
        this.selectionTo = this.selectionFrom;
      }
      if (this.selectionFrom > this.selectionTo) {
        const temp = this.selectionFrom;
        this.selectionFrom = this.selectionTo;
        this.selectionTo = temp;
      }
      this.emit();
    },
    emit() {
      this.$emit('selection', {
        from: this.selectionFrom,
        to: this.selectionTo,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.range-selector {
  display: grid;
  padding: 1px;
  font-size: 0.8rem;
  user-select: none;
}

.range-selector--option {
  cursor: pointer;
  display: flex;
  justify-content: center;
  padding: 1rem 0;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 2px;
    left: 0;
    bottom: 2px;
    right: 0;
  }

  &:hover:not(.selected) {
    color: #fff;
    background: #999;
    border-radius: 5px;
  }
}

.range-selector.in-progress {
  .range-selector--option.selected {

    &::before {
      border-top: 2px solid #09f;
      border-bottom: 2px solid #09f;
    }

    &.first::before {
      border-left: 2px solid #09f;
      border-top-left-radius: 5px;
      border-bottom-left-radius: 5px;
      left: 2px;
    }
    &.last::before {
      border-right: 2px solid #09f;
      border-top-right-radius: 5px;
      border-bottom-right-radius: 5px;
      right: 2px;
    }
  }
}
</style>
