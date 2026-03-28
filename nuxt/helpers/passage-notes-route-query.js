const DEFAULT_PASSAGE_NOTES_QUERY = {
  limit: 10,
  offset: 0,
  sortOn: 'createdAt',
  sortDirection: 'descending',
  filterTags: [],
  filterTagMatching: 'any', // 'any' | 'all' | 'exact'
  searchText: '',
  filterPassageStartVerseId: 0,
  filterPassageEndVerseId: 0,
  filterPassageMatching: 'inclusive', // 'inclusive' | 'exclusive'
};

const MAX_PAGE_SIZE = 50;

function asStringArray(value) {
  if (value === null || value === undefined) { return []; }
  if (Array.isArray(value)) { return value.map(v => `${v}`); }
  if (`${value}`.trim() === '') { return []; }
  return [`${value}`];
}

function clamp(n, min, max) {
  return Math.min(Math.max(n, min), max);
}

function parseIntOr(value, fallback) {
  const n = typeof value === 'number' ? value : parseInt(`${value}`, 10);
  return Number.isFinite(n) ? n : fallback;
}

function pickEnum(value, allowed, fallback) {
  const v = `${value ?? ''}`;
  return allowed.includes(v) ? v : fallback;
}

/**
 * Decode a vue-router `$route.query` object into a full passage-notes query object.
 * @param {Record<string, any>} routeQuery
 * @returns {typeof DEFAULT_PASSAGE_NOTES_QUERY}
 */
export function decodePassageNotesRouteQuery(routeQuery = {}) {
  const filterTags = asStringArray(routeQuery.filterTags)
    .map(v => `${v}`.trim())
    .filter(Boolean);

  const filterPassageStartVerseId = parseIntOr(routeQuery.filterPassageStartVerseId, DEFAULT_PASSAGE_NOTES_QUERY.filterPassageStartVerseId);
  const filterPassageEndVerseId = parseIntOr(routeQuery.filterPassageEndVerseId, DEFAULT_PASSAGE_NOTES_QUERY.filterPassageEndVerseId);

  return {
    limit: clamp(parseIntOr(routeQuery.limit, DEFAULT_PASSAGE_NOTES_QUERY.limit), 1, MAX_PAGE_SIZE),
    offset: Math.max(0, parseIntOr(routeQuery.offset, DEFAULT_PASSAGE_NOTES_QUERY.offset)),
    sortOn: `${routeQuery.sortOn ?? DEFAULT_PASSAGE_NOTES_QUERY.sortOn}`,
    sortDirection: pickEnum(routeQuery.sortDirection, ['ascending', 'descending'], DEFAULT_PASSAGE_NOTES_QUERY.sortDirection),
    filterTags,
    filterTagMatching: pickEnum(routeQuery.filterTagMatching, ['any', 'all', 'exact'], DEFAULT_PASSAGE_NOTES_QUERY.filterTagMatching),
    searchText: typeof routeQuery.searchText === 'string' ? routeQuery.searchText : `${routeQuery.searchText ?? DEFAULT_PASSAGE_NOTES_QUERY.searchText}`,
    filterPassageStartVerseId: (filterPassageStartVerseId && filterPassageEndVerseId) ? filterPassageStartVerseId : 0,
    filterPassageEndVerseId: (filterPassageStartVerseId && filterPassageEndVerseId) ? filterPassageEndVerseId : 0,
    filterPassageMatching: pickEnum(routeQuery.filterPassageMatching, ['inclusive', 'exclusive'], DEFAULT_PASSAGE_NOTES_QUERY.filterPassageMatching),
  };
}

/**
 * Encode a passage-notes query object into a vue-router `query` object.
 * Intended to be fully reproducible (includes sort + paging).
 * @param {Partial<typeof DEFAULT_PASSAGE_NOTES_QUERY>} query
 * @returns {Record<string, any>}
 */
export function encodePassageNotesQueryToRoute(query = {}) {
  const merged = { ...DEFAULT_PASSAGE_NOTES_QUERY, ...(query || {}) };
  const normalized = {
    limit: clamp(parseIntOr(merged.limit, DEFAULT_PASSAGE_NOTES_QUERY.limit), 1, MAX_PAGE_SIZE),
    offset: Math.max(0, parseIntOr(merged.offset, DEFAULT_PASSAGE_NOTES_QUERY.offset)),
    sortOn: `${merged.sortOn ?? DEFAULT_PASSAGE_NOTES_QUERY.sortOn}`,
    sortDirection: pickEnum(merged.sortDirection, ['ascending', 'descending'], DEFAULT_PASSAGE_NOTES_QUERY.sortDirection),
    filterTags: Array.isArray(merged.filterTags) ? merged.filterTags : [],
    filterTagMatching: pickEnum(merged.filterTagMatching, ['any', 'all', 'exact'], DEFAULT_PASSAGE_NOTES_QUERY.filterTagMatching),
    searchText: typeof merged.searchText === 'string' ? merged.searchText : `${merged.searchText ?? ''}`,
    filterPassageStartVerseId: parseIntOr(merged.filterPassageStartVerseId, 0),
    filterPassageEndVerseId: parseIntOr(merged.filterPassageEndVerseId, 0),
    filterPassageMatching: pickEnum(merged.filterPassageMatching, ['inclusive', 'exclusive'], DEFAULT_PASSAGE_NOTES_QUERY.filterPassageMatching),
  };

  const out = {};

  if (normalized.limit !== DEFAULT_PASSAGE_NOTES_QUERY.limit) {
    out.limit = `${normalized.limit}`;
  }
  if (normalized.offset !== DEFAULT_PASSAGE_NOTES_QUERY.offset) {
    out.offset = `${normalized.offset}`;
  }
  if (normalized.sortOn !== DEFAULT_PASSAGE_NOTES_QUERY.sortOn) {
    out.sortOn = normalized.sortOn;
  }
  if (normalized.sortDirection !== DEFAULT_PASSAGE_NOTES_QUERY.sortDirection) {
    out.sortDirection = normalized.sortDirection;
  }

  const trimmedSearchText = `${normalized.searchText}`.trim();
  if (trimmedSearchText) {
    out.searchText = trimmedSearchText;
  }

  if (normalized.filterTags.length) {
    out.filterTags = normalized.filterTags.map(v => `${v}`);
  }

  // `exact` with no tags means "only untagged notes" (meaningful even without filterTags)
  if (
    normalized.filterTagMatching !== DEFAULT_PASSAGE_NOTES_QUERY.filterTagMatching ||
    (normalized.filterTagMatching === 'exact' && normalized.filterTags.length === 0)
  ) {
    out.filterTagMatching = normalized.filterTagMatching;
  }

  const hasPassageFilter = !!(normalized.filterPassageStartVerseId && normalized.filterPassageEndVerseId);
  if (hasPassageFilter) {
    out.filterPassageStartVerseId = `${normalized.filterPassageStartVerseId}`;
    out.filterPassageEndVerseId = `${normalized.filterPassageEndVerseId}`;
    if (normalized.filterPassageMatching !== DEFAULT_PASSAGE_NOTES_QUERY.filterPassageMatching) {
      out.filterPassageMatching = normalized.filterPassageMatching;
    }
  }

  return out;
}

export function defaultPassageNotesQuery() {
  return JSON.parse(JSON.stringify(DEFAULT_PASSAGE_NOTES_QUERY));
}
