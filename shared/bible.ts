import bibleBooks, { type BibleBook } from './static/bible-books';
import chapterVerses from './static/chapter-verses/nasb';

/**
 * Creates a sorted array of indices for an array,
 * enabling efficient iteration over the array in sorted order
 * without mutating the original array or needing to clone it.
 */
function createSortedIndices<T>(array: ReadonlyArray<Readonly<T>>, compareFn: (a: T, b: T) => number): number[] {
  return Array.from(array.keys()).sort((a, b) =>
    compareFn(array[a], array[b]),
  );
}

type ParsedVerseId = {
  book: number,
  chapter: number,
  verse: number
}

type VerseId = number;

type VerseRange = {
  startVerseId: VerseId,
  endVerseId: VerseId,
}

type Segment = {
  startVerseId: VerseId,
  endVerseId: VerseId,
  read: boolean,
  verseCount: number,
}

const makeVerseId = (book = 0, chapter = 0, verse = 0): VerseId => {
  const verseId = 100000000 + book * 1000000 + chapter * 1000 + verse;
  return verseId;
};

const parseVerseId = (verseId: number): ParsedVerseId => {
  verseId -= 100000000;
  const book = Math.floor(verseId / 1000000);
  verseId -= book * 1000000;
  const chapter = Math.floor(verseId / 1000);
  verseId -= chapter * 1000;
  const verse = verseId;
  return { book, chapter, verse };
};

const getBooks = (): BibleBook[] => bibleBooks;

const getChapterVerses = () => chapterVerses;

const getBookCount = (): number => Bible.getBooks().length;

const getBookChapterCount = (bookIndex: number): number => {
  const targetBook = bibleBooks.find((b) => b.bibleOrder === bookIndex);
  if (!targetBook) { return 0; }
  return targetBook.chapterCount;
};

const getChapterVerseCount = (bookIndex: number, chapterIndex: number): number => {
  const chapterId = Bible.makeVerseId(bookIndex, chapterIndex);
  const result = chapterVerses[chapterId];
  return result || 0;
};

const getBookName = (bookIndex: number, lang: string = 'en'): string => {
  const targetBook = bibleBooks.find((b) => b.bibleOrder === bookIndex);
  if (!targetBook) { return ''; }
  return targetBook.locales[lang].name;
};

const getBookIndex = (bookName: string, lang: string = 'en'): number => {
  const caseInsensitive = bookName.toLocaleLowerCase();
  const targetBook = bibleBooks.find((b) => {
    if (b.locales[lang].name.toLocaleLowerCase() === caseInsensitive) { return true; }
    const insensitiveAbbreviations = b.locales[lang].abbreviations.map((a) => a.toLocaleLowerCase());
    if (insensitiveAbbreviations.includes(caseInsensitive)) { return true; }
    return false;
  });
  if (!targetBook) { return -1; }
  return targetBook.bibleOrder;
};

const verseExists = (verseId: number): boolean => {
  const { book, chapter, verse } = Bible.parseVerseId(verseId);
  const chapterCount = Bible.getBookChapterCount(book);
  if (!chapterCount) {
    return false;
  }
  const verseCount = Bible.getChapterVerseCount(book, chapter);
  if (!verseCount || verse > verseCount) {
    return false;
  }
  return true;
};

const validateRange = (startVerseId: number, endVerseId: number): boolean => {
  if (!Bible.verseExists(startVerseId)) {
    return false;
  }
  if (!Bible.verseExists(endVerseId)) {
    return false;
  }
  if (startVerseId > endVerseId) {
    return false;
  }
  const startVerse = Bible.parseVerseId(startVerseId);
  const endVerse = Bible.parseVerseId(endVerseId);
  if (startVerse.book !== endVerse.book) {
    return false;
  }
  return true;
};

const countRangeVerses = (startVerseId: number, endVerseId: number): number => {
  const startVerse = Bible.parseVerseId(startVerseId);
  const endVerse = Bible.parseVerseId(endVerseId);

  // If we are counting the unread verses between segments that have been read,
  // those unread spans could jump between books
  if (startVerse.book !== endVerse.book) {
    let sum = 0;

    const tailStartVerseId = startVerseId;
    const lastChapter = Bible.getBookChapterCount(startVerse.book);
    const lastVerse = Bible.getChapterVerseCount(startVerse.book, lastChapter);
    const tailEndVerseId = Bible.makeVerseId(startVerse.book, lastChapter, lastVerse);
    const tailVerseCount = Bible.countRangeVerses(tailStartVerseId, tailEndVerseId);
    sum += tailVerseCount;

    for (let i = startVerse.book + 1, l = endVerse.book; i < l; i++) {
      const bookVerseCount = Bible.getBookVerseCount(i);
      sum += bookVerseCount;
    }

    const headStartVerseId = Bible.makeVerseId(endVerse.book, 1, 1);
    const headEndVerseId = endVerseId;
    const headVerseCount = Bible.countRangeVerses(headStartVerseId, headEndVerseId);
    sum += headVerseCount;

    return sum;
  }

  if (startVerse.chapter === endVerse.chapter) {
    return endVerse.verse - startVerse.verse + 1;
  }
  const { book } = startVerse;
  let verseCount = 0;
  for (let i = startVerse.chapter; i <= endVerse.chapter; i++) {
    const chapterVerses = Bible.getChapterVerseCount(book, i);
    if (i === startVerse.chapter) {
      const unreadVerses = (startVerse.verse - 1);
      verseCount += (chapterVerses - unreadVerses);
    }
    else if (i === endVerse.chapter) {
      verseCount += endVerse.verse;
    }
    else {
      verseCount += chapterVerses;
    }
  }
  return verseCount;
};

const getBookVerseCount = (bookIndex: number): number => {
  const bookChapterCount = Bible.getBookChapterCount(bookIndex);
  let totalVerses = 0;
  for (let c = 1, l = bookChapterCount; c <= l; c++) {
    totalVerses += Bible.getChapterVerseCount(bookIndex, c);
  }
  return totalVerses;
};

const getTotalVerseCount = (): number => {
  const books = Bible.getBooks();
  let totalVerses = 0;
  for (let b = 1, l = books.length; b <= l; b++) {
    totalVerses += Bible.getBookVerseCount(b);
  }
  return totalVerses;
};

/**
 * Returns the next verseId. Especially used to jump from
 * the end of a chapter to the beginning of the next chapter
 * without landing on a nonexistent verse.
 *
 * Works between books if `crossBooks` is `true`.
 * Returns `0` when given the last verse of a book if `crossBooks` is false.
 * Returns `0` when given the last verse of the Bible if `crossBooks` is true.
 */
const getNextVerseId = (verseId: number, crossBooks = false): VerseId => {
  let { book, chapter, verse } = Bible.parseVerseId(verseId);
  const bookCount = Bible.getBookCount();
  const bookChapterCount = Bible.getBookChapterCount(book);
  const chapterVerseCount = Bible.getChapterVerseCount(book, chapter);
  if (verse < chapterVerseCount) {
    verse++;
  }
  else if (chapter < bookChapterCount) {
    chapter++;
    verse = 1;
  }
  else if (crossBooks && book < bookCount) {
    book++;
    chapter = 1;
    verse = 1;
  }
  else {
    return 0;
  }
  return Bible.makeVerseId(book, chapter, verse);
};

/**
 * Returns the previous verseId. Especially used to jump from
 * the beginning of a chapter back to the end of the previous chapter
 * without landing on a nonexistent verse.
 *
 * Works between books if `crossBooks` is `true`.
 * Returns `0` when given the first verse of a book if `crossBooks` is false.
 * Returns `0` when given the first verse of the Bible if `crossBooks` is true.
 */
const getPreviousVerseId = (verseId: number, crossBooks = false): VerseId => {
  let { book, chapter, verse } = Bible.parseVerseId(verseId);
  if (verse > 1) {
    verse--;
  }
  else if (chapter > 1) {
    chapter--;
    verse = Bible.getChapterVerseCount(book, chapter);
  }
  else if (crossBooks && book > 1) {
    book--;
    chapter = Bible.getBookChapterCount(book);
    verse = Bible.getChapterVerseCount(book, chapter);
  }
  else {
    return 0;
  }
  return Bible.makeVerseId(book, chapter, verse);
};

const getFirstBookChapterVerseId = (bookIndex: number, chapterIndex: number): VerseId => {
  return Bible.makeVerseId(bookIndex, chapterIndex, 1);
};

const getFirstBookVerseId = (bookIndex: number): VerseId => {
  return Bible.makeVerseId(bookIndex, 1, 1);
};

const getLastBookChapterVerseId = (bookIndex: number, chapterIndex: number): VerseId => {
  const lastChapterVerseCount = Bible.getChapterVerseCount(bookIndex, chapterIndex);
  return Bible.makeVerseId(bookIndex, chapterIndex, lastChapterVerseCount);
};

const getLastBookVerseId = (bookIndex: number): VerseId => {
  const chapterIndex = Bible.getBookChapterCount(bookIndex);
  return Bible.getLastBookChapterVerseId(bookIndex, chapterIndex);
};

/**
 * A function for use with `Array.prototype.sort` that
 * orders ranges based on book and chapter indices.
 * This comparison only takes `startVerseId` into account.
 */
const compareRanges = (range1: VerseRange, range2: VerseRange): number => {
  const startVerse1 = Bible.parseVerseId(range1.startVerseId);
  const startVerse2 = Bible.parseVerseId(range2.startVerseId);
  if (startVerse1.book < startVerse2.book) { return -1; }
  if (startVerse1.book > startVerse2.book) { return 1; }
  if (startVerse1.chapter < startVerse2.chapter) { return -1; }
  if (startVerse1.chapter > startVerse2.chapter) { return 1; }
  if (startVerse1.verse < startVerse2.verse) { return -1; }
  if (startVerse1.verse > startVerse2.verse) { return 1; }
  return 0;
};

const checkRangeOverlap = (range1: VerseRange, range2: VerseRange): boolean => {
  // Sort ranges according to Bible order
  const [firstRange, secondRange] = [range1, range2].sort(Bible.compareRanges);
  return firstRange.endVerseId >= secondRange.startVerseId;
};

/**
 * Counts the total number of verses in an array of ranges,
 * never counting the same verse more than once.
 */
const countUniqueRangeVerses = (ranges: ReadonlyArray<Readonly<VerseRange>>): number => {
  const sortedIndices = createSortedIndices(ranges, Bible.compareRanges);

  let totalVerses = 0;
  let lastRange: Readonly<VerseRange> | null = null;
  for (const index of sortedIndices) {
    const range = ranges[index];
    if (!lastRange) {
      lastRange = range;
    }
    else if (range.startVerseId <= lastRange.endVerseId) {
      if (range.endVerseId > lastRange.endVerseId) {
        lastRange = { ...lastRange, endVerseId: range.endVerseId };
      }
    }
    else {
      totalVerses += Bible.countRangeVerses(lastRange.startVerseId, lastRange.endVerseId);
      lastRange = range;
    }
  }
  if (lastRange) {
    totalVerses += Bible.countRangeVerses(lastRange.startVerseId, lastRange.endVerseId);
  }
  return totalVerses;
};

/**
 * Finds the number of unique verses that exist among `ranges` for the given `book`.
 */
const countUniqueBookRangeVerses = (bookIndex: number, ranges: ReadonlyArray<Readonly<VerseRange>>): number => {
  ranges = Bible.filterRangesByBook(bookIndex, ranges);
  return Bible.countUniqueRangeVerses(ranges);
};

/**
 * Returns a new array comprised only of ranges in the given book.
 */
const filterRangesByBook = (bookIndex: number, ranges: ReadonlyArray<Readonly<VerseRange>>): VerseRange[] => {
  return ranges.filter((r) => {
    const startVerse = Bible.parseVerseId(r.startVerseId);
    return startVerse.book === bookIndex;
  });
};

/**
 * Filters out all ranges that do not overlap the given book chapter,
 * returning the new resulting array.
 */
const filterRangesByBookChapter = (bookIndex: number, chapterIndex: number, ranges: ReadonlyArray<Readonly<VerseRange>>): VerseRange[] => {
  return ranges.filter((r) => {
    const startVerse = Bible.parseVerseId(r.startVerseId);
    const endVerse = Bible.parseVerseId(r.endVerseId);
    return (
      startVerse.book === bookIndex &&
      startVerse.chapter <= chapterIndex &&
      endVerse.chapter >= chapterIndex
    );
  });
};

/**
 * Crops a range's start and end verse IDs to the first and last verse IDs
 * for a given book chapter.
 */
const cropRangeToBookChapter = (bookIndex: number, chapterIndex: number, range: Readonly<VerseRange>): VerseRange => {
  const startVerse = Bible.parseVerseId(range.startVerseId);
  const endVerse = Bible.parseVerseId(range.endVerseId);
  if (startVerse.chapter < chapterIndex) {
    startVerse.chapter = chapterIndex;
    startVerse.verse = 1;
  }
  if (endVerse.chapter > chapterIndex) {
    endVerse.chapter = chapterIndex;
    endVerse.verse = Bible.getChapterVerseCount(bookIndex, chapterIndex);
  }
  const startVerseId = Bible.makeVerseId(startVerse.book, startVerse.chapter, startVerse.verse);
  const endVerseId = Bible.makeVerseId(endVerse.book, endVerse.chapter, endVerse.verse);
  return Object.assign({}, range, { startVerseId, endVerseId });
};

const countUniqueBookChapterRangeVerses = (bookIndex: number, chapterIndex: number, ranges: ReadonlyArray<Readonly<VerseRange>>): number => {
  // Include only ranges that overlap into the given chapter of the given book
  const filteredRanges = Bible.filterRangesByBookChapter(bookIndex, chapterIndex, ranges);

  // Crop out all verses that are beyond the given chapter
  const croppedRanges = filteredRanges.map((range) => {
    return Bible.cropRangeToBookChapter(bookIndex, chapterIndex, range);
  });

  return Bible.countUniqueRangeVerses(croppedRanges);
};

/**
 * Merges any input `ranges` that overlap.
 *
 * This function works across books, but will not create ranges that span multiple books.
 */
const consolidateRanges = (ranges: ReadonlyArray<Readonly<VerseRange>>): VerseRange[] => {
  const sortedIndices = createSortedIndices(ranges, Bible.compareRanges);
  const result: VerseRange[] = [];

  // Sort ranges into constituent books
  const allBookRanges: { [index: number]: VerseRange[] } = {};
  for (let i = 1, l = Bible.getBookCount(); i <= l; i++) {
    allBookRanges[i] = [];
  }
  for (const index of sortedIndices) {
    const range = ranges[index];
    const { book } = Bible.parseVerseId(range.startVerseId);
    allBookRanges[book].push({ ...range });
  }
  for (let bookIndex = 1, l = Bible.getBookCount(); bookIndex <= l; bookIndex++) {
    const bookRanges = allBookRanges[bookIndex];
    const consolidatedBookRanges: VerseRange[] = [];
    let holdingRange: VerseRange | null = null;
    for (const range of bookRanges) {
      if (!holdingRange) {
        holdingRange = range;
        continue;
      }
      const nextVerseId = Bible.getNextVerseId(holdingRange.endVerseId);
      if (!nextVerseId) { // If we reached the end of the book, there's nothing else to consolidate
        break;
      }
      if (range.startVerseId <= nextVerseId) {
        if (range.endVerseId > holdingRange.endVerseId) {
          holdingRange.endVerseId = range.endVerseId;
        }
      }
      else {
        consolidatedBookRanges.push(holdingRange);
        holdingRange = range;
      }
    }
    if (holdingRange) {
      consolidatedBookRanges.push(holdingRange);
    }
    result.push(...consolidatedBookRanges);
  }

  return result;
};

/**
 * Generates an array of ranges between `startVerseId` and `endVerseId`,
 * excluding the original verses.
 */
const getRangesBetweenVerseIds = (startVerseId: VerseId, endVerseId: VerseId): VerseRange[] => {
  if (startVerseId > endVerseId) {
    throw new Error('startVerseId must be before endVerseId');
  }

  // If the verses are consecutive, there are no ranges between them
  if (Bible.getNextVerseId(startVerseId) === endVerseId) {
    return [];
  }

  // We want the output of this function to omit the original verses
  // and only include the verses that are between them
  startVerseId = Bible.getNextVerseId(startVerseId);
  endVerseId = Bible.getPreviousVerseId(endVerseId);

  const { book: startBook } = Bible.parseVerseId(startVerseId);
  const { book: endBook } = Bible.parseVerseId(endVerseId);

  // If verses are in the same book, return a single range
  // from `startVerseId` to `endVerseId`.
  if (startBook === endBook) {
    return [{
      startVerseId,
      endVerseId,
    }];
  }

  // When `startVerseId` and `endVerseId` are from separate books,
  // create a separate range for each book that is crossed.
  const ranges: VerseRange[] = [];

  // Create a range from `startVerseId` to the end of that book.
  ranges.push({
    startVerseId,
    endVerseId: Bible.getLastBookVerseId(startBook),
  });

  // For each book between (if any), create range covering book
  for (let bookIndex = startBook + 1; bookIndex < endBook; bookIndex++) {
    ranges.push({
      startVerseId: Bible.getFirstBookVerseId(bookIndex),
      endVerseId: Bible.getLastBookVerseId(bookIndex),
    });
  }

  // Create range from start of end book to endId
  ranges.push({
    startVerseId: Bible.getFirstBookVerseId(startBook),
    endVerseId,
  });

  return ranges;
};

/**
 * Generates an array of segments, each indicating a read/unread range of verses.
 *
 * Input `ranges` that do not fall within `firstVerseId` and `finalVerseId` will be filtered out.
 * Input `ranges` that overlap `firstVerseId` or `finalVerseId` will be cropped.
 */
const generateSegments = (firstVerseId: VerseId, finalVerseId: VerseId, ranges: ReadonlyArray<Readonly<VerseRange>>): Segment[] => {
  if (firstVerseId > finalVerseId) {
    throw new Error('firstVerseId must be before finalVerseId');
  }

  const segments: Segment[] = [];

  // If there are no ranges, return one giant UNREAD segment
  if (!ranges.length) {
    return [{
      startVerseId: firstVerseId,
      endVerseId: finalVerseId,
      read: false,
      verseCount: Bible.countRangeVerses(firstVerseId, finalVerseId),
    }];
  }

  // Filter out ranges that do not overlap firstVerseId and finalVerseId
  ranges = ranges.filter((range) => {
    return range.endVerseId >= firstVerseId && range.startVerseId <= finalVerseId;
  });

  // Sort and consolidate ranges
  const consolidatedRanges = Bible.consolidateRanges(ranges);

  // Crop ranges to firstVerseId and finalVerseId
  for (const range of consolidatedRanges) {
    if (range.startVerseId < firstVerseId) {
      range.startVerseId = firstVerseId;
    }
    if (range.endVerseId > finalVerseId) {
      range.endVerseId = finalVerseId;
    }
  }

  let lastReadVerseId;
  for (let rangeIndex = 0, rangeCount = consolidatedRanges.length; rangeIndex < rangeCount; rangeIndex++) {
    const range = consolidatedRanges[rangeIndex];

    // Create initial UNREAD segment before first range if needed
    if (rangeIndex === 0) {
      const { startVerseId, endVerseId } = range; // eslint-disable-line
      if (firstVerseId !== startVerseId) {
        const unreadEndVerseId = Bible.getPreviousVerseId(startVerseId);
        segments.push({
          startVerseId: firstVerseId,
          endVerseId: unreadEndVerseId,
          read: false,
          verseCount: Bible.countRangeVerses(firstVerseId, unreadEndVerseId),
        });
      }
    }
    // If this is NOT the first range, and the next range doesn't start immediately,
    // create an UNREAD segment between the two ranges for each book that was crossed.
    else {
      if (!lastReadVerseId) {
        throw new Error('lastReadVerseId is undefined');
      }
      const unreadStartVerseId = Bible.getNextVerseId(lastReadVerseId, true);
      if (range.startVerseId !== unreadStartVerseId) {
        const unreadRanges = Bible.getRangesBetweenVerseIds(lastReadVerseId, range.startVerseId);
        const unreadSegments = unreadRanges.map((range) => ({
          startVerseId: range.startVerseId,
          endVerseId: range.endVerseId,
          read: false,
          verseCount: Bible.countRangeVerses(range.startVerseId, range.endVerseId),
        }));
        segments.push(...unreadSegments);
      }
    }
    // add the range as a READ segment
    const { startVerseId, endVerseId } = range;
    segments.push({
      startVerseId,
      endVerseId,
      read: true,
      verseCount: Bible.countRangeVerses(startVerseId, endVerseId),
    });
    lastReadVerseId = endVerseId;

    // Create trailing UNREAD segment if needed
    if (rangeIndex === rangeCount - 1) {
      if (range.endVerseId !== finalVerseId) {
        const startVerseId = Bible.getNextVerseId(lastReadVerseId);
        segments.push({
          startVerseId,
          endVerseId: finalVerseId,
          read: false,
          verseCount: Bible.countRangeVerses(startVerseId, finalVerseId),
        });
      }
    }
  }

  return segments;
};

/**
 * Given an array of `ranges` that have been read, generates an array of `segments`
 * representing all read and unread portions of the Bible.
 *
 * Each segment has: `startVerseId`, `endVerseId`, `read`, and `verseCount`.
 */
const generateBibleSegments = (ranges: ReadonlyArray<Readonly<VerseRange>>): Segment[] => {
  const segments: Segment[] = [];
  const bookCount = Bible.getBookCount();
  const consolidatedRanges = Bible.consolidateRanges(ranges);
  let rangeIndex = 0;
  for (let bookIndex = 1; bookIndex <= bookCount; bookIndex++) {
    const lastChapterIndex = Bible.getBookChapterCount(bookIndex);
    const lastChapterVerseCount = Bible.getChapterVerseCount(bookIndex, lastChapterIndex);
    const firstVerseId = Bible.makeVerseId(bookIndex, 1, 1);
    const finalVerseId = Bible.makeVerseId(bookIndex, lastChapterIndex, lastChapterVerseCount);
    const bookRanges: VerseRange[] = [];
    while (rangeIndex < consolidatedRanges.length && Bible.parseVerseId(consolidatedRanges[rangeIndex].startVerseId).book === bookIndex) {
      bookRanges.push(consolidatedRanges[rangeIndex]);
      rangeIndex++;
    }
    segments.push(...Bible.generateSegments(firstVerseId, finalVerseId, bookRanges));
  }
  return segments;
};

const generateBookSegments = (bookIndex: number, ranges: ReadonlyArray<Readonly<VerseRange>>): Segment[] => {
  const lastChapterIndex = Bible.getBookChapterCount(bookIndex);
  const lastChapterVerseCount = Bible.getChapterVerseCount(bookIndex, lastChapterIndex);

  const firstVerseId = Bible.makeVerseId(bookIndex, 1, 1);
  const finalVerseId = Bible.makeVerseId(bookIndex, lastChapterIndex, lastChapterVerseCount);

  const filteredRanges = Bible.filterRangesByBook(bookIndex, ranges);

  return Bible.generateSegments(firstVerseId, finalVerseId, filteredRanges);
};

const generateBookChapterSegments = (bookIndex: number, chapterIndex: number, ranges: ReadonlyArray<Readonly<VerseRange>>): Segment[] => {
  const chapterVerseCount = Bible.getChapterVerseCount(bookIndex, chapterIndex);

  const firstVerseId = Bible.makeVerseId(bookIndex, chapterIndex, 1);
  const finalVerseId = Bible.makeVerseId(bookIndex, chapterIndex, chapterVerseCount);

  const filteredRanges = Bible.filterRangesByBookChapter(bookIndex, chapterIndex, ranges);
  const croppedRanges = filteredRanges.map((range) => {
    return Bible.cropRangeToBookChapter(bookIndex, chapterIndex, range);
  });

  return Bible.generateSegments(firstVerseId, finalVerseId, croppedRanges);
};

const displayVerseRange = (startVerseId: number, endVerseId: number, lang: string = 'en'): string => {
  const start = Bible.parseVerseId(startVerseId);
  const end = Bible.parseVerseId(endVerseId);
  let range = '';
  if (!start.book) { return range; }

  const bookName = Bible.getBookName(start.book, lang);
  range += bookName;
  if (!start.chapter) { return range; }
  const chapterCount = Bible.getBookChapterCount(start.book);
  if (chapterCount === 1) { return range; }

  // If the range covers the whole book, return only book name
  if (start.chapter === 1 && start.verse && start.verse === 1) {
    if (end.chapter && end.chapter === chapterCount) {
      const endChapterVerseCount = Bible.getChapterVerseCount(start.book, end.chapter);
      if (end.verse === endChapterVerseCount) {
        return range;
      }
    }
  }

  range += ' ';
  if (start.chapter === end.chapter) {
    const startChapterVerseCount = Bible.getChapterVerseCount(start.book, start.chapter);
    if (start.verse === 1 && end.verse === startChapterVerseCount) {
      range += start.chapter;
      return range;
    }
    else {
      range += start.chapter + ':';
      range += start.verse;
      if (start.verse !== end.verse) {
        range += '-' + end.verse;
      }
      return range;
    }
  }
  else {
    const endChapterVerseCount = Bible.getChapterVerseCount(end.book, end.chapter);
    if (start.verse === 1 && end.verse === endChapterVerseCount) {
      range += start.chapter + '-' + end.chapter;
      return range;
    }
    else {
      range += start.chapter + ':' + start.verse + '-';
      range += end.chapter + ':' + end.verse;
      return range;
    }
  }
};

const RegEx = {
  BookChapterVerseToChapterVerse: /((?:\d+\s*)?[\p{L}\p{M}\p{N}\s'-]+)\.?\s+(\d+)\s*:\s*(\d+)\s*[-–—]+\s*(\d+)\s*:\s*(\d+)/iu,
  BookChapterVerseToVerse: /((?:\d+\s*)?[\p{L}\p{M}\p{N}\s'-]+)\.?\s+(\d+)\s*:\s*(\d+)\s*[-–—]+\s*(\d+)/iu,
  BookChapterToChapter: /((?:\d+\s*)?[\p{L}\p{M}\p{N}\s'-]+)\.?\s+(\d+)\s*[-–—]+\s*(\d+)/iu,
  BookChapterVerse: /((?:\d+\s*)?[\p{L}\p{M}\p{N}\s'-]+)\.?\s+(\d+)\s*:\s*(\d+)/iu,
  BookChapter: /((?:\d+\s*)?[\p{L}\p{M}\p{N}\s'-]+)\.?\s+(\d+)/iu,
  Book: /((?:\d+\s*)?[\p{L}\p{M}\p{N}\s'-]+)/iu,
};
const parseVerseRange = (verseRangeString: string, lang: string = 'en'): VerseRange | null => {
  const start: {
    book?: string | number,
    chapter?: string | number,
    verse?: string | number,
  } = {};
  const end: {
    book?: string | number,
    chapter?: string | number,
    verse?: string | number,
  } = {};

  /* eslint-disable */
  let match
  if (match = RegEx.BookChapterVerseToChapterVerse.exec(verseRangeString), match) {
    [, start.book, start.chapter, start.verse, end.chapter, end.verse] = match
  } else if (match = RegEx.BookChapterVerseToVerse.exec(verseRangeString), match) {
    [, start.book, start.chapter, start.verse, end.verse] = match
    end.chapter = start.chapter
  } else if (match = RegEx.BookChapterToChapter.exec(verseRangeString), match) {
    [, start.book, start.chapter, end.chapter] = match
    start.verse = 1
    end.verse = Bible.getChapterVerseCount(Bible.getBookIndex(String(start.book), lang), +end.chapter)
  } else if (match = RegEx.BookChapterVerse.exec(verseRangeString), match) {
    [, start.book, start.chapter, start.verse] = match
    end.chapter = start.chapter
    end.verse = start.verse
  } else if (match = RegEx.BookChapter.exec(verseRangeString), match) {
    [, start.book, start.chapter] = match
    start.verse = 1
    end.chapter = start.chapter
    end.verse = Bible.getChapterVerseCount(Bible.getBookIndex(String(start.book), lang), +start.chapter)
  } else if (match = RegEx.Book.exec(verseRangeString), match) {
    [, start.book] = match
    start.chapter = 1
    start.verse = 1
    end.chapter = Bible.getBookChapterCount(Bible.getBookIndex(String(start.book), lang))
    end.verse = Bible.getChapterVerseCount(Bible.getBookIndex(String(start.book), lang), end.chapter)
  }
  else {
    return null;
  }
  /* eslint-enable */

  start.book = Bible.getBookIndex(String(start.book), lang);
  if (start.book === -1) { throw new Error('Invalid book name'); }
  end.book = start.book;

  const startVerseId = Bible.makeVerseId(start.book, +start.chapter, +start.verse);
  const endVerseId = Bible.makeVerseId(end.book, +end.chapter, +end.verse);

  if (!Bible.validateRange(startVerseId, endVerseId)) {
    throw new Error('Invalid verse range');
  }

  return { startVerseId, endVerseId };
};

const Bible = {
  makeVerseId,
  parseVerseId,
  getBooks,
  getChapterVerses,
  getBookCount,
  getBookChapterCount,
  getChapterVerseCount,
  getBookName,
  getBookIndex,
  verseExists,
  validateRange,
  countRangeVerses,
  getBookVerseCount,
  getTotalVerseCount,
  getNextVerseId,
  getPreviousVerseId,
  getFirstBookChapterVerseId,
  getFirstBookVerseId,
  getLastBookChapterVerseId,
  getLastBookVerseId,
  compareRanges,
  checkRangeOverlap,
  countUniqueRangeVerses,
  countUniqueBookRangeVerses,
  filterRangesByBook,
  filterRangesByBookChapter,
  cropRangeToBookChapter,
  countUniqueBookChapterRangeVerses,
  consolidateRanges,
  getRangesBetweenVerseIds,
  generateSegments,
  generateBibleSegments,
  generateBookSegments,
  generateBookChapterSegments,
  displayVerseRange,
  parseVerseRange,
};

export default Bible;
