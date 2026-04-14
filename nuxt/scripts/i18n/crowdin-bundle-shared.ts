/**
 * Shared helpers for Crowdin bundle export/import (inline SFC i18n blocks).
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';

export function isPlainObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

/** api/services/email/locales/strings.json — merged into each Crowdin locale bundle as `email`. */
export function emailLocaleStringsPath(nuxtRoot: string): string {
  return path.join(nuxtRoot, '..', 'api', 'services', 'email', 'locales', 'strings.json');
}

/** First inline block: no locale= and no src= (multi-locale JSON object). */
export const INLINE_I18N_RE =
  /<i18n\b(?![^>]*\blocale=)(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/i18n>/m;

export async function* walkVueFiles(dir: string): AsyncGenerator<string> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      yield * walkVueFiles(full);
    }
    else if (ent.isFile() && ent.name.endsWith('.vue')) {
      yield full;
    }
  }
}

export function toRelKey(vueFilePath: string, rootDir: string): string {
  const rel = path.relative(rootDir, vueFilePath);
  return rel.replace(/\.vue$/i, '').split(path.sep).join('/');
}

export function isLegacySrcI18n(source: string): boolean {
  return /<i18n\b[^>]*\blocale=/.test(source) && /<i18n\b[^>]*\bsrc=/.test(source);
}

export type InlineI18nMatch = {
  bodyStart: number;
  bodyEnd: number;
};

/** Locates the first inline <i18n> block body span for replacement. */
export function findInlineI18nBodySpan(source: string): InlineI18nMatch | null {
  const m = INLINE_I18N_RE.exec(source);
  if (!m || m.index === undefined) {
    return null;
  }
  const full = m[0];
  const body = m[1];
  const start = m.index;
  const bodyStart = start + full.indexOf(body);
  const bodyEnd = bodyStart + body.length;
  return { bodyStart, bodyEnd };
}

export function findInlineI18nBody(source: string): string | null {
  const span = findInlineI18nBodySpan(source);
  if (!span) {
    return null;
  }
  return source.slice(span.bodyStart, span.bodyEnd).trim();
}

export function replaceInlineI18nBody(source: string, newBody: string): string {
  const span = findInlineI18nBodySpan(source);
  if (!span) {
    throw new Error('No inline <i18n> block found (expected block without locale= / src=)');
  }
  return source.slice(0, span.bodyStart) + newBody + source.slice(span.bodyEnd);
}

/** Parse trimmed JSON body of an inline multi-locale <i18n> block (top-level keys = locale codes). */
export function parseInlineI18nBlockJson(raw: string, filePath: string): Record<string, unknown> {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error(`Empty <i18n> block in ${filePath}`);
  }
  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('Expected a JSON object keyed by locale codes');
    }
    return parsed as Record<string, unknown>;
  }
  catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`${filePath}: ${msg}`);
  }
}
