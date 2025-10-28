import express from 'express';
import createError from 'http-errors';
import { ObjectId } from 'mongodb';
import authCurrentUser from '../helpers/authCurrentUser';
import useMongooseModels from '../../mongoose/useMongooseModels';
import { Types } from 'mongoose';

const router = express.Router();

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
 *           description: The number of notes using this tag
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the tag was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the tag was last updated
 */

const countTagNotes = async (tag) => {
  const { PassageNote } = await useMongooseModels();
  return PassageNote.countDocuments({ tags: tag._id });
};

/**
 * @swagger
 * /passage-note-tags:
 *   get:
 *     summary: Get all passage note tags for the current user
 *     tags: [PassageNoteTags]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of passage note tags
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PassageNoteTag'
 */
router.get('/passage-note-tags', async (req, res, next) => {
  try {
    const { PassageNoteTag } = await useMongooseModels();
    const currentUser = await authCurrentUser(req);
    const passageNoteTags = await PassageNoteTag.find({ owner: currentUser._id });

    for (const passageNoteTag of passageNoteTags) {
      passageNoteTag.noteCount = await countTagNotes(passageNoteTag);
    }

    return res.send(passageNoteTags);
  }
  catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /passage-note-tags/{id}:
 *   get:
 *     summary: Get a specific passage note tag by ID
 *     tags: [PassageNoteTags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The passage note tag ID
 *     responses:
 *       200:
 *         description: The passage note tag
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PassageNoteTag'
 *       404:
 *         description: Passage note tag not found
 */
router.get('/passage-note-tags/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return next(createError(400, 'Invalid ID format'));
    }

    const { PassageNoteTag } = await useMongooseModels();
    const currentUser = await authCurrentUser(req);

    const passageNoteTag = await PassageNoteTag.findOne({ owner: currentUser, _id: id });
    if (!passageNoteTag) {
      return next(createError(404, 'Not Found'));
    }
    passageNoteTag.noteCount = await countTagNotes(passageNoteTag);
    res.send(passageNoteTag.toJSON());
  }
  catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /passage-note-tags:
 *   post:
 *     summary: Create a new passage note tag
 *     tags: [PassageNoteTags]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - label
 *               - color
 *             properties:
 *               label:
 *                 type: string
 *                 description: The label of the tag
 *               color:
 *                 type: string
 *                 description: The color of the tag (hex code)
 *               description:
 *                 type: string
 *                 description: The description of the tag
 *     responses:
 *       200:
 *         description: The created passage note tag
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PassageNoteTag'
 */
router.post('/passage-note-tags', async (req, res, next) => {
  try {
    const { PassageNoteTag } = await useMongooseModels();
    const currentUser = await authCurrentUser(req);
    const passageNoteTag = new PassageNoteTag(req.body);
    passageNoteTag.owner = new Types.ObjectId(currentUser._id as string);
    try {
      await passageNoteTag.validate();
    }
    catch (error) {
      return next(createError(400, error.message));
    }
    try {
      await passageNoteTag.save();
    }
    catch (error) {
      // Check if this is a duplicate key error (index violation)
      if (error.code === 11000) {
        return res.status(422).send({
          errors: {
            label: 'A tag with this label already exists',
          },
        });
      }
      throw error;
    }

    passageNoteTag.noteCount = 0;
    res.send(passageNoteTag.toJSON());
  }
  catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /passage-note-tags/{id}:
 *   put:
 *     summary: Update a passage note tag
 *     tags: [PassageNoteTags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The passage note tag ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *                 description: The label of the tag
 *               color:
 *                 type: string
 *                 description: The color of the tag (hex code)
 *               description:
 *                 type: string
 *                 description: The description of the tag
 *     responses:
 *       200:
 *         description: The updated passage note tag
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PassageNoteTag'
 *       404:
 *         description: Passage note tag not found
 */
router.put('/passage-note-tags/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return next(createError(400, 'Invalid ID format'));
    }

    const { PassageNoteTag } = await useMongooseModels();
    const currentUser = await authCurrentUser(req);
    const { label, color, description } = req.body;

    const passageNoteTag = await PassageNoteTag.findOne({ owner: currentUser, _id: id });
    if (!passageNoteTag) {
      return next(createError(404, 'Not Found'));
    }

    if (label) { passageNoteTag.label = label; }
    if (color) { passageNoteTag.color = color; }
    if (description) { passageNoteTag.description = description; }
    try {
      await passageNoteTag.validate();
    }
    catch (error) {
      return next(createError(400, error.message));
    }

    await passageNoteTag.save();

    res.send(passageNoteTag.toJSON());
  }
  catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /passage-note-tags/{id}:
 *   delete:
 *     summary: Delete a passage note tag
 *     tags: [PassageNoteTags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The passage note tag ID
 *     responses:
 *       200:
 *         description: Passage note tag deleted successfully
 *       404:
 *         description: Passage note tag not found
 *       409:
 *         description: Cannot delete tag (tag is in use)
 */
router.delete('/passage-note-tags/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return next(createError(400, 'Invalid ID format'));
    }

    const { PassageNoteTag } = await useMongooseModels();
    const currentUser = await authCurrentUser(req);

    const result = await PassageNoteTag.deleteOne({ owner: currentUser, _id: id });
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
