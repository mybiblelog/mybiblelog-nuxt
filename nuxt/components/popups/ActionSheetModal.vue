<template>
  <div>
    <!-- Overlay with fade transition -->
    <transition name="fade">
      <div
        v-if="open"
        class="action-sheet-overlay"
        @click="close"
      />
    </transition>

    <!-- Sheet with slide transition -->
    <transition name="slide-up">
      <div
        v-if="open"
        class="action-sheet"
        @click.stop
      >
        <div v-if="title" class="action-sheet-title">
          {{ title }}
        </div>
        <div
          v-for="action in actions"
          :key="action.label"
          class="action-sheet-item"
          @click="handleAction(action)"
        >
          {{ action.label }}
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'ActionSheetModal',
  computed: {
    ...mapState('action-sheet', {
      open: state => state.open,
      title: state => state.title,
      actions: state => state.actions,
    }),
  },
  watch: {
    open(newValue) {
      // Prevent body scroll when sheet is open
      if (newValue) {
        document.body.style.overflow = 'hidden';
      }
      else {
        document.body.style.overflow = '';
      }
    },
  },
  mounted() {
    // Close sheet when pressing Escape
    document.addEventListener('keydown', this.handleKeydown);
    // Prevent body scroll when sheet is open
    if (this.open) {
      document.body.style.overflow = 'hidden';
    }
  },
  beforeDestroy() {
    document.removeEventListener('keydown', this.handleKeydown);
    document.body.style.overflow = '';
  },
  methods: {
    close() {
      this.$store.dispatch('action-sheet/closeSheet');
    },
    handleAction(action) {
      this.close();
      if (action.callback) {
        action.callback();
      }
    },
    handleKeydown(event) {
      // Close on Escape key
      if (event.key === 'Escape' && this.open) {
        this.close();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.action-sheet-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: $zIndexActionMenu;
  background: rgba(0, 0, 0, 0.5);
}

.action-sheet {
  position: fixed;
  left: 0;
  right: 0;
  background: #fff;
  box-shadow: 0 -2px 16px rgba(0, 0, 0, 0.3);
  z-index: $zIndexActionMenu + 1;
  overflow-y: auto;
  max-height: 80vh;

  // Small screens: bottom sheet style
  bottom: 0;
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;

  // Large screens: float in middle
  @media (min-width: $breakpoint) {
    bottom: auto;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    right: auto;
    width: auto;
    min-width: 300px;
    max-width: 500px;
    border-radius: 0.5rem;
    border-top-left-radius: 0.5rem;
    border-top-right-radius: 0.5rem;
    max-height: 70vh;
  }
}

.action-sheet-title {
  padding: 1.25rem 1.5rem;
  font-weight: 600;
  font-size: 1.1rem;
  color: #333;
  border-bottom: 1px solid rgba(0, 0, 0, 0.15);
  background-color: #fafafa;

  // Small screens: first item gets top border radius
  @media (max-width: calc($breakpoint - 1px)) {
    border-top-left-radius: 1rem;
    border-top-right-radius: 1rem;
  }

  // Large screens: get top border radius
  @media (min-width: $breakpoint) {
    border-top-left-radius: 0.5rem;
    border-top-right-radius: 0.5rem;
  }
}

.action-sheet-item {
  padding: 1rem 1.5rem;
  cursor: pointer;
  transition: background-color 0.15s;
  color: #333;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: #f5f5f5;
  }

  &:active {
    background-color: #e8e8e8;
  }

  &:last-child {
    border-bottom: none;
  }

  // Small screens: first item gets top border radius (only if no title)
  @media (max-width: calc($breakpoint - 1px)) {
    &:first-child {
      border-top-left-radius: 1rem;
      border-top-right-radius: 1rem;
    }
  }

  // Large screens: all items get border radius
  @media (min-width: $breakpoint) {
    &:first-child {
      border-top-left-radius: 0.5rem;
      border-top-right-radius: 0.5rem;
    }

    &:last-child {
      border-bottom-left-radius: 0.5rem;
      border-bottom-right-radius: 0.5rem;
    }
  }
}

// Fade transition for overlay
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

// Slide up transition for sheet
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-up-enter {
  transform: translateY(100%);
  opacity: 0;

  // Large screens: use scale for center animation
  @media (min-width: $breakpoint) {
    transform: translate(-50%, -50%) $modal-scale;
    opacity: 0;
  }
}

.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;

  // Large screens: use scale for center animation
  @media (min-width: $breakpoint) {
    transform: translate(-50%, -50%) $modal-scale;
    opacity: 0;
  }
}

.slide-up-enter-to,
.slide-up-leave {
  transform: translateY(0);
  opacity: 1;

  // Large screens: maintain center position (matches base .action-sheet transform)
  @media (min-width: $breakpoint) {
    transform: translate(-50%, -50%);
    opacity: 1;
  }
}
</style>
