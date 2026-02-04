import express from 'express';
import config from '../../config';
import { InvalidRequestError } from '../errors/http-errors';
import { ApiErrorDetailCode } from '../errors/error-codes';
import { isSemverLessThan, parseSemver } from '../helpers/semver';
import { type ApiResponse } from '../response';

type Platform = 'ios' | 'android';

function isPlatform(value: unknown): value is Platform {
  return value === 'ios' || value === 'android';
}

type AppSupportStatus = {
  platform: Platform;
  current: { version: string };
  minimumSupported: { version: string };
  latest?: { version: string } | null;
  supported: boolean;
  forceUpgrade: boolean;
  storeUrl?: string | null;
  message?: string;
};

const router = express.Router();

/**
 * @swagger
 * /mobile-app/support:
 *   get:
 *     summary: Mobile app support/upgrade status
 *     description: |
 *       Used by the React Native app at startup to determine whether the installed app version
 *       is still supported by the API. If not supported, the client should block usage and
 *       show a "please update" screen.
 *     tags: [Mobile]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: platform
 *         required: true
 *         schema:
 *           type: string
 *           enum: [ios, android]
 *       - in: query
 *         name: version
 *         required: true
 *         schema:
 *           type: string
 *           example: 1.2.3
 *     responses:
 *       200:
 *         description: Support status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [data]
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     supported:
 *                       type: boolean
 *                     forceUpgrade:
 *                       type: boolean
 *                     platform:
 *                       type: string
 *                     current:
 *                       type: object
 *                       properties:
 *                         version:
 *                           type: string
 *                     minimumSupported:
 *                       type: object
 *                       properties:
 *                         version:
 *                           type: string
 *                     latest:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         version:
 *                           type: string
 *                     storeUrl:
 *                       type: string
 *                       nullable: true
 *       400:
 *         description: Invalid request
 */
router.get('/mobile-app/support', async (req, res, next) => {
  try {
    const platform = req.query.platform;
    const version = req.query.version;

    if (!isPlatform(platform)) {
      throw new InvalidRequestError([{ field: 'platform', code: ApiErrorDetailCode.NotValid }]);
    }
    if (typeof version !== 'string' || !parseSemver(version)) {
      throw new InvalidRequestError([{ field: 'version', code: ApiErrorDetailCode.NotValid }]);
    }

    const minVersion = config.mobileApp.minVersion[platform] ?? '0.0.0';
    const latestVersion = config.mobileApp.latestVersion[platform];
    const storeUrl = config.mobileApp.storeUrl[platform];

    const supported = !isSemverLessThan(version, minVersion);
    const status: AppSupportStatus = {
      platform,
      current: { version },
      minimumSupported: { version: minVersion },
      latest: latestVersion ? { version: latestVersion } : null,
      supported,
      forceUpgrade: !supported,
      storeUrl: storeUrl ?? null,
    };

    return res.json({ data: status } satisfies ApiResponse<AppSupportStatus>);
  } catch (error) {
    next(error);
  }
});

export default router;

