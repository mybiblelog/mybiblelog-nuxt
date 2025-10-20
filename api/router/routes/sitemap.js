const fs = require('fs');
const path = require('path');
const express = require('express');
const xml = require('xml');
const config = require('../../config');

const i18nConfig = require('../../../nuxt/i18n.config');
const siteLocales = i18nConfig.locales.map(locale => locale.code);

const router = express.Router();

/**
 * @swagger
 * /sitemap.xml:
 *   get:
 *     summary: Get sitemap in XML format
 *     tags: [Sitemap]
 *     responses:
 *       200:
 *         description: Sitemap in XML format
 *         content:
 *           application/xml:
 *             schema:
 *               type: string
 */
router.get('/sitemap.xml', (req, res, next) => {
  const relativeUrls = [
    // Start with static files that have non-locale-specific URLs
    '/downloads/druckbare-bibel-lesetrack.pdf',
    '/downloads/printable-bible-reading-tracker.pdf',
    '/downloads/rastreador-de-lectura-de-la-biblia-imprimible.pdf',
    '/downloads/feuille-de-suivi-de-lecture-de-la-Bible-imprimable.pdf',
    '/downloads/drukovanyy-vidstezhuvach-chytannya-bibliyi.pdf',
    '/downloads/rastreador-de-leitura-da-biblia-para-imprimir.pdf',
  ];

  // start with the homepage of each locale
  for (const locale of siteLocales) {
    // English (default locale) has no prefix
    const url = locale === 'en' ? '/' : `/${locale}`;
    relativeUrls.push(url);
  }

  // iterate through the /about directory inside each /content/{locale} directory
  for (const locale of siteLocales) {
    const localePrefix = locale === 'en' ? '' : `/${locale}`;

    const aboutDir = path.resolve(process.cwd(), '..', 'nuxt', 'content', locale, 'about');
    const aboutPageFiles = fs.readdirSync(aboutDir);
    for (const file of aboutPageFiles) {
      const slug = file.replace('.md', '');
      const url = `${localePrefix}/about/${slug}`;
      relativeUrls.push(url);
    }
  }

  const urls = relativeUrls.map(url => config.siteUrl + url);

  const sitemapItems = urls.map(url => ({
    url: [
      { loc: url },
      { lastmod: new Date().toISOString().split('T')[0] },
      { changefreq: 'monthly' },
      { priority: 0.8 },
    ],
  }));

  const sitemapObject = {
    urlset: [
      {
        _attr: {
          xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9',
        },
      },
      ...sitemapItems,
    ],
  };

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>${xml(sitemapObject)}`;

  res.header('Content-Type', 'application/xml');
  res.send(sitemap);
});

// Export the router directly
module.exports = router;
