<template>
  <div>
    <h2 class="title is-5">
      {{ $t('start_page.preferred_bible_version.title') }}
    </h2>

    <div class="field">
      <label class="label">{{ $t('start_page.preferred_bible_version.translation_label') }}</label>
      <div class="control">
        <div class="select">
          <select v-model="preferredBibleVersion">
            <option value="" selected="selected" disabled="disabled">
              {{ $t('select_an_option') }}
            </option>
            <option
              v-for="option in bibleVersionOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.text }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div class="field">
      <label class="label">{{ $t('start_page.preferred_bible_version.app_label') }}</label>
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
        {{ $t('start_page.preferred_bible_version.device_note') }}
      </div>
    </div>

    <div class="content">
      <p class="help">
        {{ $t('start_page.preferred_bible_version.change_hint') }}
      </p>
    </div>

    <div class="field">
      <div class="control buttons">
        <button class="button" :disabled="isSaving" @click="handlePrevious">
          {{ previousButtonText }}
        </button>
        <button class="button is-info" :disabled="isSaving || !preferredBibleVersion || !preferredBibleApp" @click="handleSubmit">
          {{ nextButtonText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { BibleVersions, BibleApps } from '@mybiblelog/shared';

const bibleVersionNames = {
  [BibleVersions.NASB2020]: 'New American Standard Bible (NASB)',
  [BibleVersions.NASB1995]: 'New American Standard Bible 1995 (NASB 1995)',
  [BibleVersions.AMP]: 'Amplified Bible (AMP)',
  [BibleVersions.KJV]: 'King James Version (KJV)',
  [BibleVersions.NKJV]: 'New King James Version (NKJV)',
  [BibleVersions.NIV]: 'New International Version (NIV)',
  [BibleVersions.ESV]: 'English Standard Version (ESV)',
  [BibleVersions.NABRE]: 'New American Bible Revised Edition (NABRE)',
  [BibleVersions.NLT]: 'New Living Translation (NLT)',
  [BibleVersions.TPT]: 'The Passion Translation (TPT)',
  [BibleVersions.MSG]: 'The Message (MSG)',
  [BibleVersions.RVR1960]: 'Reina-Valera 1960 (RVR1960)',
  [BibleVersions.RVR2020]: 'Reina-Valera 2020 (RVR2020)',
  [BibleVersions.UKR]: 'українська (UKRK)',
  [BibleVersions.BDS]: 'Bible du Semeur (BDS)',
  [BibleVersions.LSG]: 'Louis Segond (LSG)',
  [BibleVersions.ARC]: 'Almeida Revista e Corrigida (ARC)',
  [BibleVersions.LUT]: 'Luther 1545 (LUT)',
};

const bibleVersionOptions = Object.keys(bibleVersionNames).map((key) => {
  const value = bibleVersionNames[key];
  return {
    text: value,
    value: key,
  };
});

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
  name: 'PreferredBibleVersionForm',
  props: {
    initialValue: {
      type: String,
      default: '',
    },
    initialBibleApp: {
      type: String,
      default: '',
    },
    nextButtonText: {
      type: String,
      default: 'Save and Continue',
    },
    previousButtonText: {
      type: String,
      default: 'Back',
    },
    showToast: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      preferredBibleVersion: this.initialValue || '',
      preferredBibleApp: this.initialBibleApp || '',
      bibleVersionOptions,
      bibleAppOptions,
      error: '',
      isSaving: false,
    };
  },
  watch: {
    initialValue(newValue) {
      if (newValue) {
        this.preferredBibleVersion = newValue;
      }
    },
    initialBibleApp(newValue) {
      if (newValue) {
        this.preferredBibleApp = newValue;
      }
    },
  },
  methods: {
    handlePrevious() {
      this.$emit('previous');
    },
    async handleSubmit() {
      this.error = '';

      if (!this.preferredBibleVersion) {
        this.error = this.$t('messaging.unable_to_save_preferred_bible_version');
        return;
      }

      if (!this.preferredBibleApp) {
        this.error = this.$t('messaging.unable_to_save_preferred_bible_app');
        return;
      }

      this.isSaving = true;
      const success = await this.$store.dispatch('user-settings/updateSettings', {
        preferredBibleVersion: this.preferredBibleVersion,
        preferredBibleApp: this.preferredBibleApp,
      });

      if (success) {
        if (this.showToast) {
          this.$store.dispatch('toast/add', {
            type: 'success',
            text: this.$t('messaging.preferred_bible_settings_saved_successfully'),
          });
        }
        this.$emit('saved', {
          preferredBibleVersion: this.preferredBibleVersion,
          preferredBibleApp: this.preferredBibleApp,
        });
        this.$emit('next');
      }
      else {
        this.error = this.$t('messaging.unable_to_save_preferred_bible_settings');
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
      "preferred_bible_version": {
        "title": "Bibel-Einstellungen",
        "translation_label": "Wenn ich die Bibel von My Bible Log öffne, möchte ich diese Übersetzung lesen:",
        "app_label": "Wenn ich eine Passage von My Bible Log öffne, möchte ich, dass sie in dieser App oder Website geöffnet wird:",
        "device_note": "Die App-Einstellung wird auf Ihrem Gerät gespeichert, nicht in Ihrem Konto. Dies ermöglicht es Ihnen, eine App auf einem Mobilgerät und eine Website auf einem Computer zu verwenden, wenn Sie möchten.",
        "change_hint": "Sie können diese Einstellungen jederzeit ändern."
      }
    },
    "select_an_option": "Eine Option auswählen",
    "messaging": {
      "preferred_bible_settings_saved_successfully": "Bibel-Einstellungen erfolgreich gespeichert.",
      "unable_to_save_preferred_bible_settings": "Nicht gespeichert.",
      "unable_to_save_preferred_bible_version": "Nicht gespeichert.",
      "unable_to_save_preferred_bible_app": "Nicht gespeichert."
    }
  },
  "en": {
    "start_page": {
      "preferred_bible_version": {
        "title": "Bible Settings",
        "translation_label": "When I open the Bible from My Bible Log, I want to read this translation:",
        "app_label": "When I open a passage from My Bible Log, I want it to open in this app or website:",
        "device_note": "The app setting is saved on your device rather than your account. This allows you to use an app on a mobile device and a website on a computer, if you want.",
        "change_hint": "You can change these settings at any time."
      }
    },
    "select_an_option": "Select an Option",
    "messaging": {
      "preferred_bible_settings_saved_successfully": "Bible settings saved successfully.",
      "unable_to_save_preferred_bible_settings": "Unable to save.",
      "unable_to_save_preferred_bible_version": "Unable to save.",
      "unable_to_save_preferred_bible_app": "Unable to save."
    }
  },
  "es": {
    "start_page": {
      "preferred_bible_version": {
        "title": "Configuración de la Biblia",
        "translation_label": "Cuando abro la Biblia desde My Bible Log, quiero leer esta traducción:",
        "app_label": "Cuando abro un pasaje desde My Bible Log, quiero que se abra en esta aplicación o sitio web:",
        "device_note": "La configuración de la aplicación se guarda en su dispositivo en lugar de en su cuenta. Esto le permite usar una aplicación en un dispositivo móvil y un sitio web en una computadora, si lo desea.",
        "change_hint": "Puede cambiar esta configuración en cualquier momento."
      }
    },
    "select_an_option": "Seleccionar una opción",
    "messaging": {
      "preferred_bible_settings_saved_successfully": "Configuración de la Biblia guardada con éxito.",
      "unable_to_save_preferred_bible_settings": "No se puede guardar.",
      "unable_to_save_preferred_bible_version": "No se puede guardar.",
      "unable_to_save_preferred_bible_app": "No se puede guardar."
    }
  },
  "fr": {
    "start_page": {
      "preferred_bible_version": {
        "title": "Paramètres de la Bible",
        "translation_label": "Lorsque j'ouvre la Bible depuis My Bible Log, je veux lire cette traduction :",
        "app_label": "Lorsque j'ouvre un passage depuis My Bible Log, je veux qu'il s'ouvre dans cette application ou ce site web :",
        "device_note": "Le paramètre de l'application est enregistré sur votre appareil plutôt que sur votre compte. Cela vous permet d'utiliser une application sur un appareil mobile et un site web sur un ordinateur, si vous le souhaitez.",
        "change_hint": "Vous pouvez modifier ces paramètres à tout moment."
      }
    },
    "select_an_option": "Sélectionner une option",
    "messaging": {
      "preferred_bible_settings_saved_successfully": "Paramètres de la Bible enregistrés avec succès.",
      "unable_to_save_preferred_bible_settings": "Impossible d'enregistrer.",
      "unable_to_save_preferred_bible_version": "Impossible d'enregistrer.",
      "unable_to_save_preferred_bible_app": "Impossible d'enregistrer."
    }
  },
  "pt": {
    "start_page": {
      "preferred_bible_version": {
        "title": "Configurações da Bíblia",
        "translation_label": "Quando abro a Bíblia do My Bible Log, quero ler esta tradução:",
        "app_label": "Quando abro uma passagem do My Bible Log, quero que ela abra neste aplicativo ou site:",
        "device_note": "A configuração do aplicativo é salva em seu dispositivo em vez de em sua conta. Isso permite que você use um aplicativo em um dispositivo móvel e um site em um computador, se desejar.",
        "change_hint": "Você pode alterar essas configurações a qualquer momento."
      }
    },
    "select_an_option": "Selecionar uma Opção",
    "messaging": {
      "preferred_bible_settings_saved_successfully": "Configurações da Bíblia salvas com sucesso.",
      "unable_to_save_preferred_bible_settings": "Não é possível salvar.",
      "unable_to_save_preferred_bible_version": "Não é possível salvar.",
      "unable_to_save_preferred_bible_app": "Não é possível salvar."
    }
  },
  "uk": {
    "start_page": {
      "preferred_bible_version": {
        "title": "Налаштування Біблії",
        "translation_label": "Коли я відкриваю Біблію з My Bible Log, я хочу читати цей переклад:",
        "app_label": "Коли я відкриваю уривок з My Bible Log, я хочу, щоб він відкрився в цій програмі або на веб-сайті:",
        "device_note": "Налаштування програми зберігається на вашому пристрої, а не в вашому обліковому записі. Це дозволяє вам використовувати програму на мобільному пристрої та веб-сайт на комп'ютері, якщо ви хочете.",
        "change_hint": "Ви можете змінити ці налаштування в будь-який час."
      }
    },
    "select_an_option": "Вибрати опцію",
    "messaging": {
      "preferred_bible_settings_saved_successfully": "Налаштування Біблії успішно збережено.",
      "unable_to_save_preferred_bible_settings": "Не вдалося зберегти.",
      "unable_to_save_preferred_bible_version": "Не вдалося зберегти.",
      "unable_to_save_preferred_bible_app": "Не вдалося зберегти."
    }
  }
}
</i18n>
