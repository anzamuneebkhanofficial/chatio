import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserBotConfig, updateUserBotConfig, getKnowledgeByAppId } from '@/lib/multiUserDb';
import { maskKey } from '@/lib/crypto';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const config = await getUserBotConfig(userId);
    const knowledge = await getKnowledgeByAppId(config.appId);
    const hasKnowledge = Boolean(knowledge && knowledge.trim().length > 10);

    return NextResponse.json({
      config: {
        ...config,
        hasKnowledge,
        knowledgeChars: knowledge ? knowledge.length : 0,
        geminiApiKeyMasked: maskKey(config.geminiApiKey),
        groqApiKeyMasked: maskKey(config.groqApiKey),
        geminiApiKey: config.geminiApiKey ? '********' : '',
        groqApiKey: config.groqApiKey ? '********' : '',
        customMongoUri: config.customMongoUri || '',
      },
      dbConnected: true,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));

    const allowedFields = [
      'botName', 'primaryColor', 'welcomeMessage', 'widgetTitle',
      'widgetDescription', 'footerText', 'avatarUrl', 'avatarBg', 'position',
      'suggestions', 'widgetWidth', 'widgetHeight',
      'systemPrompt', 'temperature', 'provider', 'isSetupComplete',
      'storageType'
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field];
      }
    }

    if (body.geminiApiKey && body.geminiApiKey !== '********') {
      updates.geminiApiKey = body.geminiApiKey;
    }
    if (body.groqApiKey && body.groqApiKey !== '********') {
      updates.groqApiKey = body.groqApiKey;
    }
    if ('customMongoUri' in body && body.customMongoUri !== '********') {
      updates.customMongoUri = body.customMongoUri;
    }

    const updated = await updateUserBotConfig(userId, updates);

    return NextResponse.json({
      success: true,
      config: {
        ...updated,
        geminiApiKeyMasked: maskKey(updated.geminiApiKey),
        groqApiKeyMasked: maskKey(updated.groqApiKey),
        geminiApiKey: '********',
        groqApiKey: '********',
        customMongoUri: updated.customMongoUri || '',
      },
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

