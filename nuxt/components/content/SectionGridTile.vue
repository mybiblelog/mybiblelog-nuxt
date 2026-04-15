<template>
  <div class="h3-grid-item">
    <slot />
  </div>
</template>

<script>
export default {
  name: 'SectionGridTile',
  mounted() {
    // Process H3 to separate emoji from text for gradient effect
    this.processH3();
  },
  methods: {
    processH3() {
      const h3 = this.$el.querySelector('h3');
      if (!h3) { return; }

      const h3Text = h3.textContent || '';
      // Match emoji at the start (including variation selectors and zero-width joiners)
      const emojiMatch = h3Text.match(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F?|\p{Emoji_Modifier_Base}\p{Emoji_Modifier}?)/u);

      if (emojiMatch) {
        const emoji = emojiMatch[0];
        const textAfterEmoji = h3Text.slice(emoji.length).trim();

        // Clear the H3 and rebuild with emoji and wrapped text
        h3.textContent = '';
        h3.appendChild(document.createTextNode(emoji + ' '));

        if (textAfterEmoji) {
          const textSpan = document.createElement('span');
          textSpan.className = 'h3-gradient-text';
          textSpan.textContent = textAfterEmoji;
          h3.appendChild(textSpan);
        }
      }
      else {
        // No emoji, wrap all text
        const textSpan = document.createElement('span');
        textSpan.className = 'h3-gradient-text';
        textSpan.textContent = h3Text;
        h3.textContent = '';
        h3.appendChild(textSpan);
      }
    },
  },
};
</script>

<style scoped>
.h3-grid-item {
  border: 2px solid;
  border-image-slice: 1;
  border-image-source: linear-gradient(to right, var(--primary-color, #00aaf9) 0%, var(--secondary-color, #0965f7) 100%);
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
}

.h3-grid-item h3 {
  margin-top: 0;
  margin-bottom: 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--secondary-color, #0965f7);
}

.h3-grid-item ::v-deep .h3-gradient-text {
  background: linear-gradient(to right, var(--primary-color, #00aaf9) 0%, var(--secondary-color, #0965f7) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

.h3-grid-item p {
  margin-bottom: 0.5rem;
  color: #444;
  line-height: 1.6;
}

.h3-grid-item p:last-child {
  margin-bottom: 0;
}

.h3-grid-item ul,
.h3-grid-item ol {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
  color: #444;
}

.h3-grid-item a {
  color: var(--primary-color, #00aaf9);
  text-decoration: none;
  font-weight: 500;
}

.h3-grid-item a:hover {
  text-decoration: underline;
}
</style>
