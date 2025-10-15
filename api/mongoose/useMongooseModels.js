const mongoose = require('mongoose');
const config = require('../config');
const { defineModels } = require('./models');

let connection;
let models;

const useMongooseModels = async () => {
  if (!connection) {
    connection = await mongoose.createConnection(config.mongo.uri);
  }
  if (!models) {
    await defineModels(connection);
    models = {
      User: connection.model('User'),
      Email: connection.model('Email'),
      LogEntry: connection.model('LogEntry'),
      PassageNote: connection.model('PassageNote'),
      PassageNoteTag: connection.model('PassageNoteTag'),
      DailyReminder: connection.model('DailyReminder'),
      Report: connection.model('Report'),
      Feedback: connection.model('Feedback'),
    };
  }
  return models;
};

// Allow the connection to be closed for testing and scripts
const closeConnection = async () => {
  await connection.close();
};

module.exports = useMongooseModels;
module.exports.closeConnection = closeConnection;
