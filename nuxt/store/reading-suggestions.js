import * as dayjs from 'dayjs';
import {
  SET_READING_SUGGESTIONS,
} from './mutation-types';

import Bible from '@shared/bible';
import SimpleDate from '@shared/simple-date';
import { displayDaysSince } from '@shared/date-helpers';

export const state = () => ({
  passages: [],
});

export const mutations = {
  [SET_READING_SUGGESTIONS](state, passages) {
    state.passages = passages;
  },
};

const capitalize = word =>
  word.charAt(0).toUpperCase() +
  word.slice(1);

export const actions = {
  refreshReadingSuggestions({ commit, rootGetters }) {
    const logEntries = rootGetters['log-entries/currentLogEntries'];

    // Based on recent logEntries, suggest passages to read next
    const suggestionCount = 3;
    const suggestions = [];

    // Get last X dates in format 'YYYY-MM-DD'
    const readingDaysToLookBack = 3;
    const dates = [];
    let date = dayjs().startOf('day'); // today
    for (let i = 0; i < readingDaysToLookBack; i++) {
      date = date.subtract(1, 'day');
      dates.push(date.format('YYYY-MM-DD'));
    }

    // Suggest continuing to read from the last book/chapter/verse
    // Sort log entries by date, newest first, and view the past X days of reading
    let recentReadingLogEntries = [...logEntries].filter(entry => dates.includes(entry.date));
    recentReadingLogEntries.sort((a, b) => b.date.localeCompare(a.date));
    const datesRead = [];
    for (let i = 0; i < recentReadingLogEntries.length; i++) {
      const date = recentReadingLogEntries[i].date;
      if (!datesRead.includes(date)) {
        if (datesRead.length === readingDaysToLookBack) {
          // Slice off the relevant log entries
          recentReadingLogEntries = recentReadingLogEntries.slice(0, i);
          break;
        }
        datesRead.push(date);
      }
    }

    // If there are any log entries, suggest continuing from the last one for each book
    const lastLogEntryPerBook = {};
    for (const logEntry of recentReadingLogEntries) {
      const bookIndex = Bible.parseVerseId(logEntry.endVerseId).book;
      if ((lastLogEntryPerBook[bookIndex]?.endVerseId || 0) < logEntry.endVerseId) {
        lastLogEntryPerBook[bookIndex] = logEntry;
      }
    }

    const allRecentReadingSuggestions = [];
    for (const bookIndex in lastLogEntryPerBook) {
      const lastBookLogEntry = lastLogEntryPerBook[bookIndex];
      const nextVerseId = Bible.getNextVerseId(lastBookLogEntry.endVerseId);
      if (nextVerseId) {
        const nextVerseChapter = Bible.parseVerseId(nextVerseId).chapter;
        const endVerseId = Bible.getLastBookChapterVerseId(bookIndex, nextVerseChapter);

        const lastBookLogEntryDisplayText = Bible.displayVerseRange(lastBookLogEntry.startVerseId, lastBookLogEntry.endVerseId, this.$i18n.locale);
        const lastBookLogEntryDisplayDate = displayDaysSince(lastBookLogEntry.date, this.$i18n.locale);

        const suggestionContextMessage = this.$i18n.t(
          'reading_suggestion.date_you_read_passage',
          {
            display_date: lastBookLogEntryDisplayDate,
            passage: lastBookLogEntryDisplayText,
          },
        );
        allRecentReadingSuggestions.push({
          startVerseId: nextVerseId,
          endVerseId,
          suggestionContext: capitalize(suggestionContextMessage),
          date: lastBookLogEntry.date, // for sorting
        });
      }
    }

    // Filter out any suggestions for which a log entry exists today
    // Any overlap with the suggestion should remove it from the list
    const todayDate = SimpleDate.now().toString();
    const todayLogEntries = logEntries.filter(entry => entry.date === todayDate);
    const filteredRecentSuggestions = allRecentReadingSuggestions
      .filter((suggestion) => {
        if (todayLogEntries.some(entry => entry.endVerseId >= suggestion.startVerseId && entry.startVerseId <= suggestion.endVerseId)) {
          return false;
        }
        return true;
      });

    // Sort by date, newest first, to prioritize the most recent suggestions
    const sortedRecentReadingSuggestions = filteredRecentSuggestions
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((suggestion) => {
        delete suggestion.date;
        return suggestion;
      });

    // Limit the number of recent reading suggestions
    suggestions.push(...sortedRecentReadingSuggestions.slice(0, suggestionCount));

    // Each reading path is a separate lineup of books to be read in sequence.
    // Reading suggestions will be pulled evenly from them if possible.
    const readingPathNT = [40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66];
    const readingPathOT = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39];
    const readingPathWisdom = [19, 20, 21, 18, 22];

    // Get suggestions from each reading path
    const readingPathContextNT = this.$i18n.t('reading_suggestion.new_testament');
    const readingPathContextOT = this.$i18n.t('reading_suggestion.old_testament');
    const readingPathContextWisdom = this.$i18n.t('reading_suggestion.wisdom');
    const suggestionsNT = getReadingPathSuggestions(readingPathNT, logEntries);
    const suggestionsOT = getReadingPathSuggestions(readingPathOT, logEntries);
    const suggestionsWisdom = getReadingPathSuggestions(readingPathWisdom, logEntries);
    suggestionsNT.forEach((suggestion) => { suggestion.suggestionContext = readingPathContextNT; });
    suggestionsOT.forEach((suggestion) => { suggestion.suggestionContext = readingPathContextOT; });
    suggestionsWisdom.forEach((suggestion) => { suggestion.suggestionContext = readingPathContextWisdom; });

    // Pull suggestions evenly from all reading paths
    const sources = [suggestionsNT, suggestionsOT, suggestionsWisdom]
      .filter(source => source.length > 0);
    let sourceIndex = 0;

    // Work until we generate the desired number of suggestions
    while (suggestions.length < suggestionCount) {
      // If there are no sources left, we are done
      if (!sources.length) {
        break;
      }

      // Get the next suggestion from the current source
      const nextSuggestion = sources[sourceIndex].shift();

      // If the suggestion overlaps an already present suggestion, skip it
      const rangeIsRedundant = suggestions.some((existingSuggestion) => {
        return Bible.checkRangeOverlap(nextSuggestion, existingSuggestion);
      });
      if (!rangeIsRedundant) {
        suggestions.push(nextSuggestion);
      }

      // If that was the last suggestion, remove the source
      if (!sources[sourceIndex].length) {
        sources.splice(sourceIndex, 1);
      }
      // Otherwise, if another source hasn't shifted into place,
      // increment the source index so our next suggestion comes from there
      else {
        sourceIndex++;
      }

      // Ensure we loop around and never go past the end of the array
      if (sourceIndex >= sources.length) {
        sourceIndex = 0;
      }
    }

    commit(SET_READING_SUGGESTIONS, suggestions);
  },
};

const getReadingPathSuggestions = (bookIndices, ranges) => {
  const suggestions = [];
  for (const bookIndex of bookIndices) {
    const bookSuggestions = getBookSuggestions(bookIndex, ranges);
    if (bookSuggestions.length) {
      suggestions.push(bookSuggestions[0]);
    }
  }
  return suggestions;
};

const getBookSuggestions = (bookIndex, ranges) => {
  const chapterRanges = getBookChapterRanges(bookIndex);
  return chapterRanges
    // only include chapters that aren't completely read yet
    .filter(passage => !passageIsRead(passage, ranges))
    // bump startVerseId after any already-read portion at start of passage
    .map((passage) => {
      // TODO:
      return passage;
    });
};

const getBookChapterRanges = (bookIndex) => {
  const ranges = [];
  const chapterCount = Bible.getBookChapterCount(bookIndex);
  for (let chapterIndex = 1; chapterIndex <= chapterCount; chapterIndex++) {
    const verseCount = Bible.getChapterVerseCount(bookIndex, chapterIndex);
    ranges.push({
      startVerseId: Bible.makeVerseId(bookIndex, chapterIndex, 1),
      endVerseId: Bible.makeVerseId(bookIndex, chapterIndex, verseCount),
    });
  }
  return ranges;
};

const passageIsRead = (passage, ranges) => {
  // clone ranges so we can mutate safely
  ranges = JSON.parse(JSON.stringify(ranges));

  // filter ranges by passage
  ranges = filterRangesByPassage(ranges, passage);

  // crop ranges by passage
  ranges = cropRangesByPassage(ranges, passage);

  // compare total passage verses to verses read
  const passageVerseCount = Bible.countRangeVerses(passage.startVerseId, passage.endVerseId);
  const readPassageVerses = Bible.countUniqueRangeVerses(ranges);
  return readPassageVerses === passageVerseCount;
};

const filterRangesByPassage = (ranges, passage) => {
  return ranges.filter((range) => {
    if (range.startVerseId > passage.endVerseId) {
      return false;
    }
    if (range.endVerseId < passage.startVerseId) {
      return false;
    }
    return true;
  });
};

const cropRangesByPassage = (ranges, passage) => {
  return ranges.map((range) => {
    if (range.startVerseId < passage.startVerseId) {
      range.startVerseId = passage.startVerseId;
    }
    if (range.endVerseId > passage.endVerseId) {
      range.endVerseId = passage.endVerseId;
    }
    return range;
  });
};
