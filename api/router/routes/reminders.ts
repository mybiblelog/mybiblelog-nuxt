import express from 'express';
import authCurrentUser from '../helpers/authCurrentUser';
import useMongooseModels from '../../mongoose/useMongooseModels';
import { type ApiResponse } from '../helpers/response';

const router = express.Router();

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
 *         - active
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the reminder
 *         owner:
 *           type: string
 *           description: The ID of the user who owns this reminder
 *         hour:
 *           type: number
 *           description: The hour of the day for the reminder (0-23)
 *         minute:
 *           type: number
 *           description: The minute of the hour for the reminder (0-59)
 *         timezoneOffset:
 *           type: number
 *           description: The timezone offset in minutes
 *         nextOccurrence:
 *           type: string
 *           format: date-time
 *           description: The next time the reminder will be sent
 *         active:
 *           type: boolean
 *           description: Whether the reminder is active
 *         unsubscribeCode:
 *           type: string
 *           description: A unique code for unsubscribing from the reminder
 */

/**
 * Returns the single daily reminder for the given user,
 * first creating it if necessary.
 * The reminder time defaults to 12:00 noon, and will be in UTC
 * until the user updates it.
 * This is OK since it won't be active until the user updates it.
 * @param {*} currentUser the __id of the current user
 */
const getUserReminder = async (currentUser) => {
  const { DailyReminder } = await useMongooseModels();
  let reminder = await DailyReminder.findOne({ owner: currentUser });
  if (!reminder) {
    reminder = new DailyReminder({
      owner: currentUser,
      hour: 12,
      minute: 0,
      timezoneOffset: 0,
      nextOccurrence: Date.now(),
      active: false,
    });
    await reminder.save();
  }
  return reminder;
};

/**
 * @swagger
 * /reminders/daily-reminder:
 *   get:
 *     summary: Get the daily reminder for the current user
 *     tags: [Reminders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The daily reminder
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DailyReminder'
 */
router.get('/reminders/daily-reminder', async (req, res, next) => {
  try {
    const currentUser = await authCurrentUser(req);
    const reminder = await getUserReminder(currentUser);
    return res.send({ data: reminder.toJSON() } as ApiResponse);
  }
  catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /reminders/daily-reminder:
 *   put:
 *     summary: Update the daily reminder for the current user
 *     tags: [Reminders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               hour:
 *                 type: number
 *                 description: The hour of the day for the reminder (0-23)
 *               minute:
 *                 type: number
 *                 description: The minute of the hour for the reminder (0-59)
 *               timezoneOffset:
 *                 type: number
 *                 description: The timezone offset in minutes
 *               active:
 *                 type: boolean
 *                 description: Whether the reminder is active
 *     responses:
 *       200:
 *         description: The updated daily reminder
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DailyReminder'
 */
router.put('/reminders/daily-reminder', async (req, res, next) => {
  try {
    const currentUser = await authCurrentUser(req);
    const update = req.body;
    const reminder = await getUserReminder(currentUser);
    [
      'hour',
      'minute',
      'timezoneOffset',
      'active',
    ].forEach((property) => {
      if (typeof update[property] !== 'undefined') {
        reminder[property] = update[property];
      }
    });
    await reminder.save();
    res.send({ data: reminder.toJSON() } as ApiResponse);
  }
  catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /reminders/daily-reminder/unsubscribe/{code}:
 *   put:
 *     summary: Unsubscribe from daily reminders using a unique code
 *     tags: [Reminders]
 *     parameters:
 *       - in: path
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: The unique unsubscribe code
 *     responses:
 *       200:
 *         description: Unsubscribe result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   description: Whether there was an error
 *                 email:
 *                   type: string
 *                   description: The email of the user who was unsubscribed
 */
router.put('/reminders/daily-reminder/unsubscribe/:code', async (req, res, next) => {
  const { code } = req.params;
  const { DailyReminder, User } = await useMongooseModels();

  const reminder = await DailyReminder.findOne({ unsubscribeCode: code });
  if (!reminder) {
    return res.status(404).send({ error: { error: { message: 'Not Found' } } });
  }

  const user = await User.findOne({ _id: reminder.owner });
  if (!user) {
    return res.status(404).send({ error: { error: { message: 'Not Found' } } });
  }

  reminder.active = false;
  await reminder.save();

  return res.send({ data: { email: user.email } } as ApiResponse);
});

export default router;
