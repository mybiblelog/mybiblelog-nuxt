<template>
  <div class="container">
    <h2 class="title is-4">
      {{ $t('change_email') }}
    </h2>
    <template v-if="checkingForEmailChangeRequest">
      <div class="content">
        <p>{{ $t('checking_current_email_settings') }}</p>
      </div>
    </template>
    <template v-else-if="currentChangeEmailRequest">
      <div class="content">
        <p>
          {{ $t('current_request.your_current_email_is') }}
          <br>
          <strong>{{ $store.state.auth2.user.email }}</strong>
        </p>
        <p>
          {{ $t('current_request.your_requested_email_is') }}
          <br>
          <strong>{{ currentChangeEmailRequest.newEmail }}</strong>
        </p>
        <p>{{ $t('current_request.check_your_new_email') }}</p>
        <p>{{ $t('current_request.you_can_cancel') }}</p>
        <button class="button is-danger" @click="cancelChangeEmailRequest">
          {{ $t('current_request.cancel_request') }}
        </button>
      </div>
    </template>
    <template v-else>
      <div class="content">
        <p>{{ $t('new_request.enter_new_email') }}</p>
        <p>{{ $t('new_request.you_will_receive_an_email') }}</p>
        <div class="message">
          <div class="message-body">
            {{ $t('new_request.create_password.part_1') }}
            {{ $t('new_request.create_password.part_2') }}
            {{ $t('new_request.create_password.part_3') }}
          </div>
        </div>
      </div>
      <form :disabled="formBusy" @submit.prevent="submitChangeEmail()">
        <div v-if="changeEmailErrors._form" class="help is-danger">
          {{ $terr(changeEmailErrors._form) }}
        </div>
        <div class="field">
          <label class="label" for="newEmail">{{ $t('form.new_email') }}</label>
          <div class="control">
            <input v-model="changeEmailModel.newEmail" class="input" type="email" name="newEmail">
          </div>
          <div v-if="changeEmailErrors.newEmail" class="help is-danger">
            {{ $terr(changeEmailErrors.newEmail, { field: $t('form.new_email') }) }}
          </div>
        </div>
        <div class="field">
          <label class="label" for="password">{{ $t('form.password') }}</label>
          <div class="control">
            <input v-model="changeEmailModel.password" class="input" type="password" name="password">
          </div>
          <div v-if="changeEmailErrors.password" class="help is-danger">
            {{ $terr(changeEmailErrors.password, { field: $t('form.password') }) }}
          </div>
        </div>
        <div class="field">
          <div class="control">
            <button class="button is-primary" type="submit">
              {{ $t('form.change_email') }}
            </button>
          </div>
        </div>
      </form>
    </template>
  </div>
</template>

<script>
export default {
  name: 'EmailSettingsPage',
  middleware: ['auth2'],
  data() {
    return {
      formBusy: false, // if any form was submitted and is awaiting response
      changeEmailModel: { // 'Change Email' form data
        password: '',
        newEmail: '',
      },
      changeEmailErrors: { // 'Change Email' form errors
        _form: '',
        password: '',
        newEmail: '',
      },

      checkingForEmailChangeRequest: true,
      currentChangeEmailRequest: null, // { newEmail: string, expires: number }
    };
  },
  head() {
    return {
      meta: [
        { hid: 'robots', name: 'robots', content: 'noindex' },
      ],
    };
  },
  async mounted() {
    await this.checkChangeEmailRequestState();

    window.addEventListener('focus', this.checkChangeEmailRequestState);
  },
  beforeDestroy() {
    window.removeEventListener('focus', this.checkChangeEmailRequestState);
  },
  methods: {
    // Resets 'Change Email' form fields and errors.
    resetChangeEmailForm() {
      Object.assign(this.changeEmailModel, {
        password: '',
        newEmail: '',
      });
      this.resetChangeEmailErrors();
    },

    // Resets 'Change Email' form errors.
    resetChangeEmailErrors() {
      Object.assign(this.changeEmailErrors, {
        _form: '',
        password: '',
        newEmail: '',
      });
    },

    // Checks if there is an email change request in progress
    async checkChangeEmailRequestState() {
      await this.$axios.get('/api/auth/change-email')
        .then((response) => {
          this.currentChangeEmailRequest = response.data;
          this.checkingForEmailChangeRequest = false;
        });
    },

    // Submits 'Change Email' form data and handles response.
    submitChangeEmail() {
      // Disable form and remove previous errors
      this.formBusy = true;
      this.resetChangeEmailErrors();

      const { password, newEmail } = this.changeEmailModel;

      if (!password.length) {
        this.changeEmailErrors.password = this.$t('messaging.enter_your_current_password');
        return;
      }

      this.$axios.post('/api/auth/change-email', {
        password,
        newEmail,
      })
        .then((response) => {
          this.resetChangeEmailForm();
          this.$store.dispatch('toast/add', {
            type: 'success',
            text: this.$t('messaging.confirmation_link_sent'),
          });
        })
      // Display form errors form the server
        .catch((error) => {
          Object.assign(this.changeEmailErrors, error.response.data.errors);
        })
      // Account for actual server errors
        .catch(() => {
          this.changeEmailErrors._form = this.$t('messaging.an_unknown_error_occurred');
        })
      // Re-enable the form
        .then(() => {
          this.formBusy = false;
        })
        .then(this.checkChangeEmailRequestState);
    },

    async cancelChangeEmailRequest() {
      this.formBusy = true;
      try {
        const response = await this.$axios.delete('/api/auth/change-email');
        if (response.data === true) {
          this.currentChangeEmailRequest = null;
          await this.$store.dispatch('dialog/alert', {
            message: this.$t('messaging.your_request_was_cancelled'),
          });
        }
        else {
          this.$store.dispatch('toast/add', {
            type: 'error',
            text: this.$t('messaging.unable_to_cancel_request'),
          });
        }
      }
      catch (err) {
        this.$store.dispatch('toast/add', {
          type: 'error',
          text: this.$t('messaging.something_went_wrong'),
        });
      }
      this.formBusy = false;
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
    "change_email": "E-Mail ändern",
    "checking_current_email_settings": "Aktuelle E-Mail-Einstellungen werden überprüft...",
    "current_request": {
      "your_current_email_is": "Ihre aktuelle E-Mail-Adresse ist:",
      "your_requested_email_is": "Sie haben angefragt, Ihre E-Mail-Adresse zu ändern zu:",
      "check_your_new_email": "Bitte überprüfen Sie Ihre neue E-Mail-Adresse, um den Wechsel zu bestätigen. Möglicherweise müssen Sie diese Seite später aktualisieren.",
      "you_can_cancel": "Sie können auch Ihre E-Mail-Änderungsanfrage stornieren, um Ihre aktuelle E-Mail-Adresse beizubehalten.",
      "cancel_request": "Anfrage stornieren"
    },
    "new_request": {
      "enter_new_email": "Geben Sie Ihre neue E-Mail-Adresse sowie Ihr aktuelles Passwort ein.",
      "you_will_receive_an_email": "Sie erhalten eine E-Mail an der neuen Adresse, um den Wechsel zu bestätigen.",
      "create_password": {
        "part_1": "Wenn Sie sich mit Google anmelden, möchten Sie möglicherweise kein Passwort haben.",
        "part_2": "Sie können ein Passwort erstellen, indem Sie sich abmelden und dann zur Anmeldeseite gehen.",
        "part_3": "Verwenden Sie den Link \"Passwort vergessen?\", der Ihnen ein Passwort erstellen wird."
      }
    },
    "form": {
      "new_email": "Neue E-Mail-Adresse",
      "password": "Aktuelles Passwort",
      "change_email": "E-Mail ändern"
    },
    "messaging": {
      "enter_your_current_password": "Geben Sie Ihr aktuelles Passwort ein.",
      "confirmation_link_sent": "Eine Bestätigungs-E-Mail wurde an Ihre neue E-Mail-Adresse gesendet. Klicken Sie auf den Link, um den Wechsel abzuschließen.",
      "an_unknown_error_occurred": "Ein unbekannter Fehler ist aufgetreten.",
      "your_request_was_cancelled": "Ihre E-Mail-Änderungsanfrage wurde storniert.",
      "unable_to_cancel_request": "Die Anfrage konnte nicht storniert werden. Möglicherweise wurde sie bereits ausgeführt.",
      "something_went_wrong": "Etwas ist schiefgegangen. Bitte versuchen Sie es erneut."
    }
  },
  "en": {
    "change_email": "Change Email",
    "checking_current_email_settings": "Checking current email settings...",
    "current_request": {
      "your_current_email_is": "Your current email address is:",
      "your_requested_email_is": "You requested to change your email address to:",
      "check_your_new_email": "Please check your new email address to confirm the change. You may need to refresh this page afterward.",
      "you_can_cancel": "You can also cancel your email change request to keep your current email.",
      "cancel_request": "Cancel Request"
    },
    "new_request": {
      "enter_new_email": "Enter your new email along with your current password.",
      "you_will_receive_an_email": "You will receive an email at the new address to confirm the change.",
      "create_password": {
        "part_1": "If you sign in using Google, you might not have a password.",
        "part_2": "You can create a password by logging out, then going to the sign in page.",
        "part_3": "Use the \"Forgot your password?\" link, which will allow you to create a password."
      }
    },
    "form": {
      "new_email": "New Email",
      "password": "Current Password",
      "change_email": "Change Email"
    },
    "messaging": {
      "enter_your_current_password": "Enter your current password.",
      "confirmation_link_sent": "A confirmation link has been sent to your new email address. Click the link to finish changing your email.",
      "an_unknown_error_occurred": "An unknown error occurred.",
      "your_request_was_cancelled": "Your email change request was cancelled.",
      "unable_to_cancel_request": "Unable to cancel request. It may already be fulfilled.",
      "something_went_wrong": "Something went wrong. Please try again."
    }
  },
  "es": {
    "change_email": "Cambiar Correo Electrónico",
    "checking_current_email_settings": "Comprobando la configuración de correo electrónico actual...",
    "current_request": {
      "your_current_email_is": "Su dirección de correo electrónico actual es:",
      "your_requested_email_is": "Solicitó cambiar su dirección de correo electrónico a:",
      "check_your_new_email": "Por favor, compruebe su nueva dirección de correo electrónico para confirmar el cambio. Es posible que tenga que actualizar esta página después.",
      "you_can_cancel": "También puede cancelar su solicitud de cambio de correo electrónico para mantener su correo electrónico actual.",
      "cancel_request": "Cancelar Solicitud"
    },
    "new_request": {
      "enter_new_email": "Introduzca su nuevo correo electrónico junto con su contraseña actual.",
      "you_will_receive_an_email": "Recibirá un correo electrónico en la nueva dirección para confirmar el cambio.",
      "create_password": {
        "part_1": "Si inicia sesión con Google, es posible que no tenga una contraseña.",
        "part_2": "Puede crear una contraseña cerrando la sesión y luego yendo a la página de inicio de sesión.",
        "part_3": "Utilice el enlace \"¿Olvidó su contraseña?\", que le permitirá crear una contraseña."
      }
    },
    "form": {
      "new_email": "Nuevo Correo Electrónico",
      "password": "Contraseña Actual",
      "change_email": "Cambiar Correo Electrónico"
    },
    "messaging": {
      "enter_your_current_password": "Introduzca su contraseña actual.",
      "confirmation_link_sent": "Se ha enviado un enlace de confirmación a su nueva dirección de correo electrónico. Haga clic en el enlace para terminar de cambiar su correo electrónico.",
      "an_unknown_error_occurred": "Ocurrió un error desconocido.",
      "your_request_was_cancelled": "Su solicitud de cambio de correo electrónico fue cancelada.",
      "unable_to_cancel_request": "No se puede cancelar la solicitud. Es posible que ya esté cumplida.",
      "something_went_wrong": "Algo salió mal. Por favor, inténtelo de nuevo."
    }
  },
  "fr": {
    "change_email": "Changer Email",
    "checking_current_email_settings": "Vérification des paramètres d'email actuels...",
    "current_request": {
      "your_current_email_is": "Votre adresse email actuelle est :",
      "your_requested_email_is": "Vous avez demandé à changer votre adresse email pour :",
      "check_your_new_email": "Veuillez vérifier votre nouvelle adresse email pour confirmer le changement. Vous devrez peut-être rafraîchir cette page par la suite.",
      "you_can_cancel": "Vous pouvez également annuler votre demande de changement d'email pour conserver votre adresse email actuelle.",
      "cancel_request": "Annuler la Demande"
    },
    "new_request": {
      "enter_new_email": "Entrez votre nouvelle adresse email ainsi que votre mot de passe actuel.",
      "you_will_receive_an_email": "Vous recevrez un email à la nouvelle adresse pour confirmer le changement.",
      "create_password": {
        "part_1": "Si vous vous connectez avec Google, vous pourriez ne pas avoir de mot de passe.",
        "part_2": "Vous pouvez créer un mot de passe en vous déconnectant, puis en allant à la page de connexion.",
        "part_3": "Utilisez le lien \"Mot de passe oublié?\", qui vous permettra de créer un mot de passe."
      }
    },
    "form": {
      "new_email": "Nouvel Email",
      "password": "Mot de passe actuel",
      "change_email": "Changer l'Email"
    },
    "messaging": {
      "enter_your_current_password": "Entrez votre mot de passe actuel.",
      "confirmation_link_sent": "Un lien de confirmation a été envoyé à votre nouvelle adresse e-mail. Cliquez sur le lien pour terminer la modification de votre e-mail.",
      "an_unknown_error_occurred": "Une erreur inconnue s'est produite.",
      "your_request_was_cancelled": "Votre demande de changement d'e-mail a été annulée.",
      "unable_to_cancel_request": "Impossible d'annuler la demande. Elle peut déjà être satisfaite.",
      "something_went_wrong": "Quelque chose s'est mal passé. Veuillez réessayer."
    }
  },
  "pt": {
    "change_email": "Alterar Email",
    "checking_current_email_settings": "Verificando as configurações de email atuais...",
    "current_request": {
      "your_current_email_is": "Seu endereço de email atual é:",
      "your_requested_email_is": "Você solicitou a alteração do seu endereço de email para:",
      "check_your_new_email": "Por favor, verifique seu novo endereço de email para confirmar a alteração. Você pode precisar atualizar esta página depois.",
      "you_can_cancel": "Você também pode cancelar sua solicitação de alteração de email para manter seu email atual.",
      "cancel_request": "Cancelar Solicitação"
    },
    "new_request": {
      "enter_new_email": "Insira seu novo email juntamente com sua senha atual.",
      "you_will_receive_an_email": "Você receberá um email no novo endereço para confirmar a alteração.",
      "create_password": {
        "part_1": "Se você faz login usando o Google, você pode não ter uma senha.",
        "part_2": "É possível criar uma senha saindo e indo para a página de login.",
        "part_3": "Use o link \"Esqueceu sua senha?\", que permitirá criar uma senha."
      }
    },
    "form": {
      "new_email": "Novo E-mail",
      "password": "Senha Atual",
      "change_email": "Alterar E-mail"
    },
    "messaging": {
      "enter_your_current_password": "Digite sua senha atual.",
      "confirmation_link_sent": "Um link de confirmação foi enviado para o seu novo endereço de e-mail. Clique no link para concluir a alteração do seu e-mail.",
      "an_unknown_error_occurred": "Ocorreu um erro desconhecido.",
      "your_request_was_cancelled": "Seu pedido de alteração de e-mail foi cancelado.",
      "unable_to_cancel_request": "Não foi possível cancelar o pedido. Pode já ter sido concluído.",
      "something_went_wrong": "Algo deu errado. Por favor, tente novamente."
    }
  },
  "uk": {
    "change_email": "Змінити Email",
    "checking_current_email_settings": "Перевірка поточних налаштувань електронної пошти...",
    "current_request": {
      "your_current_email_is": "Ваш поточний електронний адреса:",
      "your_requested_email_is": "Ви подали запит на зміну електронної адреси на:",
      "check_your_new_email": "Будь ласка, перевірте свою нову електронну адресу для підтвердження змін. Можливо, вам доведеться оновити цю сторінку після цього.",
      "you_can_cancel": "Ви також можете відмінити запит на зміну електронної адреси, щоб залишити ваш поточний електронний адресу.",
      "cancel_request": "Скасувати запит"
    },
    "new_request": {
      "enter_new_email": "Введіть свою нову електронну адресу разом з вашим поточним паролем.",
      "you_will_receive_an_email": "Ви отримаєте лист на новій адресі для підтвердження змін.",
      "create_password": {
        "part_1": "Якщо ви увійшли за допомогою Google, у вас, можливо, немає пароля.",
        "part_2": "Ви можете створити пароль, вийшовши з облікового запису, а потім перейшовши на сторінку входу.",
        "part_3": "Використовуйте посилання \"Забули пароль?\", яке дозволить вам створити пароль."
      }
    },
    "form": {
      "new_email": "Новий Email",
      "password": "Поточний Пароль",
      "change_email": "Змінити Email"
    },
    "messaging": {
      "enter_your_current_password": "Введіть свій поточний пароль.",
      "confirmation_link_sent": "Посилання для підтвердження було відправлено на вашу нову електронну адресу. Клацніть по посиланню, щоб завершити зміну електронної адреси.",
      "an_unknown_error_occurred": "Сталася невідома помилка.",
      "your_request_was_cancelled": "Ваш запит на зміну електронної адреси було скасовано.",
      "unable_to_cancel_request": "Не вдалося скасувати запит. Можливо, він вже виконаний.",
      "something_went_wrong": "Щось пішло не так. Будь ласка, спробуйте знову."
    }
  }
}
</i18n>
