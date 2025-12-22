<template>
  <footer v-if="links && links.length > 0" class="page-footer">
    <div class="footer-container content-column">
      <nav class="footer-nav">
        <ul class="footer-links">
          <li v-for="(link, index) in links" :key="index" class="footer-link-item">
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
      </nav>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'PageFooter',
  props: {
    links: {
      type: Array,
      required: true,
      validator(value) {
        return value.every(link =>
          link &&
          typeof link.text === 'string' &&
          typeof link.destination === 'string',
        );
      },
    },
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

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1.5rem 2rem;

  @media screen and (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
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
