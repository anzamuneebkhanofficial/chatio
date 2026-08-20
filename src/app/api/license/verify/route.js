import { NextResponse } from 'next/server';
import { getBotConfig, updateBotConfig } from '@/components/ChatBot/lib/dbConfig';

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { licenseKey, domain } = body;

    const config = await getBotConfig();
    const keyToCheck = licenseKey || config.licenseKey;

    if (!keyToCheck) {
      return NextResponse.json({ valid: false, status: 'invalid', message: 'No license key provided.' });
    }

    const licenseServerUrl = process.env.LICENSE_API_URL || '';

    if (licenseServerUrl) {
      try {
        const res = await fetch(`${licenseServerUrl}/api/license/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ licenseKey: keyToCheck, domain }),
        });

        const data = await res.json();
        const status = data.valid ? 'valid' : 'invalid';
        await updateBotConfig({ licenseStatus: status });

        return NextResponse.json({ valid: data.valid, status, domain });
      } catch (err) {
        console.warn('[License API] Verification server offline, maintaining grace period:', err.message);
        // Fail open for widget, enter grace_period status
        await updateBotConfig({ licenseStatus: 'grace_period' });
        return NextResponse.json({ valid: true, status: 'grace_period', domain });
      }
    }

    // Standalone local verification logic
    const isValid = Boolean(keyToCheck && keyToCheck.trim().length >= 8);
    const status = isValid ? 'valid' : 'invalid';
    await updateBotConfig({ licenseStatus: status });

    return NextResponse.json({ valid: isValid, status, domain });
  } catch (err) {
    return NextResponse.json({ valid: true, status: 'grace_period', error: err.message });
  }
}
