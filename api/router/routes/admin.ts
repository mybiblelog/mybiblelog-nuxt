import express from 'express';
import createError from 'http-errors';
import { FilterQuery, Types } from 'mongoose';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import authCurrentUser from '../helpers/authCurrentUser';
import useMongooseModels from '../../mongoose/useMongooseModels';
import deleteAccount from '../helpers/deleteAccount';
import { UserDoc } from 'mongoose/types';
import { IUser } from 'mongoose/schemas/User';

dayjs.extend(utc);

type PastWeekEngagementData = {
  date: string;
  newUserAccounts: number;
  usersWithLogEntry: number;
  usersWithNote: number;
};

const getUserEngagementData = async (user: IUser) => {
  const { LogEntry, PassageNote } = await useMongooseModels();
  const lastLogEntry = await LogEntry
    .find({ owner: new Types.ObjectId(user._id as string) })
    .sort({ date: -1 })
    .limit(1)
    .exec();
  const logEntryCount = await LogEntry
    .countDocuments({ owner: new Types.ObjectId(user._id as string) })
    .exec();
  const lastNote = await PassageNote
    .find({ owner: new Types.ObjectId(user._id as string) })
    .sort({ createdAt: -1 })
    .limit(1)
    .exec();
  const noteCount = await PassageNote
    .countDocuments({ owner: new Types.ObjectId(user._id as string) })
    .exec();

  return {
    ...user.toObject(),
    lastLogEntryDate: lastLogEntry[0]?.date || '',
    logEntryCount,
    lastNoteDate: lastNote[0] ? dayjs(lastNote[0]?.createdAt).format('YYYY-MM-DD') : '',
    noteCount,
  };
};

let generatingUserEngagementReport = false;
let userEngagementReportProgress = 0;
const generateUserEngagementReport = async () => {
  const { User, Report } = await useMongooseModels();

  generatingUserEngagementReport = true;
  userEngagementReportProgress = 0;

  const users = await User
    .find()
    .select({
      _id: 1,
      email: 1,
      isAdmin: 1,
      createdAt: 1,
    })
    .exec();

  const userObjects = users.map(user => user.toObject());
  const populatedUsers: UserDoc[] = [];
  for (const user of userObjects) {
    const populatedUser = await getUserEngagementData(user);
    populatedUsers.push(populatedUser);
    userEngagementReportProgress = Math.floor(populatedUsers.length / users.length * 100);
  }

  const report = new Report();
  report.type = 'user-engagement';
  report.data = { users: populatedUsers };
  await report.save();

  userEngagementReportProgress = 100;
  generatingUserEngagementReport = false;
};

const getPastWeekEngagement = async () => {
  const { User, LogEntry, PassageNote } = await useMongooseModels();

  const countNewUserAccountsForDate = async ({ date, hoursOffset = 0 }) => {
    // Convert the input date to a UTC start and end date, applying the hoursOffset
    const startDate = dayjs.utc(date).startOf('day').add(hoursOffset, 'hour').toDate();
    const endDate = dayjs.utc(date).endOf('day').add(hoursOffset, 'hour').toDate();

    // Query the database directly
    const count = await User.countDocuments({
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    }).exec();

    return count;
  };

  const countUsersWithLogEntryForDate = async (date) => {
    // Use aggregation to count distinct owners for the given date
    const result = await LogEntry.aggregate([
      {
        // Match log entries by the exact date string
        $match: { date },
      },
      {
        // Group by owner to find unique owners
        $group: {
          _id: '$owner', // Group by owner
        },
      },
      {
        // Count the number of distinct owners
        $count: 'uniqueOwners',
      },
    ]).exec();

    // Return the count or 0 if no results
    return result.length > 0 ? result[0].uniqueOwners : 0;
  };

  const countUsersWithNoteForDate = async ({ date, hoursOffset = 0 }) => {
    // Convert the input date to UTC start and end dates, applying the hoursOffset
    const startDate = dayjs.utc(date).startOf('day').add(hoursOffset, 'hour').toDate();
    const endDate = dayjs.utc(date).endOf('day').add(hoursOffset, 'hour').toDate();

    // Use aggregation to count distinct owners
    const result = await PassageNote.aggregate([
      {
        // Filter notes by the createdAt date range
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        // Group by the 'owner' field to count unique owners
        $group: {
          _id: '$owner', // Group by owner
        },
      },
      {
        // Count the number of distinct owners
        $count: 'uniqueOwners',
      },
    ]).exec();

    // Return the count or 0 if no results
    return result.length > 0 ? result[0].uniqueOwners : 0;
  };

  const getEngagementForDate = async (date) => {
    const newUserAccountsPromise = countNewUserAccountsForDate({ date });
    const usersWithLogEntryPromise = countUsersWithLogEntryForDate(date);
    const usersWithNotePromise = countUsersWithNoteForDate({ date });

    const [
      newUserAccounts,
      usersWithLogEntry,
      usersWithNote,
    ] = await Promise.all([
      newUserAccountsPromise,
      usersWithLogEntryPromise,
      usersWithNotePromise,
    ]);

    return {
      date,
      newUserAccounts,
      usersWithLogEntry,
      usersWithNote,
    };
  };

  const getLastSevenDays = () => {
    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
      dates.push(dayjs().subtract(i, 'day').format('YYYY-MM-DD'));
    }
    return dates;
  };

  const dates = getLastSevenDays();
  const engagementData: PastWeekEngagementData[] = [];
  for (const date of dates) {
    const data = await getEngagementForDate(date);
    engagementData.push(data);
  }

  return engagementData;
};

const router = express.Router();

/**
 * @swagger
 * /admin/feedback:
 *   get:
 *     summary: Get all feedback submissions
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all feedback submissions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Feedback'
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - User is not an admin
 */
// GET all feedback
router.get('/admin/feedback', async (req, res, next) => {
  try {
    const { Feedback } = await useMongooseModels();
    await authCurrentUser(req, { adminOnly: true });
    const feedback = await Feedback
      .find()
      .sort({ createdAt: -1 })
      .exec();
    res.send(feedback);
  }
  catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /admin/reports/user-engagement/status:
 *   get:
 *     summary: Get status of user engagement report generation
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Status of the report generation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [processing, ready]
 *                   description: Current status of the report
 *                 progress:
 *                   type: number
 *                   description: Progress percentage (0-100)
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - User is not an admin
 */
// GET user report status ('processing', 'ready')
router.get('/admin/reports/user-engagement/status', async (req, res, next) => {
  try {
    const { Report } = await useMongooseModels();
    await authCurrentUser(req, { adminOnly: true });
    const report = await Report.findOne({ type: 'user-engagement' });

    // If a report is in progress, return the progress
    if (generatingUserEngagementReport) {
      return res.send({
        status: 'processing',
        progress: userEngagementReportProgress,
      });
    }

    // If there is no report, start making one
    if (!report) {
      generateUserEngagementReport();
      return res.send({
        status: 'processing',
        progress: 0,
      });
    }

    // If the current report is expired, delete it and start making a new one
    if (dayjs(report.createdAt).isBefore(dayjs().subtract(1, 'hour'))) {
      await Report.deleteOne({ _id: report._id });
      generateUserEngagementReport();
      return res.send({
        status: 'processing',
        progress: 0,
      });
    }

    // If a report exists and is not expired, it is ready
    res.send({
      status: 'ready',
      progress: 100,
    });
  }
  catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /admin/reports/user-engagement:
 *   get:
 *     summary: Get user engagement report
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User engagement report data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         type: object
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - User is not an admin
 *       404:
 *         description: Report not found
 */
// GET user engagement report (if exists)
router.get('/admin/reports/user-engagement', async (req, res, next) => {
  try {
    const { Report } = await useMongooseModels();
    await authCurrentUser(req, { adminOnly: true });
    const report = await Report.findOne({ type: 'user-engagement' });
    if (report) {
      return res.send({
        data: report.data,
      });
    }
    return next(createError(404));
  }
  catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /admin/reports/user-engagement/past-week:
 *   get:
 *     summary: Get past week user engagement data
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Past week user engagement data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   date:
 *                     type: string
 *                     format: date
 *                     description: Date of the engagement data
 *                   newUserAccounts:
 *                     type: number
 *                     description: Number of new user accounts created on this date
 *                   usersWithLogEntry:
 *                     type: number
 *                     description: Number of users who created log entries on this date
 *                   usersWithNote:
 *                     type: number
 *                     description: Number of users who created notes on this date
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - User is not an admin
 */
// GET past week user engagement report
router.get('/admin/reports/user-engagement/past-week', async (req, res, next) => {
  try {
    await authCurrentUser(req, { adminOnly: true });
    const engagementData = await getPastWeekEngagement();
    res.send(engagementData);
  }
  catch (error) {
    next(error);
  }
});

type ValidatedQuery = {
  limit: number;
  offset: number;
  sortOn: string;
  sortDirection: 1 | -1;
  searchText: string;
};

const validateQuery = (query: {
  limit?: string;
  offset?: string;
  sortOn?: string;
  sortDirection?: string;
  searchText?: string;
}): ValidatedQuery | null => {
  const MAX_PAGE_SIZE = 100;

  const validated: ValidatedQuery = {
    limit: 50, // default page size
    offset: 0,
    sortOn: 'createdAt',
    sortDirection: -1,
    searchText: '',
  };

  // determine field to sort on
  const sortOnValues = ['createdAt', 'email'];
  if (query.sortOn && sortOnValues.includes(query.sortOn)) {
    validated.sortOn = query.sortOn;
  }

  // determine sort direction
  const sortDirectionValues = {
    ascending: 1,
    descending: -1,
  };
  if (query.sortDirection && Object.keys(sortDirectionValues).includes(query.sortDirection)) {
    validated.sortDirection = sortDirectionValues[query.sortDirection];
  }

  // determine max number of results to return
  if (query.limit !== undefined) {
    const parsed = parseInt(query.limit);
    if (isNaN(parsed)) {
      return null;
    }
    if (parsed <= 0) {
      return null;
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
      return null;
    }
    if (!isNaN(parsed) && parsed >= 0) {
      validated.offset = parsed;
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
 * /admin/users:
 *   get:
 *     summary: Get list of users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of users to return (max 100)
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of users to skip
 *       - in: query
 *         name: sortOn
 *         schema:
 *           type: string
 *           enum: [createdAt, email]
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
 *         name: searchText
 *         schema:
 *           type: string
 *         description: Text to search for in user emails
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 offset:
 *                   type: number
 *                   description: The offset of the results
 *                 limit:
 *                   type: number
 *                   description: The maximum number of results returned
 *                 size:
 *                   type: number
 *                   description: The total number of results available
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - User is not an admin
 */
// GET list users
router.get('/admin/users', async (req, res, next) => {
  try {
    const { User } = await useMongooseModels();
    await authCurrentUser(req, { adminOnly: true });
    const query = validateQuery(req.query);

    if (!query) {
      return next(createError(400, 'Invalid query parameters'));
    }

    const filterQuery: FilterQuery<IUser> = {}; // all users

    if (query.searchText) {
      // Escape special regex characters to prevent injection
      const escapedSearchText = query.searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filterQuery.email = { $regex: escapedSearchText, $options: 'i' };
    }

    const sortQuery: Record<string, 1 | -1> = {
      [query.sortOn]: query.sortDirection,
    };

    const users = await User
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
            emailVerificationCode: 0,
            newEmailVerificationCode: 0,
            newEmailVerificationExpires: 0,
            password: 0,
            passwordResetCode: 0,
            passwordResetExpires: 0,
          },
        },
      ]);

    // Count the total number of results for all applied filters
    const totalResultCount = await User.countDocuments(filterQuery);

    const response = {
      offset: query.offset,
      limit: query.limit,
      size: totalResultCount,
      results: users,
    };

    return res.send(response);
  }
  catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /admin/users/{email}:
 *   get:
 *     summary: Get a specific user by email
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         schema:
 *           type: string
 *         required: true
 *         description: The user's email
 *     responses:
 *       200:
 *         description: The user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - User is not an admin
 *       404:
 *         description: User not found
 */
// GET a user
router.get('/admin/users/:email', async (req, res, next) => {
  try {
    const { User } = await useMongooseModels();
    await authCurrentUser(req, { adminOnly: true });
    const { email } = req.params;
    const user = await User
      .findOne({ email })
      .select({ email: 1 })
      .exec();
    if (!user) { return next(createError(404)); }
    res.send(user);
  }
  catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /admin/users/{email}/login:
 *   get:
 *     summary: Get a JWT to login as a specific user (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         schema:
 *           type: string
 *         required: true
 *         description: The user's email
 *     responses:
 *       200:
 *         description: JWT token for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 jwt:
 *                   type: string
 *                   description: JWT token for authentication
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - User is not an admin
 *       404:
 *         description: User not found
 */
// GET a JWT to login as a user
router.get('/admin/users/:email/login', async (req, res, next) => {
  try {
    const { User } = await useMongooseModels();
    await authCurrentUser(req, { adminOnly: true });
    const { email } = req.params;
    const user = await User.findOne({ email });

    if (!user) {
      return next(createError(404));
    }

    const jwt = user.generateJWT();
    res.json({ jwt });
  }
  catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /admin/users/{email}:
 *   delete:
 *     summary: Delete a user by email
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         schema:
 *           type: string
 *         required: true
 *         description: The user's email
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: Bad Request - Cannot delete your own admin account
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - User is not an admin
 *       404:
 *         description: User not found
 */
// DELETE a user
router.delete('/admin/users/:email', async (req, res, next) => {
  try {
    const currentUser = await authCurrentUser(req, { adminOnly: true });
    const { email } = req.params;

    // Prevent admin from deleting their own account
    if (currentUser.email === email) {
      return next(createError(400, 'You cannot delete your own admin account'));
    }

    const success = await deleteAccount(email);
    if (!success) {
      return next(createError(404));
    }
    res.sendStatus(200);
  }
  catch (error) {
    next(error);
  }
});

module.exports = router;
