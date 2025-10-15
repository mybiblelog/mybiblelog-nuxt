const SimpleDate = require('./simple-date');

test('can validate an object', () => {
  const valid = SimpleDate.validate({
    year: 2020,
    month: 1,
    date: 1,
  });
  expect(valid).toBe(true);
});

test('can detect an invalid object', () => {
  const valid = SimpleDate.validate({
    year: 2019,
    month: 2,
    date: 29,
  });
  expect(valid).toBe(false);
});

test('can validate a date string', () => {
  const valid = SimpleDate.validateString('2020-02-29');
  expect(valid).toBe(true);
});

test('can detect an invalid date string', () => {
  const valid = SimpleDate.validateString('2019-02-29');
  expect(valid).toBe(false);
});

test('can construct a SimpleDate', () => {
  const date = new SimpleDate(2020, 1, 1);
  expect(typeof date).toBe('object');
});

test('fails to construct an invalid SimpleDate', () => {
  expect(() => new SimpleDate(2019, 2, 29)).toThrow();
});

test('can create from date object', () => {
  const date = new Date(2020, 1, 1);
  const simpleDate = SimpleDate.fromDate(date);
  expect(typeof simpleDate).toBe('object');
});

test('can create from string', () => {
  const simpleDate = SimpleDate.fromString('2020-01-01');
  expect(typeof simpleDate).toBe('object');
});

test('fails to construct from invalid string', () => {
  expect(() => SimpleDate.fromString('2019-02-29')).toThrow();
});

test('can export a string', () => {
  const inputString = '2020-01-01';
  const simpleDate = SimpleDate.fromString(inputString);
  const outputString = simpleDate.toString();
  expect(outputString).toBe(inputString);
});

test('can export a date', () => {
  const inputDate = new Date(2020, 2, 29);
  const simpleDate = SimpleDate.fromDate(inputDate);
  const outputDate = simpleDate.toDate();
  expect(outputDate.valueOf()).toBe(inputDate.valueOf());
});
