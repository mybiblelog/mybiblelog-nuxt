import dayjs from 'dayjs';
import { requestApi, createTestUser, createTestAdmin, deleteTestUser } from './helpers';

describe('admin.test.js', () => {
  describe('GET /api/admin/feedback is protected', () => {
    it('unauthenticated users get 401', async () => {
      const response = await requestApi
        .get('/api/admin/feedback');
      expect(response.status).toBe(401);
    });

    it('authenticated non-admin users get 403', async () => {
      const testUser = await createTestUser();
      try {
        const response = await requestApi
          .get('/api/admin/feedback')
          .set('Authorization', `Bearer ${testUser.token}`);
        expect(response.status).toBe(403);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });
  });

  describe('GET /api/admin/reports/user-engagement/past-week is protected', () => {
    it('unauthenticated users get 401', async () => {
      const response = await requestApi
        .get('/api/admin/reports/user-engagement/past-week');
      expect(response.status).toBe(401);
    });

    it('authenticated non-admin users get 403', async () => {
      const testUser = await createTestUser();
      try {
        const response = await requestApi
          .get('/api/admin/reports/user-engagement/past-week')
          .set('Authorization', `Bearer ${testUser.token}`);
        expect(response.status).toBe(403);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });
  });

  describe('GET /api/admin/users is protected', () => {
    it('unauthenticated users get 401', async () => {
      const response = await requestApi
        .get('/api/admin/users');
      expect(response.status).toBe(401);
    });

    it('authenticated non-admin users get 403', async () => {
      const testUser = await createTestUser();
      try {
        const response = await requestApi
          .get('/api/admin/users')
          .set('Authorization', `Bearer ${testUser.token}`);
        expect(response.status).toBe(403);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });
  });

  describe('GET /api/admin/users/:email is protected', () => {
    it('unauthenticated users get 401', async () => {
      const response = await requestApi
        .get('/api/admin/users/test@example.com');
      expect(response.status).toBe(401);
    });

    it('authenticated non-admin users get 403', async () => {
      const testUser = await createTestUser();
      try {
        const response = await requestApi
          .get(`/api/admin/users/${testUser.email}`)
          .set('Authorization', `Bearer ${testUser.token}`);
        expect(response.status).toBe(403);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });
  });

  describe('DELETE /api/admin/users/:email is protected', () => {
    it('unauthenticated users get 401', async () => {
      const response = await requestApi
        .delete('/api/admin/users/test@example.com');
      expect(response.status).toBe(401);
    });

    it('authenticated non-admin users get 403', async () => {
      const testUser = await createTestUser();
      try {
        const response = await requestApi
          .delete('/api/admin/users/test@example.com')
          .set('Authorization', `Bearer ${testUser.token}`);
        expect(response.status).toBe(403);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });

    it('admin cannot delete their own account', async () => {
      const admin = await createTestAdmin();
      try {
        const response = await requestApi
          .delete(`/api/admin/users/${admin.email}`)
          .set('Authorization', `Bearer ${admin.token}`);
        expect(response.status).toBe(400);
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors.message).toBe('You cannot delete your own admin account');
      }
      finally {
        await deleteTestUser(admin);
      }
    });

    it('admin can delete a user', async () => {
      const testUser = await createTestUser();
      const admin = await createTestAdmin();
      try {
        // First verify the user exists
        const getUserResponse = await requestApi
          .get(`/api/admin/users/${testUser.email}`)
          .set('Authorization', `Bearer ${admin.token}`);
        expect(getUserResponse.status).toBe(200);

        // Delete the user
        const deleteResponse = await requestApi
          .delete(`/api/admin/users/${testUser.email}`)
          .set('Authorization', `Bearer ${admin.token}`);
        expect(deleteResponse.status).toBe(200);

        // Verify the user no longer exists
        const getDeletedUserResponse = await requestApi
          .get(`/api/admin/users/${testUser.email}`)
          .set('Authorization', `Bearer ${admin.token}`);
        expect(getDeletedUserResponse.status).toBe(404);
      }
      finally {
        await deleteTestUser(admin);
      }
    });
  });

  describe('GET /api/admin/reports/user-engagement/past-week', () => {
    it('admin can view user engagement data', async () => {
      const admin = await createTestAdmin();
      try {
        const response = await requestApi
          .get('/api/admin/reports/user-engagement/past-week')
          .set('Authorization', `Bearer ${admin.token}`);
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(7); // Last 7 days
        expect(response.body[0]).toHaveProperty('date');
        expect(response.body[0]).toHaveProperty('newUserAccounts');
        expect(response.body[0]).toHaveProperty('usersWithLogEntry');
        expect(response.body[0]).toHaveProperty('usersWithNote');
      }
      finally {
        await deleteTestUser(admin);
      }
    });

    it('adding a log entry for today increments today\'s count only', async () => {
      const admin = await createTestAdmin();
      const testUser = await createTestUser();
      try {
        // Get initial counts
        const initialResponse = await requestApi
          .get('/api/admin/reports/user-engagement/past-week')
          .set('Authorization', `Bearer ${admin.token}`);
        const today = dayjs().format('YYYY-MM-DD');
        const initialCount = initialResponse.body.find(d => d.date === today).usersWithLogEntry;

        // Add a log entry
        await requestApi
          .post('/api/log-entries')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send({
            date: today,
            startVerseId: 101001001,
            endVerseId: 101001005,
          });

        // Get updated counts
        const updatedResponse = await requestApi
          .get('/api/admin/reports/user-engagement/past-week')
          .set('Authorization', `Bearer ${admin.token}`);
        const updatedCount = updatedResponse.body.find(d => d.date === today).usersWithLogEntry;

        expect(updatedCount).toBe(initialCount + 1);
      }
      finally {
        await deleteTestUser(testUser);
        await deleteTestUser(admin);
      }
    });

    it('adding a log entry for a previous date increments yesterday\'s count only', async () => {
      const admin = await createTestAdmin();
      const testUser = await createTestUser();
      try {
        // Get initial counts
        const initialResponse = await requestApi
          .get('/api/admin/reports/user-engagement/past-week')
          .set('Authorization', `Bearer ${admin.token}`);
        const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
        const initialCount = initialResponse.body.find(d => d.date === yesterday).usersWithLogEntry;

        // Add a log entry
        await requestApi
          .post('/api/log-entries')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send({
            date: yesterday,
            startVerseId: 101001001,
            endVerseId: 101001005,
          });

        // Get updated counts
        const updatedResponse = await requestApi
          .get('/api/admin/reports/user-engagement/past-week')
          .set('Authorization', `Bearer ${admin.token}`);
        const updatedCount = updatedResponse.body.find(d => d.date === yesterday).usersWithLogEntry;

        expect(updatedCount).toBe(initialCount + 1);
      }
      finally {
        await deleteTestUser(testUser);
        await deleteTestUser(admin);
      }
    });

    it('adding two log entries for the same date counts as one', async () => {
      const admin = await createTestAdmin();
      const testUser = await createTestUser();
      try {
        // Get initial counts
        const initialResponse = await requestApi
          .get('/api/admin/reports/user-engagement/past-week')
          .set('Authorization', `Bearer ${admin.token}`);
        const today = dayjs().format('YYYY-MM-DD');
        const initialCount = initialResponse.body.find(d => d.date === today).usersWithLogEntry;

        // Add two log entries
        await requestApi
          .post('/api/log-entries')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send({
            date: today,
            startVerseId: 101001001,
            endVerseId: 101001005,
          });

        await requestApi
          .post('/api/log-entries')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send({
            date: today,
            startVerseId: 101001006,
            endVerseId: 101001010,
          });

        // Get updated counts
        const updatedResponse = await requestApi
          .get('/api/admin/reports/user-engagement/past-week')
          .set('Authorization', `Bearer ${admin.token}`);
        const updatedCount = updatedResponse.body.find(d => d.date === today).usersWithLogEntry;

        expect(updatedCount).toBe(initialCount + 1);
      }
      finally {
        await deleteTestUser(testUser);
        await deleteTestUser(admin);
      }
    });

    it('adding a log entry for a date outside the past 7 days does not increment any counts', async () => {
      const admin = await createTestAdmin();
      const testUser = await createTestUser();
      try {
        // Get initial counts
        const initialResponse = await requestApi
          .get('/api/admin/reports/user-engagement/past-week')
          .set('Authorization', `Bearer ${admin.token}`);
        const oldDate = dayjs().subtract(8, 'day').format('YYYY-MM-DD');

        // Add a log entry
        await requestApi
          .post('/api/log-entries')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send({
            date: oldDate,
            startVerseId: 101001001,
            endVerseId: 101001005,
          });

        // Get updated counts
        const updatedResponse = await requestApi
          .get('/api/admin/reports/user-engagement/past-week')
          .set('Authorization', `Bearer ${admin.token}`);

        expect(updatedResponse.body).toEqual(initialResponse.body);
      }
      finally {
        await deleteTestUser(testUser);
        await deleteTestUser(admin);
      }
    });

    it('adding a note for today increments today\'s count', async () => {
      const admin = await createTestAdmin();
      const testUser = await createTestUser();
      try {
        // Get initial counts
        const initialResponse = await requestApi
          .get('/api/admin/reports/user-engagement/past-week')
          .set('Authorization', `Bearer ${admin.token}`);
        const today = dayjs().format('YYYY-MM-DD');
        const initialCount = initialResponse.body.find(d => d.date === today).usersWithNote;

        // Add a note
        await requestApi
          .post('/api/passage-notes')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send({
            content: 'Test note',
            passages: [{ startVerseId: 101001001, endVerseId: 101001005 }],
          });

        // Get updated counts
        const updatedResponse = await requestApi
          .get('/api/admin/reports/user-engagement/past-week')
          .set('Authorization', `Bearer ${admin.token}`);
        const updatedCount = updatedResponse.body.find(d => d.date === today).usersWithNote;

        expect(updatedCount).toBe(initialCount + 1);
      }
      finally {
        await deleteTestUser(testUser);
        await deleteTestUser(admin);
      }
    });

    it('adding two notes for the same date counts as one', async () => {
      const admin = await createTestAdmin();
      const testUser = await createTestUser();
      try {
        // Get initial counts
        const initialResponse = await requestApi
          .get('/api/admin/reports/user-engagement/past-week')
          .set('Authorization', `Bearer ${admin.token}`);
        const today = dayjs().format('YYYY-MM-DD');
        const initialCount = initialResponse.body.find(d => d.date === today).usersWithNote;

        // Add two notes
        await requestApi
          .post('/api/passage-notes')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send({
            content: 'Test note 1',
            passages: [{ startVerseId: 101001001, endVerseId: 101001005 }],
          });

        await requestApi
          .post('/api/passage-notes')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send({
            content: 'Test note 2',
            passages: [{ startVerseId: 101001006, endVerseId: 101001010 }],
          });

        // Get updated counts
        const updatedResponse = await requestApi
          .get('/api/admin/reports/user-engagement/past-week')
          .set('Authorization', `Bearer ${admin.token}`);
        const updatedCount = updatedResponse.body.find(d => d.date === today).usersWithNote;

        expect(updatedCount).toBe(initialCount + 1);
      }
      finally {
        await deleteTestUser(testUser);
        await deleteTestUser(admin);
      }
    });

    it('creating a new user account today increments today\'s count', async () => {
      const admin = await createTestAdmin();
      let testUser;
      try {
        // Get initial counts
        const initialResponse = await requestApi
          .get('/api/admin/reports/user-engagement/past-week')
          .set('Authorization', `Bearer ${admin.token}`);
        const today = dayjs().format('YYYY-MM-DD');
        const initialCount = initialResponse.body.find(d => d.date === today).newUserAccounts;

        // Create a new user
        testUser = await createTestUser();

        // Get updated counts
        const updatedResponse = await requestApi
          .get('/api/admin/reports/user-engagement/past-week')
          .set('Authorization', `Bearer ${admin.token}`);
        const updatedCount = updatedResponse.body.find(d => d.date === today).newUserAccounts;

        expect(updatedCount).toBe(initialCount + 1);
      }
      finally {
        await deleteTestUser(testUser);
        await deleteTestUser(admin);
      }
    });

    it('deleting a user account decrements the count', async () => {
      const admin = await createTestAdmin();
      const testUser = await createTestUser();
      try {
        // Get initial counts
        const initialResponse = await requestApi
          .get('/api/admin/reports/user-engagement/past-week')
          .set('Authorization', `Bearer ${admin.token}`);
        const today = dayjs().format('YYYY-MM-DD');
        const initialCount = initialResponse.body.find(d => d.date === today).newUserAccounts;

        // Delete the user
        await requestApi
          .delete(`/api/admin/users/${testUser.email}`)
          .set('Authorization', `Bearer ${admin.token}`);

        // Get updated counts
        const updatedResponse = await requestApi
          .get('/api/admin/reports/user-engagement/past-week')
          .set('Authorization', `Bearer ${admin.token}`);
        const updatedCount = updatedResponse.body.find(d => d.date === today).newUserAccounts;

        expect(updatedCount).toBe(initialCount - 1);
      }
      finally {
        await deleteTestUser(admin);
      }
    });
  });

  describe('GET /api/admin/users', () => {
    it('admin can list users', async () => {
      const admin = await createTestAdmin();
      const testUser = await createTestUser();
      try {
        const response = await requestApi
          .get('/api/admin/users')
          .set('Authorization', `Bearer ${admin.token}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('results');
        expect(response.body).toHaveProperty('offset');
        expect(response.body).toHaveProperty('limit');
        expect(response.body).toHaveProperty('size');
        expect(Array.isArray(response.body.results)).toBe(true);
        expect(response.body.results.length).toBeGreaterThan(0);
        expect(response.body.results[0]).toHaveProperty('email');
        expect(response.body.results[0]).toHaveProperty('createdAt');
      }
      finally {
        await deleteTestUser(testUser);
        await deleteTestUser(admin);
      }
    });

    it('admin can search users by email', async () => {
      const admin = await createTestAdmin();
      const testUser = await createTestUser();
      try {
        const response = await requestApi
          .get(`/api/admin/users?searchText=${testUser.email}`)
          .set('Authorization', `Bearer ${admin.token}`);
        expect(response.status).toBe(200);
        expect(response.body.results.length).toBe(1);
        expect(response.body.results[0].email).toBe(testUser.email);
      }
      finally {
        await deleteTestUser(testUser);
        await deleteTestUser(admin);
      }
    });

    it('admin can sort users by email', async () => {
      const admin = await createTestAdmin();
      const testUser1 = await createTestUser();
      const testUser2 = await createTestUser();
      try {
        const response = await requestApi
          .get('/api/admin/users?sortOn=email&sortDirection=ascending')
          .set('Authorization', `Bearer ${admin.token}`);
        expect(response.status).toBe(200);
        expect(response.body.results.length).toBeGreaterThan(1);
        const emails = response.body.results.map(user => user.email);
        const sortedEmails = [...emails].sort();
        expect(emails).toEqual(sortedEmails);
      }
      finally {
        await deleteTestUser(testUser1);
        await deleteTestUser(testUser2);
        await deleteTestUser(admin);
      }
    });

    it('admin can sort users by email descending', async () => {
      const admin = await createTestAdmin();
      const testUser1 = await createTestUser();
      const testUser2 = await createTestUser();
      try {
        const response = await requestApi
          .get('/api/admin/users?sortOn=email&sortDirection=descending')
          .set('Authorization', `Bearer ${admin.token}`);
        expect(response.status).toBe(200);
        expect(response.body.results.length).toBeGreaterThan(1);
        const emails = response.body.results.map(user => user.email);
        const sortedEmails = [...emails].sort().reverse();
        expect(emails).toEqual(sortedEmails);
      }
      finally {
        await deleteTestUser(testUser1);
        await deleteTestUser(testUser2);
        await deleteTestUser(admin);
      }
    });

    it('admin can sort users by createdAt ascending', async () => {
      const admin = await createTestAdmin();
      const testUser1 = await createTestUser();
      const testUser2 = await createTestUser();
      try {
        const response = await requestApi
          .get('/api/admin/users?sortOn=createdAt&sortDirection=ascending')
          .set('Authorization', `Bearer ${admin.token}`);
        expect(response.status).toBe(200);
        expect(response.body.results.length).toBeGreaterThan(1);
        const createdAt = response.body.results.map(user => user.createdAt);
        const sortedCreatedAt = [...createdAt].sort();
        expect(createdAt).toEqual(sortedCreatedAt);
      }
      finally {
        await deleteTestUser(testUser1);
        await deleteTestUser(testUser2);
        await deleteTestUser(admin);
      }
    });

    it('admin can sort users by createdAt descending', async () => {
      const admin = await createTestAdmin();
      const testUser1 = await createTestUser();
      const testUser2 = await createTestUser();
      try {
        const response = await requestApi
          .get('/api/admin/users?sortOn=createdAt&sortDirection=descending')
          .set('Authorization', `Bearer ${admin.token}`);
        expect(response.status).toBe(200);
        expect(response.body.results.length).toBeGreaterThan(1);
        const createdAt = response.body.results.map(user => user.createdAt);
        const sortedCreatedAt = [...createdAt].sort().reverse();
        expect(createdAt).toEqual(sortedCreatedAt);
      }
      finally {
        await deleteTestUser(testUser1);
        await deleteTestUser(testUser2);
        await deleteTestUser(admin);
      }
    });

    it('admin can limit the number of users returned', async () => {
      const admin = await createTestAdmin();
      const testUser1 = await createTestUser();
      const testUser2 = await createTestUser();
      try {
        const response = await requestApi
          .get('/api/admin/users?limit=1')
          .set('Authorization', `Bearer ${admin.token}`);
        expect(response.status).toBe(200);
        expect(response.body.results.length).toBe(1);
      }
      finally {
        await deleteTestUser(testUser1);
        await deleteTestUser(testUser2);
        await deleteTestUser(admin);
      }
    });

    it('admin can offset the users returned', async () => {
      const admin = await createTestAdmin();
      const testUser1 = await createTestUser();
      const testUser2 = await createTestUser();
      try {
        // Get initial results
        const response = await requestApi
          .get('/api/admin/users')
          .set('Authorization', `Bearer ${admin.token}`);
        expect(response.status).toBe(200);
        const initialResults = response.body.results;

        // Get offset results
        const updatedResponse = await requestApi
          .get('/api/admin/users?offset=1')
          .set('Authorization', `Bearer ${admin.token}`);
        expect(updatedResponse.status).toBe(200);

        // Expect to skip the first user
        expect(updatedResponse.body.results[0].email).toBe(initialResults[1].email);
      }
      finally {
        await deleteTestUser(testUser1);
        await deleteTestUser(testUser2);
        await deleteTestUser(admin);
      }
    });

    it('admin can get the total number of users', async () => {
      const admin = await createTestAdmin();
      let testUser;
      try {
        let size = 0;
        const response = await requestApi
          .get('/api/admin/users?size=true')
          .set('Authorization', `Bearer ${admin.token}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('size');
        size = response.body.size;

        // Create a new user
        testUser = await createTestUser();

        // Get updated size
        const updatedResponse = await requestApi
          .get('/api/admin/users?size=true')
          .set('Authorization', `Bearer ${admin.token}`);
        expect(updatedResponse.status).toBe(200);
        expect(updatedResponse.body).toHaveProperty('size');
        expect(updatedResponse.body.size).toBe(size + 1);
      }
      finally {
        await deleteTestUser(testUser);
        await deleteTestUser(admin);
      }
    });
  });

  describe('GET /api/admin/users/:email', () => {
    it('unauthenticated users get 401', async () => {
      const response = await requestApi
        .get('/api/admin/users/test@example.com');
      expect(response.status).toBe(401);
    });

    it('authenticated non-admin users get 403', async () => {
      const testUser = await createTestUser();
      try {
        const response = await requestApi
          .get('/api/admin/users/test@example.com')
          .set('Authorization', `Bearer ${testUser.token}`);
        expect(response.status).toBe(403);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });

    it('admin can view any user\'s data', async () => {
      const admin = await createTestAdmin();
      const testUser = await createTestUser();
      try {
        const response = await requestApi
          .get(`/api/admin/users/${testUser.email}`)
          .set('Authorization', `Bearer ${admin.token}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('email');
        expect(response.body.email).toBe(testUser.email);
      }
      finally {
        await deleteTestUser(testUser);
        await deleteTestUser(admin);
      }
    });
  });

  describe('GET /api/admin/users/:email/login', () => {
    it('unauthenticated users get 401', async () => {
      const response = await requestApi
        .get('/api/admin/users/test@example.com/login');
      expect(response.status).toBe(401);
    });

    it('authenticated non-admin users get 403', async () => {
      const testUser = await createTestUser();
      try {
        const response = await requestApi
          .get('/api/admin/users/test@example.com/login')
          .set('Authorization', `Bearer ${testUser.token}`);
        expect(response.status).toBe(403);
      }
      finally {
        await deleteTestUser(testUser);
      }
    });

    it('admin can get a JWT to login as another user', async () => {
      const admin = await createTestAdmin();
      const testUser = await createTestUser();
      try {
        const response = await requestApi
          .get(`/api/admin/users/${testUser.email}/login`)
          .set('Authorization', `Bearer ${admin.token}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('jwt');
        expect(typeof response.body.jwt).toBe('string');

        // Verify the JWT can perform authenticated requests
        const jwt = response.body.jwt;
        const userResponse = await requestApi
          .get('/api/auth/user')
          .set('Authorization', `Bearer ${jwt}`);
        expect(userResponse.status).toBe(200);
        expect(userResponse.body).toHaveProperty('user');
        expect(userResponse.body.user).not.toBeNull();
        expect(userResponse.body.user.email).toBe(testUser.email);
      }
      finally {
        await deleteTestUser(testUser);
        await deleteTestUser(admin);
      }
    });
  });
});
