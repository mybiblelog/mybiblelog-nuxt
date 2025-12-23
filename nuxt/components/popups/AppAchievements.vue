<template>
  <transition name="fade">
    <div v-if="achievement.open" class="popup-modal no-select">
      <div class="window" role="dialog">
        <div class="star-container">
          <div class="star-wrapper" :class="{ 'star-stamped': starStamped }">
            <star-icon width="64px" height="64px" fill="#ffd700" />
          </div>
          <div
            v-for="(particle, index) in particles"
            :key="index"
            class="particle"
            :style="particle.style"
          >
            <star-icon width="16px" height="16px" fill="#def" />
          </div>
        </div>
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
import StarIcon from '@/components/svg/StarIcon';

export default {
  name: 'AppAchievements',
  components: {
    StarIcon,
  },
  data() {
    return {
      starStamped: false,
      particles: [],
    };
  },
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
  watch: {
    'achievement.open'(isOpen) {
      if (isOpen) {
        // Reset animation state
        this.starStamped = false;
        this.particles = [];

        // Wait for modal enter animation to complete (0.3s), then start star animation
        setTimeout(() => {
          this.starStamped = true;

          // After star stamp animation is far enough along (0.3s of 0.5s), trigger particles
          setTimeout(() => {
            this.createParticles();
          }, 250);
        }, 300);
      }
      else {
        // Clean up when modal closes
        this.starStamped = false;
        this.particles = [];
      }
    },
  },
  methods: {
    _close() {
      this.$store.dispatch('achievements/closeAchievement');
    },
    createParticles() {
      const particleCount = 12;
      const particles = [];

      for (let i = 0; i < particleCount; i++) {
        // Random angle for particle direction
        const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
        // Random distance (80-120px)
        const distance = 80 + Math.random() * 40;
        // Calculate x and y positions
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        // Random delay (0-100ms)
        const delay = Math.random() * 100;
        // Random rotation speed
        const rotationSpeed = (Math.random() - 0.5) * 720; // -360 to +360 degrees

        particles.push({
          style: {
            '--x': `${x}px`,
            '--y': `${y}px`,
            '--delay': `${delay}ms`,
            '--rotation': `${rotationSpeed}deg`,
          },
        });
      }

      this.particles = particles;

      // Clean up particles after animation completes
      setTimeout(() => {
        this.particles = [];
      }, 1500);
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
  text-align: center;

  overflow: hidden;
}

.star-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1rem;
  height: 80px;
  overflow: visible;
}

.star-wrapper {
  position: relative;
  z-index: 2;
  transform: scale(2);
  opacity: 0;
  transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1),
              opacity 0.4s ease-out;

  &.star-stamped {
    transform: scale(1);
    opacity: 1;
  }
}

.particle {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 1;
  transform: translate(-50%, -50%);
  opacity: 0;
  animation: particle-fly 1.2s var(--delay) ease-out forwards;
}

@keyframes particle-fly {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) translate(0, 0) rotate(0deg) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%)
              translate(var(--x), var(--y))
              rotate(var(--rotation))
              scale(0.3);
  }
}

.title {
  text-align: center;
}

.content {
  text-align: center;
}

.buttons {
  display: flex;
  justify-content: center;
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
