const {
  readFile,
  readdir,
  stat,
  writeFile,
  mkdir,
} = require('node:fs/promises');
const path = require('node:path');
const { existsSync } = require('node:fs');
const OpenAI = require('openai');
const dotenv = require('dotenv');
const bibleBooks = require('../shared/static/bible-books.js');

dotenv.config();

const newLanguageCode = '';
const newLanguageName = '';

if (!newLanguageCode || !newLanguageName) {
  throw new Error('Missing new language code or name');
}

const debugDir = './_translate_debug';

const logOpenAiChatMessage = async (message) => {
  if (typeof message !== 'string') {
    message = JSON.stringify(message, null, 2);
  }
  await writeFile(`${debugDir}/${Date.now().valueOf()}.txt`, message, 'utf8');
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const extractI18nJson = (componentSource) => {
  try {
    const i18nTagStart = '<i18n lang="json">';
    const i18nTagEnd = '</i18n>';

    const startIndex = componentSource.indexOf(i18nTagStart);
    const endIndex = componentSource.indexOf(i18nTagEnd, startIndex);

    if (startIndex === -1 || endIndex === -1) {
      return null; // i18n tags not found
    }

    const jsonString = componentSource.substring(startIndex + i18nTagStart.length, endIndex).trim();
    return JSON.parse(jsonString);
  }
  catch (error) {
    console.error('Error extracting and parsing i18n JSON:', error);
    return null;
  }
};

const replaceI18nJson = (componentSource, newI18nSource) => {
  try {
    const i18nTagStart = '<i18n lang="json">';
    const i18nTagEnd = '</i18n>';

    const startIndex = componentSource.indexOf(i18nTagStart);
    const endIndex = componentSource.indexOf(i18nTagEnd, startIndex);

    if (startIndex === -1 || endIndex === -1) {
      return componentSource; // i18n tags not found, return original source
    }

    const beforeJson = componentSource.substring(0, startIndex + i18nTagStart.length);
    const afterJson = componentSource.substring(endIndex);

    return beforeJson + '\n' + newI18nSource + '\n' + afterJson;
  }
  catch (error) {
    console.error('Error replacing i18n JSON:', error);
    return componentSource;
  }
};

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
const mergeDeep = (target, ...sources) => {
  const isObject = (item) => {
    return (item && typeof item === 'object' && !Array.isArray(item));
  };

  if (!sources.length) { return target; }
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) { Object.assign(target, { [key]: {} }); }
        mergeDeep(target[key], source[key]);
      }
      else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
};

const collapseKeys = (obj, prefix = '') => {
  const result = {};

  for (const key in obj) {
    if (Object.hasOwn(obj, key)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        Object.assign(result, collapseKeys(obj[key], newKey));
      }
      else {
        result[newKey] = obj[key];
      }
    }
  }

  return result;
};

const expandKeys = (obj) => {
  const result = {};

  for (const flatKey in obj) {
    if (Object.hasOwn(obj, flatKey)) {
      const keys = flatKey.split('.');
      let current = result;

      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];

        if (i === keys.length - 1) {
          current[key] = obj[flatKey];
        }
        else {
          if (!current[key]) {
            current[key] = {};
          }
          current = current[key];
        }
      }
    }
  }

  return result;
};

const processInBatches = async (messages, batchSize, processBatch) => {
  if (typeof messages !== 'object' || messages === null) {
    throw new TypeError('First argument must be an object');
  }
  if (typeof batchSize !== 'number' || batchSize <= 0) {
    throw new TypeError('Second argument must be a positive number');
  }
  if (typeof processBatch !== 'function') {
    throw new TypeError('Third argument must be a function');
  }

  const flatMessages = collapseKeys(messages);
  const flatKeys = Object.keys(flatMessages);
  const result = {};

  for (let i = 0; i < flatKeys.length; i += batchSize) {
    const batch = {};
    for (let j = 0; j < batchSize && i + j < flatKeys.length; j++) {
      const key = flatKeys[i + j];
      batch[key] = flatMessages[key];
    }

    const processedBatch = await processBatch(expandKeys(batch));
    mergeDeep(result, processedBatch);
  }

  return expandKeys(result);
};

const removeMarkdownBackticks = (text) => {
  return text.replace(/^```.*?$/g, '');
};

const processBatch = async (batch) => {
  const prompt =
    `This is for use in a Bible reading tracker app called "My Bible Log". ` +
    `"My Bible Log" is a brand that should not be translated. ` +
    `Translate this JSON map of English localization messages to ${newLanguageName}:\n` +
    JSON.stringify(batch, null, 2);

  await logOpenAiChatMessage(prompt);

  const completionResponse = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant. You respond only with correctly formatted JSON.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  await logOpenAiChatMessage(completionResponse);

  try {
    const responseText = completionResponse.choices[0].message.content;
    const cleanResponseText = removeMarkdownBackticks(responseText);
    const result = JSON.parse(cleanResponseText);
    return result;
  }
  catch (e) {
    console.error('Unable to log response.');
    throw new Error('Unable to log response.');
  }
};

const translateEnglishMessages = async (messages) => {
  const batchSize = 10;
  const translatedMessages = await processInBatches(messages, batchSize, processBatch);
  const validResults = haveSameNestedKeys(messages, translatedMessages);
  if (!validResults) {
    console.log('Original messages:', messages);
    console.log('Translated messages:', translatedMessages);
    throw new Error('Translated messages do not have the same nested keys as the original messages');
  }
  return translatedMessages;
};

const findVueFiles = async (dir, callback) => {
  try {
    const files = await readdir(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const fileStat = await stat(fullPath);

      if (fileStat.isDirectory()) {
        await findVueFiles(fullPath, callback); // Recurse into subdirectory
      }
      else if (path.extname(file) === '.vue') {
        const textContents = await readFile(fullPath, 'utf8');
        await callback(fullPath, textContents);
      }
    }
  }
  catch (err) {
    console.error('Error processing files:', err);
  }
};

const haveSameNestedKeys = (obj1, obj2) => {
  if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
    throw new TypeError('Both arguments must be objects');
  }

  function recurse(o1, o2) {
    const keys1 = Object.keys(o1).sort();
    const keys2 = Object.keys(o2).sort();

    if (keys1.length !== keys2.length) {
      return false;
    }

    for (let i = 0; i < keys1.length; i++) {
      if (keys1[i] !== keys2[i]) {
        return false;
      }
      const val1 = o1[keys1[i]];
      const val2 = o2[keys2[i]];

      if (typeof val1 === 'object' && val1 !== null && typeof val2 === 'object' && val2 !== null) {
        if (!recurse(val1, val2)) {
          return false;
        }
      }
    }

    return true;
  }

  return recurse(obj1, obj2);
};

const translateI18nSource = async (fullFilePath, textContents) => {
  console.log(`Processing file: ${fullFilePath}`);
  const i18nJson = extractI18nJson(textContents);
  if (!i18nJson) {
    console.log('No i18n JSON found in file:', fullFilePath);
    return;
  }
  if (i18nJson[newLanguageCode]) {
    console.log('Translation already exists in file:', fullFilePath);
    return;
  }

  // Translate the i18n JSON object to a new language
  const englishMessages = i18nJson.en;

  const newMessages = await translateEnglishMessages(englishMessages);

  const newI18nJson = sortObjectKeys({
    ...i18nJson,
    [newLanguageCode]: newMessages,
  });
  const newComponentSource = replaceI18nJson(textContents, JSON.stringify(newI18nJson, null, 2));

  // Write the new source back to the file
  await writeFile(fullFilePath, newComponentSource, 'utf8');
};

const sortObjectKeys = (obj) => {
  const sortedKeys = Object.keys(obj).sort();
  const sortedObj = {};
  sortedKeys.forEach((key) => {
    sortedObj[key] = obj[key];
  });

  return sortedObj;
};

const getTranslatedBibleBookData = async () => {
  const prompt =
    `Give me a JSON array of objects, where each object has a "name" and "abbreviations" property. ` +
    `These are the 66 common books of the Bible in ${newLanguageName}. ` +
    `The "name" should be the ${newLanguageName} name of the book, and "abbreviations" should be an array with ` +
    `all common abbreviations of that book's title in the ${newLanguageName} language.`;

  await logOpenAiChatMessage(prompt);

  const completionResponse = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant. You respond only with correctly formatted JSON.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  await logOpenAiChatMessage(completionResponse);

  try {
    const responseText = completionResponse.choices[0].message.content;
    const cleanResponseText = removeMarkdownBackticks(responseText);
    const result = JSON.parse(cleanResponseText);

    // Sometimes the response is an object with a single property that is an array,
    // rather than being the expected array itself
    if (!Array.isArray(result)) {
      const firstProperty = Object.keys(result)[0];
      if (Array.isArray(result[firstProperty])) {
        return result[firstProperty];
      }
    }

    return result;
  }
  catch (e) {
    console.error('Unable to log response.', e);
    throw new Error('Unable to log response.');
  }
};

const translateBibleBooks = async () => {
  console.log('Translating Bible books');
  if (bibleBooks[0].locales[newLanguageCode]) {
    console.log('Bible books already translated.');
    return;
  }
  const translatedBibleBookData = await getTranslatedBibleBookData();
  if (!Array.isArray(translatedBibleBookData) || translatedBibleBookData.length !== bibleBooks.length) {
    console.error('Invalid translated Bible book data:', translatedBibleBookData);
    throw new Error('Invalid translated Bible book data');
  }
  for (let i = 0; i < bibleBooks.length; i++) {
    const locales = bibleBooks[i].locales;
    locales[newLanguageCode] = translatedBibleBookData[i];
    bibleBooks[i].locales = sortObjectKeys(locales);
  }
  await writeFile('./shared/static/bible-books.js', `module.exports = ${JSON.stringify(bibleBooks, null, 2)};`, 'utf8');
};

const findMarkdownFiles = async (dir, callback) => {
  try {
    const files = await readdir(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const fileStat = await stat(fullPath);

      if (fileStat.isDirectory()) {
        await findMarkdownFiles(fullPath, callback); // Recurse into subdirectory
      }
      else if (path.extname(file) === '.md') {
        const textContents = await readFile(fullPath, 'utf8');
        await callback(fullPath, textContents);
      }
    }
  }
  catch (err) {
    console.error('Error processing files:', err);
  }
};

const translateMarkdownFile = async (fullFilePath, textContents) => {
  console.log(`Processing file: ${fullFilePath}`);
  const newFilePath = fullFilePath.replace('/en/', `/${newLanguageCode}/`);
  if (existsSync(newFilePath)) {
    console.log('Output file already exists:', newFilePath);
    return;
  }

  const prompt = `Translate this Markdown file to ${newLanguageName}, returning only the new file contents as plain text:\n${textContents}`;

  await logOpenAiChatMessage(prompt);

  const completionResponse = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content:
          'You are a helpful assistant. You respond only with correctly formatted Markdown.' +
          'You are returning a full Markdown file, not a Markdown snippet, so make sure to include front matter if necessary.' +
          'Do not add extra backticks around the file contents. This is an entire file, not just a code block.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  await logOpenAiChatMessage(completionResponse);

  try {
    const responseText = completionResponse.choices[0].message.content;
    await mkdir(path.dirname(newFilePath), { recursive: true });
    await writeFile(newFilePath, responseText, 'utf8');
  }
  catch (e) {
    console.error('Unable to log response.', e);
    throw new Error('Unable to log response.');
  }
};

const main = async () => {
  await mkdir(debugDir, { recursive: true });

  await translateBibleBooks();

  for (const dir of [
    'components',
    'pages',
  ]) {
    await findVueFiles(dir, translateI18nSource);
  }

  await findMarkdownFiles('content/en', translateMarkdownFile);
};

main().catch(console.error);
