<template>
  <main>
    <div class="content-column">
      <h1 class="mbl-title">
        Admin Feedback Review
      </h1>
      <div v-if="!feedbacks.length">
        <p>There are no feedbacks.</p>
      </div>
      <div v-else>
        <div class="mbl-table-wrap">
          <table class="mbl-table mbl-table--striped mbl-table--full">
            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th>Feedback</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(feedback, index) in feedbacks" :key="feedback._id">
                <td>{{ index + 1 }}</td>
                <td>
                  <div class="mbl-text-small" style="text-wrap: nowrap;">
                    {{ dayjs(feedback.createdAt).format('YYYY-MM-DD hh:mm a') }}
                  </div>
                  <div>{{ feedback.email }}</div>
                  <div class="mbl-text-small">
                    {{ feedback.ip }}
                  </div>
                </td>
                <td>
                  <div class="mbl-text-small" :class="feedbackKindClass(feedback.kind)">
                    {{ feedback.kind }}
                  </div>
                  <div>{{ feedback.message }}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import dayjs from 'dayjs';

export default {
  name: 'AdminFeedbackReviewPage',
  middleware: ['auth'],
  meta: {
    auth: 'admin',
  },
  data() {
    return {
      feedbacks: [],
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
    this.loadFeedbacks();
  },
  methods: {
    dayjs,
    async loadFeedbacks() {
      try {
        const { data: feedbacks } = await this.$http.get('/api/admin/feedback');
        this.feedbacks = feedbacks;
      }
      catch (err) {
        console.error('Failed to load feedbacks:', err);
        this.feedbacks = [];
      }
    },
    feedbackKindClass(kind) {
      return {
        'mbl-text-success': kind === 'feature',
        'mbl-text-warning': kind === 'question' || kind === 'comment',
        'mbl-text-danger': kind === 'bug',
      };
    },
  },
};
</script>

<style scoped>
.mbl-table-wrap {
  overflow-x: auto;
  margin: 0 -0.75rem;
  padding: 0 0.75rem;

  table {
    min-width: 600px;
  }
}
</style>
