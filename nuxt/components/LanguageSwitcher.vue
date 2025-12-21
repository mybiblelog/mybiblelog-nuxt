<template>
  <div class="navbar-item has-dropdown is-hoverable">
    <div class="navbar-link desktop-switcher">
      <div class="line-height-stabilizer">
        <translator-icon />
        <span class="is-hidden-desktop"> {{ $t('choose_language') }}</span>
      </div>
    </div>
    <div class="navbar-dropdown is-right desktop-switcher">
      <a v-for="locale in availableLocales" :key="locale.code" class="navbar-item" href="#" @click.prevent.stop="setLocale(locale.code)">
        <strong v-if="locale.code === $i18n.locale">{{ locale.name }}</strong>
        <span v-else>{{ locale.name }}</span>
      </a>
    </div>
    <div class="buttons is-centered mobile-switcher">
      <button class="button is-outline" @click="modalOpen = true">
        <translator-icon width="20" height="20" />
        <span style="padding-left: 0.2rem"> {{ $t('choose_language') }}</span>
      </button>
    </div>
    <app-modal v-if="modalOpen" :title="'🌎 ' + $t('choose_language')" @close="modalOpen = false">
      <template slot="content">
        <div class="language-buttons is-flex is-flex-direction-column is-align-items-stretch is-flex-gap-1">
          <a v-for="locale in availableLocales" :key="locale.code" class="button" href="#" @click.prevent.stop="() => { modalOpen = false; setLocale(locale.code); }">
            <strong v-if="locale.code === $i18n.locale">{{ locale.name }}</strong>
            <span v-else>{{ locale.name }}</span>
          </a>
        </div>
      </template>
    </app-modal>
  </div>
</template>

<script>
import AppModal from '@/components/popups/AppModal.vue';
import TranslatorIcon from '@/components/svg/TranslatorIcon.vue';

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
      if (this.$store.state.auth.loggedIn) {
        this.$store.dispatch('user-settings/updateSettings', { locale });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.line-height-stabilizer {
  line-height: 1em;
  display: flex;
  align-items: center;
  gap: 0.68rem;
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

.language-buttons {
  gap: 0.5rem;
}
</style>

<i18n lang="json">
{
  "de": {
    "choose_language": "Sprache wählen"
  },
  "en": {
    "choose_language": "Choose Language"
  },
  "es": {
    "choose_language": "Elige idioma"
  },
  "fr": {
    "choose_language": "Choisissez la langue"
  },
  "pt": {
    "choose_language": "Escolha o Idioma"
  },
  "uk": {
    "choose_language": "Виберіть мову"
  }
}
</i18n>
