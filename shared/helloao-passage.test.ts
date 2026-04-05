import { describe, expect, it } from '@jest/globals';
import Bible from './bible';
import {
  extractHelloaoPassagePiecesFromChapter,
  extractHelloaoVersesFromChapter,
  getHelloaoChapterFetchPlan,
  shouldUseChapterByChapterReadMore,
  verseBoundsForChapter,
} from './helloao-passage';

describe('helloao-passage', () => {
  it('getHelloaoChapterFetchPlan returns chapters for cross-chapter range', () => {
    const start = Bible.makeVerseId(1, 1, 30);
    const end = Bible.makeVerseId(1, 2, 3);
    const plan = getHelloaoChapterFetchPlan(start, end);
    expect(plan).not.toBeNull();
    expect(plan?.usfm).toBe('GEN');
    expect(plan?.chapters).toEqual([1, 2]);
    expect(plan?.bookIndex).toBe(1);
  });

  it('getHelloaoChapterFetchPlan rejects cross-book range', () => {
    const start = Bible.makeVerseId(1, 50, 1);
    const end = Bible.makeVerseId(2, 1, 1);
    expect(getHelloaoChapterFetchPlan(start, end)).toBeNull();
  });

  it('getHelloaoChapterFetchPlan maps Jonah and Zephaniah to correct USFM (JON / ZEP)', () => {
    const jonah = getHelloaoChapterFetchPlan(
      Bible.makeVerseId(32, 1, 1),
      Bible.makeVerseId(32, 1, 5),
    );
    expect(jonah?.usfm).toBe('JON');

    const zephaniah = getHelloaoChapterFetchPlan(
      Bible.makeVerseId(36, 3, 1),
      Bible.makeVerseId(36, 3, 5),
    );
    expect(zephaniah?.usfm).toBe('ZEP');
  });

  it('verseBoundsForChapter trims first and last chapter', () => {
    const plan = getHelloaoChapterFetchPlan(
      Bible.makeVerseId(1, 1, 30),
      Bible.makeVerseId(1, 2, 3),
    );
    expect(plan).not.toBeNull();
    const b1 = verseBoundsForChapter(plan!, 1);
    expect(b1.from).toBe(30);
    expect(b1.to).toBeGreaterThanOrEqual(30);
    const b2 = verseBoundsForChapter(plan!, 2);
    expect(b2).toEqual({ from: 1, to: 3 });
  });

  it('shouldUseChapterByChapterReadMore is false for single chapter', () => {
    const plan = getHelloaoChapterFetchPlan(
      Bible.makeVerseId(1, 1, 1),
      Bible.makeVerseId(1, 1, 5),
    );
    expect(plan).not.toBeNull();
    expect(shouldUseChapterByChapterReadMore(plan!)).toBe(false);
  });

  it('shouldUseChapterByChapterReadMore is false for two partially included chapters', () => {
    const plan = getHelloaoChapterFetchPlan(
      Bible.makeVerseId(1, 1, 5),
      Bible.makeVerseId(1, 2, 5),
    );
    expect(plan).not.toBeNull();
    expect(plan!.chapters).toEqual([1, 2]);
    expect(shouldUseChapterByChapterReadMore(plan!)).toBe(false);
  });

  it('shouldUseChapterByChapterReadMore is true when first chapter starts at verse 1 spanning into ch2', () => {
    const plan = getHelloaoChapterFetchPlan(
      Bible.makeVerseId(1, 1, 1),
      Bible.makeVerseId(1, 2, 3),
    );
    expect(plan).not.toBeNull();
    expect(shouldUseChapterByChapterReadMore(plan!)).toBe(true);
  });

  it('shouldUseChapterByChapterReadMore is true for three or more chapters', () => {
    const plan = getHelloaoChapterFetchPlan(
      Bible.makeVerseId(1, 1, 5),
      Bible.makeVerseId(1, 3, 5),
    );
    expect(plan).not.toBeNull();
    expect(plan!.chapters.length).toBe(3);
    expect(shouldUseChapterByChapterReadMore(plan!)).toBe(true);
  });

  it('extractHelloaoVersesFromChapter filters by verse numbers', () => {
    const payload = {
      chapter: {
        content: [
          { type: 'heading', content: ['Title'] },
          { type: 'verse', number: 1, content: ['A'] },
          { type: 'verse', number: 2, content: ['B'] },
          { type: 'verse', number: 3, content: ['C'] },
        ],
      },
    };
    const verses = extractHelloaoVersesFromChapter(payload, 2, 3);
    expect(verses.map(v => v.number)).toEqual([2, 3]);
    expect(verses[0].segments.some(s => s.kind === 'text' && s.text === 'B')).toBe(true);
  });

  it('extractHelloaoPassagePiecesFromChapter includes section headings before in-range verses', () => {
    const payload = {
      chapter: {
        content: [
          { type: 'heading', content: ['The Creation'] },
          { type: 'verse', number: 1, content: ['A'] },
          { type: 'heading', content: ['The Second Day'] },
          { type: 'verse', number: 2, content: ['B'] },
          { type: 'verse', number: 3, content: ['C'] },
        ],
      },
    };
    const pieces = extractHelloaoPassagePiecesFromChapter(payload, 2, 3);
    expect(pieces.map(p => p.type)).toEqual(['section_heading', 'verse', 'verse']);
    expect(pieces[0]).toMatchObject({ type: 'section_heading', text: 'The Second Day' });
    expect(pieces[1]).toMatchObject({ type: 'verse', number: 2 });
    expect(pieces[2]).toMatchObject({ type: 'verse', number: 3 });
  });
});
