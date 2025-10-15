const express = require('express');
const status = require('http-status');
const createError = require('http-errors');
const authCurrentUser = require('../helpers/authCurrentUser');
const deleteAccount = require('../helpers/deleteAccount');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     UserSettings:
 *       type: object
 *       properties:
 *         dailyVerseCountGoal:
 *           type: number
 *           description: The user's daily verse count goal
 *         lookBackDate:
 *           type: string
 *           format: date
 *           description: The date to look back to for statistics
 *         preferredBibleVersion:
 *           type: string
 *           description: The user's preferred Bible version
 *         locale:
 *           type: string
 *           description: The user's preferred locale
 */

/**
 * @swagger
 * /settings:
 *   get:
 *     summary: Get user settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User settings
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserSettings'
 */
router.get('/settings', async (req, res, next) => {
  try {
    const currentUser = await authCurrentUser(req);
    res.json(currentUser.settings);
  }
  catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /settings:
 *   put:
 *     summary: Update user settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               settings:
 *                 $ref: '#/components/schemas/UserSettings'
 *     responses:
 *       200:
 *         description: Settings updated successfully
 */
router.put('/settings', async (req, res, next) => {
  try {
    const currentUser = await authCurrentUser(req);
    const { settings } = req.body;
    [
      'dailyVerseCountGoal',
      'lookBackDate',
      'preferredBibleVersion',
      'locale',
    ].forEach((property) => {
      if (typeof settings[property] !== 'undefined') {
        currentUser.settings[property] = settings[property];
      }
    });
    await currentUser.save();
    return res.sendStatus(status.OK);
  }
  catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /settings/delete-account:
 *   put:
 *     summary: Delete user account and all associated data
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted successfully
 */
router.put('/settings/delete-account', async (req, res, next) => {
  try {
    const currentUser = await authCurrentUser(req);
    const success = await deleteAccount(currentUser.email);
    if (!success) {
      return next(createError(500, 'Failed to delete account'));
    }
    return res.sendStatus(status.OK);
  }
  catch (error) {
    next(error);
  }
});

module.exports = router;
