import { SimpleDate } from '@mybiblelog/shared';

const DEFAULT_LOG_ENTRIES_QUERY = {
  limit: 10,
  offset: 0,
  sortDirection: 'descending', // 'ascending' | 'descending'
  startDate: '', // inclusive; YYYY-MM-DD
  endDate: '', // inclusive; YYYY-MM-DD
  filterPassageStartVerseId: 0,
  filterPassageEndVerseId: 0,
};

const MAX_PAGE_SIZE = 50;

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

function normalizeDateString(value) {
  const v = `${value ?? ''}`.trim();
  if (!v) { return ''; }
  return SimpleDate.validateString(v) ? v : '';
}

/**
 * Decode a vue-router `$route.query` object into a full log-entries query object.
 * @param {Record<string, any>} routeQuery
 * @returns {typeof DEFAULT_LOG_ENTRIES_QUERY}
 */
export function decodeLogEntriesRouteQuery(routeQuery = {}) {
  const filterPassageStartVerseId = parseIntOr(routeQuery.filterPassageStartVerseId, DEFAULT_LOG_ENTRIES_QUERY.filterPassageStartVerseId);
  const filterPassageEndVerseId = parseIntOr(routeQuery.filterPassageEndVerseId, DEFAULT_LOG_ENTRIES_QUERY.filterPassageEndVerseId);

  return {
    limit: clamp(parseIntOr(routeQuery.limit, DEFAULT_LOG_ENTRIES_QUERY.limit), 1, MAX_PAGE_SIZE),
    offset: Math.max(0, parseIntOr(routeQuery.offset, DEFAULT_LOG_ENTRIES_QUERY.offset)),
    sortDirection: pickEnum(routeQuery.sortDirection, ['ascending', 'descending'], DEFAULT_LOG_ENTRIES_QUERY.sortDirection),
    startDate: normalizeDateString(routeQuery.startDate),
    endDate: normalizeDateString(routeQuery.endDate),
    filterPassageStartVerseId: (filterPassageStartVerseId && filterPassageEndVerseId) ? filterPassageStartVerseId : 0,
    filterPassageEndVerseId: (filterPassageStartVerseId && filterPassageEndVerseId) ? filterPassageEndVerseId : 0,
  };
}

/**
 * Encode a log-entries query object into a vue-router `query` object.
 * Intended to be fully reproducible (includes sort + paging).
 * @param {Partial<typeof DEFAULT_LOG_ENTRIES_QUERY>} query
 * @returns {Record<string, any>}
 */
export function encodeLogEntriesQueryToRoute(query = {}) {
  const merged = { ...DEFAULT_LOG_ENTRIES_QUERY, ...(query || {}) };
  const normalized = {
    limit: clamp(parseIntOr(merged.limit, DEFAULT_LOG_ENTRIES_QUERY.limit), 1, MAX_PAGE_SIZE),
    offset: Math.max(0, parseIntOr(merged.offset, DEFAULT_LOG_ENTRIES_QUERY.offset)),
    sortDirection: pickEnum(merged.sortDirection, ['ascending', 'descending'], DEFAULT_LOG_ENTRIES_QUERY.sortDirection),
    startDate: normalizeDateString(merged.startDate),
    endDate: normalizeDateString(merged.endDate),
    filterPassageStartVerseId: parseIntOr(merged.filterPassageStartVerseId, 0),
    filterPassageEndVerseId: parseIntOr(merged.filterPassageEndVerseId, 0),
  };

  const out = {};

  if (normalized.limit !== DEFAULT_LOG_ENTRIES_QUERY.limit) {
    out.limit = `${normalized.limit}`;
  }
  if (normalized.offset !== DEFAULT_LOG_ENTRIES_QUERY.offset) {
    out.offset = `${normalized.offset}`;
  }
  if (normalized.sortDirection !== DEFAULT_LOG_ENTRIES_QUERY.sortDirection) {
    out.sortDirection = normalized.sortDirection;
  }

  if (normalized.startDate) {
    out.startDate = normalized.startDate;
  }
  if (normalized.endDate) {
    out.endDate = normalized.endDate;
  }

  const hasPassageFilter = !!(normalized.filterPassageStartVerseId && normalized.filterPassageEndVerseId);
  if (hasPassageFilter) {
    out.filterPassageStartVerseId = `${normalized.filterPassageStartVerseId}`;
    out.filterPassageEndVerseId = `${normalized.filterPassageEndVerseId}`;
  }

  return out;
}

export function defaultLogEntriesQuery() {
  return JSON.parse(JSON.stringify(DEFAULT_LOG_ENTRIES_QUERY));
}
