import { describe, it, expect } from '@jest/globals';
import { requestApi } from './helpers';

function isValidSemver(value: unknown): boolean {
  if (typeof value !== 'string') { return false; }
  // SemVer 2.0.0 core + optional pre-release/build.
  return /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/.test(value);
}

describe('Mobile App Support', () => {
  describe('GET /api/mobile-app/support', () => {
    it('returns 400 for invalid platform', async () => {
      const res = await requestApi.get('/api/mobile-app/support?platform=web&version=1.2.3');
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
      expect(res.body).not.toHaveProperty('data');
      expect(res.body.error.code).toBe('invalid_request');
      expect(Array.isArray(res.body.error.errors)).toBe(true);
      expect(res.body.error.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'platform', code: 'not_valid' }),
        ])
      );
    });

    it('returns 400 for invalid version (must be strict semver x.y.z)', async () => {
      const res = await requestApi.get('/api/mobile-app/support?platform=ios&version=1.2');
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
      expect(res.body).not.toHaveProperty('data');
      expect(res.body.error.code).toBe('invalid_request');
      expect(Array.isArray(res.body.error.errors)).toBe(true);
      expect(res.body.error.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'version', code: 'not_valid' }),
        ])
      );
    });

    it('returns support status with expected structure for valid input', async () => {
      const res = await requestApi.get('/api/mobile-app/support?platform=ios&version=1.2.3');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body).not.toHaveProperty('error');

      const data = res.body.data;
      expect(data).toHaveProperty('platform', 'ios');
      expect(data).toHaveProperty('current');
      expect(data).toHaveProperty('minimumSupported');
      expect(data).toHaveProperty('latest');
      expect(data).toHaveProperty('supported');
      expect(data).toHaveProperty('forceUpgrade');
      expect(data).toHaveProperty('storeUrl');

      expect(isValidSemver(data.current?.version)).toBe(true);
      expect(isValidSemver(data.minimumSupported?.version)).toBe(true);

      // latest can be null or an object with a semver version
      if (data.latest !== null) {
        expect(isValidSemver(data.latest?.version)).toBe(true);
      }

      expect(typeof data.supported).toBe('boolean');
      expect(typeof data.forceUpgrade).toBe('boolean');
      expect(data.forceUpgrade).toBe(!data.supported);

      // storeUrl can be null or a URL string
      if (data.storeUrl !== null) {
        expect(typeof data.storeUrl).toBe('string');
        expect(data.storeUrl).toMatch(/^https?:\/\//);
      }
    });
  });
});

