const { requestApi, createTestUser, deleteTestUser } = require('./helpers');

// Test data
const tag1 = {
  label: 'Theology',
  color: '#FF0000',
  description: 'Theological concepts',
};

const tag2 = {
  label: 'Application',
  color: '#00FF00',
  description: 'Practical applications',
};

const invalidTag = {
  label: 'Invalid Color',
  color: 'not-a-color', // Invalid color format
  description: 'Invalid tag',
};

const missingObjectId = '666666666666666666666666';

describe('passage-note-tags.test.js', () => {
  describe('GET /api/passage-note-tags', () => {
    it('protected', async () => {
      const response = await requestApi
        .get('/api/passage-note-tags');
      expect(response.status).toBe(401);
    });

    it('returns expected response format', async () => {
      const testUser = await createTestUser();
      try {
        const response = await requestApi
          .get('/api/passage-note-tags')
          .set('Authorization', `Bearer ${testUser.token}`);
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });

    it('returns expected result format with tags', async () => {
      const testUser = await createTestUser();
      try {
        // Create a tag first
        await requestApi
          .post('/api/passage-note-tags')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send(tag1);

        const response = await requestApi
          .get('/api/passage-note-tags')
          .set('Authorization', `Bearer ${testUser.token}`);
        expect(response.status).toBe(200);
        expect(response.body[0]).toHaveProperty('id');
        expect(response.body[0]).toHaveProperty('label');
        expect(response.body[0]).toHaveProperty('color');
        expect(response.body[0]).toHaveProperty('description');
        expect(response.body[0]).toHaveProperty('noteCount');
      }
      finally {
        await deleteTestUser(testUser);
      }
    });
  });

  describe('GET /api/passage-note-tags/:id', () => {
    it('protected', async () => {
      const response = await requestApi
        .get('/api/passage-note-tags/123456789012345678901234');
      expect(response.status).toBe(401);
    });

    it('error if invalid ID format', async () => {
      const testUser = await createTestUser();
      try {
        const response = await requestApi
          .get('/api/passage-note-tags/invalid-id')
          .set('Authorization', `Bearer ${testUser.token}`);
        expect(response.status).toBe(400);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });

    it('returns expected response if not exists', async () => {
      const testUser = await createTestUser();
      try {
        const response = await requestApi
          .get(`/api/passage-note-tags/${missingObjectId}`)
          .set('Authorization', `Bearer ${testUser.token}`);
        expect(response.status).toBe(404);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });

    it('returns expected response if exists', async () => {
      const testUser = await createTestUser();
      try {
        // Create a tag first
        const createResponse = await requestApi
          .post('/api/passage-note-tags')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send(tag1);

        const response = await requestApi
          .get(`/api/passage-note-tags/${createResponse.body.id}`)
          .set('Authorization', `Bearer ${testUser.token}`);
        expect(response.status).toBe(200);
        expect(response.body.id).toBe(createResponse.body.id);
        expect(response.body.label).toBe(tag1.label);
        expect(response.body.color).toBe(tag1.color);
        expect(response.body.description).toBe(tag1.description);
        expect(response.body.noteCount).toBe(0);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });
  });

  describe('POST /api/passage-note-tags', () => {
    it('protected', async () => {
      const response = await requestApi
        .post('/api/passage-note-tags')
        .send(tag1);
      expect(response.status).toBe(401);
    });

    it('error if missing required fields', async () => {
      const testUser = await createTestUser();
      try {
        const response = await requestApi
          .post('/api/passage-note-tags')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send({});
        expect(response.status).toBe(400);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });

    it('error if invalid color format', async () => {
      const testUser = await createTestUser();
      try {
        const response = await requestApi
          .post('/api/passage-note-tags')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send(invalidTag);
        expect(response.status).toBe(400);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });

    it('can create tag with required fields', async () => {
      const testUser = await createTestUser();
      try {
        const response = await requestApi
          .post('/api/passage-note-tags')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send(tag1);
        expect(response.status).toBe(200);
        expect(response.body.label).toBe(tag1.label);
        expect(response.body.color).toBe(tag1.color);
        expect(response.body.description).toBe(tag1.description);
        expect(response.body.noteCount).toBe(0);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });

    it('can create tag with optional description', async () => {
      const testUser = await createTestUser();
      try {
        const response = await requestApi
          .post('/api/passage-note-tags')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send(tag2);
        expect(response.status).toBe(200);
        expect(response.body.label).toBe(tag2.label);
        expect(response.body.color).toBe(tag2.color);
        expect(response.body.description).toBe(tag2.description);
        expect(response.body.noteCount).toBe(0);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });

    it('allows same label for different users', async () => {
      const testUser1 = await createTestUser();
      const testUser2 = await createTestUser();
      try {
        // Create tag for first user
        const response1 = await requestApi
          .post('/api/passage-note-tags')
          .set('Authorization', `Bearer ${testUser1.token}`)
          .send(tag1);
        expect(response1.status).toBe(200);
        expect(response1.body.label).toBe(tag1.label);

        // Create tag with same label for second user
        const response2 = await requestApi
          .post('/api/passage-note-tags')
          .set('Authorization', `Bearer ${testUser2.token}`)
          .send(tag1);
        expect(response2.status).toBe(200);
        expect(response2.body.label).toBe(tag1.label);

        // Verify both tags exist and have the same label
        const tags1 = await requestApi
          .get('/api/passage-note-tags')
          .set('Authorization', `Bearer ${testUser1.token}`);
        expect(tags1.body.length).toBe(1);
        expect(tags1.body[0].label).toBe(tag1.label);

        const tags2 = await requestApi
          .get('/api/passage-note-tags')
          .set('Authorization', `Bearer ${testUser2.token}`);
        expect(tags2.body.length).toBe(1);
        expect(tags2.body[0].label).toBe(tag1.label);
      }
      finally {
        await deleteTestUser(testUser1);
        await deleteTestUser(testUser2);
      }
    });

    it('prevents duplicate labels for same user', async () => {
      const testUser = await createTestUser();
      try {
        // Create first tag
        const response1 = await requestApi
          .post('/api/passage-note-tags')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send(tag1);
        expect(response1.status).toBe(200);
        expect(response1.body.label).toBe(tag1.label);

        // Try to create second tag with same label
        const response2 = await requestApi
          .post('/api/passage-note-tags')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send(tag1);
        expect(response2.status).toBe(422);
        expect(response2.body.errors.label).toBeDefined();

        // Verify only one tag exists
        const tags = await requestApi
          .get('/api/passage-note-tags')
          .set('Authorization', `Bearer ${testUser.token}`);
        expect(tags.body.length).toBe(1);
        expect(tags.body[0].label).toBe(tag1.label);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });
  });

  describe('PUT /api/passage-note-tags/:id', () => {
    it('protected', async () => {
      const testUser = await createTestUser();
      try {
        // Create a tag first
        const createResponse = await requestApi
          .post('/api/passage-note-tags')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send(tag1);

        const response = await requestApi
          .put(`/api/passage-note-tags/${createResponse.body.id}`)
          .send(tag2);
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
          .put(`/api/passage-note-tags/${missingObjectId}`)
          .set('Authorization', `Bearer ${testUser.token}`)
          .send(tag1);
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
          .put('/api/passage-note-tags/invalid-id')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send(tag1);
        expect(response.status).toBe(400);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });

    it('can update label', async () => {
      const testUser = await createTestUser();
      try {
        // Create a tag first
        const createResponse = await requestApi
          .post('/api/passage-note-tags')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send(tag1);

        const response = await requestApi
          .put(`/api/passage-note-tags/${createResponse.body.id}`)
          .set('Authorization', `Bearer ${testUser.token}`)
          .send({ label: 'Updated Label' });
        expect(response.status).toBe(200);
        expect(response.body.label).toBe('Updated Label');
        expect(response.body.color).toBe(tag1.color);
        expect(response.body.description).toBe(tag1.description);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });

    it('can update color', async () => {
      const testUser = await createTestUser();
      try {
        // Create a tag first
        const createResponse = await requestApi
          .post('/api/passage-note-tags')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send(tag1);

        const response = await requestApi
          .put(`/api/passage-note-tags/${createResponse.body.id}`)
          .set('Authorization', `Bearer ${testUser.token}`)
          .send({ color: '#00FF00' });
        expect(response.status).toBe(200);
        expect(response.body.label).toBe(tag1.label);
        expect(response.body.color).toBe('#00FF00');
        expect(response.body.description).toBe(tag1.description);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });

    it('can update description', async () => {
      const testUser = await createTestUser();
      try {
        // Create a tag first
        const createResponse = await requestApi
          .post('/api/passage-note-tags')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send(tag1);

        const response = await requestApi
          .put(`/api/passage-note-tags/${createResponse.body.id}`)
          .set('Authorization', `Bearer ${testUser.token}`)
          .send({ description: 'Updated description' });
        expect(response.status).toBe(200);
        expect(response.body.label).toBe(tag1.label);
        expect(response.body.color).toBe(tag1.color);
        expect(response.body.description).toBe('Updated description');
      }
      finally {
        await deleteTestUser(testUser);
      }
    });
  });

  describe('DELETE /api/passage-note-tags/:id', () => {
    it('protected', async () => {
      const testUser = await createTestUser();
      try {
        // Create a tag first
        const createResponse = await requestApi
          .post('/api/passage-note-tags')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send(tag1);

        const response = await requestApi
          .delete(`/api/passage-note-tags/${createResponse.body.id}`);
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
          .delete(`/api/passage-note-tags/${missingObjectId}`)
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
        // Create a tag first
        const createResponse = await requestApi
          .post('/api/passage-note-tags')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send(tag1);

        const response = await requestApi
          .delete(`/api/passage-note-tags/${createResponse.body.id}`)
          .set('Authorization', `Bearer ${testUser.token}`);
        expect(response.status).toBe(200);
        expect(response.body).toBe(1);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });

    it('response changes after initial successful call', async () => {
      const testUser = await createTestUser();
      try {
        // Create a tag first
        const createResponse = await requestApi
          .post('/api/passage-note-tags')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send(tag1);

        // First delete
        await requestApi
          .delete(`/api/passage-note-tags/${createResponse.body.id}`)
          .set('Authorization', `Bearer ${testUser.token}`);

        // Second delete
        const response = await requestApi
          .delete(`/api/passage-note-tags/${createResponse.body.id}`)
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
          .delete('/api/passage-note-tags/invalid-id')
          .set('Authorization', `Bearer ${testUser.token}`);
        expect(response.status).toBe(400);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });
  });
});
