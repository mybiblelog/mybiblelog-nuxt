/**
 * Verifies that every non-English locale under nuxt/locales/sfc/ has the same
 * dot-notation leaf keys as English for global JSON and every mirrored SFC JSON file.
 *
 * Locales are discovered from directory names in nuxt/locales/sfc/ (excluding `en`).
 *
 * Usage: node nuxt/scripts/i18n/verify-i18n-keys.mjs
 * Exit 1 on any mismatch.
 */
import fs from 'node:fs';
import path from 'node:path';

const SCRIPT_DIR = path.resolve(new URL('.', import.meta.url).pathname);
const NUXT_ROOT = path.resolve(SCRIPT_DIR, '../..');

function flattenKeys(obj, prefix = '') {
  const keys = [];
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    return keys;
  }
  for (const [k, v] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      keys.push(...flattenKeys(v, p));
    }
    else {
      keys.push(p);
    }
  }
  return keys.sort();
}

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function compareTrees(baseLabel, enPath, otherPath, locale) {
  const en = loadJson(enPath);
  const other = loadJson(otherPath);
  const ek = flattenKeys(en);
  const ok = flattenKeys(other);
  const es = new Set(ek);
  const os = new Set(ok);
  const missing = ek.filter(k => !os.has(k));
  const extra = ok.filter(k => !es.has(k));
  if (missing.length || extra.length) {
    console.error(`\n${baseLabel}`);
    if (missing.length) {
      console.error(`  Missing in ${locale}:`, missing.join(', '));
    }
    if (extra.length) {
      console.error(`  Extra in ${locale}:`, extra.join(', '));
    }
    return false;
  }
  return true;
}

function walkJsonFiles(dir) {
  const out = [];
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, name.name);
    if (name.isDirectory()) {
      out.push(...walkJsonFiles(p));
    }
    else if (name.isFile() && name.name.endsWith('.json')) {
      out.push(p);
    }
  }
  return out;
}

function listSfcLocales() {
  const sfcRoot = path.join(NUXT_ROOT, 'locales/sfc');
  return fs
    .readdirSync(sfcRoot, { withFileTypes: true })
    .filter(d => d.isDirectory() && d.name !== 'en')
    .map(d => d.name)
    .sort();
}

let ok = true;
const locales = listSfcLocales();

if (locales.length === 0) {
  console.error('No non-English locale directories found under nuxt/locales/sfc/');
  process.exitCode = 1;
}
else {
  const globalEn = path.join(NUXT_ROOT, 'locales/global/en.json');
  const sfcEn = path.join(NUXT_ROOT, 'locales/sfc/en');
  const enFiles = walkJsonFiles(sfcEn);

  for (const locale of locales) {
    const globalOther = path.join(NUXT_ROOT, 'locales/global', `${locale}.json`);
    if (!fs.existsSync(globalOther)) {
      console.error(`\nMissing global locale file: locales/global/${locale}.json`);
      ok = false;
    }
    else if (!compareTrees(`global/en.json vs ${locale}.json`, globalEn, globalOther, locale)) {
      ok = false;
    }

    for (const enPath of enFiles) {
      const rel = path.relative(sfcEn, enPath);
      const otherPath = path.join(NUXT_ROOT, 'locales/sfc', locale, rel);
      if (!fs.existsSync(otherPath)) {
        console.error(`Missing ${locale} file for sfc/${rel}`);
        ok = false;
        continue;
      }
      if (!compareTrees(`sfc/${rel} (${locale})`, enPath, otherPath, locale)) {
        ok = false;
      }
    }
  }

  if (!ok) {
    process.exitCode = 1;
  }
  else {
    console.log(
      `OK: key parity en ↔ [${locales.join(', ')}] (${enFiles.length} SFC files × ${locales.length} locales + global per locale).`,
    );
  }
}
