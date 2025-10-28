import mongoose from "mongoose";
import config from "../config";

import User from "./schemas/User";
import Email from "./schemas/Email";
import LogEntry from "./schemas/LogEntry";
import PassageNote from "./schemas/PassageNote";
import PassageNoteTag from "./schemas/PassageNoteTag";
import DailyReminder from "./schemas/DailyReminder";
import Report from "./schemas/Report";
import Feedback from "./schemas/Feedback";

const useMongooseModels = async () => {
  await mongoose.connect(config.mongo.uri);

  return {
    User,
    Email,
    LogEntry,
    PassageNote,
    PassageNoteTag,
    DailyReminder,
    Report,
    Feedback,
  };
};

// Allow the connection to be closed for testing and scripts
const closeConnection = async () => {
  await mongoose.disconnect();
};

export default useMongooseModels;
export { closeConnection };
