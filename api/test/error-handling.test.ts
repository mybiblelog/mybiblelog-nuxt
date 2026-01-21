import { describe, it, expect } from '@jest/globals';
import { requestApi } from './helpers';

describe('Error Handling', () => {
  describe('API Error Responses', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await requestApi.get('/api/non-existent-route');
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: {
          code: 'not_found',
        },
      });
    });
  });
});

