import mongoose from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     Feedback:
 *       type: object
 *       required:
 *         - ip
 *         - kind
 *         - message
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the feedback
 *         ip:
 *           type: string
 *           description: The IP address of the user who submitted the feedback
 *         owner:
 *           type: string
 *           description: The ID of the user who submitted the feedback (if authenticated)
 *         email:
 *           type: string
 *           description: The email of the user who submitted the feedback
 *         kind:
 *           type: string
 *           description: The type of feedback
 *         message:
 *           type: string
 *           description: The feedback message
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the feedback was submitted
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the feedback was last updated
 */

const FeedbackSchema = new mongoose.Schema({
  ip: {
    type: String,
    required: true,
  },
  owner: {
    // Can be null if the user is not logged in
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    required: [true, 'required'],
    match: [/^\S+@\S+\.\S+$/, 'is invalid'],
  },
  kind: {
    type: String,
    enum: ['bug', 'feature', 'comment'],
    required: true,
  },
  message: {
    type: String,
    trim: true,
    maxLength: 1500, // an average double-spaced page
    required: true,
  },
}, { timestamps: true });

const Feedback = mongoose.model('Feedback', FeedbackSchema);

export default Feedback;
