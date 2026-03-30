<template>
  <footer v-if="columns && columns.length > 0" class="page-footer">
    <div class="footer-container">
      <nav class="footer-nav">
        <div class="footer-columns">
          <ul
            v-for="(column, columnIndex) in columns"
            :key="columnIndex"
            class="footer-column"
          >
            <li v-for="(link, linkIndex) in column" :key="linkIndex" class="footer-link-item">
              <component
                :is="isExternalLink(link.destination) ? 'a' : 'nuxt-link'"
                :href="isExternalLink(link.destination) ? link.destination : undefined"
                :to="isExternalLink(link.destination) ? undefined : localePath(link.destination)"
                :target="isExternalLink(link.destination) ? '_blank' : undefined"
                :rel="isExternalLink(link.destination) ? 'noopener noreferrer' : undefined"
                class="footer-link"
              >
                {{ link.text }}
              </component>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'PageFooter',
  data() {
    return {
      columns: [
        [
          { text: this.$t('home'), destination: '/' },
          { text: this.$t('faq'), destination: '/faq' },
        ],
        [
          { text: this.$t('give_feedback'), destination: '/feedback' },
          { text: this.$t('contribute'), destination: '/contribute' },
        ],
        [
          { text: this.$t('donate_ko_fi'), destination: 'https://ko-fi.com/mybiblelog' },
          { text: this.$t('code_on_github'), destination: 'https://github.com/mybiblelog/mybiblelog-nuxt' },
        ],
        [
          { text: this.$t('privacy_policy'), destination: '/policy/privacy' },
          { text: this.$t('terms_and_conditions'), destination: '/policy/terms' },
        ],
      ],
    };
  },
  methods: {
    isExternalLink(url) {
      return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:');
    },
  },
};
</script>

<style lang="scss" scoped>
.page-footer {
  min-height: 20vh;
  margin: 4rem 0 0;
  padding: 3rem 0;
  background: linear-gradient(135deg, rgba(0, 170, 249, 0.05) 0%, rgba(9, 101, 247, 0.05) 50%, rgba(0, 209, 178, 0.05) 100%);
  border-top: 1px solid rgba(0, 170, 249, 0.1);
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.footer-nav {
  width: 100%;
}

.footer-columns {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(max-content, 1fr);
  justify-content: center;
  gap: 3rem;

  @media screen and (max-width: 768px) {
    grid-auto-flow: row;
    grid-auto-columns: 1fr;
    gap: 2rem;
  }
}

.footer-column {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
}

.footer-link-item {
  margin: 0;
}

.footer-link {
  color: #555;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s ease;
  position: relative;
  padding: 0.5rem 0;

  @media screen and (max-width: 768px) {
    font-size: 0.9375rem;
  }

  &:hover {
    color: var(--primary-color, #00aaf9);
    transform: translateY(-1px);
  }

  &:active {
    color: var(--secondary-color, #0965f7);
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0.25rem;
    left: 0;
    width: 0;
    height: 2px;
    background: linear-gradient(135deg, var(--primary-color, #00aaf9) 0%, var(--secondary-color, #0965f7) 100%);
    transition: width 0.3s ease;
  }

  &:hover::after {
    width: 100%;
  }
}
</style>

<i18n locale="en" lang="json" src="@/locales/sfc/en/components/content/PageFooter.json" />
<i18n locale="de" lang="json" src="@/locales/sfc/de/components/content/PageFooter.json" />
<i18n locale="es" lang="json" src="@/locales/sfc/es/components/content/PageFooter.json" />
<i18n locale="fr" lang="json" src="@/locales/sfc/fr/components/content/PageFooter.json" />
<i18n locale="ko" lang="json" src="@/locales/sfc/ko/components/content/PageFooter.json" />
<i18n locale="pt" lang="json" src="@/locales/sfc/pt/components/content/PageFooter.json" />
<i18n locale="uk" lang="json" src="@/locales/sfc/uk/components/content/PageFooter.json" />
