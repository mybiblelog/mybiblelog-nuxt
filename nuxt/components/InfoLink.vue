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

<i18n locale="en" lang="json" src="@/locales/sfc/en/components/InfoLink.json" />
<i18n locale="de" lang="json" src="@/locales/sfc/de/components/InfoLink.json" />
<i18n locale="es" lang="json" src="@/locales/sfc/es/components/InfoLink.json" />
<i18n locale="fr" lang="json" src="@/locales/sfc/fr/components/InfoLink.json" />
<i18n locale="pt" lang="json" src="@/locales/sfc/pt/components/InfoLink.json" />
<i18n locale="uk" lang="json" src="@/locales/sfc/uk/components/InfoLink.json" />
