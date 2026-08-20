import mongoose from 'mongoose';
import dbConnect from '@/lib/dbConnect';

// In-memory cache for active tenant custom database connections
const customDbCache = new Map();

/**
 * Resolves a database connection for a tenant bot.
 * If user selected 'custom' and provided a valid customMongoUri, connects dynamically
 * with a 5-second connection timeout guard.
 * Falls back safely to the central platform database if custom connection fails or drops.
 *
 * @param {string} storageType - 'managed' | 'custom'
 * @param {string} customMongoUri - Decrypted MongoDB connection URI string
 * @returns {Promise<mongoose.Connection>}
 */
export async function getTenantDbConnection(storageType = 'managed', customMongoUri = '') {
  // Option 1: Managed Platform Storage (Default)
  if (storageType !== 'custom' || !customMongoUri || !customMongoUri.trim()) {
    return await dbConnect();
  }

  const cleanUri = customMongoUri.trim();

  // Return cached active connection if available
  if (customDbCache.has(cleanUri)) {
    const cachedConn = customDbCache.get(cleanUri);
    if (cachedConn && cachedConn.readyState === 1) {
      return cachedConn;
    }
  }

  // Option 2: Connect to User's Custom MongoDB Atlas Cluster
  try {
    // LRU connection pool eviction guard (max 50 active tenant DB pools in memory)
    if (customDbCache.size >= 50) {
      const oldestKey = customDbCache.keys().next().value;
      const oldestConn = customDbCache.get(oldestKey);
      try { oldestConn?.close(); } catch (e) {}
      customDbCache.delete(oldestKey);
    }

    const customConn = await mongoose.createConnection(cleanUri, {
      serverSelectionTimeoutMS: 5000, // 5s safety guard against hanging or broken URIs
      maxPoolSize: 10,
    }).asPromise();

    customDbCache.set(cleanUri, customConn);
    return customConn;
  } catch (error) {
    console.warn('[Dynamic DB] Failed to connect to user custom MongoDB URI, falling back to central DB:', error.message);
    // Safety Fallback: Return central database connection so the app NEVER crashes!
    return await dbConnect();
  }
}
