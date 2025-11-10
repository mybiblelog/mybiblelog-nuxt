<template>
  <div>
    <h2 class="title is-5">
      {{ $t('start_page.preferred_bible_version.title') }}
    </h2>
    <div class="content">
      <p>
        {{ $t('start_page.preferred_bible_version.description') }}
      </p>
      <p>
        {{ $t('start_page.preferred_bible_version.instruction') }}
      </p>
    </div>

    <div class="field">
      <label class="label">{{ $t('start_page.preferred_bible_version.label') }}</label>
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

    <div v-if="error" class="help is-danger">
      {{ error }}
    </div>

    <div class="content">
      <p class="help">
        {{ $t('start_page.preferred_bible_version.change_hint') }}
      </p>
    </div>

    <div class="field">
      <div class="control">
        <button class="button is-primary" :disabled="isSaving || !preferredBibleVersion" @click="handleSubmit">
          {{ buttonText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { BibleVersions } from '@mybiblelog/shared';

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

export default {
  name: 'PreferredBibleVersionForm',
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
      preferredBibleVersion: this.initialValue || '',
      bibleVersionOptions,
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
  },
  methods: {
    async handleSubmit() {
      this.error = '';

      if (!this.preferredBibleVersion) {
        this.error = this.$t('messaging.unable_to_save_preferred_bible_version');
        return;
      }

      this.isSaving = true;
      const success = await this.$store.dispatch('user-settings/updateSettings', {
        preferredBibleVersion: this.preferredBibleVersion,
      });

      if (success) {
        if (this.showToast) {
          this.$store.dispatch('toast/add', {
            type: 'success',
            text: this.$t('messaging.preferred_bible_version_saved_successfully'),
          });
        }
        this.$emit('saved', this.preferredBibleVersion);
        this.$emit('next');
      }
      else {
        this.error = this.$t('messaging.unable_to_save_preferred_bible_version');
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
        "title": "Bibelversion bevorzugt",
        "description": "My Bible Log kann Ihre bevorzugte Bibel-App oder Website öffnen, damit Sie mit dem Lesen beginnen können.",
        "instruction": "Wählen Sie die Übersetzung aus, die Sie lesen möchten.",
        "label": "Bevorzugte Bibelübersetzung",
        "change_hint": "Sie können diese Einstellung jederzeit ändern."
      }
    },
    "select_an_option": "Eine Option auswählen",
    "messaging": {
      "preferred_bible_version_saved_successfully": "Bibelversion bevorzugt erfolgreich gespeichert.",
      "unable_to_save_preferred_bible_version": "Nicht gespeichert."
    }
  },
  "en": {
    "start_page": {
      "preferred_bible_version": {
        "title": "Preferred Bible Version",
        "description": "My Bible Log can open your preferred Bible app or website so you can start reading.",
        "instruction": "Choose the translation you would like to read from.",
        "label": "Preferred Bible Translation",
        "change_hint": "You can change this setting at any time."
      }
    },
    "select_an_option": "Select an Option",
    "messaging": {
      "preferred_bible_version_saved_successfully": "Preferred Bible version saved successfully.",
      "unable_to_save_preferred_bible_version": "Unable to save."
    }
  },
  "es": {
    "start_page": {
      "preferred_bible_version": {
        "title": "Versión de la Biblia Preferida",
        "description": "My Bible Log puede abrir su aplicación o sitio web de la Biblia preferido para que pueda comenzar a leer.",
        "instruction": "Elija la traducción que le gustaría leer.",
        "label": "Traducción de la Biblia Preferida",
        "change_hint": "Puede cambiar esta configuración en cualquier momento."
      }
    },
    "select_an_option": "Seleccionar una opción",
    "messaging": {
      "preferred_bible_version_saved_successfully": "Versión de la Biblia preferida guardada con éxito.",
      "unable_to_save_preferred_bible_version": "No se puede guardar."
    }
  },
  "fr": {
    "start_page": {
      "preferred_bible_version": {
        "title": "Version de la Bible préférée",
        "description": "My Bible Log peut ouvrir votre application ou site web de la Bible préféré pour que vous puissiez commencer à lire.",
        "instruction": "Choisissez la traduction que vous souhaitez lire.",
        "label": "Traduction de la Bible préférée",
        "change_hint": "Vous pouvez modifier ce paramètre à tout moment."
      }
    },
    "select_an_option": "Sélectionner une option",
    "messaging": {
      "preferred_bible_version_saved_successfully": "Version préférée de la Bible enregistrée avec succès.",
      "unable_to_save_preferred_bible_version": "Impossible d'enregistrer."
    }
  },
  "pt": {
    "start_page": {
      "preferred_bible_version": {
        "title": "Versão da Bíblia Preferida",
        "description": "My Bible Log pode abrir seu aplicativo ou site da Bíblia preferido para que você possa começar a ler.",
        "instruction": "Escolha a tradução que você gostaria de ler.",
        "label": "Tradução da Bíblia Preferida",
        "change_hint": "Você pode alterar esta configuração a qualquer momento."
      }
    },
    "select_an_option": "Selecionar uma Opção",
    "messaging": {
      "preferred_bible_version_saved_successfully": "Versão preferida da Bíblia salva com sucesso.",
      "unable_to_save_preferred_bible_version": "Não é possível salvar."
    }
  },
  "uk": {
    "start_page": {
      "preferred_bible_version": {
        "title": "Обрана версія Біблії",
        "description": "My Bible Log може відкрити вашу обрану програму або веб-сайт Біблії, щоб ви могли почати читати.",
        "instruction": "Виберіть переклад, який ви хочете читати.",
        "label": "Обраний переклад Біблії",
        "change_hint": "Ви можете змінити це налаштування в будь-який час."
      }
    },
    "select_an_option": "Вибрати опцію",
    "messaging": {
      "preferred_bible_version_saved_successfully": "Обрану версію Біблії успішно збережено.",
      "unable_to_save_preferred_bible_version": "Не вдалося зберегти."
    }
  }
}
</i18n>
