import { describe, test, expect } from '@jest/globals';
import { requestApi, createTestUser, deleteTestUser } from './helpers';

describe('Feedback routes', () => {
  test('POST /api/feedback (guest)', async () => {
    // Act
    const res = await requestApi
      .post('/api/feedback')
      .send({
        email: 'guest@example.com',
        kind: 'bug',
        message: 'Test feedback from guest',
      });

    // Assert
    expect(res.statusCode).toBe(201);
  });

  test('POST /api/feedback (authenticated user)', async () => {
    // Arrange
    const testUser = await createTestUser();

    // Act
    const res = await requestApi
      .post('/api/feedback')
      .set('Authorization', `Bearer ${testUser.token}`)
      .send({
        email: testUser.email,
        kind: 'feature',
        message: 'Test feedback from authenticated user',
      });

    // Assert
    expect(res.statusCode).toBe(201);

    // Cleanup
    await deleteTestUser(testUser);
  });
});

