import mongoose from 'mongoose';

import { Bible, SimpleDate } from '@mybiblelog/shared';

/**
 * @swagger
 * components:
 *   schemas:
 *     LogEntry:
 *       type: object
 *       required:
 *         - owner
 *         - date
 *         - startVerseId
 *         - endVerseId
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the log entry
 *         owner:
 *           type: string
 *           description: The ID of the user who owns this log entry
 *         date:
 *           type: string
 *           format: date
 *           description: The date of the log entry
 *         startVerseId:
 *           type: number
 *           description: The ID of the starting verse
 *         endVerseId:
 *           type: number
 *           description: The ID of the ending verse
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the log entry was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the log entry was last updated
 */

export const LogEntrySchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: String,
    required: true,
    validate: {
      validator: SimpleDate.validateString,
      message: props => `${props.value} is not a valid date string`,
    },
  },
  startVerseId: {
    type: Number,
    required: true,
    validate: {
      validator: Bible.verseExists,
      message: props => `${props.value} is not a valid verse`,
    },
  },
  endVerseId: {
    type: Number,
    required: true,
    validate: {
      validator: Bible.verseExists,
      message: props => `${props.value} is not a valid verse`,
    },
  },
}, {
  timestamps: true,
  methods: {
    toJSON() {
      const { _id, date, startVerseId, endVerseId } = this;
      return { id: _id, date, startVerseId, endVerseId };
    },
  },
});

LogEntrySchema.pre('validate', function (next) {
  if (!Bible.validateRange(this.startVerseId, this.endVerseId)) {
    next(new Error('Invalid Verse Range'));
  }
  else {
    next();
  }
});

const LogEntry = mongoose.model('LogEntry', LogEntrySchema);

export default LogEntry;
