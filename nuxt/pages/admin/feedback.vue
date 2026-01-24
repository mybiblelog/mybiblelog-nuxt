<template>
  <main>
    <div class="content-column">
      <h1 class="title">
        Admin Feedback Review
      </h1>
      <div v-if="!feedbacks.length">
        <p>There are no feedbacks.</p>
      </div>
      <div v-else>
        <div class="table-container">
          <table class="table is-striped is-fullwidth">
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
                  <div class="is-size-7" style="text-wrap: nowrap;">
                    {{ dayjs(feedback.createdAt).format('YYYY-MM-DD hh:mm a') }}
                  </div>
                  <div>{{ feedback.email }}</div>
                  <div class="is-size-7">
                    {{ feedback.ip }}
                  </div>
                </td>
                <td>
                  <div class="is-size-7" :class="feedbackKindClass(feedback.kind)">
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
        'has-text-success': kind === 'feature',
        'has-text-warning': kind === 'question' || kind === 'comment',
        'has-text-danger': kind === 'bug',
      };
    },
  },
};
</script>

<style lang="scss" scoped>
.table-container {
  overflow-x: auto;
  margin: 0 -0.75rem;
  padding: 0 0.75rem;

  table {
    min-width: 600px;
  }
}
</style>
