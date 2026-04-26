<template>
  <main>
    <section class="mbl-section">
      <div class="mbl-container">
        <h1 class="mbl-title">
          Past Week Engagement
        </h1>
        <div class="mbl-content">
          <template v-if="loading">
            <p>Loading...</p>
          </template>
          <template v-else>
            <div class="mbl-table-wrap">
              <table class="mbl-table mbl-table--narrow mbl-table--striped">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>New Users</th>
                    <th>Log Entry Users</th>
                    <th>Note Users</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, index) in engagementData" :key="index">
                    <td>{{ displayDate(row.date) }}</td>
                    <td>{{ row.newUserAccounts }}</td>
                    <td>{{ row.usersWithLogEntry }}</td>
                    <td>{{ row.usersWithNote }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
        </div>
      </div>
    </section>
  </main>
</template>

<script>
import { displayDate } from '@mybiblelog/shared';
import { useDialogStore } from '~/stores/dialog';

export default {
  name: 'AdminEngagementPage',
  middleware: ['auth'],
  meta: {
    auth: 'admin',
  },
  data() {
    return {
      loading: true,
      engagementData: null,
    };
  },
  head() {
    return {
      meta: [
        { hid: 'robots', name: 'robots', content: 'noindex' },
      ],
    };
  },
  mounted() {
    this.loadData();
  },
  methods: {
    async loadData() {
      try {
        const { data: engagementData } = await this.$http.get('/api/admin/reports/user-engagement/past-week');
        this.engagementData = engagementData;
      }
      catch (err) {
        const dialogStore = useDialogStore();
        await dialogStore.alert({ message: 'Error loading engagement data.' });
      }
      this.loading = false;
    },
    displayDate(date) {
      return displayDate(date, this.$i18n.locale);
    },
  },
};
</script>

<style scoped>

</style>
