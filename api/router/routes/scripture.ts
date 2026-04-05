import express from 'express';
import {
  BibleVersions,
  extractHelloaoPassagePiecesFromChapter,
  getDefaultBibleVersion,
  getHelloaoChapterFetchPlan,
  getHelloaoTranslationId,
  type HelloaoPassageBlock,
  verseBoundsForChapter,
} from '@mybiblelog/shared';
import authCurrentUser from '../helpers/authCurrentUser';
import { ApiErrorDetailCode } from '../errors/error-codes';
import { type ApiResponse } from '../response';
import { ValidationError } from '../errors/validation-errors';

const router = express.Router();

const HELLOAO_API_BASE = 'https://bible.helloao.org/api';

const parsePositiveInt = (v: unknown): number | null => {
  if (v === undefined || v === null || v === '') {
    return null;
  }
  const n = typeof v === 'string' ? parseInt(v, 10) : Number(v);
  if (!Number.isFinite(n) || n <= 0) {
    return null;
  }
  return Math.floor(n);
};

export type ScripturePassageResponse = {
  /** Chapter number this payload corresponds to (always a single chapter). */
  chapter: number;
  /** Section headings (from the translation) and verses in reading order. */
  blocks: HelloaoPassageBlock[];
  translationId: string;
  translationName: string;
  licenseUrl: string;
  usfm: string;
};

router.get('/scripture/passage', async (req, res, next) => {
  try {
    await authCurrentUser(req);

    const startVerseId = parsePositiveInt(req.query.startVerseId);
    const endVerseId = parsePositiveInt(req.query.endVerseId);
    if (startVerseId === null || endVerseId === null) {
      throw new ValidationError([{ code: ApiErrorDetailCode.NotValid, field: 'startVerseId' }]);
    }

    const plan = getHelloaoChapterFetchPlan(startVerseId, endVerseId);
    if (!plan) {
      throw new ValidationError([{ code: ApiErrorDetailCode.NotValid, field: 'passage' }]);
    }

    const chapterNumber = parsePositiveInt(req.query.chapter);
    if (chapterNumber === null) {
      throw new ValidationError([{ code: ApiErrorDetailCode.NotValid, field: 'chapter' }]);
    }
    if (!plan.chapters.includes(chapterNumber)) {
      throw new ValidationError([{ code: ApiErrorDetailCode.NotValid, field: 'chapter' }]);
    }

    const qVersion = typeof req.query.bibleVersion === 'string' ? req.query.bibleVersion : '';
    const versionKey = (qVersion && qVersion in BibleVersions
      ? qVersion
      : getDefaultBibleVersion()) as keyof typeof BibleVersions;
    const translationId = getHelloaoTranslationId(versionKey);

    const url = `${HELLOAO_API_BASE}/${encodeURIComponent(translationId)}/${encodeURIComponent(plan.usfm)}/${chapterNumber}.json`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new ValidationError([{ code: ApiErrorDetailCode.NotValid, field: 'passage' }]);
    }
    const payload: unknown = await response.json();

    let licenseUrl = '';
    let translationName = '';
    if (typeof payload === 'object' && payload !== null && 'translation' in payload) {
      const tr = (payload as { translation?: { licenseUrl?: string; englishName?: string; name?: string } }).translation;
      if (tr) {
        licenseUrl = typeof tr.licenseUrl === 'string' ? tr.licenseUrl : '';
        translationName = typeof tr.englishName === 'string' ? tr.englishName : (typeof tr.name === 'string' ? tr.name : translationId);
      }
    }

    const { from, to } = verseBoundsForChapter(plan, chapterNumber);
    const pieces = extractHelloaoPassagePiecesFromChapter(payload, from, to);
    const blocks: HelloaoPassageBlock[] = pieces.map((p) =>
      p.type === 'section_heading'
        ? { type: 'section_heading', chapter: chapterNumber, text: p.text }
        : { type: 'verse', chapter: chapterNumber, number: p.number, segments: p.segments },
    );

    res.json({
      data: {
        chapter: chapterNumber,
        blocks,
        translationId,
        translationName: translationName || translationId,
        licenseUrl,
        usfm: plan.usfm,
      } satisfies ScripturePassageResponse,
    } satisfies ApiResponse<ScripturePassageResponse>);
  }
  catch (error) {
    next(error);
  }
});

export default router;
