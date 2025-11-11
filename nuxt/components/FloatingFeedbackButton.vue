<template>
  <nuxt-link
    v-if="$auth.loggedIn && $route.path !== localePath('/feedback')"
    :to="localePath('/feedback')"
    class="floating-action-button"
    :aria-label="$t('floating_action_button.give_feedback')"
  >
    <feedback-icon fill="white" width="28px" height="28px" />
  </nuxt-link>
</template>

<script>
import FeedbackIcon from '@/components/svg/Feedback.vue';

export default {
  name: 'FloatingFeedbackButton',
  components: {
    FeedbackIcon,
  },
};
</script>

<style scoped>
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
  z-index: 1000;
  text-decoration: none;
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
  "de": {
    "floating_action_button": {
      "give_feedback": "Feedback geben"
    }
  },
  "en": {
    "floating_action_button": {
      "give_feedback": "Give Feedback"
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
