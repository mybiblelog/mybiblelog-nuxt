<template>
  <main>
    <confirm-dialogue ref="confirmDialogue" />
    <alert-dialogue ref="alertDialogue" />
    <button class="button is-danger" @click="testDeleteDialogue">
      Test Delete Confirmation
    </button>
    <br>
    <button class="button is-primary" @click="requestNotificationPermission">
      Do The Notification!
    </button>
    <grid-selector :options="books" :columns="4" @selection="onBookSelected" />
    <range-selector :min="4" :max="16" :columns="8" @selection="onVersesSelected" />
  </main>
</template>

<script>
import Bible from '@/shared/bible';
import GridSelector from '@/components/forms/GridSelector';
import RangeSelector from '@/components/forms/RangeSelector';
import ConfirmDialogue from '@/components/popups/ConfirmDialogue';
import AlertDialogue from '@/components/popups/AlertDialogue';

export default {
  name: 'TestPage',
  components: {
    GridSelector,
    RangeSelector,
    ConfirmDialogue,
    AlertDialogue,
  },
  middleware: ['auth'],
  data() {
    return {
      books: [],
    };
  },
  mounted() {
    this.books = Bible.getBooks().map(book => ({
      label: (
        book.locales[this.$i18n.locale]?.abbreviations?.[0] ||
        Bible.getBookName(book.bibleOrder, this.$i18n.locale)
      ),
      value: book.bibleOrder,
    }));
  },
  methods: {
    onBookSelected(value) {
      alert(`Book ${value} was selected`);
    },
    onVersesSelected({ from, to }) {
      alert(`Verses ${from}-${to} selected.`);
    },
    async requestNotificationPermission() {
      const result = await Notification.requestPermission();
      if (result === 'granted') {
        this.randomNotification();
      }
    },
    randomNotification() {
      const title = 'MBL Notification';
      const body = 'Created by Aaron.';
      const icon = '/icon.png';
      const options = {
        body,
        icon,
      };
      const notification = new Notification(title, options); // eslint-disable-line
      setTimeout(this.randomNotification, 30000);
    },
    async testDeleteDialogue() {
      const ok = await this.$refs.confirmDialogue.show({
        title: 'Delete Thing',
        message: 'Are you sure you want to delete the thing? It cannot be undone.',
        confirmButtonText: 'Delete Forever',
        confirmType: 'is-danger',
      });
      // If you throw an error, the method will terminate here unless you surround it wil try/catch
      if (ok) {
        this.$refs.alertDialogue.show({
          title: 'Success',
          message: 'You have successfully deleted the thing.',
          buttonText: 'I know',
          buttonType: 'is-info',
        });
      }
      else {
        this.$refs.alertDialogue.show({
          title: 'Cancelled',
          message: 'You chose not to delete the thing.',
          buttonText: 'Yep',
          buttonType: 'is-light',
        });
      }
    },

  },
};
</script>

<style lang="scss" scoped>
.reading-modal {
  position: fixed;
  top: 20vh;
  left: 20vw;
  width: 60vw;
  height: 60vh;
  background: #000;
  border: 2px solid #000;
  z-index: $zIndexModal;
}
</style>

<i18n lang="json">
{
  "de": {},
  "en": {},
  "es": {},
  "fr": {},
  "pt": {},
  "uk": {}
}
</i18n>
