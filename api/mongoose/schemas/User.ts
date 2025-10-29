

import crypto from 'crypto';
import mongoose, { Document } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../../config';
import { UserSettingsSchema, type IUserSettings } from './UserSettings';

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

export interface IUser extends Document {
  email: string;
  isAdmin: boolean;
  password: string | null;
  googleId: string;
  emailVerificationCode: string | null;
  emailVerificationExpires: Date | null;
  newEmail: string | null;
  newEmailVerificationCode: string | null;
  newEmailVerificationExpires: Date | null;
  oldEmails: string[];
  passwordResetCode: string | null;
  passwordResetExpires: Date | null;
  settings: IUserSettings;
  authenticate: (password: string) => Promise<boolean>;
  enablePasswordReset: () => void;
  verifyPasswordResetCode: (passwordResetCode: string) => boolean;
  disablePasswordReset: () => void;
  enableEmailUpdate: (newEmail: string) => void;
  verifyEmailVerificationCode: (emailVerificationCode: string) => boolean;
  verifyNewEmailVerificationCode: (newEmailVerificationCode: string) => boolean;
  disableEmailUpdate: () => void;
  generateJWT: () => string;
  toAuthJSON: () => { username: string; hasLocalAccount: boolean; email: string; isAdmin: boolean; token: string };
}

export const UserSchema = new mongoose.Schema({
  email: { type: String, lowercase: true, unique: true, required: [true, 'required'], match: [/^\S+@\S+\.\S+$/, 'is invalid'], index: true },
  isAdmin: { type: Boolean, default: false },
  password: { type: String, minlength: 8, maxlength: 100 },
  googleId: { type: String, default: null },
  emailVerificationCode: { type: String, default: () => crypto.randomBytes(64).toString('hex') },
  emailVerificationExpires: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) }, // 24 hours

  // change email flow
  newEmail: { type: String, lowercase: true, trim: true, required: false, match: [/^\S+@\S+\.\S+$/, 'is invalid'] },
  newEmailVerificationCode: { type: String, default: null },
  newEmailVerificationExpires: { type: Date, default: null },
  oldEmails: { type: [String], default: () => [] },

  // password reset flow
  passwordResetCode: { type: String, default: null },
  passwordResetExpires: { type: Date, default: null },

  settings: {
    type: UserSettingsSchema,
    required: true,
    default: () => ({}),
  },
}, { timestamps: true });

UserSchema.plugin(uniqueValidator);

UserSchema.methods.authenticate = function(password: string) {
  return new Promise((resolve) => {
    bcrypt.compare(password, this.password, function(err, isMatch) {
      if (err) {
        resolve(false);
      }
      else {
        resolve(isMatch);
      }
    });
  });
};

UserSchema.pre('save', function(next) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this;
  // only hash the password if it has been modified (or is new)
  if (user.password === null || !user.isModified('password')) { return next(); }
  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) { return next(err); }
    bcrypt.hash(String(user.password), salt, function(err, hash) {
      if (err) { return next(err); }
      user.password = hash;
      next();
    });
  });
});

UserSchema.virtual('emailVerified')
  .get(function() {
    return this.emailVerificationCode === null;
  });

UserSchema.methods.enablePasswordReset = function() {
  this.passwordResetCode = crypto.randomBytes(64).toString('hex');
  this.passwordResetExpires = new Date().getTime() + (60 * 60 * 1000); // in 1 hour
};

UserSchema.methods.verifyPasswordResetCode = function(passwordResetCode: string) {
  if (passwordResetCode !== this.passwordResetCode) {
    return false;
  }
  if (new Date().getTime() > this.passwordResetExpires) {
    return false;
  }
  return true;
};

UserSchema.methods.disablePasswordReset = function() {
  this.passwordResetCode = null;
  this.passwordResetExpires = null;
};

UserSchema.methods.enableEmailUpdate = function(newEmail: string) {
  // Allow any user to request to change their email address to any
  // other email address -- if they don't own that other email address,
  // they simply won't be able to take control of it.
  this.newEmail = newEmail;
  this.newEmailVerificationCode = crypto.randomBytes(64).toString('hex');
  this.newEmailVerificationExpires = new Date().getTime() + (60 * 60 * 1000); // in 1 hour
};

UserSchema.methods.verifyEmailVerificationCode = function(emailVerificationCode: string) {
  if (emailVerificationCode !== this.emailVerificationCode) {
    return false;
  }
  if (new Date().getTime() > this.emailVerificationExpires) {
    return false;
  }
  return true;
};

UserSchema.methods.verifyNewEmailVerificationCode = function(newEmailVerificationCode: string) {
  if (newEmailVerificationCode !== this.newEmailVerificationCode) {
    return false;
  }
  if (new Date().getTime() > this.newEmailVerificationExpires) {
    return false;
  }
  return true;
};

UserSchema.methods.disableEmailUpdate = function() {
  this.newEmail = null;
  this.newEmailVerificationCode = null;
  this.newEmailVerificationExpires = null;
};

UserSchema.methods.generateJWT = function() {
  const today = new Date();
  const exp = new Date(today);
  exp.setDate(today.getDate() + 60);

  return jwt.sign({
    id: this._id,
    hasLocalAccount: Boolean(this.password),
    isAdmin: this.isAdmin,
    exp: Math.round(exp.getTime() / 1000),
  }, config.jwtSecret);
};

UserSchema.methods.toAuthJSON = function() {
  return {
    hasLocalAccount: Boolean(this.password),
    email: this.email,
    isAdmin: this.isAdmin,
    token: this.generateJWT(),
  };
};

export const isEmailVerified = (user: IUser) => {
  return user.emailVerificationCode === null;
};

const User = mongoose.model<IUser>('User', UserSchema);

export default User;
