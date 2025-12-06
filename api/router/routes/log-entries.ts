import express from 'express';
import createError from 'http-errors';
import { ObjectId } from 'mongodb';
import { SimpleDate } from '@mybiblelog/shared';
import authCurrentUser from '../helpers/authCurrentUser';
import useMongooseModels from '../../mongoose/useMongooseModels';
import { Types } from 'mongoose';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     LogEntry:
 *       type: object
 *       required:
 *         - date
 *         - startVerseId
 *         - endVerseId
 *         - owner
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the log entry
 *         date:
 *           type: string
 *           format: date
 *           description: The date of the log entry
 *         startVerseId:
 *           type: string
 *           description: The ID of the starting verse
 *         endVerseId:
 *           type: string
 *           description: The ID of the ending verse
 *         owner:
 *           type: string
 *           description: The ID of the user who owns this log entry
 */

/**
 * @swagger
 * /log-entries:
 *   get:
 *     summary: Get all log entries for the current user
 *     tags: [LogEntries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter log entries by start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter log entries by end date
 *     responses:
 *       200:
 *         description: List of log entries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LogEntry'
 *       400:
 *         description: Invalid date format
 */
router.get('/log-entries', async (req, res, next) => {
  try {
    const { LogEntry } = await useMongooseModels();
    const currentUser = await authCurrentUser(req);
    const { startDate, endDate } = req.query as { startDate: string; endDate: string };

    if (startDate && !SimpleDate.validateString(startDate)) {
      return next(createError(400, 'Invalid startDate'));
    }

    if (endDate && !SimpleDate.validateString(endDate)) {
      return next(createError(400, 'Invalid endDate'));
    }

    if (!startDate && !endDate) {
      const logEntries = await LogEntry.find({ owner: currentUser._id });
      return res.send(logEntries);
    }

    if (startDate && !endDate) {
      const logEntries = await LogEntry.find({ owner: currentUser._id, date: { $gte: startDate } });
      return res.send(logEntries);
    }

    if (!startDate && endDate) {
      const logEntries = await LogEntry.find({ owner: currentUser._id, date: { $lte: endDate } });
      return res.send(logEntries);
    }

    const logEntries = await LogEntry.find({ owner: currentUser._id, date: { $gte: startDate, $lte: endDate } });
    return res.send(logEntries);
  }
  catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /log-entries/{id}:
 *   get:
 *     summary: Get a specific log entry by ID
 *     tags: [LogEntries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The log entry ID
 *     responses:
 *       200:
 *         description: The log entry
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LogEntry'
 *       404:
 *         description: Log entry not found
 */
router.get('/log-entries/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return next(createError(400, 'Invalid ID format'));
    }

    const { LogEntry } = await useMongooseModels();
    const currentUser = await authCurrentUser(req);

    const logEntry = await LogEntry.findOne({ owner: currentUser._id, _id: id });
    if (!logEntry) {
      return next(createError(404, 'Not Found'));
    }
    res.send(logEntry.toJSON());
  }
  catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /log-entries:
 *   post:
 *     summary: Create a new log entry
 *     tags: [LogEntries]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - startVerseId
 *               - endVerseId
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               startVerseId:
 *                 type: string
 *               endVerseId:
 *                 type: string
 *     responses:
 *       200:
 *         description: The created log entry
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LogEntry'
 */
router.post('/log-entries', async (req, res, next) => {
  try {
    const { LogEntry } = await useMongooseModels();
    const currentUser = await authCurrentUser(req);
    const logEntry = new LogEntry(req.body);
    logEntry.owner = new Types.ObjectId(currentUser._id);

    try {
      await logEntry.validate();
    }
    catch (error) {
      return next(createError(400, 'Invalid log entry'));
    }
    await logEntry.save();

    res.send(logEntry.toJSON());
  }
  catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /log-entries/{id}:
 *   put:
 *     summary: Update a log entry
 *     tags: [LogEntries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The log entry ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               startVerseId:
 *                 type: string
 *               endVerseId:
 *                 type: string
 *     responses:
 *       200:
 *         description: The updated log entry
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LogEntry'
 *       404:
 *         description: Log entry not found
 */
router.put('/log-entries/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return next(createError(400, 'Invalid ID format'));
    }

    const { LogEntry } = await useMongooseModels();
    const currentUser = await authCurrentUser(req);
    const { date, startVerseId, endVerseId } = req.body;

    const logEntry = await LogEntry.findOne({ owner: currentUser._id, _id: id });
    if (!logEntry) {
      return next(createError(404, 'Not Found'));
    }

    if (date) { logEntry.date = date; }
    if (startVerseId) { logEntry.startVerseId = startVerseId; }
    if (endVerseId) { logEntry.endVerseId = endVerseId; }

    try {
      await logEntry.validate();
    }
    catch (error) {
      return next(createError(400, 'Invalid log entry'));
    }
    await logEntry.save();

    res.send(logEntry.toJSON());
  }
  catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /log-entries/{id}:
 *   delete:
 *     summary: Delete a log entry
 *     tags: [LogEntries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The log entry ID
 *     responses:
 *       200:
 *         description: Log entry deleted successfully
 *       404:
 *         description: Log entry not found
 */
router.delete('/log-entries/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return next(createError(400, 'Invalid ID format'));
    }

    const { LogEntry } = await useMongooseModels();
    const currentUser = await authCurrentUser(req);

    const result = await LogEntry.deleteOne({ owner: currentUser._id, _id: id });
    if (result.deletedCount === 0) {
      return next(createError(404, 'Not Found'));
    }

    res.send(result.deletedCount);
  }
  catch (error) {
    next(error);
  }
});

export default router;
