const UserSchema = require('./schemas/User');
const EmailSchema = require('./schemas/Email');
const LogEntrySchema = require('./schemas/LogEntry');
const PassageNoteSchema = require('./schemas/PassageNote');
const PassageNoteTagSchema = require('./schemas/PassageNoteTag');
const DailyReminderSchema = require('./schemas/DailyReminder');
const ReportSchema = require('./schemas/Report');
const FeedbackSchema = require('./schemas/Feedback');

const defineModels = (connection) => {
  connection.model('User', UserSchema);
  connection.model('Email', EmailSchema);
  connection.model('LogEntry', LogEntrySchema);
  connection.model('PassageNote', PassageNoteSchema);
  connection.model('PassageNoteTag', PassageNoteTagSchema);
  connection.model('DailyReminder', DailyReminderSchema);
  connection.model('Report', ReportSchema);
  connection.model('Feedback', FeedbackSchema);
};

const deleteModels = (connection) => {
  Object.keys(connection.models).forEach((modelName) => {
    delete connection.models[modelName];
  });
};

module.exports = {
  defineModels,
  deleteModels,
};
