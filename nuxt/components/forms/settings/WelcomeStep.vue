<template>
  <div>
    <h2 class="title is-5">
      {{ $t('start_page.welcome.title') }}
    </h2>
    <div class="content">
      <p>
        {{ $t('start_page.welcome.description') }}
      </p>
    </div>
    <div class="field">
      <div class="control">
        <button class="button is-info" @click="handleNext">
          {{ buttonText }}
        </button>
      </div>
    </div>
    <div class="field">
      <div class="control">
        <button class="button" @click="handleSkip">
          {{ $t('start_page.welcome.skip_personalization') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { useUserSettingsStore } from '~/stores/user-settings';

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
    async handleSkip() {
      const success = await useUserSettingsStore().updateSettings({
        startPage: 'today',
      });
      if (success) {
        window.location.reload();
      }
    },
  },
};
</script>

<i18n lang="json">
{
  "en": {
    "start_page": {
      "welcome": {
        "title": "Welcome to your new My Bible Log account!",
        "description": "Let's personalize your settings so you can get the most out of the app.",
        "skip_personalization": "Skip Personalization"
      }
    }
  },
  "de": {
    "start_page": {
      "welcome": {
        "title": "Willkommen in Ihrem neuen My Bible Log-Konto!",
        "description": "Lassen Sie uns Ihre Einstellungen personalisieren, damit Sie das Beste aus der App herausholen können.",
        "skip_personalization": "Personalisierung überspringen"
      }
    }
  },
  "es": {
    "start_page": {
      "welcome": {
        "title": "¡Bienvenido a tu nueva cuenta de My Bible Log!",
        "description": "Personalicemos tu configuración para que puedas aprovechar al máximo la aplicación.",
        "skip_personalization": "Omitir personalización"
      }
    }
  },
  "fr": {
    "start_page": {
      "welcome": {
        "title": "Bienvenue dans votre nouveau compte My Bible Log !",
        "description": "Personnalisons vos paramètres pour que vous puissiez tirer le meilleur parti de l'application.",
        "skip_personalization": "Ignorer la personnalisation"
      }
    }
  },
  "ko": {
    "start_page": {
      "welcome": {
        "title": "My Bible Log 계정에 오신 것을 환영합니다!",
        "description": "My Bible Log를 최대한 유용하게 활용할 수 있도록 개인화 설정을 도와드리겠습니다.",
        "skip_personalization": "개인화 설정 건너뛰기"
      }
    }
  },
  "pt": {
    "start_page": {
      "welcome": {
        "title": "Bem-vindo à sua nova conta My Bible Log!",
        "description": "Vamos personalizar suas configurações para que você possa aproveitar ao máximo o aplicativo.",
        "skip_personalization": "Pular personalização"
      }
    }
  },
  "uk": {
    "start_page": {
      "welcome": {
        "title": "Ласкаво просимо до вашого нового облікового запису My Bible Log!",
        "description": "Давайте персоналізуємо ваші налаштування, щоб ви могли максимально використовувати додаток.",
        "skip_personalization": "Пропустити персоналізацію"
      }
    }
  }
}
</i18n>
