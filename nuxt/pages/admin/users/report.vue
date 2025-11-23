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
            <p class="has-text-grey">
              Overview of user engagement
            </p>
          </div>
        </div>
        <completion-bar v-if="!users" :percentage="percentComplete" foreground-color="#09F" />
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
                <th class="sortable" @click="toggleSort(SortColumns.lastLogEntryDate)">
                  <div class="flex">
                    Last Log Entry
                    <template v-if="sortOn === SortColumns.lastLogEntryDate">
                      <caret-down v-if="sortDirection === 1" width="1.5rem" height="1.5rem" fill="#666" />
                      <caret-down v-if="sortDirection === -1" class="flipped" width="1.5rem" height="1.5rem" fill="#666" />
                    </template>
                  </div>
                </th>
                <th class="sortable" @click="toggleSort(SortColumns.lastNoteDate)">
                  <div class="flex">
                    Last Note
                    <template v-if="sortOn === SortColumns.lastNoteDate">
                      <caret-down v-if="sortDirection === 1" width="1.5rem" height="1.5rem" fill="#666" />
                      <caret-down v-if="sortDirection === -1" class="flipped" width="1.5rem" height="1.5rem" fill="#666" />
                    </template>
                  </div>
                </th>
                <th class="sortable" @click="toggleSort(SortColumns.daysSinceLastLogEntry)">
                  <div class="flex">
                    Days Since Last Entry
                    <template v-if="sortOn === SortColumns.daysSinceLastLogEntry">
                      <caret-down v-if="sortDirection === 1" width="1.5rem" height="1.5rem" fill="#666" />
                      <caret-down v-if="sortDirection === -1" class="flipped" width="1.5rem" height="1.5rem" fill="#666" />
                    </template>
                  </div>
                </th>
                <th class="sortable" @click="toggleSort(SortColumns.daysSinceLastNote)">
                  <div class="flex">
                    Days Since Last Note
                    <template v-if="sortOn === SortColumns.daysSinceLastNote">
                      <caret-down v-if="sortDirection === 1" width="1.5rem" height="1.5rem" fill="#666" />
                      <caret-down v-if="sortDirection === -1" class="flipped" width="1.5rem" height="1.5rem" fill="#666" />
                    </template>
                  </div>
                </th>
                <th class="sortable" @click="toggleSort(SortColumns.logEntryCount)">
                  <div class="flex">
                    Log Entry Count
                    <template v-if="sortOn === SortColumns.logEntryCount">
                      <caret-down v-if="sortDirection === 1" width="1.5rem" height="1.5rem" fill="#666" />
                      <caret-down v-if="sortDirection === -1" class="flipped" width="1.5rem" height="1.5rem" fill="#666" />
                    </template>
                  </div>
                </th>
                <th class="sortable" @click="toggleSort(SortColumns.noteCount)">
                  <div class="flex">
                    Note Count
                    <template v-if="sortOn === SortColumns.noteCount">
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
              <tr v-for="(user, index) in sortedUsers" :key="user._id">
                <td>{{ index + 1 }}</td>
                <td>{{ user.email }}</td>
                <td class="nowrap">
                  {{ user.createdAt.split('T')[0] }}
                </td>
                <td class="nowrap">
                  {{ user.lastLogEntryDate || '---' }}
                </td>
                <td class="nowrap">
                  {{ user.lastNoteDate || '---' }}
                </td>
                <td class="nowrap">
                  {{ user.daysSinceLastLogEntry === Infinity ? '---' : user.daysSinceLastLogEntry }}
                </td>
                <td class="nowrap">
                  {{ user.daysSinceLastNote === Infinity ? '---' : user.daysSinceLastNote }}
                </td>
                <td class="nowrap">
                  {{ user.logEntryCount }}
                </td>
                <td class="nowrap">
                  {{ user.noteCount }}
                </td>
                <td>
                  <div class="buttons">
                    <nuxt-link class="button is-light is-primary is-small" :to="localePath('/admin/users/' + user.email)" target="_blank">
                      Details
                    </nuxt-link>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </main>
</template>

<script>
import dayjs from 'dayjs';
import CompletionBar from '@/components/CompletionBar';
import CaretDown from '@/components/svg/CaretDown';

const SortColumns = {
  email: 'email',
  createdAt: 'createdAt',
  lastLogEntryDate: 'lastLogEntryDate',
  daysSinceLastLogEntry: 'daysSinceLastLogEntry',
  logEntryCount: 'logEntryCount',
  lastNoteDate: 'lastNoteDate',
  daysSinceLastNote: 'daysSinceLastNote',
  noteCount: 'noteCount',
};

export default {
  name: 'AdminUserListPage',
  components: {
    CompletionBar,
    CaretDown,
  },
  middleware: ['auth2'],
  meta: {
    auth: 'admin',
  },
  data() {
    return {
      pollInterval: null,
      percentComplete: 0,
      loadError: false,
      users: null, // becomes array when loaded

      SortColumns,
      sortOn: SortColumns.email,
      sortDirection: 1, // 1 | -1
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
    sortedUsers() {
      const getValue = (user) => {
        const rawValue = user[this.sortOn];
        if (typeof rawValue === 'string') {
          return rawValue.toLocaleLowerCase();
        }
        return rawValue;
      };
      return Array.from(this.users).sort((u1, u2) => {
        const v1 = getValue(u1);
        const v2 = getValue(u2);
        let comparison = 0;
        if (v1 > v2) {
          comparison = 1;
        }
        else if (v1 < v2) {
          comparison = -1;
        }
        if (this.sortDirection === -1) {
          comparison *= -1;
        };
        return comparison;
      });
    },
  },
  mounted() {
    this.pollReportStatus();
  },
  destroyed() {
    clearInterval(this.pollInterval);
  },
  methods: {
    pollReportStatus() {
      const getReportStatus = async () => {
        try {
          const reportStatusResponse = await this.$axios.get(`/api/admin/reports/user-engagement/status`);
          const { status, progress } = reportStatusResponse.data;
          this.percentComplete = progress;
          if (status === 'ready') {
            clearInterval(this.pollInterval);
            this.loadReport();
          }
        }
        catch (err) {
          this.loadError = true;
          clearInterval(this.pollInterval);
        }
      };
      getReportStatus();
      this.pollInterval = setInterval(getReportStatus, 1000);
    },
    async loadReport() {
      try {
        const reportResponse = await this.$axios.get(`/api/admin/reports/user-engagement`);
        const report = reportResponse.data;
        const users = report.data.users;

        const today = dayjs();
        users.forEach((user) => {
          if (user.lastLogEntryDate) {
            const lastLogEntryDate = dayjs(user.lastLogEntryDate);
            user.daysSinceLastLogEntry = today.diff(lastLogEntryDate, 'day');
          }
          else {
            user.daysSinceLastLogEntry = Infinity;
          }
          if (user.lastNoteDate) {
            const lastNoteDate = dayjs(user.lastNoteDate);
            user.daysSinceLastNote = today.diff(lastNoteDate, 'day');
          }
          else {
            user.daysSinceLastNote = Infinity;
          }
        });
        this.users = users;
      }
      catch (err) {
        this.loadError = true;
      }
    },
    toggleSort(column) {
      if (this.sortOn !== column) {
        this.sortOn = column;
        this.sortDirection = 1;
      }
      else {
        this.sortDirection *= -1;
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
