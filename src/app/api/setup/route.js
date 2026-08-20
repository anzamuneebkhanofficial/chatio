import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { updateBotConfig, getBotConfig } from '@/components/ChatBot/lib/dbConfig';
import { hashPassword } from '@/lib/crypto';
import { ChatGoogle } from '@langchain/google';
import { ChatGroq } from '@langchain/groq';

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action } = body;

    // STEP 1: Test MongoDB Connection URL
    if (action === 'test-db') {
      const { mongoUri } = body;
      if (!mongoUri) {
        return NextResponse.json({ ok: false, error: 'MongoDB connection URL is required.' }, { status: 400 });
      }

      try {
        const conn = await mongoose.createConnection(mongoUri, { serverSelectionTimeoutMS: 5000 }).asPromise();
        await conn.close();
        return NextResponse.json({ ok: true, message: 'MongoDB connection successful!' });
      } catch (err) {
        return NextResponse.json({ ok: false, error: `Failed to connect: ${err.message}` }, { status: 400 });
      }
    }

    // STEP 2: Test AI Provider Keys
    if (action === 'test-keys') {
      const { geminiKey, groqKey } = body;
      const results = {};

      if (geminiKey) {
        try {
          const gemini = new ChatGoogle({ apiKey: geminiKey, modelName: 'gemini-3.6-flash' });
          await gemini.invoke('hi');
          results.gemini = { ok: true, message: 'Gemini API key is valid!' };
        } catch (err) {
          results.gemini = { ok: false, error: `Gemini key error: ${err.message}` };
        }
      }

      if (groqKey) {
        try {
          const groq = new ChatGroq({ apiKey: groqKey, model: 'openai/gpt-oss-120b' });
          await groq.invoke('hi');
          results.groq = { ok: true, message: 'Groq API key is valid!' };
        } catch (err) {
          results.groq = { ok: false, error: `Groq key error: ${err.message}` };
        }
      }

      return NextResponse.json({ ok: true, results });
    }

    // STEP 3: Verify License Key
    if (action === 'verify-license') {
      const { licenseKey, domain } = body;
      if (!licenseKey) {
        return NextResponse.json({ ok: false, error: 'License key is required.' }, { status: 400 });
      }

      // Check external license server if configured, else fall back to pattern check
      const licenseServerUrl = process.env.LICENSE_API_URL || '';
      let status = 'valid';

      if (licenseServerUrl) {
        try {
          const res = await fetch(`${licenseServerUrl}/api/license/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ licenseKey, domain }),
          });
          const data = await res.json();
          status = data.valid ? 'valid' : 'invalid';
        } catch (err) {
          console.warn('[Setup API] License server unreachable, entering grace period:', err.message);
          status = 'grace_period';
        }
      } else {
        // Fallback local pattern verification for standalone/offline deployment
        status = licenseKey.trim().length >= 8 ? 'valid' : 'invalid';
      }

      return NextResponse.json({ ok: status === 'valid' || status === 'grace_period', status });
    }

    // STEP 4: Complete Setup Wizard
    if (action === 'complete-setup') {
      const {
        mongoUri,
        geminiApiKey,
        groqApiKey,
        licenseKey,
        ownerPassword,
        botName,
        primaryColor,
      } = body;

      if (!ownerPassword || ownerPassword.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters long.' }, { status: 400 });
      }

      const passwordHash = hashPassword(ownerPassword);

      const updated = await updateBotConfig({
        isSetupComplete: true,
        ownerPasswordHash: passwordHash,
        geminiApiKey: geminiApiKey || '',
        groqApiKey: groqApiKey || '',
        licenseKey: licenseKey || '',
        licenseStatus: 'valid',
        botName: botName || 'Chatio Assistant',
        primaryColor: primaryColor || '#6366f1',
      });

      const response = NextResponse.json({ success: true, message: 'Setup completed successfully!' });
      response.cookies.set('owner_session', passwordHash, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      });

      return response;
    }

    return NextResponse.json({ error: 'Invalid setup action.' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
