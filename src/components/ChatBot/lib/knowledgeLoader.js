/**
 * Knowledge Loader & Vector Store Engine — LangChain.js Edition
 *
 * Uses:
 *  - LangChain Document & RecursiveCharacterTextSplitter (@langchain/textsplitters)
 *  - LangChain GoogleGenerativeAIEmbeddings (@langchain/google-genai)
 *  - LangChain MemoryVectorStore (@langchain/classic/vectorstores/memory)
 *  - MongoDB for persistent raw context storage
 */

import clientPromise from './mongodb.js';
import { Document } from '@langchain/core/documents';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { MemoryVectorStore } from '@langchain/classic/vectorstores/memory';

// ── Module-level caches ────────────────────────────────────────────────────────
let _cachedContext   = null;
let _cachedVectorStore = null;
let _cacheTime       = 0;
const CACHE_TTL      = 60000;

// ── Load & cache raw knowledge context from MongoDB ─────────────────────────────
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
      _cachedContext = doc.content.trim();
      _cacheTime = now;
      console.log(`[KnowledgeLoader LangChain] ✅ Loaded raw context from MongoDB`);
      return _cachedContext;
    }
  } catch (err) {
    console.error(`[KnowledgeLoader LangChain] ❌ Error loading from MongoDB:`, err);
  }
  
  if (_cachedContext === null) {
    _cachedContext = '';
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
  _cachedVectorStore = null;
  _cacheTime = Date.now();
}

/** Clear caches (called after training to force vector index rebuild) */
export function clearKnowledgeCache() {
  _cachedContext     = null;
  _cachedVectorStore = null;
  _cacheTime         = 0;
}

/**
 * Creates or gets the cached LangChain Embeddings instance.
 */
function getEmbeddings() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error('GEMINI_API_KEY is required for embedding generation.');
  }

  return new GoogleGenerativeAIEmbeddings({
    apiKey,
    modelName: 'gemini-embedding-001',
  });
}

/**
 * Builds or retrieves the cached LangChain Vector Store index.
 */
export async function getVectorStore() {
  if (_cachedVectorStore !== null) {
    return _cachedVectorStore;
  }

  const fullText = await getKnowledgeContext();
  if (!fullText || !fullText.trim()) {
    const embeddings = getEmbeddings();
    _cachedVectorStore = await MemoryVectorStore.fromTexts(['No knowledge loaded.'], [{ id: 1 }], embeddings);
    return _cachedVectorStore;
  }

  // Use LangChain RecursiveCharacterTextSplitter
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
    separators: ['\n## Page: ', '\n# ', '\n## ', '\n### ', '\n\n', '\n', ' '],
  });

  const docs = await splitter.createDocuments([fullText]);
  console.log(`[KnowledgeLoader LangChain] 📦 Created ${docs.length} document chunks using RecursiveCharacterTextSplitter`);

  const embeddings = getEmbeddings();
  _cachedVectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);
  return _cachedVectorStore;
}

/**
 * Returns a LangChain Vector Store Retriever instance.
 */
export async function getRetriever(k = 4) {
  const store = await getVectorStore();
  return store.asRetriever(k);
}

/**
 * Retrieves context relevant to the user query using LangChain vector similarity search.
 *
 * @param {string} query    - User's message
 * @param {number} maxChars - Cap for returned context characters
 * @returns {Promise<string>} Relevant text context
 */
export async function getRelevantContext(query, maxChars = 15000) {
  const fullContext = await getKnowledgeContext();
  if (!fullContext) return '';
  if (fullContext.length <= maxChars) return fullContext;

  try {
    const vectorStore = await getVectorStore();
    const results = await vectorStore.similaritySearch(query, 5);

    if (!results || results.length === 0) {
      return fullContext.slice(0, maxChars);
    }

    let combined = '';
    for (const doc of results) {
      if (combined.length + doc.pageContent.length > maxChars) {
        if (combined.length > 0) break;
      }
      combined += doc.pageContent + '\n\n';
    }

    return combined.trim() || fullContext.slice(0, maxChars);
  } catch (err) {
    console.error(`[KnowledgeLoader LangChain] ⚠️ Similarity search failed (${err.message}). Falling back to raw context slice.`);
    return fullContext.slice(0, maxChars);
  }
}

