const config = require('../../config');

/**
 * Check if the request is coming from a test environment.
 *
 * This is used to bypass certain checks in the API for testing purposes.
 *
 * @param {import('express').Request} req
 * @returns {boolean}
 */
const checkTestBypass = (req) => {
  const testBypassSecret = config.testBypassSecret;
  if (!testBypassSecret) {
    return false;
  }
  if (req.headers['x-test-bypass-secret'] === testBypassSecret) {
    return true;
  }
  return false;
};

module.exports = checkTestBypass;
