import fs from 'node:fs';
import path from 'node:path';
import useMongooseModels, { closeConnection } from '../mongoose/useMongooseModels';

const backupDir = '.mongodb_backup';

// Main
const main = async (): Promise<void> => {
  try {
    // Check if backup directory exists
    if (fs.existsSync(backupDir)) {
      console.error('Backup directory already exists. Delete before proceeding.');
      process.exit(1);
    }

    // Create backup directory
    console.log('Creating backup directory...');
    fs.mkdirSync(backupDir, { recursive: true });

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

    // Backup each model
    for (const modelName of modelNames) {
      console.log(`\nBacking up ${modelName}...`);
      const modelBackupFile = path.resolve(backupDir, `${modelName}.json`);

      const Model = models[modelName];
      if (!Model) {
        console.warn(`Warning: Model ${modelName} not found, skipping...`);
        continue;
      }

      // Get total count for progress tracking
      const totalCount = await Model.countDocuments({});
      console.log(`  Found ${totalCount} document(s)`);

      if (totalCount === 0) {
        // Create empty file for consistency
        fs.writeFileSync(modelBackupFile, '', 'utf-8');
        console.log(`  ✓ ${modelName} backup complete (empty collection)`);
        continue;
      }

      // Initialize file
      fs.writeFileSync(modelBackupFile, '', 'utf-8');

      // Stream documents to file
      let documentCount = 0;
      await new Promise<void>((resolve, reject) => {
        const cursor = Model.find({}).cursor();

        cursor
          .on('data', (doc) => {
            try {
              fs.appendFileSync(modelBackupFile, JSON.stringify(doc.toObject()) + '\n', 'utf-8');
              documentCount++;

              // Log progress every 100 documents or at milestones
              if (documentCount % 100 === 0 || documentCount === totalCount) {
                const percentage = ((documentCount / totalCount) * 100).toFixed(1);
                console.log(`  Progress: ${documentCount}/${totalCount} (${percentage}%)`);
              }
            }
            catch (error) {
              cursor.destroy();
              reject(new Error(`Error writing ${modelName} document: ${error instanceof Error ? error.message : String(error)}`));
            }
          })
          .on('end', () => {
            console.log(`  ✓ ${modelName} backup complete (${documentCount} documents)`);
            resolve();
          })
          .on('error', (error) => {
            reject(new Error(`Error reading ${modelName} data: ${error.message}`));
          });
      });
    }

    // Close connection
    console.log('\nClosing database connection...');
    await closeConnection();
    console.log('✓ Backup complete.');
  }
  catch (error) {
    console.error('\n✗ Backup failed:', error instanceof Error ? error.message : String(error));

    // Attempt cleanup on error
    try {
      if (fs.existsSync(backupDir)) {
        console.log('Cleaning up backup directory...');
        fs.rmSync(backupDir, { recursive: true, force: true });
      }
    }
    catch (cleanupError) {
      console.error('Warning: Failed to cleanup backup directory:', cleanupError instanceof Error ? cleanupError.message : String(cleanupError));
    }

    // Close connection if still open
    try {
      await closeConnection();
    }
    catch (closeError) {
      // Ignore close errors during error handling
    }

    process.exit(1);
  }
};

main();
