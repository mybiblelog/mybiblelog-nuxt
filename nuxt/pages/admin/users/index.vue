<template>
  <main>
    <section class="section">
      <div class="container">
        <div class="level">
          <div class="level-left">
            <h1 class="title">
              Users Admin
            </h1>
          </div>
          <div class="level-right">
            <input v-model="searchText" class="input" type="text" placeholder="Search by email">
          </div>
        </div>
        <div>
          <div>
            Page
            <div class="select">
              <select v-model="page">
                <option v-for="p in Array.from({ length: totalPages }).map((_, i) => i + 1)" :key="p" :value="p">
                  {{ p }}
                </option>
              </select>
            </div>
          </div>
          <div>
            Results per page
            <div class="select">
              <select v-model="limit">
                <option v-for="size in [10, 25, 50, 100]" :key="size" :value="size">
                  {{ size }}
                </option>
              </select>
            </div>
          </div>
          <div v-if="totalUsers !== 0">
            Showing {{ offset + 1 }} to {{ Math.min(offset + limit, totalUsers) }} of {{ totalUsers }} users.
          </div>
        </div>
        <div v-if="users" class="table-container">
          <table class="table is-narrow is-striped">
            <thead>
              <tr>
                <th>#</th>
                <th class="sortable" @click="toggleSort(SortColumns.email)">
                  <div class="flex">
                    User
                    <template v-if="sortOn === SortColumns.email">
                      <caret-down v-if="sortDirection === 1" width="1.5rem" height="1.5rem" fill="#666" />
                      <caret-down v-if="sortDirection === -1" class="flipped" width="1.5rem" height="1.5rem" fill="#666" />
                    </template>
                  </div>
                </th>
                <th class="sortable" @click="toggleSort(SortColumns.createdAt)">
                  <div class="flex">
                    Join Date
                    <template v-if="sortOn === SortColumns.createdAt">
                      <caret-down v-if="sortDirection === 1" width="1.5rem" height="1.5rem" fill="#666" />
                      <caret-down v-if="sortDirection === -1" class="flipped" width="1.5rem" height="1.5rem" fill="#666" />
                    </template>
                  </div>
                </th>
                <th>Controls</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loadError">
                <td colspan="7">
                  There was an error loading users.
                </td>
              </tr>
              <tr v-else-if="!users.length">
                <td colspan="7">
                  There are no users.
                </td>
              </tr>
              <tr v-for="(user, index) in users" :key="user._id">
                <td>{{ offset + index + 1 }}</td>
                <td>{{ user.email }}</td>
                <td class="nowrap">
                  {{ user.createdAt.split('T')[0] }}
                </td>
                <td>
                  <div class="buttons">
                    <button class="button is-light is-primary is-small" @click="openUserDetails(user)">
                      Details
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- User Details Modal -->
    <div class="modal" :class="{ 'is-active': selectedUser }">
      <div class="modal-background" @click="closeUserDetails" />
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">
            {{ selectedUser?.email || 'Loading...' }}
          </p>
          <button class="delete" aria-label="close" @click="closeUserDetails" />
        </header>
        <section class="modal-card-body">
          <div v-if="selectedUser">
            <div class="buttons">
              <button class="button is-primary" @click="signInAsUser">
                Sign In As User
              </button>
              <button class="button is-danger" @click="deleteUser(selectedUser.email)">
                Delete User
              </button>
            </div>
          </div>
          <div v-else>
            <p>Loading user details...</p>
          </div>
        </section>
        <footer class="modal-card-foot">
          <button class="button" @click="closeUserDetails">
            Close
          </button>
        </footer>
      </div>
    </div>
  </main>
</template>

<script>
import CaretDown from '@/components/svg/CaretDown';

const SortColumns = {
  email: 'email',
  createdAt: 'createdAt',
};

export default {
  name: 'AdminUserListPage',
  components: {
    CaretDown,
  },
  middleware: ['auth2'],
  meta: {
    auth: 'admin',
  },
  data() {
    return {
      users: null, // becomes array when loaded
      totalUsers: 0,
      loadError: false,
      selectedUser: null,

      SortColumns,
      sortOn: SortColumns.createdAt,
      sortDirection: -1, // 1 | -1
      searchText: '', // for searching by email
      limit: 50,
      page: 1, // for pagination
    };
  },
  head() {
    return {
      meta: [
        { hid: 'robots', name: 'robots', content: 'noindex' },
      ],
    };
  },
  computed: {
    offset() {
      return (this.page - 1) * this.limit;
    },
    totalPages() {
      return Math.ceil(this.totalUsers / this.limit) || 1;
    },
  },
  watch: {
    limit() {
      this.page = 1;
      this.loadUsers();
    },
    page() {
      this.loadUsers();
    },
    searchText() {
      // Only search when there are at least 3 characters
      // OR when the search text is cleared
      if (this.searchText.length && this.searchText.length < 3) {
        return;
      }
      this.page = 1;
      this.loadUsers();
    },
  },
  mounted() {
    this.loadUsers();
  },
  destroyed() {
    clearInterval(this.pollInterval);
  },
  methods: {
    buildUsersRequestUrl() {
      const url = new URL(this.$config.siteUrl); // from nuxt.config.js
      url.pathname = '/api/admin/users';

      if (this.searchText) {
        url.searchParams.set('searchText', this.searchText);
      }
      if (this.sortOn) {
        url.searchParams.set('sortOn', this.sortOn);
      }
      if (this.sortDirection) {
        const readableDirection = this.sortDirection === 1 ? 'ascending' : 'descending';
        url.searchParams.set('sortDirection', readableDirection);
      }
      if (this.limit) {
        url.searchParams.set('limit', this.limit);
      }
      if (this.offset) {
        url.searchParams.set('offset', this.offset);
      }

      return url.toString();
    },
    loadUsers() {
      const url = this.buildUsersRequestUrl();
      fetch(url, {
        credentials: 'include',
      })
        .then(async (response) => {
          if (!response.ok) {
            throw new Error('Failed to load users');
          }
          const responseData = await response.json();
          const {
            // limit,
            // offset,
            results: users,
            size,
          } = responseData;

          this.users = users;
          this.totalUsers = size;
        })
        .catch((error) => {
          console.error('Error loading users:', error);
          this.users = [];
          this.loadError = true;
        });
    },
    toggleSort(column) {
      if (this.sortOn !== column) {
        this.sortOn = column;
        this.sortDirection = 1;
      }
      else {
        this.sortDirection *= -1;
      }
      this.loadUsers();
    },
    async deleteUser(email) {
      if (email === this.$store.state.auth2.user.email) {
        await this.$store.dispatch('dialog/alert', {
          message: 'You cannot delete your own account.',
        });
        return;
      }
      let confirmed = false;
      confirmed = await this.$store.dispatch('dialog/confirm', {
        message: `Are you sure you want to delete account "${email}"? This action cannot be undone.`,
      });
      if (!confirmed) {
        return;
      }
      confirmed = await this.$store.dispatch('dialog/confirm', {
        message: `Are you absolutely certain? The account "${email}" will be completely removed from the system.`,
      });
      if (!confirmed) {
        return;
      }
      try {
        const response = await fetch(`/api/admin/users/${email}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Failed to delete user');
        }
        this.selectedUser = null;
        this.loadUsers();
      }
      catch (err) {
        await this.$store.dispatch('dialog/alert', {
          message: 'Unable to delete user.',
        });
      }
    },
    openUserDetails(user) {
      this.selectedUser = user;
    },
    closeUserDetails() {
      this.selectedUser = null;
    },
    async signInAsUser() {
      if (!this.selectedUser) { return; }

      const confirmed = await this.$store.dispatch('dialog/confirm', {
        message: 'Are you sure you want to sign in as this user? You will be logged out of your own account.',
      });
      if (!confirmed) {
        return;
      }
      try {
        // Clear any cached data from admin account session
        sessionStorage.clear();

        const response = await fetch(`/api/admin/users/${this.selectedUser.email}/login`, {
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Unable to sign in as user.');
        }
        await this.$router.push(this.localePath({ path: '/', query: { } }));
        await this.$store.dispatch('auth2/refreshUser');
      }
      catch (error) {
        await this.$store.dispatch('dialog/alert', {
          message: 'Unable to sign in as user.',
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
table.table {
  width: 100%;
}
.flex {
  display: flex;
}
.sortable {
  cursor: pointer;
  transition: 0.2s;
  &:hover {
    background-color: #eee;
  }
}
.nowrap {
  white-space: nowrap;
}
.flipped {
  transform: rotate(180deg);
}
</style>
