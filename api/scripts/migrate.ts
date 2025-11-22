// This is an evergreen migration script, meant to update MongoDB data to the latest schema.

import { SimpleDate } from '@shared/dist';
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

  // users with invalid lookBackDate need to have the format fixed
  const usersWithInvalidLookBackDate = await User.find({ 'settings.lookBackDate': { $not: /^\d\d\d\d-\d\d-\d\d$/ } });
  for (const user of usersWithInvalidLookBackDate) {
    console.log(`Migrating user ${user.email} to valid lookBackDate format...`);
    const justDate = user.settings.lookBackDate.split('T')[0];
    if (justDate && SimpleDate.validateString(justDate)) {
      user.settings.lookBackDate = justDate;
    }
    else {
      user.settings.lookBackDate = SimpleDate.now().toString();
    }
    await user.save();
  }

  // close connection
  await closeConnection();
};

console.log('This operation will modify data.');
console.log('You must uncomment the script manually to enable this script.');
// main();
