<template>
  <form @submit.prevent="submitFeedback">
    <div v-if="errors._form" class="help is-danger">
      <div class="help is-danger">
        {{ $terr(errors._form) }}
      </div>
    </div>
    <div class="field">
      <label class="label">{{ $t('your_email') }}</label>
      <div class="control">
        <input v-model="form.email" class="input" type="email" :placeholder="$t('your_email')" :disabled="$store.state.auth.loggedIn">
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
</template>

<script>
import mapFormErrors from '~/helpers/map-form-errors';

export default {
  name: 'FeedbackForm',
  data() {
    return {
      form: {
        email: this.$store.state.auth.user?.email || '',
        kind: 'bug',
        message: '',
      },
      errors: {},
    };
  },
  methods: {
    async submitFeedback() {
      this.errors = {};
      try {
        const response = await fetch('/api/feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            email: this.form.email,
            kind: this.form.kind,
            message: this.form.message,
          }),
        });
        if (!response.ok) {
          const responseData = await response.json();
          const error = new Error('Failed to submit feedback');
          error.response = { data: responseData };
          throw error;
        }

        // Clear the form
        this.form.kind = 'bug';
        this.form.message = '';

        await this.$store.dispatch('dialog/alert', {
          message: this.$t('messaging.feedback_submitted'),
        });

        // Emit success event so parent can handle (e.g., close modal)
        this.$emit('success');
      }
      catch (err) {
        const unknownError = { _form: this.$t('messaging.unknown_error') };
        const errorData = err.response?.data;
        if (errorData?.error) {
          this.errors = mapFormErrors(errorData.error) || unknownError;
        }
        else {
          this.errors = unknownError;
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
//
</style>

<i18n lang="json">
{
  "de": {
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
