import Bible from './bible';
import { bookIndexToUsfm } from './bible-usfm';

export type HelloaoVerseSegment =
  | { kind: 'text'; text: string; wordsOfJesus?: boolean; poem?: number }
  | { kind: 'line_break' };

export type HelloaoVerseLine = {
  number: number;
  segments: HelloaoVerseSegment[];
};

/** Verse line with chapter for cross-chapter ranges */
export type HelloaoPassageVerseRow = HelloaoVerseLine & { chapter: number };

/** In-order pieces from one chapter JSON (before chapter number is applied). */
export type HelloaoPassagePiece =
  | { type: 'section_heading'; text: string }
  | { type: 'verse'; number: number; segments: HelloaoVerseSegment[] };

/** API/client block: section titles from the translation + verses. */
export type HelloaoPassageBlock =
  | { type: 'section_heading'; chapter: number; text: string }
  | { type: 'verse'; chapter: number; number: number; segments: HelloaoVerseSegment[] };

export type HelloaoChapterFetchPlan = {
  /** Same as {@link Bible.parseVerseId}.book */
  bookIndex: number;
  usfm: string;
  chapters: number[];
  startChapter: number;
  startVerse: number;
  endChapter: number;
  endVerse: number;
};

/**
 * Validates single-book range and returns which chapter JSON files to load for helloao.
 */
export const getHelloaoChapterFetchPlan = (
  startVerseId: number,
  endVerseId: number,
): HelloaoChapterFetchPlan | null => {
  if (!Bible.validateRange(startVerseId, endVerseId)) {
    return null;
  }
  const start = Bible.parseVerseId(startVerseId);
  const end = Bible.parseVerseId(endVerseId);
  const usfm = bookIndexToUsfm(start.book);
  if (!usfm) {
    return null;
  }
  const chapters: number[] = [];
  for (let c = start.chapter; c <= end.chapter; c += 1) {
    chapters.push(c);
  }
  return {
    bookIndex: start.book,
    usfm,
    chapters,
    startChapter: start.chapter,
    startVerse: start.verse,
    endChapter: end.chapter,
    endVerse: end.verse,
  };
};

type FormattedText = { text: string; poem?: number; wordsOfJesus?: boolean };
type VerseFootnoteReference = { noteId: number };
type InlineHeading = { heading: string };
type InlineLineBreak = { lineBreak: true };

type VerseContentPiece =
  | string
  | FormattedText
  | InlineHeading
  | InlineLineBreak
  | VerseFootnoteReference;

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null;

const pushSegmentsFromContent = (
  segments: HelloaoVerseSegment[],
  content: VerseContentPiece[],
): void => {
  for (const piece of content) {
    if (typeof piece === 'string') {
      if (piece.length) {
        segments.push({ kind: 'text', text: piece });
      }
      continue;
    }
    if (!isRecord(piece)) {
      continue;
    }
    if ('noteId' in piece && typeof piece.noteId === 'number') {
      continue;
    }
    if ('lineBreak' in piece && piece.lineBreak === true) {
      segments.push({ kind: 'line_break' });
      continue;
    }
    if ('heading' in piece && typeof piece.heading === 'string') {
      if (piece.heading.length) {
        segments.push({ kind: 'text', text: piece.heading });
      }
      continue;
    }
    if ('text' in piece && typeof piece.text === 'string') {
      const ft = piece as FormattedText;
      if (ft.text.length) {
        segments.push({
          kind: 'text',
          text: ft.text,
          wordsOfJesus: ft.wordsOfJesus,
          poem: ft.poem,
        });
      }
    }
  }
};

type ChapterContentItem =
  | { type: 'verse'; number: number; content: VerseContentPiece[] }
  | { type: string; [key: string]: unknown };

const headingTextFromContent = (raw: unknown): string => {
  if (!Array.isArray(raw)) {
    return '';
  }
  const parts = raw.filter((x): x is string => typeof x === 'string');
  return parts.join(' ').trim();
};

/**
 * Extracts section headings and verses in order from one helloao chapter payload,
 * constrained to an inclusive verse range. Headings attach to the next verse in file order.
 */
export const extractHelloaoPassagePiecesFromChapter = (
  chapterPayload: unknown,
  minVerse: number,
  maxVerse: number,
): HelloaoPassagePiece[] => {
  if (!isRecord(chapterPayload)) {
    return [];
  }
  const chapter = chapterPayload.chapter;
  if (!isRecord(chapter) || !Array.isArray(chapter.content)) {
    return [];
  }
  const out: HelloaoPassagePiece[] = [];
  let attachHeading: string | null = null;

  for (const item of chapter.content as ChapterContentItem[]) {
    if (!isRecord(item) || typeof item.type !== 'string') {
      continue;
    }
    if (item.type === 'heading') {
      const text = headingTextFromContent(item.content);
      attachHeading = text.length ? text : null;
      continue;
    }
    if (item.type === 'line_break') {
      continue;
    }
    if (item.type !== 'verse') {
      continue;
    }
    const num = item.number;
    if (typeof num !== 'number') {
      continue;
    }
    if (num > maxVerse) {
      break;
    }
    if (num >= minVerse) {
      if (attachHeading !== null && attachHeading.length) {
        out.push({ type: 'section_heading', text: attachHeading });
        attachHeading = null;
      }
      const content = item.content;
      if (!Array.isArray(content)) {
        continue;
      }
      const segments: HelloaoVerseSegment[] = [];
      pushSegmentsFromContent(segments, content as VerseContentPiece[]);
      out.push({ type: 'verse', number: num, segments });
    }
    else {
      attachHeading = null;
    }
  }
  return out;
};

/**
 * Extracts verses only (no section headings) from one helloao chapter payload.
 */
export const extractHelloaoVersesFromChapter = (
  chapterPayload: unknown,
  minVerse: number,
  maxVerse: number,
): HelloaoVerseLine[] => {
  return extractHelloaoPassagePiecesFromChapter(chapterPayload, minVerse, maxVerse)
    .filter((p): p is HelloaoPassagePiece & { type: 'verse' } => p.type === 'verse')
    .map(({ number, segments }) => ({ number, segments }));
};

/**
 * Picks inclusive verse bounds for a chapter within a multi-chapter range.
 */
export const verseBoundsForChapter = (
  plan: HelloaoChapterFetchPlan,
  chapterNumber: number,
): { from: number; to: number } => {
  const { bookIndex, startChapter, startVerse, endChapter, endVerse } = plan;
  const lastInChapter = Bible.getChapterVerseCount(bookIndex, chapterNumber) || 176;
  if (chapterNumber === startChapter && chapterNumber === endChapter) {
    return { from: startVerse, to: endVerse };
  }
  if (chapterNumber === startChapter) {
    return { from: startVerse, to: lastInChapter };
  }
  if (chapterNumber === endChapter) {
    return { from: 1, to: endVerse };
  }
  return { from: 1, to: lastInChapter };
};

/**
 * When true, the UI should show the first chapter of the passage first and offer
 * "read more" for each following chapter. When false, the client may fetch every
 * chapter in the range immediately (e.g. parallel requests).
 *
 * - Single-chapter passages: false (one request loads everything).
 * - Exactly two chapters, both only partially included: false (load both at once).
 * - Otherwise multi-chapter: true.
 */
export const shouldUseChapterByChapterReadMore = (plan: HelloaoChapterFetchPlan): boolean => {
  if (plan.startChapter === plan.endChapter) {
    return false;
  }
  if (plan.chapters.length === 2) {
    const lastInEnd = Bible.getChapterVerseCount(plan.bookIndex, plan.endChapter) || 0;
    const firstChapterPartial = plan.startVerse > 1;
    const lastChapterPartial = lastInEnd > 0 && plan.endVerse < lastInEnd;
    return !(firstChapterPartial && lastChapterPartial);
  }
  return true;
};
