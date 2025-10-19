<template>
  <div>
    <div class="container content">
      <h1 class="title is-4">
        {{ $t('title') }}
      </h1>
      <div class="content">
        <p>{{ $t('description') }}</p>
        <ul>
          <li>{{ $t('list.account') }}</li>
          <li>{{ $t('list.log_entries') }}</li>
          <li>{{ $t('list.notes') }}</li>
          <li>{{ $t('list.export') }}</li>
          <li>{{ $t('list.permanent') }}</li>
        </ul>
      </div>
      <div class="card">
        <div class="card-content">
          <form>
            <div class="field">
              <label class="checkbox">
                <input v-model="understand.logEntries" type="checkbox"> {{ $t('understand.log_entries') }}
              </label>
            </div>
            <div class="field">
              <label class="checkbox">
                <input v-model="understand.export" type="checkbox"> {{ $t('understand.export') }}
              </label>
            </div>
            <div class="field">
              <label class="checkbox">
                <input v-model="understand.notes" type="checkbox"> {{ $t('understand.notes') }}
              </label>
            </div>
            <div class="field">
              <label class="checkbox">
                <input v-model="understand.permanent" type="checkbox"> {{ $t('understand.permanent') }}
              </label>
            </div>
          </form>
          <button class="button is-primary" :disabled="!fullyUnderstands" @click="deleteAccount">
            {{ $t('delete_my_account') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DeleteAccountPage',
  middleware: ['auth'],
  data() {
    return {
      formBusy: false,
      understand: {
        logEntries: false,
        export: false,
        notes: false,
        permanent: false,
      },
    };
  },
  head() {
    return {
      meta: [
        { hid: 'robots', name: 'robots', content: 'noindex' },
      ],
    };
  },
  computed: {
    fullyUnderstands() {
      return (
        this.understand.logEntries &&
        this.understand.export &&
        this.understand.notes &&
        this.understand.permanent
      );
    },
  },
  methods: {
    deleteAccount() {
      this.$axios.put('/api/settings/delete-account', {})
        .then(() => this.$auth.logout())
        .catch(() => {
          this.$store.dispatch('toast/add', {
            type: 'error',
            text: this.$t('unable_to_delete'),
          });
        });
    },
  },
};
</script>

<style lang="scss" scoped>
main p {
  margin-bottom: 1rem;
}
</style>

<i18n lang="json">
{
  "de": {
    "title": "Konto löschen",
    "description": "Sie haben die Kontrolle über Ihre Daten. Sie können Ihr Konto und alle mit ihm verbundenen Daten löschen:",
    "list": {
      "account": "Dies wird Ihr Konto und Ihre persönlichen Einstellungen dauerhaft löschen.",
      "log_entries": "Dies wird Ihre Einträge im Journal dauerhaft löschen.",
      "notes": "Dies wird Ihre Notizen und benutzerdefinierten Tags dauerhaft löschen.",
      "export": "Sie müssen Ihre Einträge im Journal exportieren, bevor Sie Ihr Konto löschen, wenn Sie sie beibehalten möchten.",
      "permanent": "Diese Aktion kann nicht rückgängig gemacht werden."
    },
    "understand": {
      "log_entries": "Ich verstehe, dass dies alle Daten meiner Einträge im Journal löscht.",
      "export": "Ich verstehe, dass ich derzeit meine Einträge im Journal für meine eigene Verwendung exportieren kann, was ich nicht nach dem Löschen meines Kontos tun kann.",
      "notes": "Ich verstehe, dass dies alle meine Notizen und Tags dauerhaft löscht.",
      "permanent": "Ich verstehe, dass diese Aktion dauerhaft ist und nicht rückgängig gemacht werden kann."
    },
    "delete_my_account": "Mein Konto löschen",
    "unable_to_delete": "Das Konto kann nicht gelöscht werden. Bitte versuchen Sie es später erneut."
  },
  "en": {
    "title": "Delete Account",
    "description": "You are in control of your data. You can delete your account and all data associated with it:",
    "list": {
      "account": "This will permanently delete your account and personal settings.",
      "log_entries": "This will permanently delete your log entries.",
      "notes": "This will permanently delete your notes and custom tags.",
      "export": "You must export your log entries before you delete your account if you wish to keep them.",
      "permanent": "This action cannot be reversed."
    },
    "understand": {
      "log_entries": "I understand that this will delete all of my log entry data.",
      "export": "I understand that I can currently export my log entry data for my own use, which I cannot do after deleting my account.",
      "notes": "I understand that this will delete all of my notes and tags.",
      "permanent": "I understand that this action is permanent and cannot be reversed."
    },
    "delete_my_account": "Delete My Account",
    "unable_to_delete": "Unable to delete account. Please try again later."
  },
  "es": {
    "title": "Eliminar cuenta",
    "description": "Usted está en control de sus datos. Puede eliminar su cuenta y todos los datos asociados con ella:",
    "list": {
      "account": "Esto eliminará permanentemente su cuenta y configuraciones personales.",
      "log_entries": "Esto eliminará permanentemente sus entradas de registro.",
      "notes": "Esto eliminará permanentemente sus notas y etiquetas personalizadas.",
      "export": "Debe exportar sus entradas de registro antes de eliminar su cuenta si desea conservarlas.",
      "permanent": "Esta acción no se puede revertir."
    },
    "understand": {
      "log_entries": "Entiendo que esto eliminará todos los datos de mi entrada de registro.",
      "export": "Entiendo que actualmente puedo exportar mis datos de entrada de registro para mi propio uso, lo que no puedo hacer después de eliminar mi cuenta.",
      "notes": "Entiendo que esto eliminará todas las notas y etiquetas.",
      "permanent": "Entiendo que la acción es permanente y no se puede revertir."
    },
    "delete_my_account": "Eliminar mi cuenta",
    "unable_to_delete": "No se puede eliminar la cuenta. Por favor, inténtelo de nuevo más tarde."
  },
  "fr": {
    "title": "Supprimer le compte",
    "description": "Vous avez le contrôle de vos données. Vous pouvez supprimer votre compte et toutes les données associées :",
    "list": {
      "account": "Cela supprimera définitivement votre compte et vos paramètres personnels.",
      "log_entries": "Cela supprimera définitivement vos entrées de journal.",
      "notes": "Cela supprimera définitivement vos notes et étiquettes personnalisées.",
      "export": "Vous devez exporter vos entrées de journal avant de supprimer votre compte si vous souhaitez les conserver.",
      "permanent": "Cette action ne peut pas être inversée."
    },
    "understand": {
      "log_entries": "Je comprends que cela supprimera toutes mes données d'entrée de journal.",
      "export": "Je comprends que je peux actuellement exporter mes données d'entrée de journal pour mon usage personnel, ce que je ne pourrai pas faire après la suppression de mon compte.",
      "notes": "Je comprends que cela supprimera toutes les notes et étiquettes.",
      "permanent": "Je comprends que l'action est permanente et ne peut pas être annulée."
    },
    "delete_my_account": "Supprimer Mon Compte",
    "unable_to_delete": "Impossible de supprimer le compte. Veuillez réessayer plus tard."
  },
  "pt": {
    "title": "Apagar Conta",
    "description": "Você está no controle dos seus dados. Você pode apagar sua conta e todos os dados associados a ela:",
    "list": {
      "account": "Isso irá apagar permanentemente sua conta e configurações pessoais.",
      "log_entries": "Isso irá apagar permanentemente suas entradas de log.",
      "notes": "Isso irá apagar permanentemente suas notas e tags personalizadas.",
      "export": "Você precisa exportar suas entradas de log antes de apagar sua conta se deseja mantê-las.",
      "permanent": "Essa ação não pode ser revertida."
    },
    "understand": {
      "log_entries": "Eu entendo que isso irá apagar todos os dados de minhas entradas de log.",
      "export": "Eu entendo que posso atualmente exportar meus dados de entrada de log para meu próprio uso, o que não posso fazer após apagar minha conta.",
      "notes": "Eu entendo que isso irá apagar todas as minhas notas e tags.",
      "permanent": "Eu entendo que esta ação é permanente e não pode ser revertida."
    },
    "delete_my_account": "Excluir Minha Conta",
    "unable_to_delete": "Não foi possível excluir a conta. Por favor, tente novamente mais tarde."
  },
  "uk": {
    "title": "Видалити обліковий запис",
    "description": "Ви контролюєте свої дані. Ви можете видалити свій обліковий запис та всі пов'язані з ним дані:",
    "list": {
      "account": "Це назавжди видалить ваш обліковий запис та персональні налаштування.",
      "log_entries": "Це назавжди видалить ваші записи журналу.",
      "notes": "Це назавжди видалить ваші нотатки та власні теги.",
      "export": "Ви повинні експортувати свої записи журналу, перш ніж видалити свій обліковий запис, якщо хочете зберегти їх.",
      "permanent": "Ця дія не може бути скасована."
    },
    "understand": {
      "log_entries": "Я розумію, що це видалить всі дані мого запису журналу.",
      "export": "Я розумію, що зараз я можу експортувати свої дані запису журналу для власного використання, що я не можу зробити після видалення облікового запису.",
      "notes": "Я розумію, що це видалить всі нотатки та теги.",
      "permanent": "Я розумію, що дія є постійною і не може бути скасована."
    },
    "delete_my_account": "Видалити мій обліковий запис",
    "unable_to_delete": "Неможливо видалити обліковий запис. Будь ласка, спробуйте знову пізніше."
  }
}
</i18n>
