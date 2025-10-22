<template>
  <nuxt-link :to="to" class="info-link" :aria-label="ariaLabel">
    <span class="info-icon">i</span>
  </nuxt-link>
</template>

<script>
export default {
  name: 'InfoLink',
  props: {
    to: {
      type: String,
      required: true,
    },
  },
  computed: {
    ariaLabel() {
      return this.$t('aria.more_information');
    },
  },
};
</script>

<style scoped>
.info-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

.info-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1em;
  height: 1em;
  border-radius: 50%;
  background-color: #c7c7c7; /* gray circle */
  color: white; /* white text */
  font-size: 0.6em;
  font-weight: bold;
}
</style>

<i18n>
{
  "en": {
    "aria": {
      "more_information": "More information"
    }
  },
  "es": {
    "aria": {
      "more_information": "Más información"
    }
  },
  "fr": {
    "aria": {
      "more_information": "Plus d'informations"
    }
  },
  "uk": {
    "aria": {
      "more_information": "Більше інформації"
    }
  }
}
</i18n>
