const useMongooseModels = require('../mongoose/useMongooseModels');

// Main
const main = async () => {
  const {
    DailyReminder,
    LogEntry,
    PassageNote,
    PassageNoteTag,
    User,
  } = await useMongooseModels();

  // delete all documents with an owner that is not in the active user list
  const ownedEntities = [
    DailyReminder,
    LogEntry,
    PassageNote,
    PassageNoteTag,
  ];

  const activeUserIds = await User.distinct('_id');
  for (const entity of ownedEntities) {
    const result = await entity.deleteMany({ owner: { $nin: activeUserIds } });
    console.log(`Deleted ${result.deletedCount} documents from ${entity.modelName}`);
  }

  // close connection
  await useMongooseModels.closeConnection();
};

console.log('This is a destructive operation that will permanently delete data.');
console.log('You must uncomment the script manually to enable this script.');
// main();
