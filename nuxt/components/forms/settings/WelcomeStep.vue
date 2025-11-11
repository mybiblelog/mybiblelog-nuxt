<template>
  <div>
    <h2 class="title is-5">
      {{ $t('start_page.welcome.title') }}
    </h2>
    <div class="content">
      <p>
        {{ $t('start_page.welcome.description') }}
      </p>
      <p>
        {{ $t('start_page.welcome.nav_hint') }}
      </p>
    </div>
    <div class="field">
      <div class="control">
        <button class="button is-info" @click="handleNext">
          {{ buttonText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WelcomeStep',
  props: {
    buttonText: {
      type: String,
      default: 'Next',
    },
  },
  methods: {
    handleNext() {
      this.$emit('next');
    },
  },
};
</script>

<i18n lang="json">
{
  "de": {
    "start_page": {
      "welcome": {
        "title": "Willkommen in Ihrem neuen My Bible Log-Konto!",
        "description": "Lassen Sie uns Ihre Einstellungen personalisieren, damit Sie das Beste aus der App herausholen können.",
        "nav_hint": "Sie können auch auf einen Link in der Navigation klicken, um die App mit den Standardeinstellungen zu verwenden."
      }
    }
  },
  "en": {
    "start_page": {
      "welcome": {
        "title": "Welcome to your new My Bible Log account!",
        "description": "Let's personalize your settings so you can get the most out of the app.",
        "nav_hint": "You can also click a link in the nav to start using the app with default settings."
      }
    }
  },
  "es": {
    "start_page": {
      "welcome": {
        "title": "¡Bienvenido a tu nueva cuenta de My Bible Log!",
        "description": "Personalicemos tu configuración para que puedas aprovechar al máximo la aplicación.",
        "nav_hint": "También puedes hacer clic en un enlace en la navegación para comenzar a usar la aplicación con la configuración predeterminada."
      }
    }
  },
  "fr": {
    "start_page": {
      "welcome": {
        "title": "Bienvenue dans votre nouveau compte My Bible Log !",
        "description": "Personnalisons vos paramètres pour que vous puissiez tirer le meilleur parti de l'application.",
        "nav_hint": "Vous pouvez également cliquer sur un lien dans la navigation pour commencer à utiliser l'application avec les paramètres par défaut."
      }
    }
  },
  "pt": {
    "start_page": {
      "welcome": {
        "title": "Bem-vindo à sua nova conta My Bible Log!",
        "description": "Vamos personalizar suas configurações para que você possa aproveitar ao máximo o aplicativo.",
        "nav_hint": "Você também pode clicar em um link na navegação para começar a usar o aplicativo com as configurações padrão."
      }
    }
  },
  "uk": {
    "start_page": {
      "welcome": {
        "title": "Ласкаво просимо до вашого нового облікового запису My Bible Log!",
        "description": "Давайте персоналізуємо ваші налаштування, щоб ви могли максимально використовувати додаток.",
        "nav_hint": "Ви також можете натиснути посилання в навігації, щоб почати використовувати додаток з налаштуваннями за замовчуванням."
      }
    }
  }
}
</i18n>
