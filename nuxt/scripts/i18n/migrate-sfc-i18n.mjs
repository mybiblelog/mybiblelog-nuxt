import { promises as fs } from 'node:fs';
import path from 'node:path';
import JSON5 from 'json5';

const SCRIPT_DIR = path.resolve(new URL('.', import.meta.url).pathname);
// This script lives at `nuxt/scripts/i18n/*`, so the Nuxt root is 2 levels up.
const NUXT_ROOT = path.resolve(SCRIPT_DIR, '../..');

const SFC_DIRS = [
  { kind: 'components', dir: path.join(NUXT_ROOT, 'components') },
  { kind: 'pages', dir: path.join(NUXT_ROOT, 'pages') },
];

const LOCALES = ['en', 'de', 'es', 'fr', 'pt', 'uk'];

async function* walkFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield * walkFiles(fullPath);
    }
    else if (entry.isFile() && fullPath.endsWith('.vue')) {
      yield fullPath;
    }
  }
}

function tryParseI18nJson(raw) {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error('Empty <i18n> block');
  }
  try {
    return JSON.parse(trimmed);
  }
  catch {
    return JSON5.parse(trimmed);
  }
}

function isAlreadyMigrated(vueSource) {
  return /<i18n\b[^>]*\blocale=/.test(vueSource) && /<i18n\b[^>]*\bsrc=/.test(vueSource);
}

function findInlineI18nBlockToReplace(vueSource) {
  // Find the first i18n block that does NOT declare a locale and does NOT use src.
  // This matches your current pattern: <i18n lang="json"> { "en": {...}, ... } </i18n>
  const re = /<i18n\b(?![^>]*\blocale=)(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/i18n>/m;
  const match = vueSource.match(re);
  if (!match) { return null; }

  return {
    fullMatch: match[0],
    body: match[1],
  };
}

function toOutJsonPath({ kind, vueFilePath, locale }) {
  const baseDir = path.join(NUXT_ROOT, 'locales', 'sfc', locale, kind);
  const rel = path.relative(path.join(NUXT_ROOT, kind), vueFilePath);
  const relNoExt = rel.replace(/\.vue$/, '.json');
  return path.join(baseDir, relNoExt);
}

function toSrcAttr({ kind, vueFilePath, locale }) {
  const rel = path.relative(path.join(NUXT_ROOT, kind), vueFilePath).replace(/\.vue$/, '.json');
  // Use Nuxt alias so the path is stable regardless of file location.
  return `@/locales/sfc/${locale}/${kind}/${rel.replaceAll(path.sep, '/')}`;
}

function buildReplacementI18nTags({ kind, vueFilePath }) {
  return LOCALES
    .map(locale => `<i18n locale="${locale}" lang="json" src="${toSrcAttr({ kind, vueFilePath, locale })}" />`)
    .join('\n');
}

async function ensureDirForFile(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

async function migrateFile({ kind, vueFilePath }) {
  const original = await fs.readFile(vueFilePath, 'utf8');

  if (!original.includes('<i18n')) {
    return { status: 'skipped_no_i18n' };
  }

  if (isAlreadyMigrated(original)) {
    return { status: 'skipped_already_migrated' };
  }

  const block = findInlineI18nBlockToReplace(original);
  if (!block) {
    return { status: 'skipped_no_inline_block' };
  }

  const parsed = tryParseI18nJson(block.body);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Unexpected <i18n> JSON shape (expected an object keyed by locale codes)');
  }

  // Extract per-locale JSON files.
  for (const locale of LOCALES) {
    const messages = parsed[locale] ?? {};
    const outPath = toOutJsonPath({ kind, vueFilePath, locale });
    await ensureDirForFile(outPath);
    await fs.writeFile(outPath, JSON.stringify(messages, null, 2) + '\n', 'utf8');
  }

  const replacement = buildReplacementI18nTags({ kind, vueFilePath });
  const updated = original.replace(block.fullMatch, replacement);
  await fs.writeFile(vueFilePath, updated, 'utf8');

  return { status: 'migrated' };
}

async function main() {
  const results = {
    migrated: 0,
    skipped_no_i18n: 0,
    skipped_already_migrated: 0,
    skipped_no_inline_block: 0,
    errors: 0,
  };

  for (const { kind, dir } of SFC_DIRS) {
    for await (const vueFilePath of walkFiles(dir)) {
      try {
        const { status } = await migrateFile({ kind, vueFilePath });

        // console.log(status, path.relative(NUXT_ROOT, vueFilePath));
        results[status] += 1;
      }
      catch (err) {
        results.errors += 1;
        // eslint-disable-next-line no-console
        console.error('Error:', path.relative(NUXT_ROOT, vueFilePath));
        // eslint-disable-next-line no-console
        console.error(err);
      }
    }
  }

  // eslint-disable-next-line no-console
  console.log(JSON.stringify(results, null, 2));

  if (results.errors > 0) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});
