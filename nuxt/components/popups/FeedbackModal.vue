<template>
  <app-modal :open="isVisible" :title="$t('feedback_form')" @close="close">
    <template slot="content">
      <div class="mbl-content">
        <p>{{ $t('feedback_form_intro.p1') }}</p>
        <p>{{ $t('feedback_form_intro.p2') }}</p>
      </div>
      <feedback-form @success="handleSuccess" @dirty-change="handleDirtyChange" />
    </template>
  </app-modal>
</template>

<script>
import FeedbackForm from '@/components/forms/FeedbackForm.vue';
import AppModal from '@/components/popups/AppModal.vue';
import { useDialogStore } from '~/stores/dialog';

export default {
  name: 'FeedbackModal',
  components: {
    FeedbackForm,
    AppModal,
  },
  props: {
    isVisible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isFormDirty: false,
    };
  },
  methods: {
    async close() {
      if (this.isFormDirty) {
        const dialogStore = useDialogStore();
        const confirmed = await dialogStore.confirm({
          message: this.$t('messaging.are_you_sure_close_feedback_form'),
        });
        if (!confirmed) { return; }
      }

      this.$emit('close');
    },
    handleDirtyChange(isDirty) {
      this.isFormDirty = isDirty;
    },
    handleSuccess() {
      // Close modal after successful submission
      this.isFormDirty = false;
      this.$emit('close');
    },
  },
};
</script>

<i18n lang="json">
{
  "en": {
    "feedback_form": "Feedback Form",
    "feedback_form_intro": {
      "p1": "Use this form to submit feedback for My Bible Log.",
      "p2": "Bug reports, feature requests, and general comments are all welcome."
    },
    "messaging": {
      "are_you_sure_close_feedback_form": "Are you sure you want to close the feedback form? All unsaved changes will be lost."
    }
  },
  "de": {
    "feedback_form": "Feedback-Formular",
    "feedback_form_intro": {
      "p1": "Verwenden Sie dieses Formular, um Feedback für My Bible Log einzureichen.",
      "p2": "Fehlerberichte, Funktionsanfragen und allgemeine Kommentare sind willkommen."
    },
    "messaging": {
      "are_you_sure_close_feedback_form": "Möchten Sie das Feedback-Formular wirklich schließen? Alle ungespeicherten Änderungen gehen verloren."
    }
  },
  "es": {
    "feedback_form": "Formulario de Comentarios",
    "feedback_form_intro": {
      "p1": "Utilice este formulario para enviar comentarios sobre My Bible Log.",
      "p2": "Los informes de errores, las solicitudes de funciones y los comentarios generales son bienvenidos."
    },
    "messaging": {
      "are_you_sure_close_feedback_form": "¿Estás seguro de que quieres cerrar el formulario de comentarios? Todas las modificaciones no guardadas se perderán."
    }
  },
  "fr": {
    "feedback_form": "Formulaire de Commentaires",
    "feedback_form_intro": {
      "p1": "Utilisez ce formulaire pour soumettre des commentaires pour My Bible Log.",
      "p2": "Les rapports de bogues, les demandes de fonctionnalités et les commentaires généraux sont les bienvenus."
    },
    "messaging": {
      "are_you_sure_close_feedback_form": "Êtes-vous sûr de vouloir fermer le formulaire de commentaires ? Toutes les modifications non enregistrées seront perdues."
    }
  },
  "ko": {
    "feedback_form": "피드백 양식",
    "feedback_form_intro": {
      "p1": "이 양식을 통해 My Bible Log에 대한 피드백을 보내주세요.",
      "p2": "버그 신고, 기능 제안, 일반 의견 모두 환영합니다."
    },
    "messaging": {
      "are_you_sure_close_feedback_form": "피드백 양식을 닫을까요? 저장하지 않은 변경 내용이 사라집니다."
    }
  },
  "pt": {
    "feedback_form": "Formulário de Feedback",
    "feedback_form_intro": {
      "p1": "Use este formulário para enviar feedback para My Bible Log.",
      "p2": "Relatórios de bugs, solicitações de recursos e comentários gerais são bem-vindos."
    },
    "messaging": {
      "are_you_sure_close_feedback_form": "Tem certeza de que deseja fechar o formulário de feedback? Todas as modificações não salvas serão perdidas."
    }
  },
  "uk": {
    "feedback_form": "Форма зворотнього зв'язку",
    "feedback_form_intro": {
      "p1": "Використовуйте цю форму для надсилання відгуків про My Bible Log.",
      "p2": "Звіти про помилки, запити на функції та загальні коментарі вітаються."
    },
    "messaging": {
      "are_you_sure_close_feedback_form": "Ви впевнені, що хочете закрити форму зворотного зв'язку? Всі незбережені зміни будуть втрачені."
    }
  }
}
</i18n>
