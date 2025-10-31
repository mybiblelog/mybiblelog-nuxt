import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { requestApi, createTestUser, deleteTestUser, TestUser } from './helpers';

describe('Reminders routes', () => {
  let testUser: TestUser;

  beforeEach(async () => {
    testUser = await createTestUser();
  });

  afterEach(async () => {
    await deleteTestUser(testUser);
  });

  test('GET /api/reminders/daily-reminder (protected)', async () => {
    // Act
    const res = await requestApi
      .get('/api/reminders/daily-reminder')
      .set('Authorization', `Bearer ${testUser.token}`);

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('hour');
    expect(res.body).toHaveProperty('minute');
    expect(res.body).toHaveProperty('timezoneOffset');
    expect(res.body).toHaveProperty('active');
  });

  test('PUT /api/reminders/daily-reminder (update single property)', async () => {
    // Act
    const res = await requestApi
      .put('/api/reminders/daily-reminder')
      .set('Authorization', `Bearer ${testUser.token}`)
      .send({
        hour: 9,
      });

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.body.hour).toBe(9);
  });

  test('PUT /api/reminders/daily-reminder (update multiple properties)', async () => {
    // Act
    const res = await requestApi
      .put('/api/reminders/daily-reminder')
      .set('Authorization', `Bearer ${testUser.token}`)
      .send({
        hour: 10,
        minute: 30,
        timezoneOffset: -420,
        active: true,
      });

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.body.hour).toBe(10);
    expect(res.body.minute).toBe(30);
    expect(res.body.timezoneOffset).toBe(-420);
    expect(res.body.active).toBe(true);
  });
});

