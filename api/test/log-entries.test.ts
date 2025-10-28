import { requestApi, createTestUser, deleteTestUser } from './helpers';

// Test data
const logEntry1 = { date: '2024-01-01', startVerseId: 101001001, endVerseId: 101001005 }; // Genesis 1:1-5
const logEntry2 = { date: '2024-01-02', startVerseId: 101001006, endVerseId: 101001010 }; // Genesis 1:6-10
const invalidLogEntry1 = { date: 'invalid-date', startVerseId: 100000000, endVerseId: 100000001 }; // Invalid verse IDs
const invalidLogEntry2 = { date: '2024-01-06', startVerseId: 101001005, endVerseId: 101001001 }; // Start verse after end verse
const invalidLogEntry3 = { date: '2024-01-07', startVerseId: 101001001, endVerseId: 143001005 }; // Different books

const missingObjectId = '666666666666666666666666';

describe('log-entries.test.js', () => {
  describe('GET /api/log-entries', () => {
    it('protected', async () => {
      const response = await requestApi
        .get('/api/log-entries');
      expect(response.status).toBe(401);
    });

    it('returns an array', async () => {
      const testUser = await createTestUser();
      try {
        const response = await requestApi
          .get('/api/log-entries')
          .set('Authorization', `Bearer ${testUser.token}`);
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });

    it('error if invalid startDate', async () => {
      const testUser = await createTestUser();
      try {
        const response = await requestApi
          .get('/api/log-entries?startDate=invalid')
          .set('Authorization', `Bearer ${testUser.token}`);
        expect(response.status).toBe(400);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });

    it('error if invalid endDate', async () => {
      const testUser = await createTestUser();
      try {
        const response = await requestApi
          .get('/api/log-entries?startDate=2024-01-01&endDate=invalid')
          .set('Authorization', `Bearer ${testUser.token}`);
        expect(response.status).toBe(400);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });

    it('can filter by start date', async () => {
      const testUser = await createTestUser();
      try {
        // Create test entries
        const entry1 = await requestApi
          .post('/api/log-entries')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send(logEntry1);

        const entry2 = await requestApi
          .post('/api/log-entries')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send(logEntry2);

        const response = await requestApi
          .get(`/api/log-entries?startDate=${logEntry2.date}`)
          .set('Authorization', `Bearer ${testUser.token}`);

        expect(response.status).toBe(200);
        expect(response.body.length).toBe(1);
        expect(response.body[0].id).toBe(entry2.body.id);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });

    it('can filter by end date', async () => {
      const testUser = await createTestUser();
      try {
        // Create test entries
        const entry1 = await requestApi
          .post('/api/log-entries')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send(logEntry1);

        const entry2 = await requestApi
          .post('/api/log-entries')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send(logEntry2);

        const response = await requestApi
          .get(`/api/log-entries?endDate=${logEntry1.date}`)
          .set('Authorization', `Bearer ${testUser.token}`);

        expect(response.status).toBe(200);
        expect(response.body.length).toBe(1);
        expect(response.body[0].id).toBe(entry1.body.id);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });

    it('can filter by both dates', async () => {
      const testUser = await createTestUser();
      try {
        // Create test entries
        const entry1 = await requestApi
          .post('/api/log-entries')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send(logEntry1);

        const entry2 = await requestApi
          .post('/api/log-entries')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send(logEntry2);

        const response = await requestApi
          .get(`/api/log-entries?startDate=${logEntry1.date}&endDate=${logEntry2.date}`)
          .set('Authorization', `Bearer ${testUser.token}`);

        expect(response.status).toBe(200);
        expect(response.body.length).toBe(2);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });
  });

  it('returns all entries if no dates are provided', async () => {
    const testUser = await createTestUser();
    try {
      // Create test entries
      const entry1 = await requestApi
        .post('/api/log-entries')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send(logEntry1);

      const entry2 = await requestApi
        .post('/api/log-entries')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send(logEntry2);

      const response = await requestApi
        .get('/api/log-entries')
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
    }
    finally {
      await deleteTestUser(testUser);
    }
  });

  describe('POST /api/log-entries', () => {
    it('protected', async () => {
      const response = await requestApi
        .post('/api/log-entries')
        .send(logEntry1);
      expect(response.status).toBe(401);
    });

    it('error if missing required fields', async () => {
      const testUser = await createTestUser();
      try {
        const response = await requestApi
          .post('/api/log-entries')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send({});
        expect(response.status).toBe(400);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });

    it('error if invalid date format', async () => {
      const testUser = await createTestUser();
      try {
        const response = await requestApi
          .post('/api/log-entries')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send(invalidLogEntry1);
        expect(response.status).toBe(400);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });

    it('error if invalid verse IDs', async () => {
      const testUser = await createTestUser();
      try {
        const response = await requestApi
          .post('/api/log-entries')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send(invalidLogEntry1);
        expect(response.status).toBe(400);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });

    it('error if invalid verse range', async () => {
      const testUser = await createTestUser();
      try {
        const response = await requestApi
          .post('/api/log-entries')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send(invalidLogEntry2);
        expect(response.status).toBe(400);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });

    it('error if different books', async () => {
      const testUser = await createTestUser();
      try {
        const response = await requestApi
          .post('/api/log-entries')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send(invalidLogEntry3);
        expect(response.status).toBe(400);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });

    it('can create valid entry', async () => {
      const testUser = await createTestUser();
      try {
        const response = await requestApi
          .post('/api/log-entries')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send(logEntry1);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
          date: logEntry1.date,
          startVerseId: logEntry1.startVerseId,
          endVerseId: logEntry1.endVerseId,
        });
      }
      finally {
        await deleteTestUser(testUser);
      }
    });
  });

  describe('PUT /api/log-entries/:id', () => {
    it('protected', async () => {
      const testUser = await createTestUser();
      try {
        // Create an entry first
        const createResponse = await requestApi
          .post('/api/log-entries')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send(logEntry1);

        const response = await requestApi
          .put(`/api/log-entries/${createResponse.body.id}`)
          .send(logEntry2);
        expect(response.status).toBe(401);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });

    it('error if updating non-existent entry', async () => {
      const testUser = await createTestUser();
      try {
        const response = await requestApi
          .put(`/api/log-entries/${missingObjectId}`)
          .set('Authorization', `Bearer ${testUser.token}`)
          .send(logEntry2);
        expect(response.status).toBe(404);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });

    it('error if invalid verse range', async () => {
      const testUser = await createTestUser();
      try {
        // Create an entry first
        const createResponse = await requestApi
          .post('/api/log-entries')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send(logEntry1);

        const response = await requestApi
          .put(`/api/log-entries/${createResponse.body.id}`)
          .set('Authorization', `Bearer ${testUser.token}`)
          .send(invalidLogEntry2);
        expect(response.status).toBe(400);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });

    it('can update date', async () => {
      const testUser = await createTestUser();
      try {
        // Create an entry first
        const createResponse = await requestApi
          .post('/api/log-entries')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send(logEntry1);

        const response = await requestApi
          .put(`/api/log-entries/${createResponse.body.id}`)
          .set('Authorization', `Bearer ${testUser.token}`)
          .send({ date: logEntry2.date });

        expect(response.status).toBe(200);
        expect(response.body.date).toBe(logEntry2.date);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });

    it('can update verse range', async () => {
      const testUser = await createTestUser();
      try {
        // Create an entry first
        const createResponse = await requestApi
          .post('/api/log-entries')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send(logEntry1);

        const response = await requestApi
          .put(`/api/log-entries/${createResponse.body.id}`)
          .set('Authorization', `Bearer ${testUser.token}`)
          .send({
            startVerseId: logEntry2.startVerseId,
            endVerseId: logEntry2.endVerseId,
          });

        expect(response.status).toBe(200);
        expect(response.body.startVerseId).toBe(logEntry2.startVerseId);
        expect(response.body.endVerseId).toBe(logEntry2.endVerseId);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });

    it('error if invalid ID format', async () => {
      const testUser = await createTestUser();
      try {
        const response = await requestApi
          .put('/api/log-entries/invalid-id')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send(logEntry2);
        expect(response.status).toBe(400);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });
  });

  describe('DELETE /api/log-entries/:id', () => {
    it('protected', async () => {
      const testUser = await createTestUser();
      try {
        // Create an entry first
        const createResponse = await requestApi
          .post('/api/log-entries')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send(logEntry1);

        const response = await requestApi
          .delete(`/api/log-entries/${createResponse.body.id}`);
        expect(response.status).toBe(401);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });

    it('returns expected response if not exists', async () => {
      const testUser = await createTestUser();
      try {
        const response = await requestApi
          .delete(`/api/log-entries/${missingObjectId}`)
          .set('Authorization', `Bearer ${testUser.token}`);
        expect(response.status).toBe(404);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });

    it('returns expected response if exists and was deleted', async () => {
      const testUser = await createTestUser();
      try {
        // Create an entry first
        const createResponse = await requestApi
          .post('/api/log-entries')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send(logEntry1);

        const response = await requestApi
          .delete(`/api/log-entries/${createResponse.body.id}`)
          .set('Authorization', `Bearer ${testUser.token}`);
        expect(response.status).toBe(200);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });

    it('response changes after initial successful call', async () => {
      const testUser = await createTestUser();
      try {
        // Create an entry first
        const createResponse = await requestApi
          .post('/api/log-entries')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send(logEntry1);

        // First delete
        await requestApi
          .delete(`/api/log-entries/${createResponse.body.id}`)
          .set('Authorization', `Bearer ${testUser.token}`);

        // Second delete
        const response = await requestApi
          .delete(`/api/log-entries/${createResponse.body.id}`)
          .set('Authorization', `Bearer ${testUser.token}`);
        expect(response.status).toBe(404);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });

    it('error if invalid ID format', async () => {
      const testUser = await createTestUser();
      try {
        const response = await requestApi
          .delete('/api/log-entries/invalid-id')
          .set('Authorization', `Bearer ${testUser.token}`);
        expect(response.status).toBe(400);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });
  });
});
