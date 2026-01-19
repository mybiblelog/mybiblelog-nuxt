import express from 'express';
import status from 'http-status';
import authCurrentUser from '../helpers/authCurrentUser';
import { ApiErrorCode } from '../helpers/error-codes';
import useMongooseModels from '../../mongoose/useMongooseModels';
import { type ApiResponse } from '../helpers/response';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Feedback:
 *       type: object
 *       required:
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
 */

/**
 * @swagger
 * /feedback:
 *   post:
 *     summary: Submit feedback
 *     tags: [Feedback]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - kind
 *               - message
 *             properties:
 *               email:
 *                 type: string
 *               kind:
 *                 type: string
 *                 description: The type of feedback
 *               message:
 *                 type: string
 *                 description: The feedback message
 *     responses:
 *       201:
 *         description: Feedback submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - data
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Feedback'
 *       429:
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */

// POST feedback form submission
router.post('/feedback', async (req, res, next) => {
  try {
    // Use IP address to mitigate spam
    const ip = req.ip;

    // Get current user (optional)
    const { Feedback } = await useMongooseModels();
    const currentUser = await authCurrentUser(req, { optional: true });

    // If the user isn't authenticated, get recent feedback from the same
    // IP address and block the attempt if there are too many
    if (!currentUser) {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const recentFeedbackCount = await Feedback
        .countDocuments({
          ip,
          createdAt: { $gt: fiveMinutesAgo },
        });

      if (recentFeedbackCount >= 5) {
        return res
          .status(status.TOO_MANY_REQUESTS)
          .json({ error: { code: ApiErrorCode.TooManyRequests } } satisfies ApiResponse);
      }
    }

    // If the user is logged in, we can associate the feedback with their account
    const owner = currentUser?._id || null;

    const { email, kind, message } = req.body;

    const feedback = new Feedback({
      ip,
      owner,
      email,
      kind,
      message,
    });

    await feedback.save();
    res.status(status.CREATED).send({ data: feedback.toJSON() } satisfies ApiResponse);
  }
  catch (error) {
    next(error);
  }
});

export default router;
