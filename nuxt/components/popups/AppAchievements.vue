<template>
  <transition name="fade">
    <div v-if="achievement.open" class="popup-modal no-select">
      <div class="window" role="dialog">
        <div class="title is-4">
          {{ achievementTitle }}
        </div>
        <div class="content">
          <p>{{ achievementMessage }}</p>
        </div>
        <div class="buttons">
          <button class="button is-primary" @click="_close">
            {{ $t('ok') }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { mapState } from 'vuex';
import { Bible } from '@mybiblelog/shared';
import { ACHIEVEMENT } from '@/store/achievements';

export default {
  name: 'AppAchievements',
  computed: {
    ...mapState({
      achievement: state => state.achievements,
    }),
    achievementTitle() {
      if (this.achievement.achievementType === ACHIEVEMENT.BOOK_COMPLETE) {
        const bookName = Bible.getBookName(this.achievement.achievementData, this.$i18n.locale);
        return this.$t('achievement.book_complete.title', { bookName });
      }
      if (this.achievement.achievementType === ACHIEVEMENT.BIBLE_COMPLETE) {
        return this.$t('achievement.bible_complete.title');
      }
      return '';
    },
    achievementMessage() {
      if (this.achievement.achievementType === ACHIEVEMENT.BOOK_COMPLETE) {
        const bookName = Bible.getBookName(this.achievement.achievementData, this.$i18n.locale);
        return this.$t('achievement.book_complete.message', { bookName });
      }
      if (this.achievement.achievementType === ACHIEVEMENT.BIBLE_COMPLETE) {
        return this.$t('achievement.bible_complete.message');
      }
      return '';
    },
  },
  methods: {
    _close() {
      this.$store.dispatch('achievements/closeAchievement');
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

<i18n lang="json">
{
  "de": {
    "ok": "OK",
    "achievement": {
      "book_complete": {
        "title": "Buch abgeschlossen!",
        "message": "Glückwunsch! Sie haben {bookName} vollständig gelesen!"
      },
      "bible_complete": {
        "title": "Bibel abgeschlossen!",
        "message": "🎉 Unglaublich! Sie haben die gesamte Bibel gelesen! 🎉"
      }
    }
  },
  "en": {
    "ok": "OK",
    "achievement": {
      "book_complete": {
        "title": "Book Complete!",
        "message": "Congratulations! You have completed {bookName}!"
      },
      "bible_complete": {
        "title": "Bible Complete!",
        "message": "🎉 Amazing! You have completed reading the entire Bible! 🎉"
      }
    }
  },
  "es": {
    "ok": "OK",
    "achievement": {
      "book_complete": {
        "title": "¡Libro completado!",
        "message": "¡Felicitaciones! Has completado {bookName}!"
      },
      "bible_complete": {
        "title": "¡Biblia completada!",
        "message": "🎉 ¡Increíble! Has completado la lectura de toda la Biblia! 🎉"
      }
    }
  },
  "fr": {
    "ok": "D'accord",
    "achievement": {
      "book_complete": {
        "title": "Livre terminé!",
        "message": "Félicitations! Vous avez terminé {bookName}!"
      },
      "bible_complete": {
        "title": "Bible terminée!",
        "message": "🎉 Incroyable! Vous avez terminé de lire toute la Bible! 🎉"
      }
    }
  },
  "pt": {
    "ok": "OK",
    "achievement": {
      "book_complete": {
        "title": "Livro completo!",
        "message": "Parabéns! Você completou {bookName}!"
      },
      "bible_complete": {
        "title": "Bíblia completa!",
        "message": "🎉 Incrível! Você completou a leitura de toda a Bíblia! 🎉"
      }
    }
  },
  "uk": {
    "ok": "OK",
    "achievement": {
      "book_complete": {
        "title": "Книга завершена!",
        "message": "Вітаємо! Ви завершили {bookName}!"
      },
      "bible_complete": {
        "title": "Біблія завершена!",
        "message": "🎉 Дивовижно! Ви завершили читання всієї Біблії! 🎉"
      }
    }
  }
}
</i18n>
