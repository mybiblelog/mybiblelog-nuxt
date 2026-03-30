# Managing translations with Crowdin

This document describes how **My Bible Log** stores UI strings, how that layout maps to **Crowdin**, and how maintainers **add keys**, **sync translations**, and **introduce a new locale**.

## Source of truth

- **The repository is authoritative.** After you merge a pull request, the JSON files in git are what production builds use.
- **English is the source language** for new keys and copy. Translators work in Crowdin (or elsewhere); **downloaded translations are committed** like any other code change.

Crowdin is a collaboration layer: it helps translators work in context, reuse translations, and review changes. It does not replace git as the system of record.

## Where strings live in the repo

### Global (shared) messages

- **Path:** `nuxt/locales/global/`
- **Files:** One JSON file per app locale code, e.g. `en.json`, `de.json`, `es.json`, `fr.json`, `pt.json`, `uk.json`.
- **Contents:** Keys shared across the app (for example `api_error.*` used by `$terr`, `reading_suggestion.*`, `my_bible_log`, etc.).
- **Loading:** Nuxt i18n is configured with `lazy: true` and `langDir: 'locales/global/'` in `nuxt/i18n.config.ts`. Only the **active locale’s** global file is loaded for that request—not every language at once.

### Component and page messages (SFC-scoped)

- **Path:** `nuxt/locales/sfc/<locale>/components/...` and `nuxt/locales/sfc/<locale>/pages/...`
- **Layout:** Mirrors the path of the Vue file under `nuxt/components/` or `nuxt/pages/`, with `.json` instead of `.vue`.
  - Example: `nuxt/components/forms/FeedbackForm.vue` → `nuxt/locales/sfc/en/components/forms/FeedbackForm.json` (and the same relative path for `de`, `es`, …).
- **Wiring:** Vue files reference those JSON files with **self-closing** `<i18n>` blocks—one block per locale—using the `@/` alias, for example:

```vue
<i18n locale="en" lang="json" src="@/locales/sfc/en/components/forms/FeedbackForm.json" />
<i18n locale="de" lang="json" src="@/locales/sfc/de/components/forms/FeedbackForm.json" />
<!-- ... other locales ... -->
```

These messages are still **scoped to the component or page** that declares the blocks; they ship with the bundles that use them, similar to the old inline `<i18n>` blocks, but the text is **editable as plain JSON** (and Crowdin-friendly).

### What is not in `nuxt/locales/`

Other localized content still lives elsewhere, for example:

- Email templates under `api/services/email/email-templates/`
- Markdown under `nuxt/content/<locale>/`
- Bible book names and related data in `shared/`
- Day.js locales in `shared/date-helpers.ts`

Those are **not** covered by the `nuxt/locales/sfc/**` layout. For a full “new locale” checklist beyond JSON UI strings, see **Adding a new locale** below and the longer list in [README.md](README.md) under **Adding a Locale**.

## Adding or changing strings (developers)

1. **Edit English only** when introducing a new key or changing source copy:
   - Global: `nuxt/locales/global/en.json`
   - Scoped: the matching file under `nuxt/locales/sfc/en/...`
2. Keep JSON **valid** and preserve **vue-i18n** placeholders exactly (e.g. `{field}`, `{minlength}`, `{display_date}`). Do not rename keys unless you update every locale file and every `$t(...)` usage.
3. Run **`npm run -w nuxt build`** (or dev) to catch broken paths or bad JSON.
4. **Upload sources** to Crowdin (see [Syncing with Crowdin](#syncing-with-crowdin)) so translators see the new or updated strings.

Translators (or `crowdin download`) will fill or update the non-English JSON files; you commit those changes in a PR.

## Syncing with Crowdin

### Prerequisites

1. A Crowdin project with **English** as the source language and the same target languages you support in the app (see `shared/i18n.ts`).
2. Either:
   - **Crowdin CLI** (this repo recommends the npm package [`@crowdin/cli`](https://www.npmjs.com/package/@crowdin/cli)), plus a configuration file (recommended: `crowdin.yml` at the **repository root**), or  
   - A **GitHub / GitLab integration** that syncs files according to rules you configure in the Crowdin UI (equivalent to what `crowdin.yml` expresses).

**Security:** Use environment variables for secrets. Do not commit tokens.

- `CROWDIN_PROJECT_ID` — numeric project id from Crowdin  
- `CROWDIN_PERSONAL_TOKEN` — personal access token (Crowdin CLI)

### Installing the CLI (`@crowdin/cli`)

Crowdin publishes a **JavaScript CLI** on npm as [`@crowdin/cli`](https://www.npmjs.com/package/@crowdin/cli). It fits this Node/npm workspace and exposes the `crowdin` command once installed.

**Global install (typical for maintainers):**

```bash
npm install -g @crowdin/cli
```

Confirm it is on your `PATH`:

```bash
crowdin --version
```

**Without a global install** you can run the same CLI via `npx` from any directory:

```bash
npx @crowdin/cli --version
```

Use `npx @crowdin/cli` in place of `crowdin` in the commands below (for example `npx @crowdin/cli upload sources`).

**Optional:** Add `@crowdin/cli` as a **devDependency** in the repo root `package.json` if you want a pinned version for the whole team (`npm install -D @crowdin/cli` at the repo root), then run it with `npx crowdin` or an npm script.

### Typical CLI workflow

From the **repository root**, with `crowdin.yml` present (see below):

```bash
export CROWDIN_PROJECT_ID="YOUR_PROJECT_ID"
export CROWDIN_PERSONAL_TOKEN="YOUR_TOKEN"

# Push updated English sources (new keys, changed strings)
crowdin upload sources

# Pull translated JSON into the repo (then commit)
crowdin download
```

If you did not install globally, prefix with `npx @crowdin/cli` instead of `crowdin`.

Exact flags may vary slightly with CLI version; use `crowdin --help` or `npx @crowdin/cli --help` if needed.

### `crowdin.yml` in this repo

The repository includes [`crowdin.yml`](crowdin.yml) at the **root**. It defines:

- **Global:** `nuxt/locales/global/en.json` → `nuxt/locales/global/%two_letters_code%.json`
- **SFC:** `nuxt/locales/sfc/en/**/*.json` → `nuxt/locales/sfc/%two_letters_code%/**/%original_file_name%` (the `**` in the translation pattern preserves subfolders such as `components/forms/` per [Crowdin’s configuration docs](https://developer.crowdin.com/configuration-file/))

It also sets **`languages_mapping`** so Crowdin **`pt-BR`** exports to paths using **`pt`**, matching `shared/i18n.ts` and `nuxt/locales/sfc/pt/...`. If your Crowdin project uses a different code for Portuguese, adjust the mapping in `crowdin.yml`.

### Portuguese: `pt` in the repo vs `pt-BR` in Crowdin

The app uses locale code **`pt`** (see `shared/i18n.ts`; `iso` is `pt-BR` for URLs/metadata). Crowdin often uses **`pt-BR`** as the language code.

If downloads would otherwise create `pt-BR.json` or `nuxt/locales/sfc/pt-BR/...`, use Crowdin’s **language mapping** (in `crowdin.yml` or the project settings) so files land as **`pt.json`** and **`nuxt/locales/sfc/pt/...`**, matching Nuxt and the `<i18n src=".../pt/...">` paths.

## Adding a new locale

Do this in **addition** to enabling the language in Crowdin.

### 1. Shared locale list and types

- **`shared/i18n.ts`**  
  - Add the new code to the `LocaleCode` union type.  
  - Append `{ code, iso, name }` to the `locales` array (use the correct BCP 47 `iso` for `hreflang` and metadata).

### 2. Nuxt i18n module

- **`nuxt/i18n.config.ts`**  
  - Add a `numberFormats` entry for the new locale code (same shape as existing locales).  
  - The `locales` array is derived from `shared/i18n.ts` and sets `file: \`${locale.code}.json\`` for lazy-loaded global files—no need to duplicate the list by hand if you only changed `shared/i18n.ts`.

### 3. Global JSON file

- Add **`nuxt/locales/global/<code>.json`**, usually by copying `en.json` and translating (or leaving values in English until Crowdin fills them).

### 4. SFC JSON files and Vue `<i18n>` tags

For **every** `nuxt/components/**/*.vue` and `nuxt/pages/**/*.vue` that already has one `<i18n>` line per locale:

1. Add a new line:  
   `<i18n locale="<code>" lang="json" src="@/locales/sfc/<code>/..." />`  
   using the **same relative path** as the existing `en` line, with `<code>` instead of `en`.
2. Add the matching JSON file at  
   `nuxt/locales/sfc/<code>/components/...` or `nuxt/locales/sfc/<code>/pages/...`  
   with the **same key structure** as `en.json` for that file.

Some files may currently have **`{}`** for a locale where translations were missing. The app falls back via `fallbackLocale` in `nuxt/i18n.config.ts`, but you should **replace empty objects with real translations** over time (Crowdin helps here).

### 5. Migration script locale list

If you use **`npm run -w nuxt i18n:migrate-sfc`** ([`nuxt/scripts/i18n/migrate-sfc-i18n.mjs`](nuxt/scripts/i18n/migrate-sfc-i18n.mjs)) for bulk work, update the hardcoded **`LOCALES`** array inside that script to include the new code. Otherwise the script will not emit or expect files for that language.

### 6. Crowdin project

- Add the new target language in Crowdin.  
- Ensure download paths or language mapping match **`nuxt/locales/global/<code>.json`** and **`nuxt/locales/sfc/<code>/...`**.

### 7. Rest of the product (not JSON UI strings)

Complete the steps in [README.md](README.md) **Adding a Locale** for content outside `nuxt/locales/` (email templates, `nuxt/content`, Bible books, dayjs, PDFs, sitemap, settings copy, etc.). You may create **additional Crowdin file groups** for those assets or translate them manually—this doc focuses on **`nuxt/locales/**`**.

### 8. Verify

```bash
npm run heroku-prebuild   # if shared package changed
npm run -w nuxt build
```

## Crowdin project setup (one-time)

1. Create a project; set **English** as the source language.  
2. Add target languages aligned with `shared/i18n.ts`.  
3. Prefer file format **JSON**; preserve **nested keys** (do not flatten keys in Crowdin if it would break `api_error.validation_error`-style paths).  
4. Connect the repo (integration) or install [`@crowdin/cli`](https://www.npmjs.com/package/@crowdin/cli) and use `crowdin.yml` as above.  
5. First **`upload sources`**, then invite translators; after work is done, **`download`** and open a PR.

Optional: use Crowdin **translation memory**, **glossary**, and **screenshots** for context; they are project settings, not repo files.

## Troubleshooting

| Issue | What to check |
|--------|----------------|
| Missing translation at runtime | Key exists in `en.json` for that scope; non-English file has the same key path; typos in `$t('...')`. |
| Wrong or missing file after `crowdin download` | `crowdin.yml` `translation` pattern; `preserve_hierarchy`; **language mapping** for `pt` vs `pt-BR`. |
| Build fails after pull | Invalid JSON (trailing commas, duplicate keys); wrong file path in `<i18n src="...">`. |
| Merge conflicts in JSON | Resolve like code: pick consistent keys; re-run `crowdin download` if needed after fixing `en` sources. |
| Global strings not updating in dev | Lazy global files: restart dev server after changing `nuxt/locales/global/*.json` if hot reload does not pick them up. |
| `crowdin: command not found` | Run `npm install -g @crowdin/cli` or use `npx @crowdin/cli …` instead of `crowdin`. |

## Related files

| File | Role |
|------|------|
| `shared/i18n.ts` | Supported locale codes, ISO codes, display names |
| `nuxt/i18n.config.ts` | Lazy global `langDir`, `vueI18n` fallback, `numberFormats` |
| `nuxt/locales/global/*.json` | Shared messages per locale |
| `nuxt/locales/sfc/<locale>/...` | Per-component/page messages |
| `nuxt/plugins/translate-api.ts` | `$terr` → `api_error.*` keys |
| `nuxt/scripts/i18n/migrate-sfc-i18n.mjs` | Bulk migration helper; `LOCALES` must stay in sync |

For general i18n behavior (`$t`, `$terr`) and non-Crowdin locale work, see [README.md](README.md) **Internationalization (i18n) Notes**.
