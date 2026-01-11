<template>
  <main>
    <div class="content-column">
      <h1 class="title">
        {{ $t('feedback_form') }}
      </h1>
      <div class="content">
        <p>{{ $t('feedback_form_intro.p1') }}</p>
        <p>{{ $t('feedback_form_intro.p2') }}</p>
      </div>
      <feedback-form />
    </div>
    <content-page-footer />
  </main>
</template>

<script>
import FeedbackForm from '@/components/forms/FeedbackForm.vue';
import ContentPageFooter from '@/components/content/PageFooter.vue';

export default {
  name: 'FeedbackFormPage',
  components: {
    FeedbackForm,
    ContentPageFooter,
  },
  head() {
    return {
      title: this.$t('feedback_form'),
      meta: [
        { hid: 'robots', name: 'robots', content: 'noindex' },
      ],
    };
  },
  // NO auth middleware -- this page will be accessible
  // for both authenticated and unauthenticated users
  auth: false,
};
</script>

<style lang="scss" scoped>
//
</style>

<i18n lang="json">
{
  "de": {
    "feedback_form": "Feedback-Formular",
    "feedback_form_intro": {
      "p1": "Verwenden Sie dieses Formular, um Feedback für My Bible Log einzureichen.",
      "p2": "Fehlerberichte, Funktionsanfragen und allgemeine Kommentare sind willkommen."
    }
  },
  "en": {
    "feedback_form": "Feedback Form",
    "feedback_form_intro": {
      "p1": "Use this form to submit feedback for My Bible Log.",
      "p2": "Bug reports, feature requests, and general comments are all welcome."
    }
  },
  "es": {
    "feedback_form": "Formulario de Comentarios",
    "feedback_form_intro": {
      "p1": "Utilice este formulario para enviar comentarios sobre My Bible Log.",
      "p2": "Los informes de errores, las solicitudes de funciones y los comentarios generales son bienvenidos."
    }
  },
  "fr": {
    "feedback_form": "Formulaire de Commentaires",
    "feedback_form_intro": {
      "p1": "Utilisez ce formulaire pour soumettre des commentaires pour My Bible Log.",
      "p2": "Les rapports de bogues, les demandes de fonctionnalités et les commentaires généraux sont les bienvenus."
    }
  },
  "pt": {
    "feedback_form": "Formulário de Feedback",
    "feedback_form_intro": {
      "p1": "Use este formulário para enviar feedback para My Bible Log.",
      "p2": "Relatórios de bugs, solicitações de recursos e comentários gerais são bem-vindos."
    }
  },
  "uk": {
    "feedback_form": "Форма зворотнього зв'язку",
    "feedback_form_intro": {
      "p1": "Використовуйте цю форму для надсилання відгуків про My Bible Log.",
      "p2": "Звіти про помилки, запити на функції та загальні коментарі вітаються."
    }
  }
}
</i18n>
