<template>
  <div>
    <h2 class="title is-5">
      {{ $t('start_page.preferred_bible_app.title') }}
    </h2>
    <div class="content">
      <p>
        {{ $t('start_page.preferred_bible_app.description') }}
      </p>
      <p>
        {{ $t('start_page.preferred_bible_app.instruction') }}
      </p>
    </div>

    <div class="field">
      <label class="label">{{ $t('start_page.preferred_bible_app.label') }}</label>
      <div class="control">
        <div class="select">
          <select v-model="preferredBibleApp">
            <option value="" selected="selected" disabled="disabled">
              {{ $t('select_an_option') }}
            </option>
            <option
              v-for="option in bibleAppOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.text }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="error" class="help is-danger">
      {{ error }}
    </div>

    <div class="message">
      <div class="message-body">
        {{ $t('start_page.preferred_bible_app.device_note') }}
      </div>
    </div>

    <div class="content">
      <p class="help">
        {{ $t('start_page.preferred_bible_app.change_hint') }}
      </p>
    </div>

    <div class="field">
      <div class="control">
        <button class="button is-primary" :disabled="isSaving || !preferredBibleApp" @click="handleSubmit">
          {{ buttonText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { BibleApps } from '@mybiblelog/shared';

const bibleAppNames = {
  [BibleApps.BIBLEGATEWAY]: 'Bible Gateway',
  [BibleApps.YOUVERSIONAPP]: 'YouVersion App',
  [BibleApps.BIBLECOM]: 'Bible.com (YouVersion)',
  [BibleApps.BLUELETTERBIBLE]: 'Blue Letter Bible',
  [BibleApps.OLIVETREE]: 'Olive Tree App',
};

const bibleAppOptions = Object.keys(bibleAppNames).map((key) => {
  const value = bibleAppNames[key];
  return {
    text: value,
    value: key,
  };
});

export default {
  name: 'PreferredBibleAppForm',
  props: {
    initialValue: {
      type: String,
      default: '',
    },
    buttonText: {
      type: String,
      default: 'Save and Continue',
    },
    showToast: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      preferredBibleApp: this.initialValue || '',
      bibleAppOptions,
      error: '',
      isSaving: false,
    };
  },
  watch: {
    initialValue(newValue) {
      if (newValue) {
        this.preferredBibleApp = newValue;
      }
    },
  },
  methods: {
    async handleSubmit() {
      this.error = '';

      if (!this.preferredBibleApp) {
        this.error = this.$t('messaging.unable_to_save_preferred_bible_app');
        return;
      }

      this.isSaving = true;
      const success = await this.$store.dispatch('user-settings/updateSettings', {
        preferredBibleApp: this.preferredBibleApp,
      });

      if (success) {
        if (this.showToast) {
          this.$store.dispatch('toast/add', {
            type: 'success',
            text: this.$t('messaging.preferred_bible_app_saved_successfully'),
          });
        }
        this.$emit('saved', this.preferredBibleApp);
        this.$emit('next');
      }
      else {
        this.error = this.$t('messaging.unable_to_save_preferred_bible_app');
      }

      this.isSaving = false;
    },
  },
};
</script>

<style scoped>
select {
  max-width: 65vw;
}
</style>

<i18n lang="json">
{
  "de": {
    "start_page": {
      "preferred_bible_app": {
        "title": "Bibel-App bevorzugt",
        "description": "My Bible Log kann Ihre bevorzugte Bibel-App oder Website öffnen, damit Sie mit dem Lesen beginnen können.",
        "instruction": "Wählen Sie die Bibel-App oder Website aus, mit der Sie lesen möchten.",
        "label": "Bevorzugte Bibel-App",
        "device_note": "Diese Einstellung wird auf Ihrem Gerät gespeichert, nicht in Ihrem Konto. Dies ermöglicht es Ihnen, eine App auf einem Mobilgerät und eine Website auf einem Computer zu verwenden, wenn Sie möchten.",
        "change_hint": "Sie können diese Einstellung jederzeit ändern."
      }
    },
    "select_an_option": "Eine Option auswählen",
    "messaging": {
      "preferred_bible_app_saved_successfully": "Bevorzugte Bibel-App erfolgreich für dieses Gerät gespeichert.",
      "unable_to_save_preferred_bible_app": "Nicht gespeichert."
    }
  },
  "en": {
    "start_page": {
      "preferred_bible_app": {
        "title": "Preferred Bible App",
        "description": "My Bible Log can open your preferred Bible app or website so you can start reading.",
        "instruction": "Choose the Bible app or website you want to read with.",
        "label": "Preferred Bible App",
        "device_note": "This setting is saved on your device rather than your account. This allows you to use an app on a mobile device and a website on a computer, if you want.",
        "change_hint": "You can change this setting at any time."
      }
    },
    "select_an_option": "Select an Option",
    "messaging": {
      "preferred_bible_app_saved_successfully": "Preferred Bible app saved successfully for this device.",
      "unable_to_save_preferred_bible_app": "Unable to save."
    }
  },
  "es": {
    "start_page": {
      "preferred_bible_app": {
        "title": "Aplicación de Biblia Preferida",
        "description": "My Bible Log puede abrir su aplicación o sitio web de la Biblia preferido para que pueda comenzar a leer.",
        "instruction": "Elija la aplicación o sitio web de la Biblia con el que desea leer.",
        "label": "Aplicación de Biblia Preferida",
        "device_note": "Esta configuración se guarda en su dispositivo en lugar de en su cuenta. Esto le permite usar una aplicación en un dispositivo móvil y un sitio web en una computadora, si lo desea.",
        "change_hint": "Puede cambiar esta configuración en cualquier momento."
      }
    },
    "select_an_option": "Seleccionar una opción",
    "messaging": {
      "preferred_bible_app_saved_successfully": "Aplicación de Biblia preferida guardada con éxito para este dispositivo.",
      "unable_to_save_preferred_bible_app": "No se puede guardar."
    }
  },
  "fr": {
    "start_page": {
      "preferred_bible_app": {
        "title": "Application de la Bible préférée",
        "description": "My Bible Log peut ouvrir votre application ou site web de la Bible préféré pour que vous puissiez commencer à lire.",
        "instruction": "Choisissez l'application ou le site web de la Bible avec lequel vous souhaitez lire.",
        "label": "Application de la Bible préférée",
        "device_note": "Ce paramètre est enregistré sur votre appareil plutôt que sur votre compte. Cela vous permet d'utiliser une application sur un appareil mobile et un site web sur un ordinateur, si vous le souhaitez.",
        "change_hint": "Vous pouvez modifier ce paramètre à tout moment."
      }
    },
    "select_an_option": "Sélectionner une option",
    "messaging": {
      "preferred_bible_app_saved_successfully": "Application de la Bible préférée enregistrée avec succès pour cet appareil.",
      "unable_to_save_preferred_bible_app": "Impossible d'enregistrer."
    }
  },
  "pt": {
    "start_page": {
      "preferred_bible_app": {
        "title": "Aplicativo da Bíblia Preferido",
        "description": "My Bible Log pode abrir seu aplicativo ou site da Bíblia preferido para que você possa começar a ler.",
        "instruction": "Escolha o aplicativo ou site da Bíblia com o qual você deseja ler.",
        "label": "Aplicativo da Bíblia Preferido",
        "device_note": "Esta configuração é salva em seu dispositivo em vez de em sua conta. Isso permite que você use um aplicativo em um dispositivo móvel e um site em um computador, se desejar.",
        "change_hint": "Você pode alterar esta configuração a qualquer momento."
      }
    },
    "select_an_option": "Selecionar uma Opção",
    "messaging": {
      "preferred_bible_app_saved_successfully": "Aplicativo preferido da Bíblia salvo com sucesso para este dispositivo.",
      "unable_to_save_preferred_bible_app": "Não é possível salvar."
    }
  },
  "uk": {
    "start_page": {
      "preferred_bible_app": {
        "title": "Обрана програма для читання Біблії",
        "description": "My Bible Log може відкрити вашу обрану програму або веб-сайт Біблії, щоб ви могли почати читати.",
        "instruction": "Виберіть програму або веб-сайт Біблії, з яким ви хочете читати.",
        "label": "Обрана програма для читання Біблії",
        "device_note": "Це налаштування зберігається на вашому пристрої, а не в вашому обліковому записі. Це дозволяє вам використовувати програму на мобільному пристрої та веб-сайт на комп'ютері, якщо ви хочете.",
        "change_hint": "Ви можете змінити це налаштування в будь-який час."
      }
    },
    "select_an_option": "Вибрати опцію",
    "messaging": {
      "preferred_bible_app_saved_successfully": "Обрану програму для читання Біблії успішно збережено для цього пристрою.",
      "unable_to_save_preferred_bible_app": "Не вдалося зберегти."
    }
  }
}
</i18n>
