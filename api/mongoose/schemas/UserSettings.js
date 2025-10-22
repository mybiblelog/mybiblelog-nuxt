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

const mongoose = require('mongoose');
const SimpleDate = require('../../../shared/simple-date');
const { BibleVersions } = require('../../../shared/util');

const i18nConfig = require('../../../nuxt/i18n.config');
const siteLocales = i18nConfig.locales.map(locale => locale.code);

const UserSettingsSchema = new mongoose.Schema({
  dailyVerseCountGoal: {
    type: Number,
    default: 86,
    required: true,
    min: 1,
    max: 1111,
  },
  lookBackDate: {
    type: String,
    required: true,
    default: SimpleDate.now().toString(),
    validate: {
      validator: SimpleDate.validateString,
      message: props => `${props.value} is not a valid date string`,
    },
  },
  preferredBibleVersion: {
    type: String,
    required: true,
    default: BibleVersions.NASB2020,
    validate: {
      validator: version => Boolean(BibleVersions[version]),
      message: props => `${props.value} is not a recognized Bible translation`,
    },
  },
  locale: {
    type: String,
    required: true,
    default: 'en',
    validate: {
      validator: locale => siteLocales.includes(locale),
      message: props => `${props.value} is not a supported locale`,
    },
  },
}, { _id: false });

module.exports = UserSettingsSchema;
