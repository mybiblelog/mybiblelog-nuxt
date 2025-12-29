<template>
  <section class="fifty-fifty-section" :class="{ 'fifty-fifty-section--reverse': reverse }">
    <div class="fifty-fifty-container content-column">
      <div class="fifty-fifty-image">
        <div :class="imageContainerClass">
          <img :src="image" :alt="imageAlt || title">
        </div>
      </div>
      <div class="fifty-fifty-content">
        <h2 class="fifty-fifty-title" v-html="title" />
        <p class="fifty-fifty-subtitle" v-html="subtitle" />
        <p class="fifty-fifty-description" v-html="description" />
        <ul v-if="list && list.length > 0" class="fifty-fifty-list">
          <li v-for="(item, index) in list" :key="index" v-html="item" />
        </ul>
        <div v-if="buttonText && buttonDestination" class="fifty-fifty-cta">
          <nuxt-link :to="localePath(buttonDestination)" class="button is-primary">
            {{ buttonText }}
          </nuxt-link>
        </div>
        <p v-if="note" class="fifty-fifty-note" v-html="note" />
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'FiftyFiftyComponent',
  props: {
    image: {
      type: String,
      required: true,
    },
    imageAlt: {
      type: String,
      default: '',
    },
    imageContainerClass: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    list: {
      type: Array,
      default: () => [],
    },
    buttonText: {
      type: String,
      default: '',
    },
    buttonDestination: {
      type: String,
      default: '',
    },
    note: {
      type: String,
      default: '',
    },
    reverse: {
      type: [Boolean],
      default: false,
    },
  },
};
</script>

<style lang="scss" scoped>
.fifty-fifty-section {
  margin: 3rem 0;
  padding: 2rem 0;
}

.fifty-fifty-container {
  display: flex;
  align-items: center;
  gap: 3rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;

  @media screen and (max-width: 768px) {
    flex-direction: column;
    gap: 2rem;
  }
}

.fifty-fifty-section--reverse .fifty-fifty-container {
  flex-direction: row-reverse;

  @media screen and (max-width: 768px) {
    flex-direction: column;
  }
}

.fifty-fifty-image {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    max-width: 500px;
    max-height: 80vh;
    height: auto;
    object-fit: contain;
  }
}

.fifty-fifty-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.fifty-fifty-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  line-height: 1.3;
  color: #333;

  @media screen and (max-width: 768px) {
    font-size: 1.75rem;
  }
}

.fifty-fifty-subtitle {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--secondary-color, #0965f7);
  line-height: 1.4;

  @media screen and (max-width: 768px) {
    font-size: 1.125rem;
  }
}

.fifty-fifty-description {
  font-size: 1.125rem;
  line-height: 1.7;
  color: #555;
  margin-bottom: 0.5rem;

  @media screen and (max-width: 768px) {
    font-size: 1rem;
  }
}

.fifty-fifty-list {
  list-style: none;
  padding-left: 0;
  margin: 1rem 0;

  li {
    font-size: 1.125rem;
    line-height: 1.7;
    color: #555;
    padding: 0.5rem 0;
    padding-left: 1.5rem;
    position: relative;

    @media screen and (max-width: 768px) {
      font-size: 1rem;
    }

    &::before {
      content: '✓';
      position: absolute;
      left: 0;
      color: var(--tertiary-color, #00d1b2);
      font-weight: bold;
      font-size: 1.25rem;
    }
  }
}

.fifty-fifty-cta {
  margin-top: 1rem;
}

.button.is-primary {
  background-color: var(--primary-color, #00aaf9);
  border-color: var(--primary-color, #00aaf9);
  font-weight: 600;
  padding: 0.875rem 2rem;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 170, 249, 0.3);

  &:hover {
    background-color: var(--secondary-color, #0965f7);
    border-color: var(--secondary-color, #0965f7);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 170, 249, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
}

.fifty-fifty-note {
  font-size: 0.875rem;
  color: #666;
  margin-top: 0.5rem;
  font-style: italic;
}
</style>
