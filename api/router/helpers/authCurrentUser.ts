import createError from 'http-errors';
import jwt from 'jsonwebtoken';
import status from 'http-status';
import config from '../../config';
import useMongooseModels from '../../mongoose/useMongooseModels';
import { type Request } from 'express';

const { jwtSecret } = config;

const getTokenFromHeader = (req: Request): string | null => {
  const [tokenType, token] = req.headers.authorization?.split(' ') || [];
  if (token && (tokenType === 'Token' || tokenType === 'Bearer')) {
    return token;
  }
  return null;
};

const authCurrentUser = async (req: Request, { optional = false, adminOnly = false } = {}) => {
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

  const user = await User.findById(payload.id);
  if (!user) {
    // We throw an error even when optional because the token is expired
    // and the client will need to re-authenticate. (Or the account was deleted.)
    throw createError(status.UNAUTHORIZED);
  }
  if (adminOnly && !user.isAdmin) {
    throw createError(status.FORBIDDEN);
  }
  return user;
};

export default authCurrentUser;
