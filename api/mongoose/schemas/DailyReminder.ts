import mongoose from 'mongoose';
import crypto from 'node:crypto';

export const DailyReminderSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  hour: { // UTC
    type: Number,
    required: true,
    min: 0,
    max: 23,
  },
  minute: { // UTC
    type: Number,
    required: true,
    min: 0,
    max: 59,
  },
  timezoneOffset: { // number of minutes difference between UTC and user timezone
    type: Number,
    required: true,
    min: -12 * 60,
    max: 14 * 60,
  },
  active: {
    type: Boolean,
    default: false,
  },
  unsubscribeCode: {
    type: String,
    default: () => crypto.randomBytes(16).toString('base64url'),
  },
  nextOccurrence: {
    type: Number,
    default: () => Date.now(),
  },
}, {
  timestamps: true,
  methods: {
    /**
     * Returns a Date() representing the next occurrence of this reminder.
     * This code is meant to run in the UTC timezone.
     * When testing this code in a local timezone, the offset is not needed.
     */
    getNextOccurrence() {
      // Use the UTC date minus 2 days to find a guaranteed past occurrence
      // Then add 24 hours as needed until the time is in the future
      const now = new Date();
      const nextOccurrence = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() - 2,
        this.hour,
        this.minute + this.timezoneOffset,
        0,
        0,
      ));
      while (nextOccurrence.getTime() < new Date().getTime()) {
        nextOccurrence.setHours(nextOccurrence.getHours() + 24);
      }
      return nextOccurrence;
    },
    toJSON() {
      const { _id, hour, minute, timezoneOffset, active } = this;
      return { id: _id, hour, minute, timezoneOffset, active };
    },
  },
});

DailyReminderSchema.pre('save', async function () {
  const nextOccurrence = this.schema.methods.getNextOccurrence.call(this);
  this.nextOccurrence = nextOccurrence.getTime();

  // If the daily reminder was just activated,
  // re-calculate an unsubscribe code
  if (this.isModified('active') && this.active) {
    this.unsubscribeCode = crypto.randomBytes(16).toString('base64url');
  }
});

const DailyReminder = mongoose.model('DailyReminder', DailyReminderSchema);

export default DailyReminder;
