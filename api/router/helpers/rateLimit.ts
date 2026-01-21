import { type Request } from 'express';
import { TooManyRequestsError } from 'router/errors/http-errors';

const defaultReqIdentifierFn = (req: Request): string => {
  return req.ip || 'unknown';
};

// In-memory store for rate limiting
// NOTE: This implementation only works with a single server instance.
// For multiple server instances (load balancing), use Redis or similar distributed store.
// Example Redis implementation:
// const redis = require('redis');
// const client = redis.createClient(process.env.REDIS_URL);
//
// const rateLimit = async (req, options) => {
//   const key = `rate_limit:${req.ip}:${req.method}:${req.path}`;
//   const current = await client.incr(key);
//   if (current === 1) {
//     await client.expire(key, Math.ceil(options.windowMs / 1000));
//   }
//   if (current > options.maxRequests) {
//     throw createError(status.TOO_MANY_REQUESTS, 'Rate limit exceeded');
//   }
// };
const rateLimitStore = {
  // key: [requestTime, requestTime, ...]
};

const clearOldRequests = (windowMs: number) => {
  const currentTime = Date.now();
  const windowStart = currentTime - windowMs;
  for (const key in rateLimitStore) {
    rateLimitStore[key] = rateLimitStore[key].filter(requestTime => requestTime >= windowStart);
    if (rateLimitStore[key].length === 0) {
      delete rateLimitStore[key];
    }
  }
};

const rateLimit = (
  req: Request,
  {
    maxRequests = 5,
    windowMs = 60 * 1000,
    reqIdentifierFn = defaultReqIdentifierFn,
  }: {
    maxRequests?: number;
    windowMs?: number;
    reqIdentifierFn?: (req: Request) => string;
  } = {},
) => {
  const reqIdentifier = reqIdentifierFn(req);
  const key = `${reqIdentifier}-${req.method}-${req.path}`;

  if (!rateLimitStore[key]) {
    rateLimitStore[key] = [];
  }

  // filter out requests older than the window first
  const currentTime = Date.now();
  const windowStart = currentTime - windowMs;
  rateLimitStore[key] = rateLimitStore[key].filter(requestTime => requestTime >= windowStart);

  // check if the limit is exceeded before adding the current request
  if (rateLimitStore[key].length >= maxRequests) {
    throw new TooManyRequestsError();
  }

  // add the current time to the rate limit store for this key
  rateLimitStore[key].push(currentTime);

  // clear old requests after the windowMs
  setTimeout(() => clearOldRequests(windowMs), windowMs);
};

export default rateLimit;
