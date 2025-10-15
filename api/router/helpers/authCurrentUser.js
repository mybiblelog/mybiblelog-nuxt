const createError = require('http-errors');
const jwt = require('jsonwebtoken');
const status = require('http-status');
const jwtSecret = require('../../config').jwtSecret;
const useMongooseModels = require('../../mongoose/useMongooseModels');

const getTokenFromHeader = (req) => {
  if ((req.headers.authorization?.split(' ')[0] === 'Token') ||
  (req.headers.authorization?.split(' ')[0] === 'Bearer')) {
    return req.headers.authorization.split(' ')[1];
  }
  return null;
};

const authCurrentUser = async (req, { optional = false, adminOnly = false } = {}) => {
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

module.exports = authCurrentUser;
