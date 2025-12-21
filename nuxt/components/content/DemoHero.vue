<template>
  <section class="hero-section">
    <div class="hero-content">
      <h1 class="hero-title">
        <strong>{{ title }}</strong>
      </h1>
      <p class="hero-subtitle">
        <em>{{ subtitle }}</em>
      </p>
      <p class="hero-description" v-html="description" />
      <div class="hero-cta">
        <nuxt-link :to="localePath('/register')" class="button is-primary is-large">
          {{ buttonText }}
        </nuxt-link>
        <p class="hero-cta-note">
          <em>{{ ctaNote }}</em>
        </p>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'DemoHero',
  props: {
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    buttonText: {
      type: String,
      required: true,
    },
    ctaNote: {
      type: String,
      required: true,
    },
  },
};
</script>

<style lang="scss" scoped>
$primary-color: #00aaf9;
$secondary-color: #0965f7;
$tertiary-color: #00d1b2;

.hero-section {
  padding: 4rem 1.5rem;
  background: linear-gradient(135deg, rgba($primary-color, 0.05) 0%, rgba($secondary-color, 0.05) 50%, rgba($tertiary-color, 0.05) 100%);
  border-radius: 12px;
  margin: 2rem 0;
  text-align: center;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  line-height: 1.2;
  background: linear-gradient(135deg, $primary-color 0%, $secondary-color 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media screen and (max-width: 768px) {
    font-size: 2.5rem;
  }
}

.hero-subtitle {
  font-size: 1.5rem;
  color: #4a4a4a;
  margin-bottom: 1.5rem;
  font-style: italic;

  @media screen and (max-width: 768px) {
    font-size: 1.25rem;
  }
}

.hero-description {
  font-size: 1.125rem;
  line-height: 1.7;
  color: #555;
  margin-bottom: 2.5rem;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;

  @media screen and (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 2rem;
  }

  em {
    font-style: italic;
    color: #333;
  }

  strong {
    font-weight: 600;
    color: $secondary-color;
  }
}

.hero-cta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.button.is-primary {
  background-color: $primary-color;
  border-color: $primary-color;
  font-weight: 600;
  padding: 1rem 2.5rem;
  font-size: 1.125rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba($primary-color, 0.3);

  &:hover {
    background-color: $secondary-color;
    border-color: $secondary-color;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba($primary-color, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
}

.hero-cta-note {
  font-size: 0.9rem;
  color: #666;
  margin: 0;

  em {
    font-style: italic;
  }
}
</style>
