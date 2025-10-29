import useMongooseModels from '../../mongoose/useMongooseModels';

const deleteAccount = async (email: string): Promise<boolean> => {
  try {
    const { User, LogEntry, PassageNote, PassageNoteTag, DailyReminder } = await useMongooseModels();
    const user = await User.findOne({ email });
    if (!user) {
      return false;
    }
    await LogEntry.deleteMany({ owner: user._id });
    await PassageNote.deleteMany({ owner: user._id });
    await PassageNoteTag.deleteMany({ owner: user._id });
    await DailyReminder.deleteMany({ owner: user._id });
    await User.deleteOne({ _id: user._id });
    return true;
  }
  catch (error) {
    return false;
  }
};

export default deleteAccount;
