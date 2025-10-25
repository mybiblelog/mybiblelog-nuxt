const express = require('express');
const status = require('http-status');
const authCurrentUser = require('../helpers/authCurrentUser').default;
const { I18nError, makeI18nError } = require('../helpers/i18n-error');
const useMongooseModels = require('../../mongoose/useMongooseModels').default;

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
 *       429:
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: object
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
          .json({ errors: { _form: makeI18nError(I18nError.TooManyRequests, '_form') } });
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
    res.sendStatus(status.CREATED);
  }
  catch (error) {
    next(error);
  }
});

module.exports = router;
