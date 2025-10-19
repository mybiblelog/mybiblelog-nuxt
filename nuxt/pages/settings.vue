<template>
  <main>
    <section class="section">
      <div class="container">
        <div class="columns is-centered">
          <div class="column is-two-thirds-tablet is-half-desktop">
            <header class="page-header">
              <h1 class="title is-3">
                {{ $t('settings') }}
                <info-link :to="localePath('/about/page-features--settings')" />
              </h1>
              <div class="dropdown narrow-screen is-right" :class="menuOpen ? 'is-active' : ''">
                <div class="dropdown-trigger" @click="toggleMenu">
                  <button class="button" aria-haspopup="true" aria-controls="dropdown-menu">
                    <span>{{ $t('menu') }}</span>
                  </button>
                </div>
                <div class="dropdown-menu" role="menu" @click="toggleMenu">
                  <div class="dropdown-content">
                    <nuxt-link class="dropdown-item" :to="localePath('/settings')">
                      {{ $t('account') }}
                    </nuxt-link>
                    <nuxt-link class="dropdown-item" :to="localePath('/settings/reading')">
                      {{ $t('reading') }}
                    </nuxt-link>
                    <nuxt-link class="dropdown-item" :to="localePath('/settings/reminder')">
                      {{ $t('reminder') }}
                    </nuxt-link>
                    <nuxt-link class="dropdown-item" :to="localePath('/settings/export')">
                      {{ $t('export') }}
                    </nuxt-link>
                    <nuxt-link class="dropdown-item" :to="localePath('/settings/import')">
                      {{ $t('import') }}
                    </nuxt-link>
                  </div>
                </div>
              </div>
            </header>
            <div class="tabs wide-screen">
              <ul>
                <li>
                  <nuxt-link :to="localePath('/settings')">
                    {{ $t('account') }}
                  </nuxt-link>
                </li>
                <li>
                  <nuxt-link :to="localePath('/settings/reading')">
                    {{ $t('reading') }}
                  </nuxt-link>
                </li>
                <li>
                  <nuxt-link :to="localePath('/settings/reminder')">
                    {{ $t('reminder') }}
                  </nuxt-link>
                </li>
                <li>
                  <nuxt-link :to="localePath('/settings/export')">
                    {{ $t('export') }}
                  </nuxt-link>
                </li>
                <li>
                  <nuxt-link :to="localePath('/settings/import')">
                    {{ $t('import') }}
                  </nuxt-link>
                </li>
              </ul>
            </div>
            <nuxt-child />
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script>
import InfoLink from '@/components/InfoLink';

export default {
  name: 'SettingsPage',
  components: {
    InfoLink,
  },
  middleware: ['auth'],
  data() {
    return {
      menuOpen: false,
    };
  },
  head() {
    return {
      title: this.$t('settings'),
      meta: [
        { hid: 'robots', name: 'robots', content: 'noindex' },
      ],
    };
  },
  methods: {
    toggleMenu() {
      this.menuOpen = !this.menuOpen;
    },
  },
};
</script>

<style lang="scss" scoped>
.narrow-screen {
  @media screen and (min-width: 600px) {
    display: none;
  }
}
.wide-screen {
  @media screen and (max-width: 599px) {
    display: none;
  }
}
</style>

<i18n lang="json">
{
  "de": {
    "settings": "Einstellungen",
    "menu": "Menü",
    "account": "Konto",
    "reading": "Lesen",
    "reminder": "Erinnerung",
    "export": "Exportieren",
    "import": "Importieren"
  },
  "en": {
    "settings": "Settings",
    "menu": "Menu",
    "account": "Account",
    "reading": "Reading",
    "reminder": "Reminder",
    "export": "Export",
    "import": "Import"
  },
  "es": {
    "settings": "Configuración",
    "menu": "Menú",
    "account": "Cuenta",
    "reading": "Lectura",
    "reminder": "Recordatorio",
    "export": "Exportar",
    "import": "Importar"
  },
  "fr": {
    "settings": "Paramètres",
    "menu": "Menu",
    "account": "Compte",
    "reading": "Lecture",
    "reminder": "Rappel",
    "export": "Exporter",
    "import": "Importer"
  },
  "pt": {
    "settings": "Configurações",
    "menu": "Menu",
    "account": "Conta",
    "reading": "Leitura",
    "reminder": "Lembrete",
    "export": "Exportar",
    "import": "Importar"
  },
  "uk": {
    "settings": "Налаштування",
    "menu": "Меню",
    "account": "Акаунт",
    "reading": "Читання",
    "reminder": "Нагадування",
    "export": "Експорт",
    "import": "Імпорт"
  }
}
</i18n>
