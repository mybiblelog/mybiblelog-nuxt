/**
 * USFM 3-letter book IDs by Protestant bibleOrder (1–66), aligned with
 * {@link ./static/bible-books} `bibleOrder`. Index 0 is unused.
 *
 * @see https://ubsicap.github.io/usfm/identification/books.html
 */
export const BIBLE_ORDER_TO_USFM: readonly string[] = [
  '',
  'GEN', 'EXO', 'LEV', 'NUM', 'DEU', 'JOS', 'JDG', 'RUT',
  '1SA', '2SA', '1KI', '2KI', '1CH', '2CH', 'EZR', 'NEH',
  'EST', 'JOB', 'PSA', 'PRO', 'ECC', 'SNG', 'ISA', 'JER',
  'LAM', 'EZK', 'DAN', 'HOS', 'JOL', 'AMO', 'OBA', 'JON', 'MIC',
  'NAM', 'HAB', 'ZEP', 'HAG', 'ZEC', 'MAL',
  'MAT', 'MRK', 'LUK', 'JHN', 'ACT', 'ROM', '1CO', '2CO',
  'GAL', 'EPH', 'PHP', 'COL', '1TH', '2TH', '1TI', '2TI',
  'TIT', 'PHM', 'HEB', 'JAS', '1PE', '2PE', '1JN', '2JN',
  '3JN', 'JUD', 'REV',
] as const;

export const bookIndexToUsfm = (bibleOrder: number): string | null => {
  if (bibleOrder < 1 || bibleOrder > 66) {
    return null;
  }
  return BIBLE_ORDER_TO_USFM[bibleOrder] ?? null;
};
