/**
 * Knowledge Loader & Vector Store Engine — LangChain.js Edition
 *
 * Uses:
 *  - LangChain Document & RecursiveCharacterTextSplitter (@langchain/textsplitters)
 *  - LangChain GoogleGenerativeAIEmbeddings (@langchain/google-genai)
 *  - LangChain MemoryVectorStore (@langchain/classic/vectorstores/memory)
 *  - MongoDB for persistent raw context storage
 *  - Isolated Demo knowledge reader for temporary interactive modes
 */

import { Document } from '@langchain/core/documents';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { MemoryVectorStore } from '@langchain/classic/vectorstores/memory';
import { DEMO_PRESETS } from './demoPresets.js';
import fs from 'fs';
import path from 'path';

// ── Module-level caches ────────────────────────────────────────────────────────
let _cachedContext   = null;
let _cachedVectorStore = null;
let _cacheTime       = 0;
const CACHE_TTL      = 60000;

const _demoCache = new Map();

/**
 * Reads demo-specific knowledge context safely without modifying the database.
 */
export async function getDemoKnowledgeContext(demoId) {
  if (!demoId || !DEMO_PRESETS[demoId]) return null;

  if (_demoCache.has(demoId)) {
    return _demoCache.get(demoId);
  }

  try {
    const fileName = DEMO_PRESETS[demoId].fileName;
    const filePath = path.join(process.cwd(), 'public', 'demos', fileName);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8').trim();
      _demoCache.set(demoId, content);
      return content;
    }
  } catch (err) {
    console.error(`[KnowledgeLoader] Error loading demo knowledge for ${demoId}:`, err.message);
  }

  return null;
}

// ── Load & cache raw knowledge context from MongoDB or website-data.md ────────
export async function getKnowledgeContext() {
  const now = Date.now();
  if (_cachedContext !== null && (now - _cacheTime) < CACHE_TTL) {
    return _cachedContext;
  }

  // Load from local website-data.md as default ground truth
  let defaultFileContent = '';
  try {
    const filePath = path.join(process.cwd(), 'knowledge', 'website-data.md');
    if (fs.existsSync(filePath)) {
      defaultFileContent = fs.readFileSync(filePath, 'utf8').trim();
    }
  } catch (e) {}

  try {
    const dbConnect = (await import('@/lib/dbConnect')).default;
    const { AdminKnowledge } = await import('@/models');
    await dbConnect();
    const doc = await AdminKnowledge.findOne({ type: 'global' }).lean();
    
    // Check if doc exists and is genuine Chatio platform data (not leftover demo data)
    if (doc && doc.content && doc.content.length > 50) {
      const isDemoData = doc.content.includes('Bella Vista') || doc.content.includes('TechCart') || doc.content.includes('Wellness First') || doc.content.includes('Pixel & Ink');
      if (!isDemoData) {
        _cachedContext = doc.content.trim();
        _cacheTime = now;
        return _cachedContext;
      }
    }

    // If MongoDB had demo data or is empty, restore genuine Chatio manual to MongoDB
    if (defaultFileContent) {
      await AdminKnowledge.findOneAndUpdate(
        { type: 'global' },
        { $set: { content: defaultFileContent, type: 'global' } },
        { upsert: true }
      );
      _cachedContext = defaultFileContent;
      _cacheTime = now;
      return _cachedContext;
    }
  } catch (err) {
    console.error(`[KnowledgeLoader LangChain] ❌ Error loading from MongoDB via Mongoose:`, err.message);
  }

  if (defaultFileContent) {
    _cachedContext = defaultFileContent;
    _cacheTime = now;
    return _cachedContext;
  }

  _cachedContext = '';
  return _cachedContext;
}

export async function setKnowledgeContext(content) {
  const dbConnect = (await import('@/lib/dbConnect')).default;
  const { AdminKnowledge } = await import('@/models');
  await dbConnect();
  await AdminKnowledge.findOneAndUpdate(
    { type: 'global' },
    { $set: { content: content, type: 'global' } },
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
  _demoCache.clear();
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
 * Builds or retrieves the cached LangChain Vector Store index for global knowledge.
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

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
    separators: ['\n## Page: ', '\n# ', '\n## ', '\n### ', '\n\n', '\n', ' '],
  });

  const docs = await splitter.createDocuments([fullText]);
  const embeddings = getEmbeddings();
  _cachedVectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);
  return _cachedVectorStore;
}

/**
 * Retrieves context relevant to the user query using LangChain vector similarity search.
 * Limits chunk payload to ~3500 chars (~800 tokens) to prevent TPM rate limits on Groq free tier.
 */
export async function getRelevantContext(query, maxChars = 3500) {
  const fullContext = await getKnowledgeContext();
  if (!fullContext) return '';

  try {
    const vectorStore = await getVectorStore();
    const results = await vectorStore.similaritySearch(query, 4);

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
    return fullContext.slice(0, maxChars);
  }
}
