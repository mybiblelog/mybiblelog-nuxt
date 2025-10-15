const mongoose = require('mongoose');
const memoryServer = require('../memory-server');
const UserSchema = require('./User');

describe('User model ', () => {
  let db, User;

  beforeAll(async () => {
    db = await memoryServer.connect();
    User = db.connection.model('User', UserSchema);
  });
  beforeEach(() => db.clear());
  afterAll(() => db.close());

  it('can validate a user', async () => {
    let validationError;
    try {
      const user = new User({
        _id: new mongoose.Types.ObjectId(),
        email: 'admin@example.com',
        isAdmin: true,
        password: 'password',
        emailVerificationCode: null,
      });
      await user.validate();
    }
    catch (err) {
      validationError = err;
    }
    expect(validationError).toBeUndefined();
  });

  it('can detect a missing email', async () => {
    let validationError;
    try {
      const user = new User({
        _id: new mongoose.Types.ObjectId(),
        email: '',
        isAdmin: true,
        password: 'password',
        emailVerificationCode: null,
      });
      await user.validate();
    }
    catch (err) {
      validationError = err;
    }
    expect(validationError).toBeInstanceOf(mongoose.Error.ValidationError);
  });

  it('can create a new user', async () => {
    let error;
    try {
      await User.create({
        _id: new mongoose.Types.ObjectId(),
        email: 'user@example.com',
        isAdmin: false,
        password: 'password',
        emailVerificationCode: null,
      });
    }
    catch (err) {
      error = err;
    }
    expect(error).toBe(undefined);
  });
});
