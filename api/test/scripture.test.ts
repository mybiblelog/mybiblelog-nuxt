import { describe, it, expect } from '@jest/globals';
import { requestApi, createTestUser, deleteTestUser } from './helpers';

/** Genesis 1:1 */
const GEN_1_1 = 101001001;
/** Genesis 1:2 */
const GEN_1_2 = 101001002;
/** Genesis 2:2 */
const GEN_2_2 = 101002002;

describe('GET /api/scripture/passage', () => {
  it('returns 401 when unauthenticated', async () => {
    const res = await requestApi.get(
      `/api/scripture/passage?startVerseId=${GEN_1_1}&endVerseId=${GEN_1_1}&chapter=1`,
    );
    expect(res.status).toBe(401);
  });

  it('returns 400 when startVerseId missing', async () => {
    const user = await createTestUser();
    try {
      const res = await requestApi
        .get('/api/scripture/passage?endVerseId=101001001&chapter=1')
        .set('Authorization', `Bearer ${user.token}`);
      expect(res.status).toBe(400);
    }
    finally {
      await deleteTestUser(user);
    }
  });

  it('returns 400 when chapter missing', async () => {
    const user = await createTestUser();
    try {
      const res = await requestApi
        .get(`/api/scripture/passage?startVerseId=${GEN_1_1}&endVerseId=${GEN_1_2}`)
        .set('Authorization', `Bearer ${user.token}`);
      expect(res.status).toBe(400);
    }
    finally {
      await deleteTestUser(user);
    }
  });

  it('returns 400 for invalid passage range', async () => {
    const user = await createTestUser();
    try {
      const res = await requestApi
        .get('/api/scripture/passage?startVerseId=101001010&endVerseId=101001001&chapter=1')
        .set('Authorization', `Bearer ${user.token}`);
      expect(res.status).toBe(400);
    }
    finally {
      await deleteTestUser(user);
    }
  });

  it('returns 400 when chapter is outside passage range', async () => {
    const user = await createTestUser();
    try {
      const res = await requestApi
        .get(`/api/scripture/passage?startVerseId=${GEN_1_1}&endVerseId=${GEN_1_2}&chapter=2`)
        .set('Authorization', `Bearer ${user.token}`);
      expect(res.status).toBe(400);
    }
    finally {
      await deleteTestUser(user);
    }
  });

  it('returns structured verses for one chapter (integration)', async () => {
    const user = await createTestUser();
    try {
      const res = await requestApi
        .get(`/api/scripture/passage?startVerseId=${GEN_1_1}&endVerseId=${GEN_1_2}&bibleVersion=NASB2020&chapter=1`)
        .set('Authorization', `Bearer ${user.token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.chapter).toBe(1);
      expect(res.body.data.usfm).toBe('GEN');
      expect(Array.isArray(res.body.data.blocks)).toBe(true);
      const verseBlocks = res.body.data.blocks.filter((b: { type: string }) => b.type === 'verse');
      expect(verseBlocks.length).toBe(2);
      expect(verseBlocks[0].chapter).toBe(1);
      expect(verseBlocks[0].number).toBe(1);
      expect(verseBlocks[1].number).toBe(2);
      expect(typeof res.body.data.licenseUrl).toBe('string');
      expect(typeof res.body.data.translationName).toBe('string');
      expect(verseBlocks[0].segments.length).toBeGreaterThan(0);
    }
    finally {
      await deleteTestUser(user);
    }
  });

  it('returns verses for chapter 2 when range spans two chapters (integration)', async () => {
    const user = await createTestUser();
    try {
      const res = await requestApi
        .get(`/api/scripture/passage?startVerseId=${GEN_1_1}&endVerseId=${GEN_2_2}&chapter=2`)
        .set('Authorization', `Bearer ${user.token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.chapter).toBe(2);
      expect(res.body.data.blocks.every((b: { type: string; chapter?: number }) =>
        b.type !== 'verse' || b.chapter === 2,
      )).toBe(true);
      expect(res.body.data.blocks.filter((b: { type: string }) => b.type === 'verse').length).toBeGreaterThan(0);
    }
    finally {
      await deleteTestUser(user);
    }
  });
});
