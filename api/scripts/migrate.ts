// This is an evergreen migration script, meant to update MongoDB data to the latest schema.

import useMongooseModels, { closeConnection } from '../mongoose/useMongooseModels';

// Main
const main = async (): Promise<void> => {
  const { User } = await useMongooseModels();

  // users without a locale need 'en' locale (original default)
  const usersWithoutLocale = await User.find({ 'settings.locale': { $exists: false } });
  for (const user of usersWithoutLocale) {
    console.log(`Migrating user ${user.email} to 'en' locale...`);
    user.settings.locale = 'en';
    await user.save();
  }

  // users without a preferred Bible version need 'NASB2020' (original default)
  const usersWithoutPreferredBibleVersion = await User.find({ 'settings.preferredBibleVersion': { $exists: false } });
  for (const user of usersWithoutPreferredBibleVersion) {
    console.log(`Migrating user ${user.email} to 'NASB2020' preferred Bible version...`);
    user.settings.preferredBibleVersion = 'NASB2020';
    await user.save();
  }

  // users without a start page need 'today' start page (original behavior)
  const usersWithoutStartPage = await User.find({ 'settings.startPage': { $exists: false } });
  for (const user of usersWithoutStartPage) {
    console.log(`Migrating user ${user.email} to 'today' start page...`);
    user.settings.startPage = 'today';
    await user.save();
  }

  // close connection
  await closeConnection();
};

console.log('This operation will modify data.');
console.log('You must uncomment the script manually to enable this script.');
// main();
