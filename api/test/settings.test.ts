import { describe, it, test, expect } from '@jest/globals';
import { requestApi, createTestUser, deleteTestUser } from './helpers';
import { AUTH_COOKIE_NAME } from '../router/helpers/authCurrentUser';

describe('settings.test.js', () => {
  describe('GET /api/settings', () => {
    it('protected from guests', async () => {
      const response = await requestApi
        .get('/api/settings');
      expect(response.status).toBe(401);
    });

    it('settings response has expected properties', async () => {
      const testUser = await createTestUser();
      try {
        const response = await requestApi
          .get('/api/settings')
          .set('Authorization', `Bearer ${testUser.token}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('dailyVerseCountGoal');
        expect(response.body).toHaveProperty('lookBackDate');
        expect(response.body).toHaveProperty('preferredBibleVersion');
        expect(response.body).toHaveProperty('startPage');
        expect(response.body).toHaveProperty('locale');

        // verify lookBackDate is in correct format
        expect(typeof response.body.lookBackDate).toBe('string');
        expect(response.body.lookBackDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });
  });

  describe('PUT /api/settings', () => {
    it('protected from guests', async () => {
      const response = await requestApi
        .put('/api/settings')
        .send({ settings: { dailyVerseCountGoal: 100 } });
      expect(response.status).toBe(401);
    });

    it('user can update individual settings (dailyVerseCountGoal)', async () => {
      const testUser = await createTestUser();
      try {
        // First get current settings
        const getResponse = await requestApi
          .get('/api/settings')
          .set('Authorization', `Bearer ${testUser.token}`);
        const originalGoal = getResponse.body.dailyVerseCountGoal;

        // Update just the dailyVerseCountGoal
        const newGoal = originalGoal + 10;
        const putResponse = await requestApi
          .put('/api/settings')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send({ settings: { dailyVerseCountGoal: newGoal } });
        expect(putResponse.status).toBe(200);

        // Verify the change
        const verifyResponse = await requestApi
          .get('/api/settings')
          .set('Authorization', `Bearer ${testUser.token}`);
        expect(verifyResponse.body.dailyVerseCountGoal).toBe(newGoal);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });

    it('user can update multiple settings at once', async () => {
      const testUser = await createTestUser();
      try {
        const newSettings = {
          dailyVerseCountGoal: 100,
          lookBackDate: '2024-01-01',
          preferredBibleVersion: 'NASB2020',
          locale: 'en',
        };

        const putResponse = await requestApi
          .put('/api/settings')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send({ settings: newSettings });
        expect(putResponse.status).toBe(200);

        // Verify all changes
        const verifyResponse = await requestApi
          .get('/api/settings')
          .set('Authorization', `Bearer ${testUser.token}`);
        expect(verifyResponse.body).toMatchObject(newSettings);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });

    it('ignores undefined settings', async () => {
      const testUser = await createTestUser();
      try {
        // First get current settings
        const getResponse = await requestApi
          .get('/api/settings')
          .set('Authorization', `Bearer ${testUser.token}`);
        const originalSettings = { ...getResponse.body };

        // Update with some undefined values
        const putResponse = await requestApi
          .put('/api/settings')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send({ settings: { dailyVerseCountGoal: 100, lookBackDate: undefined } });
        expect(putResponse.status).toBe(200);

        // Verify only the defined setting changed
        const verifyResponse = await requestApi
          .get('/api/settings')
          .set('Authorization', `Bearer ${testUser.token}`);
        expect(verifyResponse.body.dailyVerseCountGoal).toBe(100);
        expect(verifyResponse.body.lookBackDate).toBe(originalSettings.lookBackDate);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });
  });

  describe('PUT /api/settings/change-password', () => {
    test('Incorrect password for password change', async () => {
      // Arrange
      const testUser = await createTestUser();

      // Act
      const response = await requestApi
        .put('/api/settings/change-password')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword123',
        });

      // Assert
      expect(response.statusCode).toBe(404);
      expect(response.body.errors).toEqual({
        error: { message: 'Not Found' },
        message: 'Not Found',
      });

      // Cleanup
      await deleteTestUser(testUser);
    });
  });

  describe('PUT /api/settings/delete-account', () => {
    it('protected from guests', async () => {
      const response = await requestApi
        .put('/api/settings/delete-account');
      expect(response.status).toBe(401);
    });

    it('deletes user account and all associated data', async () => {
      const testUser = await createTestUser();
      try {
        const response = await requestApi
          .put('/api/settings/delete-account')
          .set('Authorization', `Bearer ${testUser.token}`);
        expect(response.status).toBe(200);
        // expect cookie to be cleared in header
        expect(response.headers['set-cookie']).toBeDefined();
        expect(response.headers['set-cookie']?.[0]).toContain(`${AUTH_COOKIE_NAME}=;`);

        // Verify user can no longer access protected endpoints
        const verifyResponse = await requestApi
          .get('/api/settings')
          .set('Authorization', `Bearer ${testUser.token}`);
        expect(verifyResponse.status).toBe(401);
      }
      finally {
        // No need to delete test user since it was already deleted
      }
    });
  });
});

