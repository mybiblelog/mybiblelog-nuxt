<template>
  <div class="action-menu-wrapper">
    <!-- Overlay to close menu when clicking outside -->
    <div v-if="isOpen" class="action-menu-overlay" @click="close" />

    <!-- Button to open menu -->
    <button
      v-if="actions.length > 0"
      :aria-label="$t('open_menu')"
      class="action-menu-button"
      @click.stop="toggle"
    >
      <span class="action-menu-button-icon">⋯</span>
    </button>

    <!-- Menu items -->
    <div v-if="isOpen" class="action-menu" @click.stop>
      <div
        v-for="action in actions"
        :key="action.label"
        class="action-menu-item"
        @click="handleAction(action)"
      >
        {{ action.label }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ActionMenu',
  props: {
    actions: {
      type: Array,
      default: () => [],
    },
  },
  data: () => ({
    isOpen: false,
  }),
  mounted() {
    // Close menu when clicking outside or pressing Escape
    document.addEventListener('click', this.handleDocumentClick);
    document.addEventListener('keydown', this.handleKeydown);
  },
  beforeDestroy() {
    document.removeEventListener('click', this.handleDocumentClick);
    document.removeEventListener('keydown', this.handleKeydown);
  },
  methods: {
    toggle() {
      this.isOpen = !this.isOpen;
    },
    open() {
      this.isOpen = true;
    },
    close() {
      this.isOpen = false;
    },
    handleAction(action) {
      this.close();
      if (action.callback) {
        action.callback();
      }
    },
    handleDocumentClick(event) {
      // Close if clicking outside the component
      if (this.isOpen && !this.$el.contains(event.target)) {
        this.close();
      }
    },
    handleKeydown(event) {
      // Close on Escape key
      if (event.key === 'Escape' && this.isOpen) {
        this.close();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.action-menu-wrapper {
  position: relative;
  display: inline-block;
}

.action-menu-button {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.25rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  &:focus {
    outline: 2px solid #09f;
    outline-offset: 2px;
  }
}

.action-menu-button-icon {
  font-size: 1.2rem;
  line-height: 1;
  color: #666;
  font-weight: bold;
  user-select: none;
}

.action-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 38; // Below modals but above most content
  background: transparent;
}

.action-menu {
  position: absolute;
  top: 0;
  right: 0;
  margin-top: 0.25rem;
  background: #fff;
  border-radius: 0.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  min-width: 150px;
  z-index: 39; // Above overlay
  overflow: hidden;
}

.action-menu-item {
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background-color 0.15s;
  white-space: nowrap;
  color: #333;

  &:hover {
    background-color: #f5f5f5;
  }

  &:first-child {
    border-top-left-radius: 0.25rem;
    border-top-right-radius: 0.25rem;
  }

  &:last-child {
    border-bottom-left-radius: 0.25rem;
    border-bottom-right-radius: 0.25rem;
  }
}
</style>

<i18n lang="json">
{
  "de": {
    "open_menu": "Menü öffnen"
  },
  "en": {
    "open_menu": "Open menu"
  },
  "es": {
    "open_menu": "Abrir menú"
  },
  "fr": {
    "open_menu": "Ouvrir le menu"
  },
  "pt": {
    "open_menu": "Abrir menu"
  },
  "uk": {
    "open_menu": "Відкрити меню"
  }
}
</i18n>
