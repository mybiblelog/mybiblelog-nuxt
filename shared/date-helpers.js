import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import SimpleDate from './simple-date';

// additional locales ('en' is already included)
import 'dayjs/locale/de';
import 'dayjs/locale/es';
import 'dayjs/locale/fr';
import 'dayjs/locale/uk';
import 'dayjs/locale/pt';

dayjs.extend(duration);
dayjs.extend(relativeTime);

/**
 * Returns the number of days in a given month.
 * @param {number} year Full year: 1984, 2000, etc.
 * @param {number} month January = 0, February = 1, etc.
 */
export const daysInMonth = (year, month) => {
  // We look at the date of the last day of the month
  // We access it as the zeroeth day of the next month
  return new Date(year, month + 1, 0).getDate();
};

/**
 * Returns the numerical weekday, with Sunday = 1, Monday = 2, etc.
 * @param {number} year Full year: 1984, 2000, etc.
 * @param {number} month January = 0, February = 1, etc.
 * @param {number} date 1, 2, 3, etc.
 */
export const indexOfWeekday = (year, month, date) => {
  return new Date(year, month, date).getDay();
};

/**
 * Generates an array of 7 date-like objects representing the week
 * in which the specified date occurs.
 * @param {number} year Full year: 1984, 2000, etc.
 * @param {number} month January = 0, February = 1, etc.
 * @param {number} date 1, 2, 3, etc.
 */
export const weekFromDate = (year, month, date) => {
  // Start at noon on the given day
  const referenceDate = new Date(year, month, date, 12);

  // Move the day back to Sunday
  const daysSinceSunday = referenceDate.getDay();
  referenceDate.setDate(referenceDate.getDate() - daysSinceSunday);

  // For each day of the week, capture the date and increment
  const result = [];
  for (let i = 0; i < 7; i++) {
    const { year, month, date } = SimpleDate.fromDate(referenceDate);
    const dayDate = new SimpleDate(year, month, date).toString();
    result.push(dayDate);
    referenceDate.setDate(referenceDate.getDate() + 1);
  }
  return result;
};

export const getWeekStartAndEnd = (year, month, date) => {
  const week = weekFromDate(year, month, date);
  const startDate = week[0];
  const endDate = week[6];
  return {
    startDate,
    endDate,
  };
};

export const displayDate = (dateString, locale = 'en') => {
  const date = SimpleDate.fromString(dateString).toDate();
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return date.toLocaleDateString(locale, options);
};

export const displayDateTime = (dateString, locale = 'en') => {
  const date = new Date(dateString);
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  const displayDate = date.toLocaleDateString(locale, options);
  let hours = date.getHours();
  let amPm = 'am';
  if (hours > 12) {
    hours -= 12;
    amPm = 'pm';
  }
  hours = hours.toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${displayDate} @ ${hours}:${minutes} ${amPm}`;
};

/**
 * Returns the time duration between now and the given date/time in a
 * human readable format. For example: "a few seconds ago", "8 hours ago".
 * @param {string} dateString 'YYYY-MM-DD'
 * @param {string} locale 'en', 'es', etc.
 * @returns {string}
 */
export const displayTimeSince = (dateTimeString, locale = 'en') => {
  const difference = dayjs(dateTimeString).diff(dayjs());
  return dayjs.duration(difference).locale(locale).humanize(true);
};

/**
 * Returns the number of days between now and the given date in a
 * human readable format. For example: "2 days ago", "in 3 days".
 * @param {string} dateString 'YYYY-MM-DD'
 * @param {string} locale 'en', 'es', etc.
 * @returns {string}
 */
export const displayDaysSince = (dateString, locale = 'en') => {
  const difference = dayjs(dateString).diff(dayjs(), 'day');
  return dayjs.duration(difference, 'day').locale(locale).humanize(true);
};
