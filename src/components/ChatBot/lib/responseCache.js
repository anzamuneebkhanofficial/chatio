/**
 * High-Performance Bounded TTL Response Cache
 *
 * Features:
 *  - Bounded size (Max 500 entries) with LRU eviction to prevent memory leaks.
 *  - Time-To-Live (TTL): 10 minutes default. Automatically prunes expired entries.
 *  - Multi-tenant isolated keys: `${scope}_${normalizedText}_${historyDepth}`.
 *  - Smart invalidation: Instantly clears cache for a specific bot or global scope upon training.
 */

const MAX_CACHE_ENTRIES = 500;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// Map preserves insertion order for LRU eviction
const _cache = new Map();

function normalizeQuery(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '') // remove punctuation
    .replace(/\s+/g, ' ');
}

function createCacheKey(scope, text, historyDepth = 1) {
  const cleanScope = scope || 'global';
  const cleanQuery = normalizeQuery(text);
  return `${cleanScope}:::h${historyDepth}:::${cleanQuery}`;
}

/**
 * Retrieves a cached AI response if available and not expired.
 */
export function getResponseFromCache(scope, userText, historyDepth = 1) {
  if (!userText || userText.length < 2) return null;

  const key = createCacheKey(scope, userText, historyDepth);
  const entry = _cache.get(key);

  if (!entry) return null;

  const now = Date.now();
  if (now - entry.createdAt > CACHE_TTL_MS) {
    _cache.delete(key);
    return null;
  }

  // Refresh LRU position by re-inserting
  _cache.delete(key);
  _cache.set(key, entry);

  return {
    text: entry.text,
    provider: entry.provider,
  };
}

/**
 * Saves an AI response to the cache with LRU eviction.
 */
export function saveResponseToCache(scope, userText, historyDepth = 1, responseObj) {
  if (!userText || !responseObj?.text) return;

  const key = createCacheKey(scope, userText, historyDepth);

  // LRU Eviction: Remove oldest entry if limit reached
  if (_cache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = _cache.keys().next().value;
    if (oldestKey) _cache.delete(oldestKey);
  }

  _cache.set(key, {
    text: responseObj.text,
    provider: responseObj.provider || 'AI',
    createdAt: Date.now(),
  });
}

/**
 * Invalidates cache entries for a specific scope (appId / global) or all entries.
 */
export function invalidateResponseCache(scope = null) {
  if (!scope) {
    _cache.clear();
    return;
  }

  const prefix = `${scope}:::`;
  for (const key of _cache.keys()) {
    if (key.startsWith(prefix)) {
      _cache.delete(key);
    }
  }
}

/**
 * Returns current cache metrics for monitoring.
 */
export function getCacheStats() {
  return {
    size: _cache.size,
    maxSize: MAX_CACHE_ENTRIES,
    ttlMinutes: CACHE_TTL_MS / 60000,
  };
}
