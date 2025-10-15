/**
 * A wrapper for managing 'YYYY-MM-DD' formatted date strings.
 */
class SimpleDate {
  constructor(year, month, date) {
    const instance = { year, month, date };
    if (!SimpleDate.validate(instance)) {
      throw new Error('Invalid Date');
    }
    return Object.assign(this, { year, month, date });
  }

  /**
   * Checks whether a given year/month/date combination is valid.
   * @param year Full, four-digit year to check
   * @param month Zero-based month to check (February = 1)
   * @param date One-based day of month to check
   */
  static validate({ year, month, date }) {
    const testDate = new Date(year, month - 1, date);
    return (
      testDate.getFullYear() === year &&
      testDate.getMonth() + 1 === month &&
      testDate.getDate() === date
    );
  }

  static validateString(dateString) {
    try {
      SimpleDate.fromString(dateString);
      return true;
    }
    catch (err) {
      return false;
    }
  }

  static fromString(dateString) {
    let [, year, month, date] = /(\d\d\d\d)-(\d\d)-(\d\d)/.exec(dateString);
    year = +year;
    month = +month;
    date = +date;
    return new SimpleDate(year, month, date);
  }

  static fromDate(dateObject) {
    const year = dateObject.getFullYear();
    const month = dateObject.getMonth() + 1;
    const date = dateObject.getDate();
    return new SimpleDate(year, month, date);
  }

  static now() {
    const today = new Date();
    return this.fromDate(today);
  }

  toString() {
    return new Date(Date.UTC(this.year, this.month - 1, this.date, 15, 0, 0)).toISOString().slice(0, 10);
  }

  toDate() {
    return new Date(this.year, this.month - 1, this.date);
  }
}

module.exports = SimpleDate;
