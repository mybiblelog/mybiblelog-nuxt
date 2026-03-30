<template>
  <transition name="fade">
    <div v-if="dialog.open" class="popup-modal no-select">
      <div class="window" role="dialog">
        <div v-if="dialog.title" class="title is-4">
          {{ dialog.title }}
        </div>
        <div class="content">
          <p>{{ dialog.message }}</p>
        </div>
        <div v-if="dialog.type === 'alert'" class="buttons">
          <button class="button" :class="buttonClass" @click="_clear">
            {{ dialog.buttonText || $t('ok') }}
          </button>
        </div>
        <div v-if="dialog.type === 'confirm'" class="buttons">
          <button class="button" :class="confirmButtonClass" @click="_confirm">
            {{ dialog.confirmButtonText || $t('confirm') }}
          </button>
          <button class="button is-light" @click="_cancel">
            {{ dialog.cancelButtonText || $t('cancel') }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { useDialogStore } from '~/stores/dialog';

export default {
  name: 'PopUps',
  computed: {
    dialogStore() {
      return useDialogStore();
    },
    dialog() {
      return this.dialogStore;
    },
    buttonClass() {
      return {
        [this.dialog.buttonType]: true,
      };
    },
    confirmButtonClass() {
      return {
        [this.dialog.confirmButtonType]: true,
      };
    },
  },

  methods: {
    _clear() {
      this.dialogStore.closeAlert();
    },
    _confirm() {
      this.dialogStore.acceptConfirm();
    },
    _cancel() {
      this.dialogStore.cancelConfirm();
    },
  },
};
</script>

<style lang="scss" scoped>
/* css class for the transition */
.popup-modal {
  background-color: rgba(0, 0, 0, 0.5);
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  z-index: $zIndexPopUp;

  &.fade-enter-active,
  &.fade-leave-active {
    transition: $transition-fade;

    .window {
      transition: $transition-modal;
    }
  }

  &.fade-enter,
  &.fade-leave-to {
    opacity: 0;

    .window {
      transform: $modal-scale;
    }
  }
}

.window {
  background: #fff;

  padding: 2rem;
  border-radius: 0.25rem;
  box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.2);

  max-width: 480px;
  margin-left: auto;
  margin-right: auto;
}

.no-select {
  user-select: none;
}
</style>

<i18n locale="en" lang="json" src="@/locales/sfc/en/components/popups/PopUps.json" />
<i18n locale="de" lang="json" src="@/locales/sfc/de/components/popups/PopUps.json" />
<i18n locale="es" lang="json" src="@/locales/sfc/es/components/popups/PopUps.json" />
<i18n locale="fr" lang="json" src="@/locales/sfc/fr/components/popups/PopUps.json" />
<i18n locale="ko" lang="json" src="@/locales/sfc/ko/components/popups/PopUps.json" />
<i18n locale="pt" lang="json" src="@/locales/sfc/pt/components/popups/PopUps.json" />
<i18n locale="uk" lang="json" src="@/locales/sfc/uk/components/popups/PopUps.json" />
