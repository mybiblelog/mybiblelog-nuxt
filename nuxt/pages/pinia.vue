<template>
  <main>
    <div class="content-column">
      <header class="page-header">
        <h1 class="title">
          Pinia demo
        </h1>
      </header>

      <div class="box">
        <p class="mb-2">
          <strong>Store name:</strong> {{ demoStore.name }}
        </p>
        <p class="mb-2">
          <strong>Count:</strong> {{ demoStore.count }}
        </p>
        <p class="mb-4">
          <strong>Double:</strong> {{ demoStore.doubleCount }}
        </p>

        <div class="buttons">
          <button class="button is-primary" @click="demoStore.increment()">
            Increment
          </button>
          <button class="button is-light" @click="demoStore.reset()">
            Reset
          </button>
        </div>

        <hr>

        <div class="field">
          <label class="label">Update store name</label>
          <div class="control">
            <input v-model="newName" class="input" type="text" placeholder="Type a new name">
          </div>
        </div>

        <div class="buttons">
          <button class="button is-info" @click="demoStore.setName(newName)">
            Set name
          </button>
        </div>
      </div>

      <p class="help">
        Reload the page to verify the store still initializes cleanly.
      </p>
    </div>
  </main>
</template>

<script>
import { useDemoStore } from '~/stores/demo';

export default {
  name: 'PiniaDemoPage',
  data() {
    return {
      newName: '',
    };
  },
  head() {
    return {
      title: 'Pinia demo',
      meta: [
        { hid: 'robots', name: 'robots', content: 'noindex' },
      ],
    };
  },
  computed: {
    demoStore() {
      return useDemoStore(this.$pinia);
    },
  },
  mounted() {
    if (!this.newName) {
      this.newName = this.demoStore.name;
    }
  },
};
</script>
