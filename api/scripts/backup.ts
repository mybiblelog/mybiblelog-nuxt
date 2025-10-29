import fs from 'node:fs';
import path from 'node:path';
import useMongooseModels, { closeConnection } from '../mongoose/useMongooseModels';

const backupDir = '.mongodb_backup';

// Main
const main = async (): Promise<void> => {
  if (fs.existsSync(backupDir)) {
    console.log('Backup directory already exists. Delete before proceeding.');
    process.exit();
  }
  else {
    console.log('Creating backup directory...');
    fs.mkdirSync(backupDir);
  }

  const models = await useMongooseModels();

  const modelNames = [
    'DailyReminder',
    'Email',
    'LogEntry',
    'PassageNote',
    'PassageNoteTag',
    'User',
    // 'UserSettings', // Included in "User",
    'Feedback',
  ];

  for (const modelName of modelNames) {
    console.log(`Downloading ${modelName} data...`);
    const modelBackupFile = path.resolve(backupDir, modelName + '.json');
    const modelBackupData: any[] = [];

    const Model = models[modelName];
    await new Promise((resolve) => {
      Model
        .find({})
        .cursor()
        .on('data', (doc) => {
          modelBackupData.push(doc.toObject());
        })
        .on('end', () => {
          console.log(`Saving ${modelName} data...`);
          fs.writeFileSync(
            modelBackupFile,
            JSON.stringify(modelBackupData),
            'utf-8',
          );
          resolve(void 0);
        });
    });
  }

  // close connection
  console.log(`Closing database connection...`);
  await closeConnection();
  console.log(`Backup complete.`);
};

main();
