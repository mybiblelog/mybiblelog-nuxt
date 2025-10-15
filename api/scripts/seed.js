const { ObjectId } = require('mongoose').Types;
const useMongooseModels = require('../mongoose/useMongooseModels');

// Main
const main = async () => {
  const {
    DailyReminder,
    Email,
    LogEntry,
    PassageNote,
    PassageNoteTag,
    User,
    // UserSettings, // Embedded in "User",
    Feedback,
    Report,
  } = await useMongooseModels();

  // delete all documents
  await DailyReminder.deleteMany({});
  await Email.deleteMany({});
  await LogEntry.deleteMany({});
  await PassageNote.deleteMany({});
  await PassageNoteTag.deleteMany({});
  await User.deleteMany({});
  await Feedback.deleteMany({});
  await Report.deleteMany({});

  // seed users
  const users = {};

  users.admin = await new User({
    _id: new ObjectId(),
    email: 'admin@example.com',
    isAdmin: true,
    password: 'password',
    emailVerificationCode: null,
  });
  await users.admin.save();

  users.user = await new User({
    _id: new ObjectId(),
    email: 'user@example.com',
    isAdmin: false,
    password: 'password',
    emailVerificationCode: null,
  });
  await users.user.save();

  // close connection
  await useMongooseModels.closeConnection();
};

console.log('This is a destructive operation that will permanently delete data.');
console.log('You must uncomment the script manually to enable this script.');
// main();
