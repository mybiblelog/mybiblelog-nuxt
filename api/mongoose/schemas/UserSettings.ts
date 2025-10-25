import mongoose, { Schema, Document, InferSchemaType } from 'mongoose';
import SimpleDate from '../../../shared/simple-date';
import { BibleVersions } from '../../../shared/util';

import i18nConfig, { LocaleCode } from '../../../nuxt/i18n.config';
const siteLocales = i18nConfig.locales.map(locale => locale.code);

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

export interface IUserSettings extends Document {
  dailyVerseCountGoal: number;
  lookBackDate: string;
  preferredBibleVersion: string;
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
    default: BibleVersions.NASB2020,
    validate: {
      validator: (version: string) => Object.keys(BibleVersions).includes(version),
      message: (props: { value: string }) => `${props.value} is not a recognized Bible translation`,
    },
  },
  locale: {
    type: String,
    required: true,
    default: 'en',
    validate: {
      validator: (locale: string) => siteLocales.includes(locale),
      message: (props: { value: string }) => `${props.value} is not a supported locale`,
    },
  },
}, { _id: false });

const UserSettings = mongoose.model('UserSettings', UserSettingsSchema);

export default UserSettings;
