import { requestApi, createTestUser, deleteTestUser } from './helpers';

// Test data
const tag1 = { label: 'Theology', color: '#FF0000', description: 'Theological concepts' };
const tag2 = { label: 'Application', color: '#00FF00', description: 'Practical applications' };

// Helper function to create tags
async function createPassageNoteTags(testUser, tags) {
  const tagResponses = await Promise.all(
    tags.map(tag =>
      requestApi
        .post('/api/passage-note-tags')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send(tag),
    ),
  );
  return tagResponses.map(response => response.body);
}

// Test data with tag IDs (to be populated during test setup)
const passageNote1 = {
  passages: [{ startVerseId: 101001001, endVerseId: 101001005 }], // Genesis 1:1-5
  content: 'Test note 1',
  tags: [], // Will be populated with tag IDs during test setup
};

const passageNote2 = {
  passages: [{ startVerseId: 101001006, endVerseId: 101001010 }], // Genesis 1:6-10
  content: 'Test note 2',
  tags: [], // Will be populated with tag IDs during test setup
};

const passageNote3 = {
  passages: [{ startVerseId: 101001011, endVerseId: 101001015 }], // Genesis 1:11-15
  content: 'Test note 3',
  tags: [], // Will be populated with tag IDs during test setup
};

const invalidPassageNote1 = {
  passages: [{ startVerseId: 100000000, endVerseId: 100000001 }], // Invalid verse IDs
  content: 'x'.repeat(3001),
  tags: ['nonexistent-tag'],
};

const invalidPassageNote2 = {
  passages: [{ startVerseId: 101001005, endVerseId: 101001001 }], // Start verse after end verse
  content: 'Test note 7',
  tags: ['Theology'],
};

const invalidPassageNote3 = {
  passages: [{ startVerseId: 101001001, endVerseId: 143001005 }], // Different books
  content: 'Test note 8',
  tags: ['Application'],
};

const missingObjectId = '666666666666666666666666';

describe('passage-notes.test.js', () => {
  describe('GET /api/passage-notes', () => {
    it('protected', async () => {
      const response = await requestApi
        .get('/api/passage-notes');
      expect(response.status).toBe(401);
    });

    it('returns expected response format', async () => {
      const testUser = await createTestUser();
      try {
        const response = await requestApi
          .get('/api/passage-notes')
          .set('Authorization', `Bearer ${testUser.token}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('offset');
        expect(response.body).toHaveProperty('limit');
        expect(response.body).toHaveProperty('size');
        expect(response.body).toHaveProperty('results');
        expect(Array.isArray(response.body.results)).toBe(true);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });

    it('error if invalid query', async () => {
      const testUser = await createTestUser();
      try {
        const response = await requestApi
          .get('/api/passage-notes?limit=invalid&offset=invalid&sortOn=invalid&sortDirection=invalid')
          .set('Authorization', `Bearer ${testUser.token}`);
        expect(response.status).toBe(400);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });

    it('error if invalid filter', async () => {
      const testUser = await createTestUser();
      try {
        const response = await requestApi
          .get('/api/passage-notes?filterTags=invalid&filterTagMatching=invalid&filterPassageStartVerseId=invalid&filterPassageEndVerseId=invalid&filterPassageMatching=invalid')
          .set('Authorization', `Bearer ${testUser.token}`);
        expect(response.status).toBe(400);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });

    it('returns expected result format with valid query', async () => {
      const testUser = await createTestUser();
      try {
        // Create tags first
        const tags = await createPassageNoteTags(testUser, [tag1, tag2]);

        // Create a note with tag IDs
        const noteWithTags = {
          ...passageNote1,
          tags: [tags[0].id, tags[1].id],
        };

        await requestApi
          .post('/api/passage-notes')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send(noteWithTags);

        const response = await requestApi
          .get('/api/passage-notes')
          .set('Authorization', `Bearer ${testUser.token}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('results');
        expect(response.body).toHaveProperty('offset');
        expect(response.body).toHaveProperty('limit');
        expect(response.body).toHaveProperty('size');
        expect(Array.isArray(response.body.results)).toBe(true);
        expect(response.body.results[0]).toHaveProperty('id');
        expect(response.body.results[0]).toHaveProperty('passages');
        expect(response.body.results[0]).toHaveProperty('content');
        expect(response.body.results[0]).toHaveProperty('tags');
        expect(response.body.results[0]).toHaveProperty('createdAt');
        expect(response.body.results[0]).toHaveProperty('updatedAt');
      }
      finally {
        await deleteTestUser(testUser);
      }
    });

    it('can filter by tags', async () => {
      const testUser = await createTestUser();
      try {
        // Create tags first
        const tags = await createPassageNoteTags(testUser, [tag1, tag2]);

        // Create a note with specific tag
        const noteWithTag = {
          ...passageNote1,
          tags: [tags[0].id],
        };

        const createResponse = await requestApi
          .post('/api/passage-notes')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send(noteWithTag);

        const response = await requestApi
          .get(`/api/passage-notes?filterTags=${tags[0].id}`)
          .set('Authorization', `Bearer ${testUser.token}`);
        expect(response.status).toBe(200);
        expect(response.body.results.length).toBe(1);
        expect(response.body.results[0].id).toBe(createResponse.body.id);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });

    it('can filter by passages', async () => {
      const testUser = await createTestUser();
      try {
        // Create tags first
        await createPassageNoteTags(testUser, [tag1, tag2]);

        // Create a note with specific passages
        const createResponse = await requestApi
          .post('/api/passage-notes')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send(passageNote1);

        const response = await requestApi
          .get(`/api/passage-notes?filterPassageStartVerseId=${passageNote1.passages[0]!.startVerseId}&filterPassageEndVerseId=${passageNote1.passages[0]!.endVerseId}`)
          .set('Authorization', `Bearer ${testUser.token}`);
        expect(response.status).toBe(200);
        expect(response.body.results.length).toBe(1);
        expect(response.body.results[0].id).toBe(createResponse.body.id);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });

    it('can filter by search text', async () => {
      const testUser = await createTestUser();
      try {
        // Create tags first
        await createPassageNoteTags(testUser, [tag1, tag2]);

        // Create a note with specific content
        const createResponse = await requestApi
          .post('/api/passage-notes')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send(passageNote1);

        const response = await requestApi
          .get('/api/passage-notes?searchText=Test note 1')
          .set('Authorization', `Bearer ${testUser.token}`);
        expect(response.status).toBe(200);
        expect(response.body.results.length).toBe(1);
        expect(response.body.results[0].id).toBe(createResponse.body.id);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });

    it('can sort by date', async () => {
      const testUser = await createTestUser();
      try {
        // Create tags first
        await createPassageNoteTags(testUser, [tag1, tag2]);

        // Create two notes
        await requestApi
          .post('/api/passage-notes')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send(passageNote1);

        await requestApi
          .post('/api/passage-notes')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send(passageNote2);

        const response = await requestApi
          .get('/api/passage-notes?sortOn=createdAt&sortDirection=descending')
          .set('Authorization', `Bearer ${testUser.token}`);
        expect(response.status).toBe(200);
        expect(response.body.results.length).toBe(2);
        expect(new Date(response.body.results[0].createdAt) > new Date(response.body.results[1].createdAt)).toBe(true);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });
  });

  describe('POST /api/passage-notes', () => {
    it('protected', async () => {
      const response = await requestApi
        .post('/api/passage-notes')
        .send(passageNote1);
      expect(response.status).toBe(401);
    });

    describe('Validation', () => {
      it('error if missing required fields', async () => {
        const testUser = await createTestUser();
        try {
          const response = await requestApi
            .post('/api/passage-notes')
            .set('Authorization', `Bearer ${testUser.token}`)
            .send({});
          expect(response.status).toBe(400);
          expect(response.body.errors).toEqual({
            error: { message: 'Invalid passage note' },
            message: 'Invalid passage note',
          });
        }
        finally {
          await deleteTestUser(testUser);
        }
      });

      it('error if content exceeds max length', async () => {
        const testUser = await createTestUser();
        try {
          const response = await requestApi
            .post('/api/passage-notes')
            .set('Authorization', `Bearer ${testUser.token}`)
            .send({
              content: 'a'.repeat(3001), // Exceeds max length
              passages: [{
                startVerseId: 1,
                endVerseId: 1,
              }],
            });
          expect(response.status).toBe(400);
          expect(response.body.errors).toEqual({
            error: { message: 'Invalid passage note' },
            message: 'Invalid passage note',
          });
        }
        finally {
          await deleteTestUser(testUser);
        }
      });

      it('error if invalid passage verse IDs', async () => {
        const testUser = await createTestUser();
        try {
          const response = await requestApi
            .post('/api/passage-notes')
            .set('Authorization', `Bearer ${testUser.token}`)
            .send({
              content: 'Test content',
              passages: [{
                startVerseId: 'invalid',
                endVerseId: 'invalid',
              }],
            });
          expect(response.status).toBe(400);
          expect(response.body.errors).toEqual({
            error: { message: 'Invalid passage note' },
            message: 'Invalid passage note',
          });
        }
        finally {
          await deleteTestUser(testUser);
        }
      });
    });

    it('error if invalid passage verse range', async () => {
      const testUser = await createTestUser();
      try {
        const response = await requestApi
          .post('/api/passage-notes')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send(invalidPassageNote2);
        expect(response.status).toBe(400);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });

    test('Error if missing required fields', async () => {
      // Arrange
      const testUser = await createTestUser();
      const invalidData = {
        // Missing required fields
      };

      // Act
      const response = await requestApi
        .post('/api/passage-notes')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send(invalidData);

      // Assert
      expect(response.statusCode).toBe(400);
      expect(response.body.errors).toEqual({
        error: { message: 'Invalid passage note' },
        message: 'Invalid passage note',
      });

      // Cleanup
      await deleteTestUser(testUser);
    });

    test('Error if content exceeds max length', async () => {
      // Arrange
      const testUser = await createTestUser();
      const invalidData = {
        content: 'a'.repeat(3001), // Exceeds max length
        passages: [{
          startVerseId: 'invalid',
          endVerseId: 'invalid',
        }],
      };

      // Act
      const response = await requestApi
        .post('/api/passage-notes')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send(invalidData);

      // Assert
      expect(response.statusCode).toBe(400);
      expect(response.body.errors).toEqual({
        error: { message: 'Invalid passage note' },
        message: 'Invalid passage note',
      });

      // Cleanup
      await deleteTestUser(testUser);
    });

    it('error if passages array is empty and content is empty', async () => {
      const testUser = await createTestUser();
      try {
        const response = await requestApi
          .post('/api/passage-notes')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send({ passages: [], content: '' });
        expect(response.status).toBe(400);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });

    it('can create note with just passages', async () => {
      const testUser = await createTestUser();
      try {
        const response = await requestApi
          .post('/api/passage-notes')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send({ passages: passageNote1.passages });
        expect(response.status).toBe(200);
        expect(response.body.passages.length).toEqual(passageNote1.passages.length);
        expect(response.body.passages[0].startVerseId).toEqual(passageNote1.passages[0]!.startVerseId);
        expect(response.body.passages[0].endVerseId).toEqual(passageNote1.passages[0]!.endVerseId);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });

    it('can create note with just content', async () => {
      const testUser = await createTestUser();
      try {
        const response = await requestApi
          .post('/api/passage-notes')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send({ content: passageNote2.content });
        expect(response.status).toBe(200);
        expect(response.body.content).toBe(passageNote2.content);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });

    it('can create note with both passages and content', async () => {
      const testUser = await createTestUser();
      try {
        const response = await requestApi
          .post('/api/passage-notes')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send({
            passages: passageNote3.passages,
            content: passageNote3.content,
          });
        expect(response.status).toBe(200);
        expect(response.body.passages.length).toEqual(passageNote3.passages.length);
        expect(response.body.passages[0].startVerseId).toEqual(passageNote3.passages[0]!.startVerseId);
        expect(response.body.passages[0].endVerseId).toEqual(passageNote3.passages[0]!.endVerseId);
        expect(response.body.content).toBe(passageNote3.content);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });

    it('can create note with tags', async () => {
      const testUser = await createTestUser();
      try {
        // Create tags first
        const tags = await createPassageNoteTags(testUser, [tag1]);

        const noteWithTag = {
          ...passageNote1,
          tags: [tags[0].id],
        };

        const response = await requestApi
          .post('/api/passage-notes')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send(noteWithTag);
        expect(response.status).toBe(200);
        expect(response.body.tags).toEqual([tags[0].id]);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });
  });

  describe('PUT /api/passage-notes/:id', () => {
    it('protected', async () => {
      const testUser = await createTestUser();
      try {
        // Create tags first
        await createPassageNoteTags(testUser, [tag1]);

        // Create a note first
        const createResponse = await requestApi
          .post('/api/passage-notes')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send(passageNote1);

        const response = await requestApi
          .put(`/api/passage-notes/${createResponse.body.id}`)
          .send(passageNote2);
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
          .put('/api/passage-notes/123456789012345678901234')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send(passageNote1);
        expect(response.status).toBe(404);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });

    it('can update passages', async () => {
      const testUser = await createTestUser();
      try {
        // Create tags first
        await createPassageNoteTags(testUser, [tag1]);

        // Create a note first
        const createResponse = await requestApi
          .post('/api/passage-notes')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send(passageNote1);

        const response = await requestApi
          .put(`/api/passage-notes/${createResponse.body.id}`)
          .set('Authorization', `Bearer ${testUser.token}`)
          .send({ passages: passageNote2.passages });
        expect(response.status).toBe(200);
        expect(response.body.passages.length).toEqual(passageNote2.passages.length);
        expect(response.body.passages[0].startVerseId).toEqual(passageNote2.passages[0]!.startVerseId);
        expect(response.body.passages[0].endVerseId).toEqual(passageNote2.passages[0]!.endVerseId);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });

    it('can update content', async () => {
      const testUser = await createTestUser();
      try {
        // Create tags first
        await createPassageNoteTags(testUser, [tag1]);

        // Create a note first
        const createResponse = await requestApi
          .post('/api/passage-notes')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send(passageNote1);

        const response = await requestApi
          .put(`/api/passage-notes/${createResponse.body.id}`)
          .set('Authorization', `Bearer ${testUser.token}`)
          .send({ content: passageNote2.content });
        expect(response.status).toBe(200);
        expect(response.body.content).toBe(passageNote2.content);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });

    it('can update tags', async () => {
      const testUser = await createTestUser();
      try {
        // Create tags first
        const tags = await createPassageNoteTags(testUser, [tag1, tag2]);

        // Create a note first
        const createResponse = await requestApi
          .post('/api/passage-notes')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send(passageNote1);

        const response = await requestApi
          .put(`/api/passage-notes/${createResponse.body.id}`)
          .set('Authorization', `Bearer ${testUser.token}`)
          .send({ tags: [tags[0].id] });
        expect(response.status).toBe(200);
        expect(response.body.tags).toEqual([tags[0].id]);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });

    it('error if invalid ID format', async () => {
      const testUser = await createTestUser();
      try {
        const response = await requestApi
          .put('/api/passage-notes/invalid-id')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send(passageNote1);
        expect(response.status).toBe(400);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });
  });

  describe('DELETE /api/passage-notes/:id', () => {
    it('protected', async () => {
      const testUser = await createTestUser();
      try {
        // Create tags first
        await createPassageNoteTags(testUser, [tag1]);

        // Create a note first
        const createResponse = await requestApi
          .post('/api/passage-notes')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send(passageNote1);

        const response = await requestApi
          .delete(`/api/passage-notes/${createResponse.body.id}`);
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
          .delete(`/api/passage-notes/${missingObjectId}`)
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
        // Create tags first
        await createPassageNoteTags(testUser, [tag1]);

        // Create a note first
        const createResponse = await requestApi
          .post('/api/passage-notes')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send(passageNote1);

        const response = await requestApi
          .delete(`/api/passage-notes/${createResponse.body.id}`)
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
        // Create tags first
        await createPassageNoteTags(testUser, [tag1]);

        // Create a note first
        const createResponse = await requestApi
          .post('/api/passage-notes')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send(passageNote1);

        // First delete
        await requestApi
          .delete(`/api/passage-notes/${createResponse.body.id}`)
          .set('Authorization', `Bearer ${testUser.token}`);

        // Second delete
        const response = await requestApi
          .delete(`/api/passage-notes/${createResponse.body.id}`)
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
          .delete('/api/passage-notes/invalid-id')
          .set('Authorization', `Bearer ${testUser.token}`);
        expect(response.status).toBe(400);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });
  });

  describe('GET /api/passage-notes/count/books', () => {
    it('protected', async () => {
      const response = await requestApi
        .get('/api/passage-notes/count/books');
      expect(response.status).toBe(401);
    });

    it('returns expected response format', async () => {
      const testUser = await createTestUser();
      try {
        const response = await requestApi
          .get('/api/passage-notes/count/books')
          .set('Authorization', `Bearer ${testUser.token}`);
        expect(response.status).toBe(200);
        expect(typeof response.body).toBe('object');
        // Check that all Bible books are present in the response
        expect(response.body).toHaveProperty('1');
        expect(response.body).toHaveProperty('66');
        // Check that all values are numbers
        Object.values(response.body).forEach((value) => {
          expect(typeof value).toBe('number');
        });
      }
      finally {
        await deleteTestUser(testUser);
      }
    });

    it('returns accurate counts for notes in different books', async () => {
      const testUser = await createTestUser();
      try {
        // Create tags first
        await createPassageNoteTags(testUser, [tag1]);

        // Create a note in Genesis
        await requestApi
          .post('/api/passage-notes')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send({
            passages: [{ startVerseId: 101001001, endVerseId: 101001005 }], // Genesis 1:1-5
            content: 'Test note in Genesis',
          });

        // Create a note in Exodus
        await requestApi
          .post('/api/passage-notes')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send({
            passages: [{ startVerseId: 102001001, endVerseId: 102001005 }], // Exodus 1:1-5
            content: 'Test note in Exodus',
          });

        // Create another note in Genesis
        await requestApi
          .post('/api/passage-notes')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send({
            passages: [{ startVerseId: 101001006, endVerseId: 101001010 }], // Genesis 1:6-10
            content: 'Another test note in Genesis',
          });

        const response = await requestApi
          .get('/api/passage-notes/count/books')
          .set('Authorization', `Bearer ${testUser.token}`);
        expect(response.status).toBe(200);
        expect(response.body[1]).toBe(2); // 2 notes in Genesis
        expect(response.body[2]).toBe(1); // 1 note in Exodus
        expect(response.body[66]).toBe(0); // 0 notes in Revelation
      }
      finally {
        await deleteTestUser(testUser);
      }
    });

    it('handles notes spanning multiple books', async () => {
      const testUser = await createTestUser();
      try {
        // Create tags first
        await createPassageNoteTags(testUser, [tag1]);

        // Create a note that spans Genesis and Exodus
        await requestApi
          .post('/api/passage-notes')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send({
            passages: [
              { startVerseId: 101001001, endVerseId: 101001005 }, // Genesis 1:1 to Genesis 1:5
              { startVerseId: 102001001, endVerseId: 102001005 }, // Exodus 1:1 to Exodus 1:5
            ],
            content: 'Test note spanning Genesis and Exodus',
          });

        const response = await requestApi
          .get('/api/passage-notes/count/books')
          .set('Authorization', `Bearer ${testUser.token}`);
        expect(response.status).toBe(200);
        expect(response.body[1]).toBe(1); // Note counted in Genesis
        expect(response.body[2]).toBe(1); // Note counted in Exodus
      }
      finally {
        await deleteTestUser(testUser);
      }
    });
  });

  describe('GET /api/passage-notes/:id', () => {
    it('protected', async () => {
      const response = await requestApi
        .get('/api/passage-notes/123456789012345678901234');
      expect(response.status).toBe(401);
    });

    it('error if invalid ID format', async () => {
      const testUser = await createTestUser();
      try {
        const response = await requestApi
          .get('/api/passage-notes/invalid-id')
          .set('Authorization', `Bearer ${testUser.token}`);
        expect(response.status).toBe(400);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });
  });
});
