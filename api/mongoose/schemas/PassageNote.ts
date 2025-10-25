import mongoose from 'mongoose';
import Bible from '@shared/bible';

/**
 * @swagger
 * components:
 *   schemas:
 *     Passage:
 *       type: object
 *       required:
 *         - startVerseId
 *         - endVerseId
 *       properties:
 *         startVerseId:
 *           type: number
 *           description: The ID of the starting verse
 *         endVerseId:
 *           type: number
 *           description: The ID of the ending verse
 *     PassageNote:
 *       type: object
 *       required:
 *         - owner
 *         - passages
 *         - content
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the passage note
 *         owner:
 *           type: string
 *           description: The ID of the user who owns this note
 *         passages:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Passage'
 *           description: The Bible passages this note is associated with
 *         content:
 *           type: string
 *           description: The content of the note
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of tag IDs associated with this note
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the note was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the note was last updated
 */

const PassageSchema = new mongoose.Schema({
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
}, { timestamps: false });

PassageSchema.pre('validate', function (next) {
  if (!Bible.validateRange(this.startVerseId, this.endVerseId)) {
    next(new Error('Invalid Verse Range'));
  }
  else {
    next();
  }
});

const PassageNoteSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  passages: {
    type: [PassageSchema],
  },
  content: {
    type: String,
    trim: true,
    maxLength: 3000, // an average single-spaced page
    default: '',
    index: 'text',
  },
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PassageNoteTag',
  }],
}, {
  timestamps: true,
  methods: {
    toJSON() {
      const { _id, passages, content, tags } = this;
      return { id: _id, passages, content, tags };
    },
  },
});

PassageNoteSchema.pre('validate', function (next) {
  if (!this.content.length && !this.passages.length) {
    next(new Error('One of `passages` or `content` required'));
  }
  else {
    next();
  }
});

const PassageNote = mongoose.model('PassageNote', PassageNoteSchema);

export default PassageNote;
