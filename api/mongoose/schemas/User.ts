import crypto from 'crypto';
import mongoose, { HydratedDocument, InferSchemaType } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../../config';
import { UserSettingsSchema } from './UserSettings';

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the user
 *         email:
 *           type: string
 *           description: The user's email address
 *         isAdmin:
 *           type: boolean
 *           description: Whether the user is an admin
 *         password:
 *           type: string
 *           description: The user's hashed password
 *         googleId:
 *           type: string
 *           description: The user's Google ID (if using Google OAuth)
 *         emailVerificationCode:
 *           type: string
 *           description: Code for verifying the user's email
 *         newEmail:
 *           type: string
 *           description: New email address for email change process
 *         newEmailVerificationCode:
 *           type: string
 *           description: Code for verifying the new email
 *         newEmailVerificationExpires:
 *           type: string
 *           format: date-time
 *           description: Expiration time for the new email verification code
 *         oldEmails:
 *           type: array
 *           items:
 *             type: string
 *           description: List of previous email addresses
 *         passwordResetCode:
 *           type: string
 *           description: Code for resetting the password
 *         passwordResetExpires:
 *           type: string
 *           format: date-time
 *           description: Expiration time for the password reset code
 *         settings:
 *           $ref: '#/components/schemas/UserSettings'
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the user was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the user was last updated
 */

const SALT_WORK_FACTOR = 10;

export const UserSchema = new mongoose.Schema({
  email: { type: String, lowercase: true, unique: true, required: [true, 'required'], match: [/^\S+@\S+\.\S+$/, 'is invalid'], index: true },
  isAdmin: { type: Boolean, default: false },
  password: { type: String, minlength: 8, maxlength: 100 },
  googleId: { type: String, default: null },
  emailVerificationCode: { type: String, default: () => crypto.randomBytes(64).toString('hex') },
  emailVerificationExpires: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) }, // 24 hours

  // change email flow
  newEmail: { type: String, lowercase: true, trim: true, required: false, match: [/^\S+@\S+\.\S+$/, 'is invalid'] },
  newEmailVerificationCode: { type: String, default: '' },
  newEmailVerificationExpires: { type: Date, default: () => new Date(0) },
  oldEmails: { type: [String], default: () => [] },

  // password reset flow
  passwordResetCode: { type: String, default: '' },
  passwordResetExpires: { type: Date, default: () => new Date(0) },

  settings: {
    type: UserSettingsSchema,
    required: true,
    default: () => ({}),
  },
}, {
  timestamps: true,
  methods: {
    authenticate(password: string) {
      const userPassword = this.password ?? '';
      if (!userPassword) {
        return false;
      }
      return new Promise((resolve) => {
        bcrypt.compare(password, userPassword, function(err, isMatch) {
          if (err) {
            resolve(false);
          }
          else {
            resolve(isMatch);
          }
        });
      });
    },
    enablePasswordReset() {
      this.passwordResetCode = crypto.randomBytes(64).toString('hex');
      this.passwordResetExpires = new Date(Date.now() + (60 * 60 * 1000)); // in 1 hour
    },
    verifyPasswordResetCode(passwordResetCode: string) {
      if (passwordResetCode !== this.passwordResetCode) {
        return false;
      }
      if (new Date().getTime() > this.passwordResetExpires.getTime()) {
        return false;
      }
      return true;
    },
    disablePasswordReset() {
      this.passwordResetCode = '';
      this.passwordResetExpires = new Date(0);
    },
    enableEmailUpdate(newEmail: string) {
      // Allow any user to request to change their email address to any
      // other email address -- if they don't own that other email address,
      // they simply won't be able to take control of it.
      this.newEmail = newEmail;
      this.newEmailVerificationCode = crypto.randomBytes(64).toString('hex');
      this.newEmailVerificationExpires = new Date(Date.now() + (60 * 60 * 1000)); // in 1 hour
    },
    verifyEmailVerificationCode(emailVerificationCode: string) {
      if (emailVerificationCode !== this.emailVerificationCode) {
        return false;
      }
      if (new Date().getTime() > this.emailVerificationExpires.getTime()) {
        return false;
      }
      return true;
    },
    verifyNewEmailVerificationCode(newEmailVerificationCode: string) {
      if (newEmailVerificationCode !== this.newEmailVerificationCode) {
        return false;
      }
      if (new Date().getTime() > this.newEmailVerificationExpires.getTime()) {
        return false;
      }
      return true;
    },
    disableEmailUpdate() {
      this.newEmail = null;
      this.newEmailVerificationCode = '';
      this.newEmailVerificationExpires = new Date(0);
    },
    generateJWT() {
      const today = new Date();
      const exp = new Date(today);
      exp.setDate(today.getDate() + 60);

      return jwt.sign({
        id: this._id,
        hasLocalAccount: Boolean(this.password),
        isAdmin: this.isAdmin,
        exp: Math.round(exp.getTime() / 1000),
      }, config.jwtSecret);
    },
    toAuthJSON() {
      return {
        hasLocalAccount: Boolean(this.password),
        email: this.email,
        isAdmin: this.isAdmin,
      };
    },
  },
});

UserSchema.plugin(uniqueValidator);

UserSchema.pre('save', function() {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this;
  return new Promise((resolve, reject) => {
    // only hash the password if it has been modified (or is new)
    if (user.password === null || !user.isModified('password')) {
      return resolve();
    }
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
      if (err) { return reject(err); }
      bcrypt.hash(String(user.password), salt, function(err, hash) {
        if (err) { return reject(err); }
        user.password = hash;
        resolve();
      });
    });
  });
});

const User = mongoose.model('User', UserSchema);

export type UserDoc = HydratedDocument<
  ReturnType<typeof User['hydrate']>
>;
export type IUser = InferSchemaType<typeof UserSchema>;

export default User;

// Helpers (in place of virtuals, which are not compatible with type inference)

export const isEmailVerified = (user: IUser) => {
  return user.emailVerificationCode === '';
};
