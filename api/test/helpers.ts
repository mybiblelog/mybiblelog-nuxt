import crypto from 'node:crypto';
import path from 'node:path';
import request from 'supertest';
import dotenv from 'dotenv';

dotenv.config({
  path: path.resolve(__dirname, '../../.env'),
});

const { TEST_API_URL } = process.env;
if (!TEST_API_URL) {
  throw new Error('TEST_API_URL environment variable is not set');
}
const api = request(TEST_API_URL);

const generateTestEmail = (): string => {
  return 'test_user_' + crypto.randomBytes(10).toString('hex') + '@example.com';
};

export interface TestUser {
  id: string;
  email: string;
  password: string;
  token: string;
}

interface CreateTestUserOptions {
  isAdmin?: boolean;
}

/**
 * Creates a test user and returns a token
 */
async function createTestUser({ isAdmin = false }: CreateTestUserOptions = {}): Promise<TestUser> {
  const email = generateTestEmail();
  const password = crypto.randomBytes(10).toString('hex');
  const testBypassSecret = process.env.TEST_BYPASS_SECRET;

  // Register the user
  const registerResponse = await api
    .post('/api/auth/register')
    .set('x-test-bypass-secret', testBypassSecret!)
    .send({ email, password, ...(isAdmin && { isAdmin }) });

  if (registerResponse.status !== 200) {
    throw new Error(`Failed to register test user: ${registerResponse.body.message}`);
  }

  // Login to get the token
  const loginResponse = await api
    .post('/api/auth/login')
    .set('x-test-bypass-secret', testBypassSecret!)
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
 */
async function deleteTestUser(user: TestUser): Promise<void> {
  await api.put(`/api/settings/delete-account`)
    .set('Authorization', `Bearer ${user.token}`);
}

export {
  api as requestApi,
  generateTestEmail,
  createTestUser,
  deleteTestUser,
};

// Named exports for convenience
export const createTestAdmin = () => createTestUser({ isAdmin: true });

