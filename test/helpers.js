const crypto = require('crypto');
const request = require('supertest');
const dotenv = require('dotenv');
dotenv.config();

const { TEST_SITE_URL } = process.env;

const api = request(TEST_SITE_URL);

const generateTestEmail = () => {
  return 'test_user_' + crypto.randomBytes(10).toString('hex') + '@example.com';
};

/**
 * Creates a test user and returns a token
 * @returns {Promise<{id: string, email: string, password: string, token: string}>}
 */
async function createTestUser({ isAdmin = false }) {
  const email = generateTestEmail();
  const password = crypto.randomBytes(10).toString('hex');
  const testBypassSecret = process.env.TEST_BYPASS_SECRET;

  // Register the user
  const registerResponse = await api
    .post('/api/auth/register')
    .set('x-test-bypass-secret', testBypassSecret)
    .send({ email, password, ...(isAdmin && { isAdmin }) });

  if (registerResponse.status !== 200) {
    throw new Error(`Failed to register test user: ${registerResponse.body.message}`);
  }

  // Login to get the token
  const loginResponse = await api
    .post('/api/auth/login')
    .set('x-test-bypass-secret', testBypassSecret)
    .send({ email, password });

  if (loginResponse.status !== 200) {
    throw new Error(`Failed to login test user: ${loginResponse.body.message}`);
  }

  return {
    id: loginResponse.body.id,
    email,
    password,
    token: loginResponse.body.token,
  };
}

/**
 * Deletes a test user
 * @param {{ id: string, email: string, token: string }} user
 */
async function deleteTestUser(user) {
  await api.put(`/api/settings/delete-account`)
    .set('Authorization', `Bearer ${user.token}`);
}

module.exports = {
  requestApi: api,
  generateTestEmail,
  createTestUser: () => createTestUser({ isAdmin: false }),
  createTestAdmin: () => createTestUser({ isAdmin: true }),
  deleteTestUser,
};
