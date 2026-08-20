import { NextResponse } from 'next/server';
import { getBotConfig, updateBotConfig } from '@/components/ChatBot/lib/dbConfig';
import { maskKey } from '@/lib/crypto';
import { isMasterOwnerRequest } from '@/lib/ownerAuth';

export async function GET(req) {
  try {
    if (!isMasterOwnerRequest(req)) {
      return NextResponse.json({ error: 'Unauthorized: Master owner access required.' }, { status: 401 });
    }

    const config = await getBotConfig();
    const safeConfig = {
      ...config,
      geminiApiKey: maskKey(config.geminiApiKey),
      groqApiKey: maskKey(config.groqApiKey),
      hasGeminiKey: Boolean(config.geminiApiKey),
      hasGroqKey: Boolean(config.groqApiKey),
    };

    return NextResponse.json({ config: safeConfig, dbConnected: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


export async function POST(req) {
  try {
    if (!isMasterOwnerRequest(req)) {
      return NextResponse.json({ error: 'Unauthorized: Master owner access required.' }, { status: 401 });
    }

    const updates = await req.json();

    if (updates.geminiApiKey && updates.geminiApiKey.includes('•')) {
      delete updates.geminiApiKey;
    }
    if (updates.groqApiKey && updates.groqApiKey.includes('•')) {
      delete updates.groqApiKey;
    }

    const updatedConfig = await updateBotConfig(updates);
    const safeConfig = {
      ...updatedConfig,
      geminiApiKey: maskKey(updatedConfig.geminiApiKey),
      groqApiKey: maskKey(updatedConfig.groqApiKey),
    };

    return NextResponse.json({ ok: true, config: safeConfig });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
