import dbConnect from '@/lib/dbConnect';
import { getTenantDbConnection } from '@/lib/dynamicDb';
import { UserConfig, UserKnowledge, AdminConfig } from '@/models';
import { encryptText, decryptText } from '@/lib/crypto';

export const DEFAULT_USER_CONFIG = {
  botName: 'My AI Assistant',
  primaryColor: '#6366f1',
  welcomeMessage: 'Hello! I am your AI assistant. How can I help you today?',
  widgetTitle: 'AI Assistant',
  widgetDescription: 'Online · Always Ready',
  footerText: 'POWERED BY CHATIO BY ANZA',
  avatarUrl: '',
  avatarBg: 'transparent',
  position: 'bottom-right',
  suggestions: [
    { label: 'Pricing & Plans', prompt: 'What are your pricing plans and packages?' },
    { label: 'How It Works', prompt: 'Can you explain how this service works?' },
    { label: 'Customer Support', prompt: 'How can I get in touch with customer support?' },
    { label: 'Features & Benefits', prompt: 'What key features and benefits do you offer?' },
  ],
  systemPrompt: `You are a helpful AI assistant. Answer visitor questions clearly, concisely, and professionally based on the knowledge base provided.`,
  temperature: 0.3,
  provider: 'gemini',
  geminiApiKey: '',
  groqApiKey: '',
  widgetWidth: '480px',
  widgetHeight: '680px',
  storageType: 'managed',
  customMongoUri: '',
  isSetupComplete: false,
};

/**
 * Generate unique appId for user chatbot
 */
export function generateAppId() {
  return 'bot_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

/**
 * Get or create bot config for a given user via Mongoose
 */
export async function getUserBotConfig(userId) {
  try {
    await dbConnect();
    let doc = await UserConfig.findOne({ userId }).lean();

    if (!doc) {
      const newAppId = generateAppId();
      const created = await UserConfig.create({
        userId,
        appId: newAppId,
      });
      doc = created.toObject();
    } else if (!doc.appId) {
      const newAppId = generateAppId();
      await UserConfig.updateOne({ _id: doc._id }, { $set: { appId: newAppId } });
      doc.appId = newAppId;
    }

    const decryptedUri = doc.customMongoUri ? decryptText(doc.customMongoUri) : '';

    // If custom database is active, load 100% of the bot config from the custom database
    if (doc.storageType === 'custom' && decryptedUri) {
      try {
        const tenantConn = await getTenantDbConnection('custom', decryptedUri);
        const DynamicConfig = tenantConn.models.UserConfig || tenantConn.model('UserConfig', UserConfig.schema);
        const customDoc = await DynamicConfig.findOne({ userId }).lean();
        if (customDoc) {
          doc = {
            ...DEFAULT_USER_CONFIG,
            ...customDoc,
            userId,
            appId: doc.appId,
            storageType: 'custom',
            customMongoUri: doc.customMongoUri,
          };
        }
      } catch (err) {
        console.warn('[multiUserDb] Could not read config from custom DB, using defaults:', err.message);
      }
    }

    return {
      ...DEFAULT_USER_CONFIG,
      ...doc,
      suggestions: Array.isArray(doc.suggestions) && doc.suggestions.length > 0 ? doc.suggestions : DEFAULT_USER_CONFIG.suggestions,
      geminiApiKey: doc.geminiApiKey ? decryptText(doc.geminiApiKey) : '',
      groqApiKey: doc.groqApiKey ? decryptText(doc.groqApiKey) : '',
      customMongoUri: decryptedUri,
    };
  } catch (err) {
    console.error('[multiUserDb] Mongoose getUserBotConfig error:', err.message);
    return { ...DEFAULT_USER_CONFIG, userId, appId: 'default' };
  }
}

/**
 * Get bot config by appId (public widget API) via Mongoose
 */
export async function getBotConfigByAppId(appId) {
  try {
    await dbConnect();
    let doc = await UserConfig.findOne({ appId }).lean();

    if (!doc) {
      doc = await AdminConfig.findById('singleton').lean();
    }

    if (!doc) {
      return { ...DEFAULT_USER_CONFIG, appId: appId || 'default' };
    }

    const decryptedUri = doc.customMongoUri ? decryptText(doc.customMongoUri) : '';

    // If custom DB is active, fetch latest config from custom DB
    if (doc.storageType === 'custom' && decryptedUri) {
      try {
        const tenantConn = await getTenantDbConnection('custom', decryptedUri);
        const DynamicConfig = tenantConn.models.UserConfig || tenantConn.model('UserConfig', UserConfig.schema);
        const customDoc = await DynamicConfig.findOne({ appId }).lean();
        if (customDoc) {
          doc = {
            ...DEFAULT_USER_CONFIG,
            ...customDoc,
            appId,
            storageType: 'custom',
            customMongoUri: doc.customMongoUri,
          };
        }
      } catch (err) {
        console.warn('[multiUserDb] Could not read bot config from custom DB:', err.message);
      }
    }

    return {
      ...DEFAULT_USER_CONFIG,
      ...doc,
      suggestions: Array.isArray(doc.suggestions) && doc.suggestions.length > 0 ? doc.suggestions : DEFAULT_USER_CONFIG.suggestions,
      geminiApiKey: doc.geminiApiKey ? decryptText(doc.geminiApiKey) : '',
      groqApiKey: doc.groqApiKey ? decryptText(doc.groqApiKey) : '',
      customMongoUri: decryptedUri,
    };
  } catch (err) {
    console.error('[multiUserDb] Mongoose getBotConfigByAppId error:', err.message);
    return { ...DEFAULT_USER_CONFIG, appId: appId || 'default' };
  }
}

/**
 * Update user bot config via Mongoose & Sync to Custom DB if Option 2 is chosen
 */
export async function updateUserBotConfig(userId, updates) {
  await dbConnect();
  const toSave = { ...updates };

  if ('geminiApiKey' in updates && updates.geminiApiKey) {
    toSave.geminiApiKey = encryptText(updates.geminiApiKey);
  }
  if ('groqApiKey' in updates && updates.groqApiKey) {
    toSave.groqApiKey = encryptText(updates.groqApiKey);
  }
  if ('customMongoUri' in updates && updates.customMongoUri) {
    toSave.customMongoUri = encryptText(updates.customMongoUri);
  }

  // Determine effective storage type and custom Mongo URI
  const existingDoc = await UserConfig.findOne({ userId }).lean();
  const effectiveStorageType = updates.storageType || existingDoc?.storageType || 'managed';
  const rawCustomUri = updates.customMongoUri
    ? updates.customMongoUri
    : (existingDoc?.customMongoUri ? decryptText(existingDoc.customMongoUri) : '');

  if (effectiveStorageType === 'custom' && rawCustomUri) {
    // ── OPTION 2: BYODB MODE ──
    // 1. Central database holds ONLY the routing pointer ($unset any personal bot fields)
    const centralPointer = {
      userId,
      appId: existingDoc?.appId || toSave.appId || generateAppId(),
      storageType: 'custom',
      customMongoUri: toSave.customMongoUri || existingDoc?.customMongoUri || encryptText(rawCustomUri),
    };

    await UserConfig.collection.updateOne(
      { userId },
      {
        $set: centralPointer,
        $unset: {
          botName: '',
          widgetTitle: '',
          widgetDescription: '',
          welcomeMessage: '',
          footerText: '',
          avatarUrl: '',
          avatarBg: '',
          primaryColor: '',
          position: '',
          suggestions: '',
          systemPrompt: '',
          temperature: '',
          provider: '',
          geminiApiKey: '',
          groqApiKey: '',
          widgetWidth: '',
          widgetHeight: '',
          isSetupComplete: '',
        },
      },
      { upsert: true }
    );

    // 2. User custom database (e.g. poo2026) holds 100% of the bot config, customization, and keys
    try {
      const tenantConn = await getTenantDbConnection('custom', rawCustomUri);
      const DynamicConfig = tenantConn.models.UserConfig || tenantConn.model('UserConfig', UserConfig.schema);
      await DynamicConfig.findOneAndUpdate(
        { userId },
        { $set: { ...toSave, userId, appId: centralPointer.appId } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    } catch (customErr) {
      console.warn('[multiUserDb] Warning: Failed to write user_config to custom DB:', customErr.message);
    }
  } else {
    // ── OPTION 1: MANAGED CLOUD MODE ──
    // Central database holds 100% of config
    await UserConfig.findOneAndUpdate(
      { userId },
      { $set: toSave },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  return await getUserBotConfig(userId);
}

/**
 * Load knowledge context by appId via Mongoose or Dynamic Tenant Connection
 */
export async function getKnowledgeByAppId(appId) {
  try {
    const config = await getBotConfigByAppId(appId);
    if (config?.storageType === 'custom' && config?.customMongoUri) {
      const tenantConn = await getTenantDbConnection('custom', config.customMongoUri);
      const DynamicKnowledge = tenantConn.models.UserKnowledge || tenantConn.model('UserKnowledge', UserKnowledge.schema);
      const doc = await DynamicKnowledge.findOne({ appId }).lean();
      return doc?.content || '';
    }

    await dbConnect();
    const doc = await UserKnowledge.findOne({ appId }).lean();
    return doc?.content || '';
  } catch (err) {
    console.error('[multiUserDb] getKnowledgeByAppId error:', err.message);
    return '';
  }
}

/**
 * Save knowledge context by appId via Mongoose or Dynamic Tenant Connection
 */
export async function saveKnowledgeByAppId(appId, userId, content) {
  const config = await getBotConfigByAppId(appId);
  if (config?.storageType === 'custom' && config?.customMongoUri) {
    const tenantConn = await getTenantDbConnection('custom', config.customMongoUri);
    const DynamicKnowledge = tenantConn.models.UserKnowledge || tenantConn.model('UserKnowledge', UserKnowledge.schema);
    await DynamicKnowledge.findOneAndUpdate(
      { appId },
      { $set: { appId, userId, content } },
      { upsert: true }
    );
    // Ensure zero duplicate knowledge documents remain in the central database
    try {
      await dbConnect();
      await UserKnowledge.deleteOne({ appId });
    } catch (e) {}
    return;
  }

  await dbConnect();
  await UserKnowledge.findOneAndUpdate(
    { appId },
    { $set: { appId, userId, content } },
    { upsert: true }
  );
}

export const saveKnowledge = saveKnowledgeByAppId;
