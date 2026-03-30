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

<i18n locale="en" lang="json" src="@/locales/sfc/en/components/SiteNav.json" />
<i18n locale="de" lang="json" src="@/locales/sfc/de/components/SiteNav.json" />
<i18n locale="es" lang="json" src="@/locales/sfc/es/components/SiteNav.json" />
<i18n locale="fr" lang="json" src="@/locales/sfc/fr/components/SiteNav.json" />
<i18n locale="ko" lang="json" src="@/locales/sfc/ko/components/SiteNav.json" />
<i18n locale="pt" lang="json" src="@/locales/sfc/pt/components/SiteNav.json" />
<i18n locale="uk" lang="json" src="@/locales/sfc/uk/components/SiteNav.json" />
