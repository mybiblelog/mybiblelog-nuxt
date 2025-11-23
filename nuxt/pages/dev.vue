<template>
  <main>
    <section class="section">
      <div class="container">
        <div class="columns is-centered">
          <div class="column is-two-thirds-tablet is-half-desktop">
            <h1 class="title">
              Dev Page
            </h1>

            <!-- vuex auth user -->
            <p>
              Vuex Auth User:
              <code>
                {{ JSON.stringify(user, null, 2) }}
              </code>
            </p>

            <div v-if="loggedIn">
              <p>
                Logged in
              </p>

              <!-- log entries -->
              <div>
                Log Entries:
                <p>{{ logEntries.length }}</p>
                <ul>
                  <li v-for="logEntry in logEntries" :key="logEntry.id">
                    {{ logEntry.date }} - {{ logEntry.startVerseId }} - {{ logEntry.endVerseId }}
                    <button class="button is-small is-danger" @click="deleteLogEntry(logEntry.id)">
                      Delete
                    </button>
                  </li>
                </ul>
                <button class="button is-primary" @click="createLogEntry">
                  Create Log Entry
                </button>
              </div>

              <!-- Logout button -->
              <button v-if="loggedIn" class="button is-primary" @click="logout">
                Logout
              </button>
            </div>
            <div v-else>
              <p>
                Not logged in
              </p>

              <!-- login form -->
              <form v-if="!loggedIn" @submit.prevent="login">
                <div class="field">
                  <label class="label">Email</label>
                  <div class="control">
                    <input v-model="form.email" class="input" type="email" required>
                  </div>
                </div>
                <div class="field">
                  <label class="label">Password</label>
                  <div class="control">
                    <input v-model="form.password" class="input" type="password" required>
                  </div>
                </div>
                <button class="button is-primary" type="submit">
                  Login
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import dayjs from 'dayjs';
import getCookieToken from '@/helpers/getCookieToken';

export default {
  name: 'DevPage',
  layout: 'empty',
  async asyncData({ req, app }) {
    const token = getCookieToken(req);
    let asyncDataUser = null;
    if (token) {
      try {
        const url = new URL(app.$config.siteUrl); // from nuxt.config.js
        url.pathname = '/api/auth/user';
        asyncDataUser = await fetch(url.toString(), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
      catch (error) {
        console.error(error);
      }
    }
    return {
      asyncDataUser,
    };
  },
  data() {
    return {
      asyncDataUser: null,
      form: {
        // email: '',
        // password: '',
        email: 'test@example.com',
        password: 'password',
      },
    };
  },
  head() {
    return {
      title: 'Dev Page',
      meta: [
        { hid: 'robots', name: 'robots', content: 'noindex' },
      ],
    };
  },
  computed: {
    ...mapGetters({
      logEntries: 'log-entries/currentLogEntries',
    }),
    ...mapState({
      loggedIn: state => state.auth2.loggedIn,
      user: state => state.auth2.user,
    }),
  },
  async mounted() {
    if (!this.loggedIn) {
      return;
    }
    await this.$store.dispatch('loadUserData');
  },
  methods: {
    async login() {
      const loginSuccess = await this.$store.dispatch('auth2/login', {
        email: this.form.email,
        password: this.form.password,
      });

      if (loginSuccess) {
        // only doing this here since we aren't redirecting
        await this.$store.dispatch('loadUserData');
      }
    },
    async logout() {
      await this.$store.dispatch('auth2/logout');
    },

    async createLogEntry() {
      await this.$store.dispatch('log-entries/createLogEntry', {
        date: dayjs().format('YYYY-MM-DD'),
        startVerseId: 101001001,
        endVerseId: 101001002,
      });
    },
    async deleteLogEntry(id) {
      await this.$store.dispatch('log-entries/deleteLogEntry', id);
    },
  },
  // NO auth middleware -- this page will be accessible
  // for both authenticated and unauthenticated users
  auth: false,
};
</script>

<style lang="scss" scoped>
//
</style>
