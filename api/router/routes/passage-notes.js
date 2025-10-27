const createError = require('http-errors');
const express = require('express');
const { ObjectId } = require('mongoose').Types;
const authCurrentUser = require('../helpers/authCurrentUser').default;
const { Bible } = require('@mybiblelog/shared');
const useMongooseModels = require('../../mongoose/useMongooseModels').default;

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     PassageRange:
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
 *         - content
 *         - passages
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the passage note
 *         content:
 *           type: string
 *           description: The content of the note
 *         passages:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PassageRange'
 *           description: The Bible passages this note is associated with
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
 *     PassageNoteList:
 *       type: object
 *       properties:
 *         offset:
 *           type: number
 *           description: The offset of the results
 *         limit:
 *           type: number
 *           description: The maximum number of results returned
 *         size:
 *           type: number
 *           description: The total number of results available
 *         results:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PassageNote'
 *           description: The list of passage notes
 */

const validateTags = async (tagIds) => {
  const { PassageNoteTag } = await useMongooseModels();
  for (const tagId of tagIds) {
    const count = await PassageNoteTag.countDocuments({ _id: tagId });
    if (!count) {
      return false;
    }
  }
  return true;
};

/**
 * Validates the query parameters for the passage notes route
 * Returns undefined if the query is invalid
 * @param {Object} query - The query parameters
 * @returns {Object} The validated query parameters
 */
const validateQuery = (query) => {
  const MAX_PAGE_SIZE = 50;

  // default query values
  const validated = {
    limit: 10, // default page size
    offset: 0,
    sortOn: 'createdAt',
    sortDirection: -1,
    filterTags: [],
    filterTagMatching: 'any', // 'any' | 'all'
    searchText: '',
    filterPassageStartVerseId: 0, // VerseId number
    filterPassageEndVerseId: 0, // VerseId number
    filterPassageMatching: 'inclusive', // 'inclusive' | 'exclusive'
  };

  // determine field to sort on
  const sortOnValues = ['createdAt'];
  if (query.sortOn) {
    if (sortOnValues.includes(query.sortOn)) {
      validated.sortOn = query.sortOn;
    }
    else {
      return;
    }
  }

  // determine sort direction
  const sortDirectionValues = {
    ascending: 1,
    descending: -1,
  };
  if (query.sortDirection) {
    if (Object.keys(sortDirectionValues).includes(query.sortDirection)) {
      validated.sortDirection = sortDirectionValues[query.sortDirection];
    }
    else {
      return;
    }
  }

  // determine max number of results to return
  if (query.limit !== undefined) {
    const parsed = parseInt(query.limit);
    if (isNaN(parsed)) {
      return;
    }
    if (parsed <= 0) {
      return;
    }
    if (parsed > MAX_PAGE_SIZE) {
      validated.limit = MAX_PAGE_SIZE;
    }
    else {
      validated.limit = parsed;
    }
  }

  // determine how many items to skip before results begin
  if (query.offset !== undefined) {
    const parsed = parseInt(query.offset);
    if (isNaN(parsed)) {
      return;
    }
    if (!isNaN(parsed) && parsed >= 0) {
      validated.offset = parsed;
    }
  }

  // determine which passage to filter by
  if (query.filterPassageStartVerseId && query.filterPassageEndVerseId) {
    const startVerseId = Number(query.filterPassageStartVerseId);
    const endVerseId = Number(query.filterPassageEndVerseId);
    const rangeIsValid = Bible.validateRange(startVerseId, endVerseId);
    if (rangeIsValid) {
      validated.filterPassageStartVerseId = startVerseId;
      validated.filterPassageEndVerseId = endVerseId;
    }
  }

  // determine how to filter by passage
  if (query.filterPassageMatching) {
    if (['inclusive', 'exclusive'].includes(query.filterPassageMatching)) {
      validated.filterPassageMatching = query.filterPassageMatching;
    }
    else {
      return;
    }
  }

  // determine which tags to filter by
  if (!Array.isArray(query.filterTags)) {
    // ensure single tags are treated as single-item arrays
    query.filterTags = [query.filterTags];
  }
  if (query.filterTags.length) {
    for (const filterTag of query.filterTags) {
      // ensure each value is a valid ObjectId
      if (ObjectId.isValid(filterTag)) {
        validated.filterTags.push(new ObjectId(filterTag));
      }
    }
  }

  // determine how to filter by tag
  if (query.filterTagMatching) {
    if (['any', 'all', 'exact'].includes(query.filterTagMatching)) {
      validated.filterTagMatching = query.filterTagMatching;
    }
    else {
      return;
    }
  }

  // determine text to search for
  if (query.searchText?.length) {
    validated.searchText = query.searchText;
  }

  return validated;
};

/**
 * @swagger
 * /passage-notes:
 *   get:
 *     summary: Get passage notes for the current user
 *     tags: [PassageNotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Maximum number of notes to return (max 50)
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of notes to skip
 *       - in: query
 *         name: sortOn
 *         schema:
 *           type: string
 *           enum: [createdAt]
 *           default: createdAt
 *         description: Field to sort on
 *       - in: query
 *         name: sortDirection
 *         schema:
 *           type: string
 *           enum: [ascending, descending]
 *           default: descending
 *         description: Sort direction
 *       - in: query
 *         name: filterTags
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Tag IDs to filter by
 *       - in: query
 *         name: filterTagMatching
 *         schema:
 *           type: string
 *           enum: [any, all, exact]
 *           default: any
 *         description: How to match tags
 *       - in: query
 *         name: searchText
 *         schema:
 *           type: string
 *         description: Text to search for in notes
 *       - in: query
 *         name: filterPassageStartVerseId
 *         schema:
 *           type: integer
 *         description: Start verse ID for passage filtering
 *       - in: query
 *         name: filterPassageEndVerseId
 *         schema:
 *           type: integer
 *         description: End verse ID for passage filtering
 *       - in: query
 *         name: filterPassageMatching
 *         schema:
 *           type: string
 *           enum: [inclusive, exclusive]
 *           default: inclusive
 *         description: How to match passages
 *     responses:
 *       200:
 *         description: List of passage notes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PassageNoteList'
 */
router.get('/passage-notes', async (req, res, next) => {
  try {
    const { PassageNote } = await useMongooseModels();
    const currentUser = await authCurrentUser(req);
    const query = validateQuery(req.query);

    if (!query) {
      return res.status(400).send({ error: 'Invalid query parameters' });
    }

    const filterQuery = {
      owner: currentUser._id,
    };

    if (query.filterTags.length || query.filterTagMatching === 'exact') {
      if (query.filterTagMatching === 'any') {
        filterQuery.tags = {
          $in: query.filterTags,
        };
      }
      else if (query.filterTagMatching === 'all') {
        filterQuery.tags = {
          $all: query.filterTags,
        };
      }
      else if (query.filterTagMatching === 'exact') {
        filterQuery.tags = query.filterTags;
      }
    }

    if (query.filterPassageStartVerseId && query.filterPassageEndVerseId) {
      if (query.filterPassageMatching === 'inclusive') {
        filterQuery.passages = {
          $elemMatch: {
            startVerseId: { $lte: query.filterPassageEndVerseId },
            endVerseId: { $gte: query.filterPassageStartVerseId },
          },
        };
      }
      else if (query.filterPassageMatching === 'exclusive') {
        filterQuery.passages = {
          $elemMatch: {
            startVerseId: { $gte: query.filterPassageStartVerseId },
            endVerseId: { $lte: query.filterPassageEndVerseId },
          },
        };
      }
    }

    if (query.searchText) {
      filterQuery.$text = {
        $search: query.searchText,
      };
    }

    const sortQuery = {
      [query.sortOn]: query.sortDirection,
    };

    const passageNotes = await PassageNote
      .aggregate([
        { $match: filterQuery },
        { $sort: sortQuery },
        { $skip: query.offset },
        { $limit: query.limit },
        {
          $addFields: {
            id: '$_id',
          },
        },
        {
          $project: {
            _id: 0,
            __v: 0,
            owner: 0,
          },
        },
      ]);

    const totalResultCount = await PassageNote.countDocuments(filterQuery);

    const response = {
      offset: query.offset,
      limit: query.limit,
      size: totalResultCount,
      results: passageNotes,
    };

    return res.send(response);
  }
  catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /passage-notes/{id}:
 *   get:
 *     summary: Get a specific passage note by ID
 *     tags: [PassageNotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The passage note ID
 *     responses:
 *       200:
 *         description: The passage note
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PassageNote'
 *       404:
 *         description: Passage note not found
 */
router.get('/passage-notes/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return next(createError(400, 'Invalid ID format'));
    }

    const { PassageNote } = await useMongooseModels();
    const currentUser = await authCurrentUser(req);

    const passageNote = await PassageNote.findOne({ owner: currentUser, _id: id });
    if (!passageNote) {
      return next(createError(404, 'Not Found'));
    }
    res.send(passageNote.toJSON());
  }
  catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /passage-notes:
 *   post:
 *     summary: Create a new passage note
 *     tags: [PassageNotes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - passages
 *             properties:
 *               content:
 *                 type: string
 *                 description: The content of the note
 *               passages:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/PassageRange'
 *                 description: The Bible passages this note is associated with
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of tag IDs to associate with this note
 *     responses:
 *       200:
 *         description: The created passage note
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PassageNote'
 *       409:
 *         description: Cannot create note (invalid tags)
 */
router.post('/passage-notes', async (req, res, next) => {
  try {
    const { PassageNote } = await useMongooseModels();
    const currentUser = await authCurrentUser(req);
    const passageNote = new PassageNote(req.body);

    // validate that all tags exist
    const tagsValid = await validateTags(passageNote.tags);
    if (!tagsValid) {
      return next(createError(409, 'Cannot Create'));
    }

    passageNote.owner = currentUser._id;
    try {
      await passageNote.validate();
    }
    catch (error) {
      return next(createError(400, 'Invalid passage note'));
    }
    await passageNote.save();

    res.send(passageNote.toJSON());
  }
  catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /passage-notes/{id}:
 *   put:
 *     summary: Update a passage note
 *     tags: [PassageNotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The passage note ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: The content of the note
 *               passages:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/PassageRange'
 *                 description: The Bible passages this note is associated with
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of tag IDs to associate with this note
 *     responses:
 *       200:
 *         description: The updated passage note
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PassageNote'
 *       404:
 *         description: Passage note not found
 *       409:
 *         description: Cannot update note (invalid tags)
 */
router.put('/passage-notes/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return next(createError(400, 'Invalid ID format'));
    }

    const { PassageNote } = await useMongooseModels();
    const currentUser = await authCurrentUser(req);
    const { content, passages, tags } = req.body;

    const passageNote = await PassageNote.findOne({ owner: currentUser, _id: id });
    if (!passageNote) {
      return next(createError(404, 'Not Found'));
    }

    if (content) { passageNote.content = content; }
    if (passages) { passageNote.passages = passages; }
    if (tags) {
      // validate that all tags exist
      const tagsValid = await validateTags(tags);
      if (!tagsValid) {
        return next(createError(409, 'Cannot Update'));
      }
      passageNote.tags = tags;
    }
    try {
      await passageNote.validate();
    }
    catch (error) {
      return next(createError(400, 'Invalid passage note'));
    }
    await passageNote.save();

    res.send(passageNote.toJSON());
  }
  catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /passage-notes/{id}:
 *   delete:
 *     summary: Delete a passage note
 *     tags: [PassageNotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The passage note ID
 *     responses:
 *       200:
 *         description: Passage note deleted successfully
 *       404:
 *         description: Passage note not found
 */
router.delete('/passage-notes/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return next(createError(400, 'Invalid ID format'));
    }

    const { PassageNote } = await useMongooseModels();
    const currentUser = await authCurrentUser(req);

    const result = await PassageNote.deleteOne({ owner: currentUser, _id: id });
    if (result.deletedCount === 0) {
      return next(createError(404, 'Not Found'));
    }

    res.send(result.deletedCount);
  }
  catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /passage-notes/count/books:
 *   get:
 *     summary: Get count of passage notes by Bible book
 *     tags: [PassageNotes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Count of passage notes by Bible book
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties:
 *                 type: number
 *               description: Object with Bible book codes as keys and note counts as values
 */
// GET passage note book counts
router.get('/passage-notes/count/books', async (req, res, next) => {
  try {
    const { PassageNote } = await useMongooseModels();
    const currentUser = await authCurrentUser(req);

    const facetQuery = {};
    const projectQuery = {};

    for (const book of Bible.getBooks()) {
      const { bibleOrder } = book;

      const firstVerseId = Bible.getFirstBookVerseId(bibleOrder);
      const lastVerseId = Bible.getLastBookVerseId(bibleOrder);
      facetQuery[bibleOrder] = [
        {
          $match: {
            'passages.startVerseId': { $gte: firstVerseId },
            'passages.endVerseId': { $lte: lastVerseId },
          },
        },
        {
          $count: 'count',
        },
      ];

      projectQuery[bibleOrder] = {
        $cond: [
          {
            $eq: [
              { $size: `$${bibleOrder}` },
              0,
            ],
          },
          0,
          { $arrayElemAt: [`$${bibleOrder}.count`, 0] },
        ],
      };
    }

    const result = await PassageNote.aggregate([
      {
        $match: {
          owner: currentUser._id,
        },
      },
      {
        $unwind: {
          path: '$passages',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $facet: facetQuery,
      },
      {
        $project: projectQuery,
      },
    ]);

    res.send(result[0]);
  }
  catch (error) {
    next(error);
  }
});

module.exports = router;
