<template>
  <main>
    <div class="content-column">
      <h1 class="title">
        {{ $t('change_email') }}
      </h1>
      <template v-if="busy">
        <div class="content">
          <p>{{ $t('confirming_your_new_email_address') }}</p>
        </div>
      </template>
      <template v-if="codeExpired">
        <div class="content">
          <p>{{ $t('your_email_change_request_has_expired') }}</p>
          <p>{{ $t('please_go_to_your_settings_and_try_changing_your_email_address_again') }}</p>
        </div>
      </template>
      <template v-if="serverError">
        <div class="content">
          <p>{{ $t('there_was_an_error_changing_your_email_address') }}</p>
          <p v-if="serverError">
            {{ serverError }}
          </p>
          <p>{{ $t('please_go_to_your_settings_and_try_changing_your_email_address_again') }}</p>
        </div>
      </template>
    </div>
  </main>
</template>

<script>
export default {
  name: 'ChangeEmailPage',
  data() {
    return {
      newEmail: '',
      busy: true,
      codeExpired: false,
      serverError: '',
    };
  },
  head() {
    return {
      title: this.$t('change_email'),
      meta: [
        { hid: 'robots', name: 'robots', content: 'noindex' },
      ],
    };
  },
  async mounted() {
    const newEmailVerificationCode = new URL(window.location.href).searchParams.get('code');
    if (!newEmailVerificationCode) {
      this.$router.push(this.localePath('/settings/email'));
      return;
    }

    // Determine if change email code is valid
    let changeEmailRequest;
    try {
      const response = await fetch(`/api/auth/change-email/${newEmailVerificationCode}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to get change email request');
      }
      const responseData = await response.json();
      changeEmailRequest = responseData.data;
    }
    catch (err) {
      // If there is no open email change request (404), redirect to the settings page
      // which will show the user's current email address
      this.$router.push(this.localePath('/settings'));
      return;
    }

    const { newEmail, expires } = changeEmailRequest;
    this.newEmail = newEmail;
    if (Date.now() > expires) {
      this.codeExpired = true;
      this.busy = false;
      return;
    }

    // Submit change email code to finalize the update
    try {
      const response = await fetch(`/api/auth/change-email/${newEmailVerificationCode}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (!response.ok) {
        const responseData = await response.json();
        this.serverError = responseData.error;
        this.busy = false;
        return;
      }
    }
    catch (err) {
      this.serverError = this.$t('an_unknown_error_occurred');
      this.busy = false;
      return;
    }

    // Display confirmation toast
    this.$store.dispatch('toast/add', {
      type: 'success',
      text: this.$t('your_email_address_was_updated_successfully'),
    });

    // Reload user now that auth cookie should be set
    await this.$store.dispatch('auth/refreshUser');

    // Redirect to the settings page, which displays the current email
    this.$router.push(this.localePath('/settings'));
  },
  // NO auth middleware -- this page will be accessible via email link
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
    "change_email": "E-Mail ändern",
    "confirming_your_new_email_address": "Bestätige deine neue E-Mail-Adresse...",
    "your_email_change_request_has_expired": "Deine E-Mail-Änderungsanfrage ist abgelaufen.",
    "please_go_to_your_settings_and_try_changing_your_email_address_again": "Gehe zu deinen Einstellungen und versuche erneut, deine E-Mail-Adresse zu ändern.",
    "there_was_an_error_changing_your_email_address": "Es gab einen Fehler beim Ändern deiner E-Mail-Adresse.",
    "an_unknown_error_occurred": "Ein unbekannter Fehler ist aufgetreten.",
    "your_email_address_was_updated_successfully": "Deine E-Mail-Adresse wurde erfolgreich aktualisiert."
  },
  "en": {
    "change_email": "Change Email",
    "confirming_your_new_email_address": "Confirming your new email address...",
    "your_email_change_request_has_expired": "Your email change request has expired.",
    "please_go_to_your_settings_and_try_changing_your_email_address_again": "Please go to your settings and try changing your email address again.",
    "there_was_an_error_changing_your_email_address": "There was an error changing your email address.",
    "an_unknown_error_occurred": "An unknown error occurred.",
    "your_email_address_was_updated_successfully": "Your email address was updated successfully."
  },
  "es": {
    "change_email": "Cambiar Correo Electrónico",
    "confirming_your_new_email_address": "Confirmando su nueva dirección de correo electrónico...",
    "your_email_change_request_has_expired": "Su solicitud de cambio de correo electrónico ha caducado.",
    "please_go_to_your_settings_and_try_changing_your_email_address_again": "Por favor, vaya a su configuración e intente cambiar su dirección de correo electrónico de nuevo.",
    "there_was_an_error_changing_your_email_address": "Hubo un error al cambiar su dirección de correo electrónico.",
    "an_unknown_error_occurred": "Ocurrió un error desconocido.",
    "your_email_address_was_updated_successfully": "Su dirección de correo electrónico se actualizó correctamente."
  },
  "fr": {
    "change_email": "Changer l'e-mail",
    "confirming_your_new_email_address": "Confirmation de votre nouvelle adresse e-mail...",
    "your_email_change_request_has_expired": "Votre demande de changement d'e-mail a expiré.",
    "please_go_to_your_settings_and_try_changing_your_email_address_again": "Veuillez vous rendre dans vos paramètres et essayer de changer à nouveau votre adresse e-mail.",
    "there_was_an_error_changing_your_email_address": "Une erreur s'est produite lors du changement de votre adresse e-mail.",
    "an_unknown_error_occurred": "Une erreur inconnue s'est produite.",
    "your_email_address_was_updated_successfully": "Votre adresse e-mail a été mise à jour avec succès."
  },
  "pt": {
    "change_email": "Alterar E-mail",
    "confirming_your_new_email_address": "Confirmando seu novo endereço de e-mail...",
    "your_email_change_request_has_expired": "Seu pedido de alteração de e-mail expirou.",
    "please_go_to_your_settings_and_try_changing_your_email_address_again": "Por favor, acesse suas configurações e tente alterar seu endereço de e-mail novamente.",
    "there_was_an_error_changing_your_email_address": "Houve um erro ao alterar seu endereço de e-mail.",
    "an_unknown_error_occurred": "Ocorreu um erro desconhecido.",
    "your_email_address_was_updated_successfully": "Seu endereço de e-mail foi atualizado com sucesso."
  },
  "uk": {
    "change_email": "Змінити електронну адресу",
    "confirming_your_new_email_address": "Підтвердження вашої нової електронної адреси...",
    "your_email_change_request_has_expired": "Ваш запит на зміну електронної адреси застарів.",
    "please_go_to_your_settings_and_try_changing_your_email_address_again": "Будь ласка, перейдіть до налаштувань і спробуйте змінити свою електронну адресу знову.",
    "there_was_an_error_changing_your_email_address": "Під час зміни вашої електронної адреси сталася помилка.",
    "an_unknown_error_occurred": "Сталася невідома помилка.",
    "your_email_address_was_updated_successfully": "Ваша електронна адреса була успішно оновлена."
  }
}
</i18n>
