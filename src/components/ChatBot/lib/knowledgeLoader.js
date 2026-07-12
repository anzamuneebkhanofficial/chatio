/**
 * Knowledge Loader & Zero-Dependency RAG Engine v2 (MongoDB Edition)
 *
 * v2 Improvements:
 *  - Intent expansion: maps short words ("contact", "price") to domain synonyms
 *  - Currency/number-aware scoring (finds ₹2599 when user asks "price")
 *  - Multi-pass scoring: exact → substring → partial
 *  - Top-3 chunks always included regardless of score
 *  - Sliding window fallback for non-structured text
 *  - Chunk pre-caching after first build
 *  - Replaced fs with MongoDB
 */

import clientPromise from './mongodb';

// ── Module-level caches ────────────────────────────────────────────────────────
let _cachedContext = null;
let _cachedChunks  = null;
let _cacheTime = 0;
const CACHE_TTL = 60000;

// ── Universal Intent Expansion Map ─────────────────────────────────────────────
// Maps a short user word to universal business concepts.
// This is strictly domain-agnostic so it works for Restaurants, Real Estate, E-commerce, etc.
const INTENT_MAP = {
  contact:   ['contact', 'email', 'phone', 'whatsapp', 'address', 'reach', 'support', 'touch', 'call', 'message', 'social'],
  price:     ['price', 'cost', 'fee', 'charge', 'rate', 'pay', 'buy', 'purchase', 'offer', 'discount', 'sale', 'budget', 'amount'],
  about:     ['about', 'who', 'company', 'team', 'founder', 'history', 'mission', 'vision', 'story', 'brand'],
  owner:     ['owner', 'creator', 'founder', 'who made', 'belongs to', 'ceo', 'management'],
  location:  ['location', 'address', 'city', 'state', 'country', 'area', 'place', 'office', 'map', 'directions'],
  time:      ['time', 'hour', 'open', 'close', 'schedule', 'timing', 'available', 'duration', 'days'],
  service:   ['service', 'offer', 'provide', 'solution', 'work', 'help', 'assist', 'feature', 'package', 'product', 'item'],
  review:    ['review', 'rating', 'feedback', 'testimonial', 'star', 'opinion', 'experience', 'client', 'customer'],
};

// ── JSON parser ─────────────────────────────────────────────────────────────────
function parseJSON(raw) {
  try {
    const data = JSON.parse(raw);
    if (Array.isArray(data) && data[0]?.question && data[0]?.answer) {
      return data.map((item) => `Q: ${item.question}\nA: ${item.answer}`).join('\n\n---\n\n');
    }
    if (data.qa && Array.isArray(data.qa)) {
      return data.qa
        .map((item) => `Q: ${item.q || item.question}\nA: ${item.a || item.answer}`)
        .join('\n\n---\n\n');
    }
    return JSON.stringify(data, null, 2);
  } catch {
    return raw;
  }
}

// ── Load & cache raw knowledge context ─────────────────────────────────────────
export async function getKnowledgeContext() {
  const now = Date.now();
  if (_cachedContext !== null && (now - _cacheTime) < CACHE_TTL) {
    return _cachedContext;
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    const doc = await db.collection('knowledge').findOne({ type: 'global' });
    
    if (doc && doc.content) {
      // Assuming training panel may save as text or json, try parsing if json
      let raw = doc.content.trim();
      _cachedContext = raw.startsWith('{') || raw.startsWith('[') ? parseJSON(raw) : raw;
      _cacheTime = now;
      console.log(`[KnowledgeLoader] ✅ Loaded from MongoDB`);
      return _cachedContext;
    }
  } catch (err) {
    console.error(`[KnowledgeLoader] ❌ Error loading from MongoDB:`, err);
  }
  
  if (_cachedContext === null) {
      _cachedContext = ''; // fallback
  }
  return _cachedContext;
}

export async function setKnowledgeContext(content) {
  const client = await clientPromise;
  const db = client.db();
  await db.collection('knowledge').updateOne(
    { type: 'global' },
    { $set: { content: content, updatedAt: new Date() } },
    { upsert: true }
  );
  
  _cachedContext = content;
  _cachedChunks = null;
  _cacheTime = Date.now();
}

/** Clear caches (called after training to pick up new knowledge) */
export function clearKnowledgeCache() {
  _cachedContext = null;
  _cachedChunks  = null;
  _cacheTime = 0;
}

// ── Keyword extractor ───────────────────────────────────────────────────────────
const STOP_WORDS = new Set([
  'this', 'that', 'with', 'from', 'your', 'what', 'have', 'will', 'about',
  'more', 'also', 'some', 'they', 'their', 'been', 'when', 'than', 'then',
  'into', 'such', 'each', 'which', 'these', 'those', 'been', 'does', 'just',
]);

function getKeywords(text) {
  // Match letters/numbers including ₹ symbol
  return (text.toLowerCase().match(/[a-z0-9₹]+/g) || [])
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

// ── Query expander ──────────────────────────────────────────────────────────────
function expandQuery(queryWords) {
  const expanded = new Set(queryWords);
  for (const word of queryWords) {
    // Direct map hit
    const direct = INTENT_MAP[word];
    if (direct) direct.forEach((s) => expanded.add(s));

    // Partial key match (e.g. "pricing" matches key "price")
    for (const [key, synonyms] of Object.entries(INTENT_MAP)) {
      if (word.includes(key) || key.includes(word)) {
        synonyms.forEach((s) => expanded.add(s));
      }
    }
  }
  return [...expanded];
}

// ── Build & cache chunk array ───────────────────────────────────────────────────
async function getChunks() {
  if (_cachedChunks !== null) return _cachedChunks;

  const full = await getKnowledgeContext();
  if (!full) { _cachedChunks = []; return []; }

  // Strategy 1: crawler-style page markers  "## Page:"
  let chunks = full.split(/(?=## Page: )/g).filter((c) => c.trim().length > 80);

  // Strategy 2: generic markdown headings / HR separators
  if (chunks.length < 3) {
    chunks = full.split(/(?=\n#{1,3} |\n\n---)/g).filter((c) => c.trim().length > 80);
  }

  // Strategy 3: sliding window (plain text files)
  if (chunks.length < 3) {
    chunks = [];
    const WINDOW = 1200;
    const OVERLAP = 300;
    for (let i = 0; i < full.length; i += WINDOW - OVERLAP) {
      const slice = full.slice(i, i + WINDOW);
      if (slice.trim().length > 80) chunks.push(slice);
    }
  }

  _cachedChunks = chunks;
  console.log(`[KnowledgeLoader] 📦 Built ${chunks.length} RAG chunks from knowledge base`);
  return chunks;
}

// ── Main RAG Engine (BM25 Implementation) ──────────────────────────────────
function scoreBM25(queryKeywords, chunks) {
  const N = chunks.length;
  if (N === 0) return [];

  // BM25 Constants
  const k1 = 1.5; // Term frequency saturation
  const b = 0.75; // Document length normalization

  // Calculate average document length
  const lengths = chunks.map(c => getKeywords(c).length);
  const avgdl = lengths.reduce((a, b) => a + b, 0) / N || 1;

  // Calculate Document Frequency (DF) for each keyword
  const df = {};
  for (const kw of queryKeywords) {
    df[kw] = chunks.filter(c => c.toLowerCase().includes(kw)).length;
  }

  // Calculate Inverse Document Frequency (IDF)
  const idf = {};
  for (const kw of queryKeywords) {
    // Standard BM25 IDF formula with +0.5 smoothing
    idf[kw] = Math.log(1 + (N - df[kw] + 0.5) / (df[kw] + 0.5));
  }

  // Score each chunk
  return chunks.map((chunk, index) => {
    const chunkKeywords = getKeywords(chunk);
    const dl = chunkKeywords.length;
    let score = 0;

    // Term frequency in this specific chunk
    const tf = {};
    for (const w of chunkKeywords) tf[w] = (tf[w] || 0) + 1;

    for (const kw of queryKeywords) {
      // 1. Exact match using BM25
      if (tf[kw]) {
        const numerator = tf[kw] * (k1 + 1);
        const denominator = tf[kw] + k1 * (1 - b + b * (dl / avgdl));
        score += idf[kw] * (numerator / denominator);
      }
      
      // 2. Partial word match fallback (e.g. "pricing" matches "price")
      if (!tf[kw] && chunk.toLowerCase().includes(kw)) {
        score += idf[kw] * 0.5; // Half weight for partial matches
      }
    }

    return { chunk, score, index };
  });
}

/**
 * Returns the most relevant sections of the knowledge base for the user's query.
 * Uses intent expansion + BM25 scoring for highly accurate retrieval.
 *
 * @param {string} query    - The user's message
 * @param {number} maxChars - Hard character cap for the returned context
 * @returns {string}        - Relevant knowledge text to inject into system prompt
 */
export async function getRelevantContext(query, maxChars = 15000) {
  const fullContext = await getKnowledgeContext();
  if (!fullContext) return '';

  if (fullContext.length <= maxChars) return fullContext;

  const chunks = await getChunks();
  if (chunks.length === 0) return '';

  const baseKeywords = getKeywords(query);
  const allKeywords  = expandQuery(baseKeywords);

  if (allKeywords.length === 0) {
    return chunks.slice(0, 4).join('\n\n').slice(0, maxChars);
  }

  // ── BM25 Scoring ──────────────────────────────────────────────────────────
  const scoredChunks = scoreBM25(allKeywords, chunks);

  // ── Universal Heuristics (Bonus Boosters) ───────────────────────────
  const isPriceQuery = baseKeywords.some(k => ['price', 'cost', 'fee', 'buy', 'budget', 'pay'].includes(k));
  const isContactQuery = baseKeywords.some(k => ['contact', 'email', 'phone', 'reach'].includes(k));

  for (const item of scoredChunks) {
    if (item.score === 0) continue; // Only boost chunks that actually matched the query

    if (isPriceQuery && /[\$€£₹¥]|\d{2,}/.test(item.chunk)) {
      item.score += 2.0; // Boost chunks containing global currency symbols or numbers
    }
    if (isContactQuery && /(@|\+\d{1,3}|\b\d{3}[-.]?\d{3}[-.]?\d{4}\b)/.test(item.chunk)) {
      item.score += 2.0; // Boost chunks containing emails (@) or phone numbers
    }
  }

  // Sort by score desc, then by original order for ties
  scoredChunks.sort((a, b) => b.score - a.score || a.index - b.index);

  // ── Assemble result ───────────────────────────────────────────────────────
  let result = '';
  const ALWAYS_INCLUDE = 2; // Always include top 2 chunks (usually homepage/about)

  for (let i = 0; i < scoredChunks.length; i++) {
    const { chunk, score } = scoredChunks[i];

    if (i >= ALWAYS_INCLUDE && score <= 0) continue;

    if (result.length + chunk.length > maxChars) {
      if (result.length > 0) break;
    }

    result += chunk + '\n\n';
  }

  if (!result.trim()) {
    result = chunks.slice(0, 3).join('\n\n').slice(0, maxChars);
  }

  return result.trim();
}
