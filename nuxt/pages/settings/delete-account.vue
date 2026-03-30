<template>
  <div>
    <div class="container content">
      <h1 class="title is-4">
        {{ $t('title') }}
      </h1>
      <div class="content">
        <p>{{ $t('description') }}</p>
        <ul>
          <li>{{ $t('list.account') }}</li>
          <li>{{ $t('list.log_entries') }}</li>
          <li>{{ $t('list.notes') }}</li>
          <li>{{ $t('list.export') }}</li>
          <li>{{ $t('list.permanent') }}</li>
        </ul>
      </div>
      <div class="card">
        <div class="card-content">
          <form>
            <div class="field">
              <label class="checkbox">
                <input v-model="understand.logEntries" type="checkbox"> {{ $t('understand.log_entries') }}
              </label>
            </div>
            <div class="field">
              <label class="checkbox">
                <input v-model="understand.export" type="checkbox"> {{ $t('understand.export') }}
              </label>
            </div>
            <div class="field">
              <label class="checkbox">
                <input v-model="understand.notes" type="checkbox"> {{ $t('understand.notes') }}
              </label>
            </div>
            <div class="field">
              <label class="checkbox">
                <input v-model="understand.permanent" type="checkbox"> {{ $t('understand.permanent') }}
              </label>
            </div>
          </form>
          <button class="button is-primary" :disabled="!fullyUnderstands" @click="deleteAccount">
            {{ $t('delete_my_account') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useToastStore } from '~/stores/toast';
import { useAuthStore } from '~/stores/auth';

export default {
  name: 'DeleteAccountPage',
  middleware: ['auth'],
  data() {
    return {
      formBusy: false,
      understand: {
        logEntries: false,
        export: false,
        notes: false,
        permanent: false,
      },
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
    fullyUnderstands() {
      return (
        this.understand.logEntries &&
        this.understand.export &&
        this.understand.notes &&
        this.understand.permanent
      );
    },
  },
  methods: {
    async deleteAccount() {
      const toastStore = useToastStore();
      try {
        await this.$http.put('/api/settings/delete-account');
        await useAuthStore().logout();
      }
      catch (err) {
        toastStore.add({
          type: 'error',
          text: this.$t('unable_to_delete'),
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
main p {
  margin-bottom: 1rem;
}
</style>

<i18n locale="en" lang="json" src="@/locales/sfc/en/pages/settings/delete-account.json" />
<i18n locale="de" lang="json" src="@/locales/sfc/de/pages/settings/delete-account.json" />
<i18n locale="es" lang="json" src="@/locales/sfc/es/pages/settings/delete-account.json" />
<i18n locale="fr" lang="json" src="@/locales/sfc/fr/pages/settings/delete-account.json" />
<i18n locale="pt" lang="json" src="@/locales/sfc/pt/pages/settings/delete-account.json" />
<i18n locale="uk" lang="json" src="@/locales/sfc/uk/pages/settings/delete-account.json" />
