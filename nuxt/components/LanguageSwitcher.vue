<template>
  <div class="navbar-item language-switcher">
    <a
      href="#"
      class="language-switcher-desktop desktop-switcher"
      role="button"
      :aria-label="$t('choose_language')"
      @click.prevent="modalOpen = true"
    >
      <div class="line-height-stabilizer">
        <translator-icon />
        <span class="is-hidden-desktop"> {{ $t('choose_language') }}</span>
      </div>
    </a>
    <div class="buttons is-centered mobile-switcher">
      <button class="button is-outline" @click="modalOpen = true">
        <translator-icon width="20" height="20" />
        <span style="padding-left: 0.2rem"> {{ $t('choose_language') }}</span>
      </button>
    </div>
    <app-modal :open="modalOpen" :title="'🌎 ' + $t('choose_language')" @close="modalOpen = false">
      <template slot="content">
        <div class="language-switcher-modal">
          <div class="language-switcher-modal__grid">
            <a
              v-for="locale in availableLocales"
              :key="locale.code"
              class="button language-switcher-modal__btn"
              href="#"
              @click.prevent.stop="() => { modalOpen = false; setLocale(locale.code); }"
            >
              <strong v-if="locale.code === $i18n.locale">{{ locale.name }}</strong>
              <span v-else>{{ locale.name }}</span>
            </a>
          </div>
        </div>
      </template>
    </app-modal>
  </div>
</template>

<script>
import AppModal from '@/components/popups/AppModal.vue';
import TranslatorIcon from '@/components/svg/TranslatorIcon.vue';
import { useUserSettingsStore } from '~/stores/user-settings';
import { useAuthStore } from '~/stores/auth';

export default {
  name: 'LanguageSwitcher',
  components: {
    AppModal,
    TranslatorIcon,
  },
  data() {
    return {
      modalOpen: false,
    };
  },
  computed: {
    localeName() {
      return this.$i18n.locales.find(locale => locale.code === this.$i18n.locale).name;
    },
    availableLocales() {
      return this.$i18n.locales;
    },
  },
  methods: {
    setLocale(locale) {
      this.$i18n.setLocale(locale);

      // If the user is already logged in and changes the locale, we capture the new locale in the database
      if (useAuthStore().loggedIn) {
        useUserSettingsStore().updateSettings({ locale });
      }
    },
  },
};
</script>

<style scoped>
.line-height-stabilizer {
  line-height: 1em;
  display: flex;
  align-items: center;
  gap: 0.68rem;
}

.language-switcher-desktop {
  display: inline-flex;
  align-items: center;
  line-height: 1.5;
  color: rgba(0, 0, 0, 0.7);
  text-decoration: none;
  cursor: pointer;
  margin: -0.5rem -0.75rem;
  padding: 1rem 1.5rem;
}

.language-switcher-desktop:hover,
.language-switcher-desktop:focus {
  background-color: #e8e8e8;
  color: rgba(0, 0, 0, 0.7);
}

.language-switcher-desktop:focus:not(:focus-visible) {
  outline: none;
}

.language-switcher-desktop:focus-visible {
  outline: 2px solid #485fc7;
  outline-offset: 2px;
}

.mobile-switcher {
  display: none;
  padding: 1rem;
}

@media screen and (max-width: 1023px) {
  .desktop-switcher {
    display: none;
  }
  .mobile-switcher {
    display: flex;
  }
}

.language-switcher-modal {
  /* stylelint-disable-next-line property-no-unknown */
  container-type: inline-size;
  max-width: 100%;
}

.language-switcher-modal__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
  max-width: 100%;
}

/* stylelint-disable-next-line at-rule-no-unknown */
@container (max-width: 300px) {
  .language-switcher-modal__grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

.language-switcher-modal__btn {
  width: 100%;
  justify-content: center;
}
</style>

<i18n lang="json">
{
  "en": {
    "choose_language": "Choose Language"
  },
  "de": {
    "choose_language": "Sprache wählen"
  },
  "es": {
    "choose_language": "Elige idioma"
  },
  "fr": {
    "choose_language": "Choisissez la langue"
  },
  "ko": {
    "choose_language": "언어 선택"
  },
  "pt": {
    "choose_language": "Escolha o Idioma"
  },
  "uk": {
    "choose_language": "Виберіть мову"
  }
}
</i18n>
