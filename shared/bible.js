const bibleBooks = require('./static/bible-books.js');
const chapterVerses = require('./static/chapter-verses/nasb.js');

const Bible = {};

/**
 * Create a new `Object` with the same nested properties as the input.
 * Used to manipulate data without mutating the original input.
 * @param {Object} data
 */
const cloneData = data => JSON.parse(JSON.stringify(data));

Bible.makeVerseId = (book = 0, chapter = 0, verse = 0) => {
  const verseId = 100000000 + book * 1000000 + chapter * 1000 + verse;
  return verseId;
};

Bible.parseVerseId = (verseId) => {
  verseId -= 100000000;
  const book = Math.floor(verseId / 1000000);
  verseId -= book * 1000000;
  const chapter = Math.floor(verseId / 1000);
  verseId -= chapter * 1000;
  const verse = verseId;
  return { book, chapter, verse };
};

Bible.getBooks = () => bibleBooks;

Bible.getChapterVerses = () => chapterVerses;

Bible.getBookCount = () => Bible.getBooks().length;

Bible.getBookChapterCount = (bookIndex) => {
  const targetBook = bibleBooks.find(b => b.bibleOrder === bookIndex);
  if (!targetBook) { return 0; }
  return targetBook.chapterCount;
};

Bible.getChapterVerseCount = (bookIndex, chapterIndex) => {
  const chapterId = Bible.makeVerseId(bookIndex, chapterIndex);
  const result = chapterVerses[chapterId];
  return result || 0;
};

Bible.getBookName = (bookIndex, lang = 'en') => {
  const targetBook = bibleBooks.find(b => b.bibleOrder === bookIndex);
  if (!targetBook) { return ''; }
  return targetBook.locales[lang].name;
};

Bible.getBookIndex = (bookName, lang = 'en') => {
  const caseInsensitive = bookName.toLocaleLowerCase();
  const targetBook = bibleBooks.find((b) => {
    if (b.locales[lang].name.toLocaleLowerCase() === caseInsensitive) { return true; }
    const insensitiveAbbreviations = b.locales[lang].abbreviations.map(a => a.toLocaleLowerCase());
    if (insensitiveAbbreviations.includes(caseInsensitive)) { return true; }
    return false;
  });
  if (!targetBook) { return -1; }
  return targetBook.bibleOrder;
};

Bible.verseExists = (verseId) => {
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

Bible.validateRange = (startVerseId, endVerseId) => {
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

Bible.countRangeVerses = (startVerseId, endVerseId) => {
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

Bible.getBookVerseCount = (bookIndex) => {
  const bookChapterCount = Bible.getBookChapterCount(bookIndex);
  let totalVerses = 0;
  for (let c = 1, l = bookChapterCount; c <= l; c++) {
    totalVerses += Bible.getChapterVerseCount(bookIndex, c);
  }
  return totalVerses;
};

Bible.getTotalVerseCount = () => {
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
Bible.getNextVerseId = (verseId, crossBooks = false) => {
  let { book, chapter, verse } = Bible.parseVerseId(verseId); // eslint-disable-line
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
Bible.getPreviousVerseId = (verseId, crossBooks = false) => {
  let { book, chapter, verse } = Bible.parseVerseId(verseId); // eslint-disable-line
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

Bible.getFirstBookChapterVerseId = (bookIndex, chapterIndex) => {
  return Bible.makeVerseId(bookIndex, chapterIndex, 1);
};

Bible.getFirstBookVerseId = (bookIndex) => {
  return Bible.makeVerseId(bookIndex, 1, 1);
};

Bible.getLastBookChapterVerseId = (bookIndex, chapterIndex) => {
  const lastChapterVerseCount = Bible.getChapterVerseCount(bookIndex, chapterIndex);
  return Bible.makeVerseId(bookIndex, chapterIndex, lastChapterVerseCount);
};

Bible.getLastBookVerseId = (bookIndex) => {
  const chapterIndex = Bible.getBookChapterCount(bookIndex);
  return Bible.getLastBookChapterVerseId(bookIndex, chapterIndex);
};

/**
 * A function for use with `Array.prototype.sort` that
 * orders ranges based on book and chapter indices.
 * This comparison only takes `startVerseId` into account.
 */
Bible.compareRanges = (range1, range2) => {
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

Bible.checkRangeOverlap = (range1, range2) => {
  // Sort ranges according to Bible order
  const [firstRange, secondRange] = [range1, range2].sort(Bible.compareRanges);
  return firstRange.endVerseId >= secondRange.startVerseId;
};

/**
 * Counts the total number of verses in an array of ranges,
 * never counting the same verse more than once.
 */
Bible.countUniqueRangeVerses = (ranges) => {
  ranges = cloneData(ranges);
  ranges = ranges.sort(Bible.compareRanges);
  let totalVerses = 0;
  let lastRange = null;
  for (const range of ranges) {
    if (!lastRange) {
      lastRange = range;
    }
    else if (range.startVerseId <= lastRange.endVerseId) {
      if (range.endVerseId > lastRange.endVerseId) {
        lastRange.endVerseId = range.endVerseId;
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
Bible.countUniqueBookRangeVerses = (bookIndex, ranges) => {
  ranges = Bible.filterRangesByBook(bookIndex, ranges);
  return Bible.countUniqueRangeVerses(ranges);
};

/**
 * Returns a new array comprised only of ranges in the given book.
 */
Bible.filterRangesByBook = (bookIndex, ranges) => {
  ranges = cloneData(ranges);
  return ranges.filter((r) => {
    const startVerse = Bible.parseVerseId(r.startVerseId);
    return startVerse.book === bookIndex;
  });
};

/**
 * Filters out all ranges that do not overlap the given book chapter,
 * returning the new resulting array.
 */
Bible.filterRangesByBookChapter = (bookIndex, chapterIndex, ranges) => {
  ranges = cloneData(ranges);
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
Bible.cropRangeToBookChapter = (bookIndex, chapterIndex, range) => {
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

Bible.countUniqueBookChapterRangeVerses = (bookIndex, chapterIndex, ranges) => {
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
Bible.consolidateRanges = (ranges) => {
  ranges = cloneData(ranges);
  ranges = ranges.sort(Bible.compareRanges);
  const result = [];

  // Sort ranges into constituent books
  const allBookRanges = {};
  for (let i = 1, l = Bible.getBookCount(); i <= l; i++) {
    allBookRanges[i] = [];
  }
  for (const range of ranges) {
    const { book } = Bible.parseVerseId(range.startVerseId);
    allBookRanges[book].push(range);
  }
  for (let bookIndex = 1, l = Bible.getBookCount(); bookIndex <= l; bookIndex++) {
    const bookRanges = allBookRanges[bookIndex];
    const consolidatedBookRanges = [];
    let holdingRange = null;
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
Bible.getRangesBetweenVerseIds = (startVerseId, endVerseId) => {
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
  const ranges = [];

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
Bible.generateSegments = (firstVerseId, finalVerseId, ranges) => {
  if (firstVerseId > finalVerseId) {
    throw new Error('firstVerseId must be before finalVerseId');
  }

  const segments = [];

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
  ranges = Bible.consolidateRanges(ranges);

  // Crop ranges to firstVerseId and finalVerseId
  for (const range of ranges) {
    if (range.startVerseId < firstVerseId) {
      range.startVerseId = firstVerseId;
    }
    if (range.endVerseId > finalVerseId) {
      range.endVerseId = finalVerseId;
    }
  }

  let lastReadVerseId;
  for (let rangeIndex = 0, rangeCount = ranges.length; rangeIndex < rangeCount; rangeIndex++) {
    const range = ranges[rangeIndex];

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
      const unreadStartVerseId = Bible.getNextVerseId(lastReadVerseId, true);
      if (range.startVerseId !== unreadStartVerseId) {
        const unreadRanges = Bible.getRangesBetweenVerseIds(lastReadVerseId, range.startVerseId);
        const unreadSegments = unreadRanges.map(range => ({
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
Bible.generateBibleSegments = (ranges) => {
  const segments = [];
  const bookCount = Bible.getBookCount();
  ranges = Bible.consolidateRanges(ranges);
  let rangeIndex = 0;
  for (let bookIndex = 1; bookIndex <= bookCount; bookIndex++) {
    const lastChapterIndex = Bible.getBookChapterCount(bookIndex);
    const lastChapterVerseCount = Bible.getChapterVerseCount(bookIndex, lastChapterIndex);
    const firstVerseId = Bible.makeVerseId(bookIndex, 1, 1);
    const finalVerseId = Bible.makeVerseId(bookIndex, lastChapterIndex, lastChapterVerseCount);
    const bookRanges = [];
    while (rangeIndex < ranges.length && Bible.parseVerseId(ranges[rangeIndex].startVerseId).book === bookIndex) {
      bookRanges.push(ranges[rangeIndex]);
      rangeIndex++;
    }
    segments.push(...Bible.generateSegments(firstVerseId, finalVerseId, bookRanges));
  }
  return segments;
};

Bible.generateBookSegments = (bookIndex, ranges) => {
  const lastChapterIndex = Bible.getBookChapterCount(bookIndex);
  const lastChapterVerseCount = Bible.getChapterVerseCount(bookIndex, lastChapterIndex);

  const firstVerseId = Bible.makeVerseId(bookIndex, 1, 1);
  const finalVerseId = Bible.makeVerseId(bookIndex, lastChapterIndex, lastChapterVerseCount);

  ranges = Bible.filterRangesByBook(bookIndex, ranges);

  return Bible.generateSegments(firstVerseId, finalVerseId, ranges);
};

Bible.generateBookChapterSegments = (bookIndex, chapterIndex, ranges) => {
  const chapterVerseCount = Bible.getChapterVerseCount(bookIndex, chapterIndex);

  const firstVerseId = Bible.makeVerseId(bookIndex, chapterIndex, 1);
  const finalVerseId = Bible.makeVerseId(bookIndex, chapterIndex, chapterVerseCount);

  ranges = Bible.filterRangesByBookChapter(bookIndex, chapterIndex, ranges);
  ranges = ranges.map((range) => {
    return Bible.cropRangeToBookChapter(bookIndex, chapterIndex, range);
  });

  return Bible.generateSegments(firstVerseId, finalVerseId, ranges);
};

Bible.displayVerseRange = (startVerseId, endVerseId, lang = 'en') => {
  const start = Bible.parseVerseId(startVerseId);
  const end = Bible.parseVerseId(endVerseId);
  let range = '';
  if (!start.book) { return range; }

  const bookName = Bible.getBookName(start.book, lang);
  range += bookName;
  if (!start.chapter) { return range; };
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
  BookChapterVerseToChapterVerse: /((?:\d\s)?[\w\s]+)\.?\s+(\d+)\s*:\s*(\d+)\s*[-–—]+\s*(\d+)\s*:\s*(\d+)/i,
  BookChapterVerseToVerse: /((?:\d\s)?[\w\s]+)\.?\s+(\d+)\s*:\s*(\d+)\s*[-–—]+\s*(\d+)/i,
  BookChapterToChapter: /((?:\d\s)?[\w\s]+)\.?\s+(\d+)\s*[-–—]+\s*(\d+)/i,
  BookChapterVerse: /((?:\d\s)?[\w\s]+)\.?\s+(\d+)\s*:\s*(\d+)/i,
  BookChapter: /((?:\d\s)?[\w\s]+)\.?\s+(\d+)/i,
  Book: /((?:\d\s)?[\w\s]+)/i,
};
Bible.parseVerseRange = (verseRangeString, lang = 'en') => {
  const start = {
    book: null,
    chapter: null,
    verse: null,
  };
  const end = {
    chapter: null,
    verse: null,
  };

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
    end.verse = Bible.getChapterVerseCount(Bible.getBookIndex(start.book, lang), end.chapter)
  } else if (match = RegEx.BookChapterVerse.exec(verseRangeString), match) {
    [, start.book, start.chapter, start.verse] = match
    end.chapter = start.chapter
    end.verse = start.verse
  } else if (match = RegEx.BookChapter.exec(verseRangeString), match) {
    [, start.book, start.chapter] = match
    start.verse = 1
    end.chapter = start.chapter
    end.verse = Bible.getChapterVerseCount(Bible.getBookIndex(start.book, lang), start.chapter)
  } else if (match = RegEx.Book.exec(verseRangeString), match) {
    [, start.book] = match
    start.chapter = 1
    start.verse = 1
    end.chapter = Bible.getBookChapterCount(Bible.getBookIndex(start.book, lang))
    end.verse = Bible.getChapterVerseCount(Bible.getBookIndex(start.book, lang), end.chapter)
  }
  /* eslint-enable */

  start.book = Bible.getBookIndex(start.book, lang);
  if (start.book === -1) { throw new Error('Invalid book name'); }
  end.book = start.book;

  const startVerseId = Bible.makeVerseId(start.book, +start.chapter, +start.verse);
  const endVerseId = Bible.makeVerseId(end.book, +end.chapter, +end.verse);

  if (!Bible.validateRange(startVerseId, endVerseId)) {
    throw new Error('Invalid verse range');
  }

  return { startVerseId, endVerseId };
};

module.exports = Bible;
