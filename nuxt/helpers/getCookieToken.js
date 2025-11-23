import { AUTH_COOKIE_NAME } from '../store/index.js';

const getCookieToken = (req) => {
  if (req.headers && req.headers.cookie && req.headers.cookie.includes(`${AUTH_COOKIE_NAME}=`)) {
    return req.headers.cookie.split(`${AUTH_COOKIE_NAME}=`)[1].split(';')[0];
  }
  return null;
};

export default getCookieToken;
