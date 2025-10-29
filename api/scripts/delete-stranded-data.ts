import mongoose from 'mongoose';
import useMongooseModels, { closeConnection } from '../mongoose/useMongooseModels';

// Main
const main = async (): Promise<void> => {
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
    const result = await (entity as mongoose.Model<any>).deleteMany({ owner: { $nin: activeUserIds } });
    console.log(`Deleted ${result.deletedCount} documents from ${entity.modelName}`);
  }

  // close connection
  await closeConnection();
};

console.log('This is a destructive operation that will permanently delete data.');
console.log('You must uncomment the script manually to enable this script.');
// main();
