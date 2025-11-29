<template>
  <nav class="navbar is-light is-fixed-top no-print" role="navigation" aria-label="main navigation">
    <div class="container">
      <div class="navbar-brand">
        <nuxt-link class="navbar-item" :to="localePath($store.state.auth.loggedIn ? '/start' : '/')" aria-label="home">
          <img src="/images/logo.svg" width="28" height="28" alt="">
        </nuxt-link>
        <template v-if="!$store.state.auth.loggedIn">
          <nuxt-link class="navbar-item" :to="localePath($store.state.auth.loggedIn ? '/start' : '/')">
            {{ $t('my_bible_log') }}
          </nuxt-link>
        </template>
        <template v-else>
          <nuxt-link class="navbar-item is-hidden-desktop-only" :to="localePath($store.state.auth.loggedIn ? '/start' : '/')">
            {{ $t('my_bible_log') }}
          </nuxt-link>
        </template>
        <a class="navbar-burger burger" role="button" aria-label="menu" aria-expanded="false" @click="toggleNav">
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </a>
      </div>
      <div class="navbar-menu" :class="{ 'is-active': navOpen }">
        <div class="navbar-start">
          <template v-if="$store.state.auth.loggedIn">
            <nuxt-link class="navbar-item" :to="localePath('/today')">
              {{ $t('today') }}
            </nuxt-link>
            <nuxt-link class="navbar-item" :to="localePath('/books')">
              {{ $t('bible_books') }}
            </nuxt-link>
            <nuxt-link class="navbar-item" :to="localePath('/checklist')">
              {{ $t('chapter_checklist') }}
            </nuxt-link>
            <nuxt-link class="navbar-item" :to="localePath('/calendar')">
              {{ $t('calendar') }}
            </nuxt-link>
            <nuxt-link class="navbar-item" :to="localePath('/notes')">
              {{ $t('notes') }}
            </nuxt-link>
          </template>
        </div>
        <div class="navbar-end">
          <nuxt-link class="navbar-item" :to="localePath('/about/overview')">
            {{ $t('about') }}
          </nuxt-link>
          <template v-if="$store.state.auth.loggedIn">
            <nuxt-link class="navbar-item" :to="localePath('/settings')">
              {{ $t('settings') }}
            </nuxt-link>
          </template>
          <template v-if="$store.state.auth.loggedIn && $store.state.auth.user.isAdmin">
            <div class="navbar-item has-dropdown" :class="{ 'is-active': adminDropdownOpen }">
              <a class="navbar-link" @click="toggleAdminDropdown">Admin</a>
              <div v-if="adminDropdownOpen" class="navbar-dropdown" @click="toggleAdminDropdown">
                <nuxt-link class="navbar-item" :to="localePath('/admin/users')">
                  {{ $t('users') }}
                </nuxt-link>
                <nuxt-link class="navbar-item" :to="localePath('/admin/feedback')">
                  {{ $t('feedback') }}
                </nuxt-link>
                <nuxt-link class="navbar-item" :to="localePath('/admin/engagement')">
                  {{ $t('engagement') }}
                </nuxt-link>
              </div>
            </div>
          </template>
          <template v-if="$store.state.auth.loggedIn">
            <a class="navbar-item" href="#" @click.prevent="logout">{{ $t('log_out') }}</a>
          </template>
          <template v-else>
            <nuxt-link class="navbar-item" :to="localePath('/register')">
              {{ $t('sign_up') }}
            </nuxt-link>
            <nuxt-link class="navbar-item" :to="localePath('/login')">
              {{ $t('sign_in') }}
            </nuxt-link>
          </template>
          <language-switcher />
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default {
  name: 'SiteNav',
  components: {
    LanguageSwitcher,
  },
  data() {
    return {
      navOpen: false,
      adminDropdownOpen: false,
    };
  },
  head() {
    return {
      bodyAttrs: {
        class: 'has-navbar-fixed-top',
      },
    };
  },
  watch: {
    $route() {
      this.navOpen = false;
    },
  },
  methods: {
    toggleNav() {
      this.navOpen = !this.navOpen;
    },
    toggleAdminDropdown() {
      this.adminDropdownOpen = !this.adminDropdownOpen;
    },
    async logout() {
      // Remove all cached user data at session end.
      // Note that this removes ALL sessionStorage,
      // not just values set by the BrowserCache utility.
      sessionStorage.clear();
      await this.$store.dispatch('auth/logout');
      this.$router.push(this.localePath('/login', this.$i18n.locale));
    },
  },
};
</script>

<style lang="scss" scoped>
//
</style>

<i18n lang="json">
{
  "de": {
    "today": "Heute",
    "bible_books": "Bibelbücher",
    "chapter_checklist": "Kapitel Checkliste",
    "calendar": "Kalender",
    "notes": "Notizen",
    "about": "Über",
    "settings": "Einstellungen",
    "admin": "Administrator",
    "users": "Benutzer",
    "feedback": "Feedback",
    "engagement": "Engagement",
    "log_out": "Abmelden",
    "sign_up": "Registrieren",
    "sign_in": "Anmelden"
  },
  "en": {
    "today": "Today",
    "bible_books": "Bible Books",
    "chapter_checklist": "Chapter Checklist",
    "calendar": "Calendar",
    "notes": "Notes",
    "about": "About",
    "settings": "Settings",
    "admin": "Admin",
    "users": "Users",
    "feedback": "Feedback",
    "engagement": "Engagement",
    "log_out": "Log Out",
    "sign_up": "Sign Up",
    "sign_in": "Sign In"
  },
  "es": {
    "today": "Hoy",
    "bible_books": "Libros Bíblicos",
    "chapter_checklist": "Lista de Capítulos",
    "calendar": "Calendario",
    "notes": "Notas",
    "about": "Acerca de",
    "settings": "Configuración",
    "admin": "Administrador",
    "users": "Usuarios",
    "feedback": "Comentarios",
    "engagement": "Participación",
    "log_out": "Cerrar sesión",
    "sign_up": "Registrarse",
    "sign_in": "Iniciar sesión"
  },
  "fr": {
    "today": "Aujourd'hui",
    "bible_books": "Livres de la Bible",
    "chapter_checklist": "Liste de Contrôle",
    "calendar": "Calendrier",
    "notes": "Notes",
    "about": "À Propos",
    "settings": "Paramètres",
    "admin": "Administrateur",
    "users": "Utilisateurs",
    "feedback": "Retour d'Information",
    "engagement": "Engagement",
    "log_out": "Déconnexion",
    "sign_up": "S'inscrire",
    "sign_in": "Se connecter"
  },
  "pt": {
    "today": "Hoje",
    "bible_books": "Livros da Bíblia",
    "chapter_checklist": "Lista de Capítulos",
    "calendar": "Calendário",
    "notes": "Notas",
    "about": "Sobre",
    "settings": "Configurações",
    "admin": "Administrador",
    "users": "Usuários",
    "feedback": "Feedback",
    "engagement": "Engajamento",
    "log_out": "Sair",
    "sign_up": "Inscrever-se",
    "sign_in": "Entrar"
  },
  "uk": {
    "today": "Сьогодні",
    "bible_books": "Книги Біблії",
    "chapter_checklist": "Список розділів",
    "calendar": "Календар",
    "notes": "Нотатки",
    "about": "Про нас",
    "settings": "Налаштування",
    "admin": "Адміністратор",
    "users": "Користувачі",
    "feedback": "Зворотній зв'язок",
    "engagement": "Залученість",
    "log_out": "Вийти",
    "sign_up": "Зареєструватися",
    "sign_in": "Увійти"
  }
}
</i18n>
