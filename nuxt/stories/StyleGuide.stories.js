export default {
  title: 'Design System / Style guide',
};

export const Overview = () => ({
  template: `
    <div class="mbl-styleguide" style="padding:1.5rem;max-width:960px;margin:0 auto;font-family:system-ui,sans-serif;">
      <h1 class="mbl-title mbl-title--3">mbl design tokens</h1>
      <p class="mbl-content">All UI classes use the <code>mbl-</code> prefix. This story mirrors <code>main.css</code> (tokens + global + mbl).</p>

      <h2 class="mbl-title mbl-title--4 mbl-mt-6">Typography</h2>
      <h1 class="mbl-title mbl-title--1">Title 1</h1>
      <h2 class="mbl-title mbl-title--3">Title 3</h2>
      <p class="mbl-subtitle">Subtitle sample</p>
      <article class="mbl-content">
        <p>Paragraph in <strong>mbl-content</strong> with a <a href="#">link</a>.</p>
        <ul><li>List one</li><li>List two</li></ul>
      </article>
      <p class="mbl-text-muted mbl-text-small">Muted small text</p>
      <p class="mbl-text-danger">Danger text</p>
      <p class="mbl-text-center mbl-bg-muted mbl-p-5">Centered block</p>

      <h2 class="mbl-title mbl-title--4 mbl-mt-6">Buttons</h2>
      <div class="mbl-button-group" style="margin-bottom:1rem;">
        <button type="button" class="mbl-button mbl-button--primary">Primary</button>
        <button type="button" class="mbl-button mbl-button--info">Info</button>
        <button type="button" class="mbl-button mbl-button--light">Light</button>
        <button type="button" class="mbl-button mbl-button--danger">Danger</button>
        <button type="button" class="mbl-button mbl-button--success">Success</button>
      </div>
      <div class="mbl-button-group" style="margin-bottom:1rem;">
        <button type="button" class="mbl-button mbl-button--sm mbl-button--primary">Small</button>
        <button type="button" class="mbl-button mbl-button--lg mbl-button--primary">Large</button>
        <button type="button" class="mbl-button mbl-button--text">Text</button>
        <button type="button" class="mbl-button mbl-button--static">Static</button>
      </div>
      <p><button type="button" class="mbl-delete" aria-label="close" /></p>

      <h2 class="mbl-title mbl-title--4 mbl-mt-6">Forms</h2>
      <div class="mbl-field">
        <label class="mbl-label" for="sg-input">Label</label>
        <div class="mbl-control">
          <input id="sg-input" class="mbl-input" type="text" placeholder="Input" />
        </div>
        <p class="mbl-help mbl-help--danger">Help danger</p>
      </div>
      <div class="mbl-field mbl-field--addons">
        <p class="mbl-control"><button type="button" class="mbl-button mbl-button--light mbl-button--sm">Prev</button></p>
        <div class="mbl-control"><div class="mbl-select mbl-select--sm"><select><option>Page 1</option></select></div></div>
        <p class="mbl-control"><button type="button" class="mbl-button mbl-button--light mbl-button--sm">Next</button></p>
      </div>
      <div class="mbl-field">
        <label class="mbl-checkbox"><input type="checkbox" /> Checkbox</label>
      </div>
      <div class="mbl-field">
        <label class="mbl-radio"><input type="radio" name="sg-r" /> Radio</label>
      </div>

      <h2 class="mbl-title mbl-title--4 mbl-mt-6">Table</h2>
      <div class="mbl-table-wrap">
        <table class="mbl-table mbl-table--striped mbl-table--narrow">
          <thead><tr><th>A</th><th>B</th></tr></thead>
          <tbody><tr><td>1</td><td>2</td></tr><tr><td>3</td><td>4</td></tr></tbody>
        </table>
      </div>

      <h2 class="mbl-title mbl-title--4 mbl-mt-6">Message & notification</h2>
      <article class="mbl-message mbl-message--info" style="margin-bottom:1rem;">
        <div class="mbl-message__header"><p>Info header</p></div>
        <div class="mbl-message__body">Info message with header + body</div>
      </article>
      <article class="mbl-message mbl-message--info" style="margin-bottom:1rem;">
        <div class="mbl-message__body">Info message body only</div>
      </article>
      <div class="mbl-notification mbl-notification--success">Success notification</div>

      <h2 class="mbl-title mbl-title--4 mbl-mt-6">Modal (static)</h2>
      <div style="position:relative;height:220px;background:#eee;border-radius:6px;overflow:hidden;">
        <div class="mbl-modal mbl-modal--active" style="position:absolute;">
          <div class="mbl-modal__backdrop" />
          <div class="mbl-modal__card" style="max-height:200px;">
            <header class="mbl-modal__head">
              <p class="mbl-modal__title">Title</p>
              <button type="button" class="mbl-delete" aria-label="close" />
            </header>
            <section class="mbl-modal__body">Modal body</section>
            <footer class="mbl-modal__foot">
              <button type="button" class="mbl-button mbl-button--primary">OK</button>
              <button type="button" class="mbl-button mbl-button--light">Cancel</button>
            </footer>
          </div>
        </div>
      </div>

      <h2 class="mbl-title mbl-title--4 mbl-mt-6">Layout</h2>
      <div class="mbl-centered-column">
        <div class="mbl-bg-muted">Sidebar width</div>
        <div class="mbl-bg-muted">Grow</div>
      </div>
      <div class="mbl-box mbl-mt-5">Box</div>
    </div>
  `,
});
