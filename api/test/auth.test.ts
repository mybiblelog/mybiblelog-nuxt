import { describe, it, test, expect } from '@jest/globals';
import {
  requestApi,
  createTestUser,
  deleteTestUser,
  generateTestEmail,
  generateRandomString,
} from './helpers';

const { TEST_BYPASS_SECRET } = process.env;

const AUTH_COOKIE_NAME = 'auth_token';

describe('Auth routes', () => {
  test('POST /api/auth/login (invalid credentials)', async () => {
    // Act
    const res = await requestApi
      .post('/api/auth/login')
      .send({
        email: 'invalid@example.com',
        password: 'invalid_password',
      });

    // Assert
    expect(res.statusCode).toBe(422);
    expect(res.headers['set-cookie']).toBeUndefined();
    expect(res.body.errors).toEqual({
      _form: {
        kind: 'api_error.invalid_login',
        field: '_form',
        properties: {},
      },
    });
  });

  test('POST /api/auth/login (valid credentials)', async () => {
    // Arrange
    const testUser = await createTestUser();

    // Act
    const res = await requestApi
      .post('/api/auth/login')
      .set('x-test-bypass-secret', TEST_BYPASS_SECRET!)
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    // Assert
    expect(res.statusCode).toBe(200);
    // expect token in response body
    expect(res.body).toHaveProperty('token');
    expect(typeof res.body.token).toBe('string');
    // expect cookie to be set in header
    expect(res.headers['set-cookie']).toBeDefined();
    expect(res.headers['set-cookie']?.[0]).toContain(`${AUTH_COOKIE_NAME}=`);

    // Cleanup
    await deleteTestUser(testUser);
  });

  test('POST /api/auth/logout', async () => {
    // Arrange
    const testUser = await createTestUser();

    // Act
    const res = await requestApi
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${testUser.token}`);

    // Assert
    expect(res.statusCode).toBe(200);
    // expect cookie to be cleared in header
    expect(res.headers['set-cookie']).toBeDefined();
    expect(res.headers['set-cookie']?.[0]).toContain(`${AUTH_COOKIE_NAME}=;`);

    // Cleanup
    await deleteTestUser(testUser);
  });

  test('GET /api/auth/user (unauthenticated)', async () => {
    // Act
    const res = await requestApi
      .get('/api/auth/user');

    // Assert
    // The ONE unauthenticated route that returns a 200
    // only because Nuxt auth would fail otherwise
    expect(res.statusCode).toBe(200);

    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toBe(null);
  });

  test('GET /api/auth/user (authenticated)', async () => {
    // Arrange
    const testUser = await createTestUser();

    // Act
    const res = await requestApi
      .get('/api/auth/user')
      .set('Authorization', `Bearer ${testUser.token}`);

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.user.hasLocalAccount).toBe(true);
    expect(res.body.user.isAdmin).toBe(false);

    // Cleanup
    await deleteTestUser(testUser);
  });

  describe('POST /api/auth/register', () => {
    it('error if email is invalid', async () => {
      const response = await requestApi
        .post('/api/auth/register')
        // bypass rate limiting
        .set('x-test-bypass-secret', TEST_BYPASS_SECRET!)
        .send({
          email: 'invalid-email',
          password: 'password123',
          name: 'Test User',
          locale: 'en',
        });
      expect(response.status).toBe(422);
      expect(response.body.errors).toEqual({
        email: {
          field: 'email',
          kind: 'api_error.review',
          properties: {
            length: 13,
            message: 'is invalid',
            path: 'email',
            regexp: {},
            type: 'regexp',
            value: 'invalid-email',
          },
        },
      });
    });

    it('error if email already in use', async () => {
      // Helper function to truncate email for error message
      const truncatedEmail = (email: string) => email.substring(0, 30) + '...';

      // Arrange
      const testUser = await createTestUser();

      // Act
      const response = await requestApi
        .post('/api/auth/register')
        // bypass rate limiting
        .set('x-test-bypass-secret', TEST_BYPASS_SECRET!)
        .send({
          email: testUser.email,
          password: 'newpassword123',
          locale: 'en',
        });

      // Assert
      expect(response.statusCode).toBe(422);
      expect(response.body.errors).toEqual({
        email: {
          kind: 'api_error.unique',
          field: 'email',
          properties: {
            length: 42,
            message: `Error, expected \`email\` to be unique. Value: \`${truncatedEmail(testUser.email)}\``,
            path: 'email',
            type: 'unique',
            value: truncatedEmail(testUser.email),
          },
        },
      });

      // Cleanup
      await deleteTestUser(testUser);
    });

    it('error if password is too short', async () => {
      const response = await requestApi
        .post('/api/auth/register')
        // bypass rate limiting
        .set('x-test-bypass-secret', TEST_BYPASS_SECRET!)
        .send({
          email: generateTestEmail(),
          password: '123',
          name: 'Test User',
          locale: 'en',
        });
      expect(response.status).toBe(422);
      expect(response.body.errors).toEqual({
        password: {
          field: 'password',
          kind: 'api_error.min_length',
          properties: {
            length: 3,
            message: 'Path `password` (`123`, length 3) is shorter than the minimum allowed length (8).',
            minlength: 8,
            path: 'password',
            type: 'minlength',
            value: '123',
          },
        },
      });
    });

    it('enforces rate limiting when test bypass header is not present', async () => {
      // Send 6 requests to ensure the rate limit is enforced
      // (previous tests may have already counted against the rate limit)
      let response: any = null;
      for (let i = 0; i < 6; i++) {
        response = await requestApi
          .post('/api/auth/register')
          .send({
            email: generateTestEmail(),
            password: 'password123',
            locale: 'en',
          });
      }

      expect(response.status).toBe(429); // Too Many Requests
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toHaveProperty('error');
      expect(response.body.errors.error.message).toContain('Rate limit exceeded');
    });

    it('bypasses rate limiting when test bypass header is present', async () => {
      // Should be able to make more than 5 requests when bypass header is present
      const successfulRequests: any[] = [];
      for (let i = 0; i < 7; i++) {
        const response = await requestApi
          .post('/api/auth/register')
          .set('x-test-bypass-secret', TEST_BYPASS_SECRET!)
          .send({
            email: generateTestEmail(),
            password: 'password123',
            locale: 'en',
          });

        expect(response.status).toBe(200);
        successfulRequests.push(response);
      }
    });
  });

  describe('GET /api/auth/verify-email/:emailVerificationCode', () => {
    it('returns 404 for invalid verification code', async () => {
      const res = await requestApi
        .get('/api/auth/verify-email/invalid-code-12345');
      expect(res.statusCode).toBe(404);
    });

    it('returns a token with cookie when verification code is valid', async () => {
      const testEmail = generateTestEmail();
      const testEmailVerificationCode = generateRandomString();
      const registerResponse = await requestApi
        .post('/api/auth/register')
        .set('x-test-bypass-secret', TEST_BYPASS_SECRET!)
        .send({
          email: testEmail,
          password: 'password123',
          locale: 'en',
          emailVerificationCode: testEmailVerificationCode,
        });
      expect(registerResponse.statusCode).toBe(200);

      const res = await requestApi
        .get(`/api/auth/verify-email/${testEmailVerificationCode}`);
      expect(res.statusCode).toBe(200);
      expect(res.headers['set-cookie']).toBeDefined();
      expect(res.headers['set-cookie']?.[0]).toContain(`${AUTH_COOKIE_NAME}=`);
      expect(res.body).toHaveProperty('token');
      expect(typeof res.body.token).toBe('string');

      await deleteTestUser({ token: registerResponse.body.token });
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('returns the password reset code in the response body when test bypass header is present', async () => {
      const testUser = await createTestUser();
      const response = await requestApi
        .post('/api/auth/reset-password')
        .set('x-test-bypass-secret', TEST_BYPASS_SECRET!)
        .send({
          email: testUser.email
        });
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('passwordResetCode');
      expect(response.body.passwordResetCode).toBeDefined();

      await deleteTestUser(testUser);
    });

    it('does not return the password reset code in the response body when test bypass header is not present', async () => {
      const testUser = await createTestUser();
      const response = await requestApi
        .post('/api/auth/reset-password')
        .send({
          email: testUser.email
        });
      expect(response.statusCode).toBe(200);
      expect(response.body).not.toHaveProperty('passwordResetCode');

      await deleteTestUser(testUser);
    });

    it('returns 422 for invalid email', async () => {
      const response = await requestApi
        .post('/api/auth/reset-password')
        .send({
          email: 'invalid-email'
        });
      expect(response.statusCode).toBe(422);
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toHaveProperty('email');
    });

    it('does not return the password reset code in the response body when test bypass header is not present', async () => {
      const testUser = await createTestUser();
      const response = await requestApi
        .post('/api/auth/reset-password')
        .send({
          email: testUser.email
        });
        expect(response.statusCode).toBe(200);
      expect(response.body).not.toHaveProperty('passwordResetCode');

      await deleteTestUser(testUser);
    });
  });

  describe('POST /api/auth/reset-password/:passwordResetCode', () => {
    it('returns 404 for invalid reset code', async () => {
      const res = await requestApi
        .post('/api/auth/reset-password/invalid-code-12345')
        .send({ newPassword: 'newpassword123' });
      expect(res.statusCode).toBe(404);
    });

    it('returns a token with cookie when reset code is valid', async () => {
      const testUser = await createTestUser();
      const passwordResetCodeResponse = await requestApi
        .post('/api/auth/reset-password')
        .set('x-test-bypass-secret', TEST_BYPASS_SECRET!)
        .send({ email: testUser.email });

      const passwordResetCode = passwordResetCodeResponse.body.passwordResetCode;
      expect(passwordResetCode).toBeDefined();

      const response = await requestApi
        .post(`/api/auth/reset-password/${passwordResetCode}`)
        .send({ newPassword: 'newpassword123' });

      expect(response.statusCode).toBe(200);
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie']?.[0]).toContain(`${AUTH_COOKIE_NAME}=`);
      expect(response.body).toHaveProperty('token');
      expect(typeof response.body.token).toBe('string');

      await deleteTestUser(testUser);
    });
  });

  describe('GET /api/auth/oauth2/google/verify', () => {
    it('returns 400 for invalid state parameter', async () => {
      const res = await requestApi
        .get('/api/auth/oauth2/google/verify?code=test-code&state=invalid-state');
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });

    // Note: A full test that verifies token and cookie would require mocking
    // the Google OAuth API calls (getAccessTokenFromCode and getUserProfileFromToken).
    // The endpoint does set a cookie and return a token when successful,
    // as seen in the route implementation at api/router/routes/auth.ts:414-483
  });

  describe('POST /api/auth/change-email', () => {
    it('returns the new email verification code in the response body when test bypass header is present', async () => {
      const testUser = await createTestUser();
      const response = await requestApi
        .post('/api/auth/change-email')
        .set('x-test-bypass-secret', TEST_BYPASS_SECRET!)
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({
          newEmail: generateTestEmail(),
          password: testUser.password,
        });
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('newEmailVerificationCode');
      expect(response.body.newEmailVerificationCode).toBeDefined();

      await deleteTestUser(testUser);
    });

    it('does not return the new email verification code in the response body when test bypass header is not present', async () => {
      const testUser = await createTestUser();
      const response = await requestApi
        .post('/api/auth/change-email')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({
          newEmail: generateTestEmail(),
          password: testUser.password,
        });
      expect(response.statusCode).toBe(200);
      expect(response.body).not.toHaveProperty('newEmailVerificationCode');

      await deleteTestUser(testUser);
    });
  });

  describe('POST /api/auth/change-email/:newEmailVerificationCode', () => {
    it('changes email and returns token with cookie', async () => {
      const testUser = await createTestUser();
      const newEmail = generateTestEmail();
      const newEmailVerificationCodeResponse = await requestApi
        .post('/api/auth/change-email')
        .set('x-test-bypass-secret', TEST_BYPASS_SECRET!)
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({
          newEmail,
          password: testUser.password,
        });
      const newEmailVerificationCode = newEmailVerificationCodeResponse.body.newEmailVerificationCode;
      expect(newEmailVerificationCode).toBeDefined();

      const response = await requestApi
        .post(`/api/auth/change-email/${newEmailVerificationCode}`)
        // .set('Authorization', `Bearer ${testUser.token}`)
        .send({
          newEmail,
          password: testUser.password,
        });
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(typeof response.body.token).toBe('string');
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie']?.[0]).toContain(`${AUTH_COOKIE_NAME}=`);

      // Verify email change (by logging in with the new email)
      const loginResponse = await requestApi
        .post('/api/auth/login')
        .send({
          email: newEmail,
          password: testUser.password,
        });
      expect(loginResponse.statusCode).toBe(200);

      await deleteTestUser(testUser);
    });

    it('returns 404 for invalid verification code', async () => {
      const res = await requestApi
        .post('/api/auth/change-email/invalid-code-12345');
      expect(res.statusCode).toBe(404);
    });
  });
});
