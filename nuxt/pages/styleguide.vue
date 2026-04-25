<template>
  <main>
    <div
      class="content-column mbl-styleguide"
      style="padding:1.5rem;max-width:960px;margin:0 auto;font-family:system-ui,sans-serif;"
    >
      <h1 class="mbl-title mbl-title--3">
        mbl design tokens
      </h1>
      <p class="mbl-content">
        All UI classes use the <code>mbl-</code> prefix. This page mirrors <code>main.css</code> (tokens + global + mbl) with live Vue state where helpful.
      </p>

      <h2 class="mbl-title mbl-title--4 mbl-styleguide__section-title">
        Typography
      </h2>
      <h1 class="mbl-title mbl-title--1">
        Title 1
      </h1>
      <h2 class="mbl-title mbl-title--2">
        Title 2
      </h2>
      <h2 class="mbl-title mbl-title--3">
        Title 3
      </h2>
      <h2 class="mbl-title mbl-title--4">
        Title 4
      </h2>
      <h2 class="mbl-title mbl-title--5">
        Title 5
      </h2>
      <h2 class="mbl-title mbl-title--6">
        Title 6
      </h2>
      <p class="mbl-subtitle">
        Subtitle sample
      </p>
      <article class="mbl-content">
        <p>Paragraph in <strong>mbl-content</strong> with a <a href="#">link</a>.</p>
        <ul>
          <li>List one</li>
          <li>
            Nested list
            <ul>
              <li>Circle bullet</li>
              <li>
                Deeper
                <ul>
                  <li>Square bullet</li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>
        <ol>
          <li>Ordered one</li>
          <li>Ordered two</li>
        </ol>
        <h3>Heading inside prose</h3>
        <p>More body copy after a heading.</p>
      </article>
      <p class="mbl-text-muted mbl-text-small">
        Muted small text
      </p>
      <p class="mbl-text-danger">
        Danger text
      </p>
      <p class="mbl-text-success">
        Success text
      </p>
      <p class="mbl-text-warning">
        Warning text
      </p>
      <p class="mbl-text-center mbl-empty-state">
        Centered block (mbl-text-center, mbl-empty-state)
      </p>

      <h2 class="mbl-title mbl-title--4 mbl-styleguide__section-title">
        Buttons
      </h2>
      <div class="mbl-button-group" style="margin-bottom:1rem;">
        <button type="button" class="mbl-button mbl-button--primary">
          Primary
        </button>
        <button type="button" class="mbl-button mbl-button--light">
          Light
        </button>
        <button type="button" class="mbl-button mbl-button--danger">
          Danger
        </button>
      </div>
      <div class="mbl-button-group" style="margin-bottom:1rem;">
        <button type="button" class="mbl-button mbl-button--sm mbl-button--primary">
          Small
        </button>
        <button type="button" class="mbl-button mbl-button--lg mbl-button--primary">
          Large
        </button>
        <button type="button" class="mbl-button mbl-button--text">
          Text
        </button>
        <button type="button" class="mbl-button mbl-button--static">
          Static
        </button>
        <button type="button" class="mbl-button mbl-button--primary" disabled>
          Disabled
        </button>
      </div>
      <p class="mbl-text-small mbl-text-muted mbl-mb-0">
        mbl-button-group alignment modifiers:
      </p>
      <div class="mbl-button-group mbl-button-group--start mbl-empty-state" style="margin-bottom:0.5rem;">
        <button type="button" class="mbl-button mbl-button--light">
          Start
        </button>
        <button type="button" class="mbl-button mbl-button--light">
          Row
        </button>
      </div>
      <div class="mbl-button-group mbl-button-group--center mbl-empty-state" style="margin-bottom:0.5rem;">
        <button type="button" class="mbl-button mbl-button--light">
          Center
        </button>
      </div>
      <div class="mbl-button-group mbl-button-group--end mbl-empty-state" style="margin-bottom:1rem;">
        <button type="button" class="mbl-button mbl-button--light">
          End
        </button>
      </div>
      <p>
        <button type="button" class="mbl-delete" aria-label="close" />
        <button type="button" class="mbl-delete mbl-delete--sm" aria-label="close small" />
      </p>

      <h2 class="mbl-title mbl-title--4 mbl-styleguide__section-title">
        Forms
      </h2>
      <div class="mbl-field">
        <label class="mbl-label" for="sg-input">Label</label>
        <div class="mbl-control">
          <input
            id="sg-input"
            v-model="demoInput"
            class="mbl-input"
            type="text"
            placeholder="Text input"
          >
        </div>
        <p class="mbl-help">
          Neutral help text
        </p>
      </div>
      <div class="mbl-field">
        <label class="mbl-label" for="sg-danger">Danger field</label>
        <div class="mbl-control">
          <input
            id="sg-danger"
            v-model="demoDangerInput"
            class="mbl-input mbl-input--danger"
            type="text"
            placeholder="Invalid value"
          >
        </div>
        <p class="mbl-help mbl-help--danger">
          Help danger
        </p>
      </div>
      <div class="mbl-field">
        <label class="mbl-label" for="sg-textarea">Textarea</label>
        <div class="mbl-control">
          <textarea
            id="sg-textarea"
            v-model="demoTextarea"
            class="mbl-textarea"
            rows="3"
            placeholder="Notes"
          />
        </div>
      </div>
      <div class="mbl-field mbl-field--addons">
        <p class="mbl-control">
          <button type="button" class="mbl-button mbl-button--light mbl-button--sm">
            Prev
          </button>
        </p>
        <div class="mbl-control">
          <div class="mbl-select mbl-select--sm">
            <select v-model="demoSelect">
              <option
                v-for="opt in pageOptions"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>
          </div>
        </div>
        <p class="mbl-control">
          <button type="button" class="mbl-button mbl-button--light mbl-button--sm">
            Next
          </button>
        </p>
      </div>
      <div class="mbl-field mbl-field--addons">
        <p class="mbl-control">
          <button type="button" class="mbl-button mbl-button--light">
            @
          </button>
        </p>
        <div class="mbl-control mbl-control--expanded">
          <input v-model="demoInput" class="mbl-input" type="search" placeholder="Search (expanded control)">
        </div>
        <p class="mbl-control">
          <button type="button" class="mbl-button mbl-button--primary">
            Go
          </button>
        </p>
      </div>
      <div class="mbl-field">
        <label class="mbl-label" for="sg-select">Select (default size)</label>
        <div class="mbl-control">
          <div class="mbl-select">
            <select id="sg-select" v-model="demoSelect">
              <option
                v-for="opt in pageOptions"
                :key="'full-' + opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>
          </div>
        </div>
      </div>
      <div class="mbl-field">
        <label class="mbl-label" for="sg-time">Short input</label>
        <div class="mbl-control">
          <input id="sg-time" v-model="demoTime" class="mbl-input mbl-input--short" type="time">
        </div>
      </div>
      <div class="mbl-field">
        <label class="mbl-label" for="sg-color">Color input</label>
        <div class="mbl-control">
          <input id="sg-color" v-model="demoColor" class="mbl-input" type="color">
        </div>
      </div>
      <div class="mbl-field">
        <label class="mbl-checkbox"><input v-model="demoCheckbox" type="checkbox"> Checkbox</label>
      </div>
      <div class="mbl-field">
        <label class="mbl-radio"><input v-model="demoRadio" type="radio" value="a" name="sg-r"> Radio A</label>
      </div>
      <div class="mbl-field">
        <label class="mbl-radio"><input v-model="demoRadio" type="radio" value="b" name="sg-r"> Radio B</label>
      </div>
      <div class="mbl-field">
        <span class="mbl-label">File input</span>
        <div class="mbl-file-block">
          <label class="mbl-file">
            <input class="mbl-file__input" type="file" @change="onDemoFile">
            <span class="mbl-file__cta">
              <span class="mbl-file__text">{{ demoFileName }}</span>
            </span>
          </label>
        </div>
      </div>
      <div class="mbl-field mbl-field--flush">
        <p class="mbl-text-small mbl-text-muted mbl-mb-0">
          Field above uses mbl-field--flush (no bottom margin).
        </p>
      </div>

      <h2 class="mbl-title mbl-title--4 mbl-styleguide__section-title">
        Table
      </h2>
      <p class="mbl-text-small mbl-text-muted">
        Striped + narrow
      </p>
      <div class="mbl-table-wrap">
        <table class="mbl-table mbl-table--striped mbl-table--narrow">
          <thead><tr><th>A</th><th>B</th></tr></thead>
          <tbody><tr><td>1</td><td>2</td></tr><tr><td>3</td><td>4</td></tr></tbody>
        </table>
      </div>
      <p class="mbl-text-small mbl-text-muted mbl-mt-5">
        Full width, not striped
      </p>
      <div class="mbl-table-wrap">
        <table class="mbl-table mbl-table--full">
          <thead><tr><th>Column</th><th>Column</th><th>Column</th></tr></thead>
          <tbody>
            <tr><td>Alpha</td><td>Beta</td><td>Gamma</td></tr>
            <tr><td>Delta</td><td>Epsilon</td><td>Zeta</td></tr>
          </tbody>
        </table>
      </div>

      <h2 class="mbl-title mbl-title--4 mbl-styleguide__section-title">
        Message &amp; notification
      </h2>
      <article class="mbl-message mbl-message--info" style="margin-bottom:1rem;">
        <div class="mbl-message__header">
          <p>Info header</p>
        </div>
        <div class="mbl-message__body">
          Info message with header + body
        </div>
      </article>
      <article class="mbl-message mbl-message--info" style="margin-bottom:1rem;">
        <div class="mbl-message__body">
          Info message body only
        </div>
      </article>
      <div class="mbl-notification mbl-notification--info" style="margin-bottom:0.5rem;">
        Info notification
      </div>
      <div class="mbl-notification mbl-notification--success" style="margin-bottom:0.5rem;">
        Success notification
      </div>
      <div class="mbl-notification mbl-notification--warning" style="margin-bottom:0.5rem;">
        Warning notification
      </div>
      <div class="mbl-notification mbl-notification--danger" style="margin-bottom:0.5rem;">
        Danger notification
      </div>
      <div class="mbl-notification mbl-notification--success">
        <button type="button" class="mbl-delete" aria-label="dismiss" />
        Notification with dismiss control
      </div>

      <h2 class="mbl-title mbl-title--4 mbl-styleguide__section-title">
        Modal (static)
      </h2>
      <div style="position:relative;height:220px;background:#eee;border-radius:6px;overflow:hidden;">
        <div class="mbl-modal mbl-modal--active" style="position:absolute;">
          <div class="mbl-modal__backdrop" />
          <div class="mbl-modal__card" style="max-height:200px;">
            <header class="mbl-modal__head">
              <p class="mbl-modal__title">
                Title
              </p>
              <button type="button" class="mbl-delete" aria-label="close" />
            </header>
            <section class="mbl-modal__body">
              Modal body
            </section>
            <footer class="mbl-modal__foot">
              <button type="button" class="mbl-button mbl-button--primary">
                OK
              </button>
              <button type="button" class="mbl-button mbl-button--light">
                Cancel
              </button>
            </footer>
          </div>
        </div>
      </div>

      <h2 class="mbl-title mbl-title--4 mbl-styleguide__section-title">
        Tabs
      </h2>
      <div class="mbl-tabs">
        <ul>
          <li><a href="#">First</a></li>
          <li><a href="#" class="router-link-exact-active">Active tab</a></li>
          <li><a href="#">Third</a></li>
        </ul>
      </div>

      <h2 class="mbl-title mbl-title--4 mbl-styleguide__section-title">
        Dropdown
      </h2>
      <div class="mbl-button-group" style="margin-bottom:1rem;flex-wrap:wrap;">
        <div class="mbl-dropdown" :class="{ 'mbl-dropdown--active': dropdownOpen }">
          <div class="mbl-dropdown__trigger">
            <button type="button" class="mbl-button mbl-button--light" @click="dropdownOpen = !dropdownOpen">
              Toggle menu
            </button>
          </div>
          <div class="mbl-dropdown__menu">
            <div class="mbl-dropdown__content">
              <a href="#" class="mbl-dropdown__item" @click.prevent="dropdownOpen = false">Item one</a>
              <a href="#" class="mbl-dropdown__item" @click.prevent="dropdownOpen = false">Item two</a>
            </div>
          </div>
        </div>
        <div style="flex:1 1 auto;text-align:right;">
          <div class="mbl-dropdown mbl-dropdown--right" :class="{ 'mbl-dropdown--active': dropdownRightOpen }">
            <div class="mbl-dropdown__trigger">
              <button type="button" class="mbl-button mbl-button--light" @click="dropdownRightOpen = !dropdownRightOpen">
                Right-aligned
              </button>
            </div>
            <div class="mbl-dropdown__menu">
              <div class="mbl-dropdown__content">
                <a href="#" class="mbl-dropdown__item" @click.prevent="dropdownRightOpen = false">Alpha</a>
                <a href="#" class="mbl-dropdown__item" @click.prevent="dropdownRightOpen = false">Beta</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h2 class="mbl-title mbl-title--4 mbl-styleguide__section-title">
        Card
      </h2>
      <div class="mbl-card mbl-mt-5">
        <div class="mbl-card__content">
          <p class="mbl-title mbl-title--5 mbl-mb-0">
            Card title
          </p>
          <p class="mbl-content">
            <code>.mbl-card</code> with <code>.mbl-card__content</code>. Last field has no extra bottom margin.
          </p>
          <div class="mbl-field">
            <label class="mbl-label" for="sg-card-input">Sample field</label>
            <div class="mbl-control">
              <input id="sg-card-input" class="mbl-input" type="text" placeholder="Inside card">
            </div>
          </div>
        </div>
      </div>

      <h2 class="mbl-title mbl-title--4 mbl-styleguide__section-title">
        Layout
      </h2>
      <p class="mbl-text-small mbl-text-muted">
        mbl-section + mbl-container (nested preview)
      </p>
      <div class="mbl-section mbl-bg-muted" style="padding-top:1rem;padding-bottom:1rem;">
        <div class="mbl-container">
          <p class="mbl-mb-0">
            Content inside <code>.mbl-container</code> within <code>.mbl-section</code>.
          </p>
        </div>
      </div>
      <div class="mbl-box mbl-mt-5">
        Box
      </div>
      <p class="mbl-mt-5">
        <a href="#" class="mbl-box" @click.prevent>Interactive box (link)</a>
      </p>
      <p class="mbl-text-small mbl-text-muted">
        mbl-level + items
      </p>
      <div class="mbl-level">
        <div class="mbl-level-left">
          <div class="mbl-level-item">
            <span class="mbl-text-small">Left group</span>
          </div>
          <div class="mbl-level-item">
            <button type="button" class="mbl-button mbl-button--sm mbl-button--light">
              Action
            </button>
          </div>
        </div>
        <div class="mbl-level-right">
          <div class="mbl-level-item">
            <button type="button" class="mbl-button mbl-button--sm mbl-button--primary">
              Primary
            </button>
          </div>
        </div>
      </div>
      <p class="mbl-text-small mbl-text-muted mbl-mt-5">
        mbl-level--mobile
      </p>
      <div class="mbl-level mbl-level--mobile">
        <div class="mbl-level-item">
          Mobile level row
        </div>
        <div class="mbl-level-item">
          <button type="button" class="mbl-button mbl-button--sm mbl-button--light">
            Btn
          </button>
        </div>
      </div>
      <div class="mbl-flex mbl-empty-state mbl-mt-5" style="gap:0.5rem;align-items:center;">
        <span>mbl-flex</span>
        <button type="button" class="mbl-button mbl-button--sm mbl-button--light">
          One
        </button>
        <button type="button" class="mbl-button mbl-button--sm mbl-button--light">
          Two
        </button>
      </div>
      <p class="mbl-styleguide__no-vertical-padding mbl-text-small mbl-text-muted mbl-mt-5">
        This paragraph uses a local no-vertical-padding style on the element itself.
      </p>
      <p class="mbl-mt-5 mbl-text-small">
        <span class="mbl-hidden-mobile">This sentence uses mbl-hidden-mobile (hidden when viewport ≤768px).</span>
        <span class="mbl-hidden-tablet"> This sentence uses mbl-hidden-tablet (hidden when viewport ≥769px).</span>
      </p>
    </div>
  </main>
</template>

<script>
export default {
  name: 'StyleGuidePage',
  data() {
    return {
      demoInput: '',
      demoDangerInput: '',
      demoTextarea: '',
      demoCheckbox: false,
      demoRadio: 'a',
      demoSelect: '1',
      demoTime: '12:00',
      demoColor: '#3366cc',
      demoFileName: 'Choose a file…',
      dropdownOpen: false,
      dropdownRightOpen: false,
      pageOptions: [
        { value: '1', label: 'Page 1' },
        { value: '2', label: 'Page 2' },
        { value: '3', label: 'Page 3' },
      ],
    };
  },
  head() {
    return {
      title: 'Style guide',
      meta: [
        { hid: 'robots', name: 'robots', content: 'noindex' },
      ],
    };
  },
  methods: {
    onDemoFile(evt) {
      const input = evt.target;
      const file = input.files && input.files[0];
      this.demoFileName = file ? file.name : 'Choose a file…';
    },
  },
};
</script>

<style scoped>
.mbl-styleguide__section-title {
  margin-top: 2rem;
}

.mbl-styleguide__no-vertical-padding {
  padding-bottom: 0;
  padding-top: 0;
}
</style>
