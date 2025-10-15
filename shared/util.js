const Bible = require('./bible');

/** Determines if the operating system is a mobile device (for opening links in apps). */
const isMobileOperatingSystem = () => {
  if (typeof window === 'undefined') {
    return false;
  }
  return /Android|webOS|iPhone|iPad|iPod|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Determine the mobile operating system.
 * This function returns one of 'iOS', 'Android', 'Windows Phone', or 'unknown'.
 *
 * @returns {String}
 */
const getMobileOperatingSystem = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;

  // Windows Phone must come first because its UA also contains "Android"
  if (/windows phone/i.test(userAgent)) {
    return 'Windows Phone';
  }

  if (/android/i.test(userAgent)) {
    return 'Android';
  }

  // iOS detection from: http://stackoverflow.com/a/9039885/177710
  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    return 'iOS';
  }

  return 'unknown';
};

const OSIS = {
  Judges: 'JDG',
  '1 Samuel': '1SA',
  '2 Samuel': '2SA',
  '1 Kings': '1KI',
  '2 Kings': '2KI',
  '1 Chronicles': '1CH',
  '2 Chronicles': '2CH',
  'Song of Solomon': 'SNG',
  Ezekiel: 'EZK',
  Joel: 'JOL',
  Nahum: 'NAM',
  Mark: 'MRK',
  John: 'JHN',
  '1 Corinthians': '1CO',
  '2 Corinthians': '2CO',
  '1 Thessalonians': '1TH',
  '2 Thessalonians': '2TH',
  '1 Timothy': '1TI',
  '2 Timothy': '2TI',
  Philippians: 'PHP',
  Philemon: 'PHM',
  James: 'JAS',
  '1 Peter': '1PE',
  '2 Peter': '2PE',
  '1 John': '1JN',
  '2 John': '2JN',
  '3 John': '3JN',
};

/**
 * Use the OSIS abbreviation map for books whose OSIS codes do not follow the
 * pattern of using their three initial letters.
 * @param {string} bookName
 */
const getOsisCode = (bookName) => {
  if (OSIS[bookName]) { return OSIS[bookName]; }
  return bookName.substring(0, 3).toLocaleUpperCase();
};

/**
 * This is an enum of translations *internal* to My Bible Log.
 * They are not official codes used across apps.
 * However, these are based on the Bible.com / YouVersion codes.
 *
 * These values may need converted to a list of codes specific
 * to other Bible reading apps.
 */
const BibleVersions = {
  KJV: 'KJV',
  NKJV: 'NKJV',
  NIV: 'NIV',
  ESV: 'ESV',
  NASB1995: 'NASB1995',
  NASB2020: 'NASB2020',
  RVR1960: 'RVR1960', // Reina Valera 1960 (Spanish)
  RVR2020: 'RVR2020', // Reina Valera 2020 (Spanish)
  UKR: 'UKR', // Ukrainian (any version available)
  BDS: 'BDS', // Bible du Semeur (French)
  LSG: 'LSG', // Louis Segond (French)
  ARC: 'ARC', // Almeida Revista e Corrigida (Portuguese)
  LUT: 'LUT', // Luther 1912 (German)
};

const BlueLetterBibleVersions = {
  [BibleVersions.KJV]: 'kjv',
  [BibleVersions.NKJV]: 'nkjv',
  [BibleVersions.NIV]: 'niv',
  [BibleVersions.ESV]: 'esv',
  [BibleVersions.NASB1995]: 'nasb95',
  [BibleVersions.NASB2020]: 'nasb20',
  [BibleVersions.RVR1960]: 'rvr60',
  [BibleVersions.RVR2020]: 'rvr60', // 2020 not available -- fall back to 1960
  [BibleVersions.UKR]: 'niv', // There is no Ukrainian version on Blue Letter Bible
  [BibleVersions.BDS]: 'ls', // There's no Bible du Semeur version on Blue Letter Bible
  [BibleVersions.LSG]: 'ls',
  [BibleVersions.ARC]: 'nasb20', // There is no ARC version on Blue Letter Bible
  [BibleVersions.LUT]: 'lut',
};

const BibleGatewayVersions = {
  [BibleVersions.KJV]: 'KJV',
  [BibleVersions.NKJV]: 'NKJV',
  [BibleVersions.NIV]: 'NIV',
  [BibleVersions.ESV]: 'ESV',
  [BibleVersions.NASB1995]: 'NASB1995',
  [BibleVersions.NASB2020]: 'NASB',
  [BibleVersions.RVR1960]: 'RVR1960',
  [BibleVersions.RVR2020]: 'RVR1960', // 2020 not available -- fall back to 1960
  [BibleVersions.UKR]: 'UKR',
  [BibleVersions.BDS]: 'BDS',
  [BibleVersions.LSG]: 'LSG',
  [BibleVersions.ARC]: 'ARC',
  [BibleVersions.LUT]: 'LUTH1545',
};

// The language code of each translation on Bible.com
const BibleComTranslationLanguages = {
  [BibleVersions.KJV]: 1,
  [BibleVersions.NKJV]: 114,
  [BibleVersions.NIV]: 111,
  [BibleVersions.ESV]: 59,
  [BibleVersions.NASB1995]: 100,
  [BibleVersions.NASB2020]: 2692,
  [BibleVersions.RVR1960]: 149,
  [BibleVersions.RVR2020]: 3425,
  [BibleVersions.UKR]: 188,
  [BibleVersions.BDS]: 21,
  [BibleVersions.LSG]: 93,
  [BibleVersions.ARC]: 212,
  [BibleVersions.LUT]: 51,
};

const defaultBibleVersion = BibleVersions.NASB2020;

const getYouVersionReadingURL = (version, bookIndex, chapterIndex) => {
  // Map version to YouVersion accepted values
  version = BibleVersions[version] || defaultBibleVersion;
  const bookName = Bible.getBookName(bookIndex, 'en');
  const bookOsisCode = getOsisCode(bookName);
  const url = `youversion://bible?reference=${bookOsisCode}.${chapterIndex}.${version}`;
  return url;
};

const getBibleComReadingURL = (version, bookIndex, chapterIndex) => {
  // Example: https://www.bible.com/bible/1/GEN.1.KJV
  // Map version to Bible.com accepted values
  version = BibleVersions[version] || defaultBibleVersion;
  const languageCode = BibleComTranslationLanguages[version] || 1;
  const bookName = Bible.getBookName(bookIndex, 'en');
  const bookOsisCode = getOsisCode(bookName);
  const url = `https://www.bible.com/bible/${languageCode}/${bookOsisCode}.${chapterIndex}.${version}`;
  return url;
};

const BlueLetterBibleBookCodes = [
  undefined,
  'Gen',
  'Exo',
  'Lev',
  'Num',
  'Deu',
  'Jos',
  'Jdg',
  'Rth',
  '1Sa',
  '2Sa',
  '1Ki',
  '2Ki',
  '1Ch',
  '2Ch',
  'Ezr',
  'Neh',
  'Est',
  'Job',
  'Psa',
  'Pro',
  'Ecc',
  'Sng',
  'Isa',
  'Jer',
  'Lam',
  'Eze',
  'Dan',
  'Hos',
  'Joe',
  'Amo',
  'Oba',
  'Jon',
  'Mic',
  'Nah',
  'Hab',
  'Zep',
  'Hag',
  'Zec',
  'Mal',
  'Mat',
  'Mar',
  'Luk',
  'Jhn',
  'Act',
  'Rom',
  '1Co',
  '2Co',
  'Gal',
  'Eph',
  'Phl',
  'Col',
  '1Th',
  '2Th',
  '1Ti',
  '2Ti',
  'Tit',
  'Phm',
  'Heb',
  'Jas',
  '1Pe',
  '2Pe',
  '1Jo',
  '2Jo',
  '3Jo',
  'Jde',
  'Rev',
];

const getBlueLetterBibleReadingURL = (version, bookIndex, chapterIndex) => {
  // Example: https://www.blueletterbible.org/nasb20/1jo/3/1/s_1162001
  // Map version to Blue Letter Bible accepted values
  version = BlueLetterBibleVersions[version] || BlueLetterBibleVersions[defaultBibleVersion];
  // Get app-specific book code
  const bookCode = BlueLetterBibleBookCodes[bookIndex];
  const url = `https://www.blueletterbible.org/${version}/${bookCode}/${chapterIndex}/1`;
  return url;
};

const getBibleGatewayReadingURL = (version, bookIndex, chapterIndex) => {
  // Example: https://www.biblegateway.com/passage/?search=John+3&version=NIV
  // Map version to Bible Gateway accepted values
  version = BibleGatewayVersions[version] || BibleGatewayVersions[defaultBibleVersion];
  const bookName = Bible.getBookName(bookIndex, 'en');
  const chapterReference = `${bookName} ${chapterIndex}`;
  const url = encodeURI(`https://www.biblegateway.com/passage/?version=${version}&search=${chapterReference}`);
  return url;
};

const getOliveTreeReadingUrl = (version, bookIndex, chapterIndex) => {
  return `olivetree://bible/${bookIndex}.${chapterIndex}.1`;
};

const BibleApps = {
  YOUVERSIONAPP: 'YOUVERSIONAPP',
  BIBLECOM: 'BIBLECOM',
  BLUELETTERBIBLE: 'BLUELETTERBIBLE',
  BIBLEGATEWAY: 'BIBLEGATEWAY',
  OLIVETREE: 'OLIVETREE',
};

const getAppReadingUrl = (app, version, bookIndex, chapterIndex) => {
  switch (app) {
  case BibleApps.YOUVERSIONAPP:
    return getYouVersionReadingURL(version, bookIndex, chapterIndex);
  case BibleApps.BIBLECOM:
    return getBibleComReadingURL(version, bookIndex, chapterIndex);
  case BibleApps.BLUELETTERBIBLE:
    return getBlueLetterBibleReadingURL(version, bookIndex, chapterIndex);
  case BibleApps.OLIVETREE:
    return getOliveTreeReadingUrl(version, bookIndex, chapterIndex);
  case BibleApps.BIBLEGATEWAY:
  default:
    return getBibleGatewayReadingURL(version, bookIndex, chapterIndex);
  }
};

/**
 * Gets the default Bible app to use if no user preference is available.
 * This is based on whether the OS supports opening the YouVersion directly.
 */
const getDefaultBibleApp = () => {
  if (isMobileOperatingSystem() && getMobileOperatingSystem() === 'Android') {
    return BibleApps.YOUVERSIONAPP;
  }
  return BibleApps.BIBLEGATEWAY;
};

/**
 * Gets the default Bible version to use if no user preference is available.
 */
const getDefaultBibleVersion = () => {
  return BibleVersions.NASB2020;
};

const Util = {
  BibleApps,
  BibleVersions,
  getAppReadingUrl,
  getDefaultBibleApp,
  getDefaultBibleVersion,
};

module.exports = Util;
