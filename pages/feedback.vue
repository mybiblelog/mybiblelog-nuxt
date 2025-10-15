<template>
  <main>
    <section class="section">
      <div class="container">
        <div class="columns is-centered">
          <div class="column is-two-thirds-tablet is-half-desktop">
            <h1 class="title">
              {{ $t('feedback_form') }}
            </h1>
            <div class="content">
              <p>{{ $t('feedback_form_intro.p1') }}</p>
              <p>{{ $t('feedback_form_intro.p2') }}</p>
            </div>
            <form @submit.prevent="submitFeedback">
              <div v-if="errors._form" class="help is-danger">
                <div class="help is-danger">
                  {{ $terr(errors._form) }}
                </div>
              </div>
              <div class="field">
                <label class="label">{{ $t('your_email') }}</label>
                <div class="control">
                  <input v-model="form.email" class="input" type="email" :placeholder="$t('your_email')" :disabled="$auth.loggedIn">
                  <div v-if="errors.email" class="help is-danger">
                    {{ $terr(errors.email) }}
                  </div>
                </div>
              </div>
              <div class="field">
                <label class="label">{{ $t('what_kind_of_feedback') }}</label>
                <div class="control">
                  <div class="select">
                    <select v-model="form.kind">
                      <option value="bug">
                        {{ $t('bug_report') }}
                      </option>
                      <option value="feature">
                        {{ $t('feature_request') }}
                      </option>
                      <option value="comment">
                        {{ $t('general_comment') }}
                      </option>
                    </select>
                  </div>
                  <div v-if="errors.kind" class="help is-danger">
                    {{ $terr(errors.kind) }}
                  </div>
                </div>
              </div>
              <div class="field">
                <label class="label">{{ $t('feedback_details') }}</label>
                <div class="control">
                  <textarea v-model="form.message" class="textarea" :placeholder="$t('feedback_details')" />
                  <div v-if="errors.message" class="help is-danger">
                    {{ $terr(errors.message) }}
                  </div>
                </div>
              </div>
              <div class="field">
                <div class="control">
                  <button class="button is-primary">
                    {{ $t('submit_feedback') }}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script>
export default {
  name: 'FeedbackFormPage',
  data() {
    return {
      form: {
        email: this.$auth.user?.email || '',
        kind: 'bug',
        message: '',
      },
      errors: {},
    };
  },
  head() {
    return {
      title: this.$t('feedback_form'),
      meta: [
        { hid: 'robots', name: 'robots', content: 'noindex' },
      ],
    };
  },
  methods: {
    async submitFeedback() {
      this.errors = {};
      try {
        await this.$axios.post('/api/feedback', {
          email: this.form.email,
          kind: this.form.kind,
          message: this.form.message,
        });

        // Clear the form
        this.form.kind = 'bug';
        this.form.message = '';

        await this.$store.dispatch('dialog/alert', {
          message: this.$t('messaging.feedback_submitted'),
        });
      }
      catch (err) {
        const unknownError = { _form: this.$t('messaging.unknown_error') };
        this.errors = err.response?.data?.errors || unknownError;
      }
    },
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
    },
    "your_email": "Ihre E-Mail",
    "what_kind_of_feedback": "Welche Art von Feedback reichen Sie ein?",
    "bug_report": "Fehlerbericht",
    "feature_request": "Funktionsanfrage",
    "general_comment": "Allgemeiner Kommentar",
    "feedback_details": "Feedback-Details",
    "submit_feedback": "Feedback einreichen",
    "messaging": {
      "unknown_error": "Ein unbekannter Fehler ist aufgetreten.",
      "feedback_submitted": "Feedback erfolgreich übermittelt. Vielen Dank!"
    }
  },
  "en": {
    "feedback_form": "Feedback Form",
    "feedback_form_intro": {
      "p1": "Use this form to submit feedback for My Bible Log.",
      "p2": "Bug reports, feature requests, and general comments are all welcome."
    },
    "your_email": "Your Email",
    "what_kind_of_feedback": "What kind of feedback are you submitting?",
    "bug_report": "Bug Report",
    "feature_request": "Feature Request",
    "general_comment": "General Comment",
    "feedback_details": "Feedback Details",
    "submit_feedback": "Submit Feedback",
    "messaging": {
      "unknown_error": "An unknown error occurred.",
      "feedback_submitted": "Feedback submitted successfully. Thank you!"
    }
  },
  "es": {
    "feedback_form": "Formulario de Comentarios",
    "feedback_form_intro": {
      "p1": "Utilice este formulario para enviar comentarios sobre My Bible Log.",
      "p2": "Los informes de errores, las solicitudes de funciones y los comentarios generales son bienvenidos."
    },
    "your_email": "Tu Correo Electrónico",
    "what_kind_of_feedback": "¿Qué tipo de comentarios estás enviando?",
    "bug_report": "Informe de Error",
    "feature_request": "Solicitud de Función",
    "general_comment": "Comentario General",
    "feedback_details": "Detalles de los Comentarios",
    "submit_feedback": "Enviar Comentarios",
    "messaging": {
      "unknown_error": "Ocurrió un error desconocido.",
      "feedback_submitted": "Comentarios enviados con éxito. ¡Gracias!"
    }
  },
  "fr": {
    "feedback_form": "Formulaire de Commentaires",
    "feedback_form_intro": {
      "p1": "Utilisez ce formulaire pour soumettre des commentaires pour My Bible Log.",
      "p2": "Les rapports de bogues, les demandes de fonctionnalités et les commentaires généraux sont les bienvenus."
    },
    "your_email": "Votre Adresse E-mail",
    "what_kind_of_feedback": "Quel type de commentaires soumettez-vous?",
    "bug_report": "Rapport de Bug",
    "feature_request": "Demande de Fonctionnalité",
    "general_comment": "Commentaire Général",
    "feedback_details": "Détails des Commentaires",
    "submit_feedback": "Soumettre des Commentaires",
    "messaging": {
      "unknown_error": "Une erreur inconnue s'est produite.",
      "feedback_submitted": "Commentaires soumis avec succès. Merci!"
    }
  },
  "pt": {
    "feedback_form": "Formulário de Feedback",
    "feedback_form_intro": {
      "p1": "Use este formulário para enviar feedback para My Bible Log.",
      "p2": "Relatórios de bugs, solicitações de recursos e comentários gerais são bem-vindos."
    },
    "your_email": "Seu Email",
    "what_kind_of_feedback": "Que tipo de feedback você está enviando?",
    "bug_report": "Relatório de Bug",
    "feature_request": "Solicitação de Recurso",
    "general_comment": "Comentário Geral",
    "feedback_details": "Detalhes do Feedback",
    "submit_feedback": "Enviar Feedback",
    "messaging": {
      "unknown_error": "Ocorreu um erro desconhecido.",
      "feedback_submitted": "Feedback enviado com sucesso. Obrigado!"
    }
  },
  "uk": {
    "feedback_form": "Форма зворотнього зв'язку",
    "feedback_form_intro": {
      "p1": "Використовуйте цю форму для надсилання відгуків про My Bible Log.",
      "p2": "Звіти про помилки, запити на функції та загальні коментарі вітаються."
    },
    "your_email": "Ваша електронна пошта",
    "what_kind_of_feedback": "Якого роду відгук ви надаєте?",
    "bug_report": "Звіт про помилку",
    "feature_request": "Запит функції",
    "general_comment": "Загальний коментар",
    "feedback_details": "Деталі відгуку",
    "submit_feedback": "Надіслати відгук",
    "messaging": {
      "unknown_error": "Сталася невідома помилка.",
      "feedback_submitted": "Відгук успішно надіслано. Дякуємо!"
    }
  }
}
</i18n>
