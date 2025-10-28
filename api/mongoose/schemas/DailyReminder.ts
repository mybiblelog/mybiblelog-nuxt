import mongoose from 'mongoose';
import crypto from 'node:crypto';

/**
 * @swagger
 * components:
 *   schemas:
 *     DailyReminder:
 *       type: object
 *       required:
 *         - owner
 *         - hour
 *         - minute
 *         - timezoneOffset
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the reminder
 *         owner:
 *           type: string
 *           description: The ID of the user who owns this reminder
 *         hour:
 *           type: number
 *           description: The hour of the day for the reminder (0-23) in UTC
 *         minute:
 *           type: number
 *           description: The minute of the hour for the reminder (0-59) in UTC
 *         timezoneOffset:
 *           type: number
 *           description: The timezone offset in minutes
 *         active:
 *           type: boolean
 *           description: Whether the reminder is active
 *         unsubscribeCode:
 *           type: string
 *           description: A unique code for unsubscribing from the reminder
 *         nextOccurrence:
 *           type: number
 *           description: The timestamp of the next occurrence of the reminder
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the reminder was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the reminder was last updated
 */

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
    default: () => crypto.randomBytes(64).toString('hex'),
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

DailyReminderSchema.pre('save', function (next) {
  const nextOccurrence = this.schema.methods.getNextOccurrence.call(this);
  this.nextOccurrence = nextOccurrence.getTime();

  // If the daily reminder was just activated,
  // re-calculate an unsubscribe code
  if (this.isModified('active') && this.active) {
    this.unsubscribeCode = crypto.randomBytes(64).toString('hex');
  }
  next();
});

const DailyReminder = mongoose.model('DailyReminder', DailyReminderSchema);

export default DailyReminder;
