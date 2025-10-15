const express = require('express');

const authRouter = require('./routes/auth');
const settingsRouter = require('./routes/settings');
const adminRouter = require('./routes/admin');
const logEntriesRouter = require('./routes/log-entries');
const passageNotesRouter = require('./routes/passage-notes');
const passageNoteTagsRouter = require('./routes/passage-note-tags');
const remindersRouter = require('./routes/reminders');
const feedbackRouter = require('./routes/feedback');
const sitemapRouter = require('./routes/sitemap');

const apiRouter = express.Router();

apiRouter.use(authRouter);
apiRouter.use(settingsRouter);
apiRouter.use(adminRouter);
apiRouter.use(logEntriesRouter);
apiRouter.use(passageNotesRouter);
apiRouter.use(passageNoteTagsRouter);
apiRouter.use(remindersRouter);
apiRouter.use(feedbackRouter);
apiRouter.use(sitemapRouter);

module.exports = apiRouter;
