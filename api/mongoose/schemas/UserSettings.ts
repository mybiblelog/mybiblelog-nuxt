import mongoose, { Schema, Document } from 'mongoose';
import { SimpleDate, BibleVersions, LocaleCode, getLocaleCodes, defaultLocaleBibleVersions } from '@mybiblelog/shared';

const siteLocales = getLocaleCodes();

export const StartPages = ['start', 'today', 'books', 'checklist', 'calendar', 'notes'] as const;

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
 *         startPage:
 *           type: string
 *           description: The user's preferred start page
 *         locale:
 *           type: string
 *           description: The user's preferred locale
 */

export interface IUserSettings extends Document {
  dailyVerseCountGoal: number;
  lookBackDate: string;
  preferredBibleVersion: string;
  startPage: string;
  locale: LocaleCode;
}

export const UserSettingsSchema = new Schema<IUserSettings>({
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
    default: new Date().toISOString(),
    validate: {
      validator: (date: string) => SimpleDate.validateString(date),
      message: (props: { value: string }) => `${props.value} is not a valid date string`,
    },
  },
  preferredBibleVersion: {
    type: String,
    required: true,
    default: function () {
      const locale = this.locale || 'en';
      return defaultLocaleBibleVersions[locale];
    },
    validate: {
      validator: (version: string) => Object.keys(BibleVersions).includes(version),
      message: (props: { value: string }) => `${props.value} is not a recognized Bible translation`,
    },
  },
  startPage: {
    type: String,
    required: true,
    default: 'start',
    validate: {
      validator: (page: string) => StartPages.includes(page as (typeof StartPages)[number]),
      message: (props: { value: string }) => `${props.value} is not a valid start page`,
    },
  },
  locale: {
    type: String,
    required: true,
    validate: {
      validator: (locale: string) => (siteLocales as string[]).includes(locale),
      message: (props: { value: string }) => `${props.value} is not a supported locale`,
    },
  },
}, { _id: false });

const UserSettings = mongoose.model('UserSettings', UserSettingsSchema);

export default UserSettings;
