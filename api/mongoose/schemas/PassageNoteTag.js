/**
 * @swagger
 * components:
 *   schemas:
 *     PassageNoteTag:
 *       type: object
 *       required:
 *         - owner
 *         - label
 *         - color
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the tag
 *         owner:
 *           type: string
 *           description: The ID of the user who owns this tag
 *         label:
 *           type: string
 *           description: The label of the tag
 *         color:
 *           type: string
 *           description: The color of the tag (hex code)
 *         description:
 *           type: string
 *           description: The description of the tag
 *         noteCount:
 *           type: number
 *           description: The number of notes using this tag (computed field)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the tag was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the tag was last updated
 */

const mongoose = require('mongoose');

const PassageNoteTagSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  label: {
    type: String,
    required: true,
    trim: true,
    minLength: 1,
    maxLength: 32,
  },
  color: {
    type: String,
    required: true,
    validate: {
      validator(value) {
        // require a hexadecimal color value like #FFF or #0099ff
        return /^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/.test(value);
      },
      message: props => `${props.value} is not a valid hexadecimal color`,
    },
  },
  description: {
    type: String,
    default: '',
    trim: true,
    maxLength: 1500, // an average double-spaced page
  },
  // This property is not stored in the database
  // it should be computed and added separately per request
  noteCount: {
    type: Number,
    required: false,
  },
}, { timestamps: true });

// Make sure labels are unique per user
PassageNoteTagSchema.index({ owner: 1, label: 1 }, { unique: true });

PassageNoteTagSchema.methods.toJSON = function() {
  const { _id, label, color, description, noteCount } = this;
  return { id: _id, label, color, description, noteCount };
};

module.exports = PassageNoteTagSchema;
