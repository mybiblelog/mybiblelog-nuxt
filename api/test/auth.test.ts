import { describe, it, test, expect } from '@jest/globals';
import { requestApi, createTestUser, deleteTestUser, generateTestEmail } from './helpers';

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

  test('GET /api/auth/user', async () => {
    // Arrange
    const testUser = await createTestUser();

    // Act
    const res = await requestApi
      .get('/api/auth/user')
      .set('Authorization', `Bearer ${testUser.token}`);

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('user.token');
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
});

