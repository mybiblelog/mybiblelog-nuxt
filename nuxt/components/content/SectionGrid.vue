<template>
  <div class="h3-grid-container">
    <slot />
  </div>
</template>

<script>
export default {
  name: 'SectionGrid',
  mounted() {
    // If no explicit tiles are provided, automatically process h3 sections
    // This allows the component to work with plain markdown structure
    this.$nextTick(() => {
      const hasExplicitTiles = this.$el.querySelectorAll('.h3-grid-item').length > 0;
      if (!hasExplicitTiles) {
        this.processAutomatic();
      }
    });
  },
  methods: {
    processAutomatic() {
      // Find all h3 elements within this component
      const h3Elements = Array.from(this.$el.querySelectorAll('h3'));

      if (h3Elements.length === 0) { return; }

      // Group h3s and their following content
      const h3Sections = [];
      let currentSection = null;

      // Process all child nodes of the grid container
      const childNodes = Array.from(this.$el.childNodes);
      const introElements = [];

      childNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.tagName === 'H3') {
            // Start a new section
            if (currentSection) {
              h3Sections.push(currentSection);
            }
            currentSection = {
              h3: node,
              content: [],
            };
          }
          else if (currentSection) {
            // Add content to current section (until next h3 or end)
            if (node.tagName !== 'H3') {
              currentSection.content.push(node);
            }
          }
          else {
            // This is intro content before any h3
            introElements.push(node);
          }
        }
      });

      // Add the last section if it exists
      if (currentSection) {
        h3Sections.push(currentSection);
      }

      // If we have h3 sections, wrap them in grid items
      if (h3Sections.length > 0) {
        // Clear intro elements from DOM temporarily
        introElements.forEach((el) => {
          if (el.parentNode) {
            el.parentNode.removeChild(el);
          }
        });

        // Process and add grid items
        h3Sections.forEach((section) => {
          const gridItem = document.createElement('div');
          gridItem.className = 'h3-grid-item';

          // Process H3 to separate emoji from text
          const h3 = section.h3;
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

          // Remove h3 from its current position
          if (h3.parentNode) {
            h3.parentNode.removeChild(h3);
          }

          // Move the h3 into the grid item
          gridItem.appendChild(h3);

          // Move all content into the grid item
          section.content.forEach((contentEl) => {
            if (contentEl.parentNode) {
              contentEl.parentNode.removeChild(contentEl);
            }
            gridItem.appendChild(contentEl);
          });

          // Add grid item to container
          this.$el.appendChild(gridItem);
        });

        // Re-add intro elements at the beginning
        introElements.reverse().forEach((el) => {
          this.$el.insertBefore(el, this.$el.firstChild);
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.h3-grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin: 1.5rem 0 2rem;

  @media screen and (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

// Styles for automatically processed tiles (when not using explicit SectionGridTile)
::v-deep .h3-grid-item {
  border: 2px solid;
  border-image-slice: 1;
  border-image-source: linear-gradient(to right, var(--primary-color, #00aaf9) 0%, var(--secondary-color, #0965f7) 100%);
  padding: 1.5rem;
  position: relative;
  overflow: hidden;

  h3 {
    margin-top: 0;
    margin-bottom: 0.75rem;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--secondary-color, #0965f7);
  }

  .h3-gradient-text {
    background: linear-gradient(to right, var(--primary-color, #00aaf9) 0%, var(--secondary-color, #0965f7) 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    color: transparent;
  }

  p {
    margin-bottom: 0.5rem;
    color: #444;
    line-height: 1.6;

    &:last-child {
      margin-bottom: 0;
    }
  }

  ul, ol {
    margin: 0.5rem 0;
    padding-left: 1.5rem;
    color: #444;
  }

  a {
    color: var(--primary-color, #00aaf9);
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
