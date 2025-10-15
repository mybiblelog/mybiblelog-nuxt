const { ObjectId } = require('mongoose').Types;
const memoryServer = require('../memory-server');
const LogEntrySchema = require('./LogEntry');

describe('LogEntry model ', () => {
  let db, LogEntry;

  beforeAll(async () => {
    db = await memoryServer.connect();
    LogEntry = db.connection.model('User', LogEntrySchema);
  });
  beforeEach(() => db.clear());
  afterAll(() => db.close());

  it('can validate a log entry', async () => {
    let validationError;
    try {
      const logEntry = new LogEntry({
        owner: new ObjectId(),
        date: '2020-01-01',
        startVerseId: 148004001,
        endVerseId: 148006018,
      });
      await logEntry.validate();
    }
    catch (err) {
      validationError = err;
    }
    expect(validationError).toBeUndefined();
  });

  it('can detect a backwards log entry', async () => {
    let validationError;
    try {
      const logEntry = new LogEntry({
        owner: new ObjectId(),
        date: '2020-01-01',
        startVerseId: 148006018,
        endVerseId: 148004001,
      });
      await logEntry.validate();
    }
    catch (err) {
      validationError = err;
    }
    expect(validationError).toBeInstanceOf(Error);
  });

  it('can create a new log entry', async () => {
    let error;
    try {
      await LogEntry.create({
        owner: new ObjectId(),
        date: '2020-01-01',
        startVerseId: 148004001,
        endVerseId: 148006018,
      });
    }
    catch (err) {
      error = err;
    }
    expect(error).toBe(undefined);
  });
});
