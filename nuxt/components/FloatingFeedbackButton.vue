<template>
  <div v-if="authStore.loggedIn" class="no-print">
    <button
      class="floating-action-button"
      :aria-label="$t('floating_action_button.give_feedback')"
      @click="openModal"
    >
      <feedback-icon fill="white" width="28px" height="28px" />
    </button>
    <feedback-modal :is-visible="isModalVisible" @close="closeModal" />
  </div>
</template>

<script>
import FeedbackIcon from '@/components/svg/FeedbackIcon.vue';
import FeedbackModal from '@/components/popups/FeedbackModal.vue';
import { useAuthStore } from '~/stores/auth';

export default {
  name: 'FloatingFeedbackButton',
  components: {
    FeedbackIcon,
    FeedbackModal,
  },
  data() {
    return {
      isModalVisible: false,
    };
  },
  computed: {
    authStore() {
      return useAuthStore();
    },
  },
  methods: {
    openModal() {
      this.isModalVisible = true;
    },
    closeModal() {
      this.isModalVisible = false;
    },
  },
};
</script>

<style scoped lang="scss">
.floating-action-button {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: #3273dc; /* Bulma primary color */
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  z-index: $zIndexActionButton;
  text-decoration: none;
  border: none;
  cursor: pointer;
}

.floating-action-button:hover {
  background-color: #2366d1;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  transform: translateY(-2px);
}

.floating-action-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

@media screen and (max-width: 768px) {
  .floating-action-button {
    bottom: 1.5rem;
    right: 1.5rem;
    width: 48px;
    height: 48px;
  }
}
</style>

<i18n lang="json">
{
  "en": {
    "floating_action_button": {
      "give_feedback": "Give Feedback"
    }
  },
  "de": {
    "floating_action_button": {
      "give_feedback": "Feedback geben"
    }
  },
  "es": {
    "floating_action_button": {
      "give_feedback": "Dar Comentarios"
    }
  },
  "fr": {
    "floating_action_button": {
      "give_feedback": "Donner des Commentaires"
    }
  },
  "ko": {
    "floating_action_button": {
      "give_feedback": "피드백 보내기"
    }
  },
  "pt": {
    "floating_action_button": {
      "give_feedback": "Dar Feedback"
    }
  },
  "uk": {
    "floating_action_button": {
      "give_feedback": "Залишити відгук"
    }
  }
}
</i18n>
