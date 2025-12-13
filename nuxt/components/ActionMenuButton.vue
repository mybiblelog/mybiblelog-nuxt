<template>
  <button
    :aria-label="$t('open_menu')"
    class="action-menu-button"
    @click.stop="$emit('click')"
  >
    <span class="action-menu-button-icon" />
  </button>
</template>

<script>
export default {
  name: 'ActionMenuButton',
};
</script>

<style lang="scss" scoped>
.action-menu-button {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.25rem;
  transition: background-color 0.2s;
  width: 35px;
  height: 35px;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  &:focus {
    outline: 2px solid #09f;
    outline-offset: 2px;
  }
}

.action-menu-button-icon {
  position: relative;
  display: inline-block;
  width: 3px;
  height: 3px;
  color: #666;
  user-select: none;
  background-color: currentColor;
  border-radius: 50%;
  // Create three vertically stacked dots using box-shadow
  box-shadow:
    0 -6px 0 0 currentColor,
    0 6px 0 0 currentColor;
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
