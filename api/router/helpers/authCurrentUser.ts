import createError from 'http-errors';
import jwt from 'jsonwebtoken';
import status from 'http-status';
import config from '../../config';
import useMongooseModels from '../../mongoose/useMongooseModels';
import { type Request } from 'express';

import type { UserDoc } from '../../mongoose/types';

export const AUTH_COOKIE_NAME = 'auth_token';
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const { jwtSecret } = config;

const getTokenFromHeader = (req: Request): string | null => {
  const [tokenType, token] = req.headers.authorization?.split(' ') || [];
  if (token && (tokenType === 'Token' || tokenType === 'Bearer')) {
    return token;
  }
  // eslint-disable-next-line dot-notation
  if (req.headers.cookie?.includes(`${AUTH_COOKIE_NAME}=`)) {
    return req.headers.cookie.split(`${AUTH_COOKIE_NAME}=`)[1]?.split(';')[0] || null;
  }
  return null;
};

async function authCurrentUser(
  req: Request,
): Promise<UserDoc>;

async function authCurrentUser(
  req: Request,
  opts: { optional?: false; adminOnly?: boolean }
): Promise<UserDoc>;

async function authCurrentUser(
  req: Request,
  opts: { optional: true; adminOnly?: boolean }
): Promise<UserDoc | null>;

async function authCurrentUser(req: Request, { optional = false, adminOnly = false } = {}): Promise<UserDoc | null> {
  const { User } = await useMongooseModels();

  const token = getTokenFromHeader(req);
  if (!token) {
    if (!optional) {
      throw createError(status.UNAUTHORIZED);
    }
    return null;
  }

  let payload;
  try {
    payload = await new Promise((resolve, reject) => {
      jwt.verify(token, jwtSecret, (err, payload) => {
        if (err) {
          return reject(err);
        }
        resolve(payload);
      });
    });
  }
  catch (err) {
    if (!optional) {
      throw createError(status.UNAUTHORIZED);
    }
    return null;
  }

  const user: UserDoc | null = await User.findById(payload.id);
  if (!user) {
    // We throw an error even when optional because the token is expired
    // and the client will need to re-authenticate. (Or the account was deleted.)
    throw createError(status.UNAUTHORIZED);
  }
  if (adminOnly && !user.isAdmin) {
    throw createError(status.FORBIDDEN);
  }
  return user;
}

export default authCurrentUser;
