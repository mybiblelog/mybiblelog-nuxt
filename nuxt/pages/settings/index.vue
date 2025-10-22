<template>
  <div>
    <div class="container content">
      <h1 class="title is-4">
        {{ $t('account') }}
      </h1>
      <div class="content">
        <p>
          <em>{{ $auth.user.email }}</em>
        </p>
        <p>
          <nuxt-link class="button is-primary" :to="localePath('/settings/email')">
            {{ $t('change_email') }}
          </nuxt-link>
        </p>
      </div>
      <template v-if="$auth.user.hasLocalAccount">
        <h2 class="title is-4">
          {{ $t('password') }}
        </h2>
        <div class="content">
          <p>{{ $t('you_can_change_your_password_below') }}</p>
          <p>
            <nuxt-link class="button is-primary" :to="localePath('/settings/password')">
              {{ $t('change_password') }}
            </nuxt-link>
          </p>
        </div>
      </template>
      <h2 class="title is-4">
        {{ $t('delete_account') }}
      </h2>
      <div class="content">
        <p>{{ $t('you_are_in_control') }}</p>
        <p>
          <nuxt-link :to="localePath('/settings/delete-account')">
            {{ $t('learn_more') }}
          </nuxt-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SettingsPage',
  middleware: ['auth'],
  data() {
    return {
    };
  },
  async fetch() {
    await this.$store.dispatch('loadUserData');
  },
  head() {
    return {
      meta: [
        { hid: 'robots', name: 'robots', content: 'noindex' },
      ],
    };
  },
  computed: {
    userSettings() {
      return this.$store.state['user-settings'].settings;
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
    "account": "Konto",
    "email": "E-Mail",
    "change_email": "E-Mail ändern",
    "password": "Passwort",
    "you_can_change_your_password_below": "Sie können Ihr Passwort unten ändern.",
    "change_password": "Passwort ändern",
    "delete_account": "Konto löschen",
    "you_are_in_control": "Sie haben die Kontrolle über Ihre Daten. Sie können Ihr Konto und alle mit ihm verbundenen Daten löschen.",
    "learn_more": "Mehr erfahren"
  },
  "en": {
    "account": "Account",
    "email": "Email",
    "change_email": "Change Email",
    "password": "Password",
    "you_can_change_your_password_below": "You can change your password below.",
    "change_password": "Change Password",
    "delete_account": "Delete Account",
    "you_are_in_control": "You are in control of your data. You can delete your account and all data associated with it.",
    "learn_more": "Learn More"
  },
  "es": {
    "account": "Cuenta",
    "email": "Correo electrónico",
    "change_email": "Cambiar correo electrónico",
    "password": "Contraseña",
    "you_can_change_your_password_below": "Puede cambiar su contraseña a continuación.",
    "change_password": "Cambiar contraseña",
    "delete_account": "Eliminar cuenta",
    "you_are_in_control": "Usted tiene el control de sus datos. Puede eliminar su cuenta y todos los datos asociados a ella.",
    "learn_more": "Aprende más"
  },
  "fr": {
    "account": "Compte",
    "email": "Email",
    "change_email": "Changer Email",
    "password": "Mot de passe",
    "you_can_change_your_password_below": "Vous pouvez changer votre mot de passe ci-dessous.",
    "change_password": "Changer Mot de passe",
    "delete_account": "Supprimer Compte",
    "you_are_in_control": "Vous êtes en contrôle de vos données. Vous pouvez supprimer votre compte et toutes les données qui y sont associées.",
    "learn_more": "En savoir plus"
  },
  "pt": {
    "account": "Conta",
    "email": "Email",
    "change_email": "Alterar Email",
    "password": "Senha",
    "you_can_change_your_password_below": "Você pode alterar sua senha abaixo.",
    "change_password": "Alterar Senha",
    "delete_account": "Excluir Conta",
    "you_are_in_control": "Você está no controle dos seus dados. Você pode excluir sua conta e todos os dados associados a ela.",
    "learn_more": "Saiba Mais"
  },
  "uk": {
    "account": "Обліковий запис",
    "email": "Електронна пошта",
    "change_email": "Змінити електронну пошту",
    "password": "Пароль",
    "you_can_change_your_password_below": "Ви можете змінити свій пароль нижче.",
    "change_password": "Змінити пароль",
    "delete_account": "Видалити обліковий запис",
    "you_are_in_control": "Ви контролюєте свої дані. Ви можете видалити свій обліковий запис та всі пов'язані з ним дані.",
    "learn_more": "Дізнатися більше"
  }
}
</i18n>
