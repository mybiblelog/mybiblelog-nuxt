<template>
  <nav class="navbar is-light is-fixed-top no-print" role="navigation" aria-label="main navigation">
    <div class="container">
      <div class="navbar-brand">
        <nuxt-link class="navbar-item" :to="localePath(authStore.loggedIn ? '/start' : '/')" aria-label="home">
          <img src="/images/logo.svg" width="28" height="28" alt="">
        </nuxt-link>
        <template v-if="!authStore.loggedIn">
          <nuxt-link class="navbar-item" :to="localePath(authStore.loggedIn ? '/start' : '/')">
            {{ $t('my_bible_log') }}
          </nuxt-link>
        </template>
        <template v-else>
          <nuxt-link class="navbar-item is-hidden-desktop-only" :to="localePath(authStore.loggedIn ? '/start' : '/')">
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
          <template v-if="authStore.loggedIn">
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
          <template v-if="authStore.loggedIn">
            <nuxt-link class="navbar-item" :to="localePath('/settings')">
              {{ $t('settings') }}
            </nuxt-link>
          </template>
          <template v-if="authStore.loggedIn && authStore.user?.isAdmin">
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
          <template v-if="authStore.loggedIn">
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
import { useAuthStore } from '~/stores/auth';

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
  computed: {
    authStore() {
      return useAuthStore();
    },
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
      await this.authStore.logout();
    },
  },
};
</script>

<style lang="scss" scoped>
//
</style>

<i18n lang="json">
{
  "en": {
    "today": "Today",
    "bible_books": "Bible Books",
    "chapter_checklist": "Chapter Checklist",
    "calendar": "Calendar",
    "log": "Log",
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
  "de": {
    "today": "Heute",
    "bible_books": "Bibelbücher",
    "chapter_checklist": "Kapitel Checkliste",
    "calendar": "Kalender",
    "log": "Journal",
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
  "es": {
    "today": "Hoy",
    "bible_books": "Libros Bíblicos",
    "chapter_checklist": "Lista de Capítulos",
    "calendar": "Calendario",
    "log": "Registro",
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
    "log": "Journal",
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
  "ko": {
    "today": "오늘",
    "bible_books": "성경 일람",
    "chapter_checklist": "장별 체크",
    "calendar": "달력",
    "log": "기록",
    "notes": "노트",
    "about": "소개",
    "settings": "설정",
    "admin": "관리자",
    "users": "사용자",
    "feedback": "피드백",
    "engagement": "참여",
    "log_out": "로그아웃",
    "sign_up": "회원가입",
    "sign_in": "로그인"
  },
  "pt": {
    "today": "Hoje",
    "bible_books": "Livros da Bíblia",
    "chapter_checklist": "Lista de Capítulos",
    "calendar": "Calendário",
    "log": "Registro",
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
    "log": "Журнал",
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
