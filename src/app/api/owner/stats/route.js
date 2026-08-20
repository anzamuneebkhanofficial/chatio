import { NextResponse } from 'next/server';
import { isMasterOwnerRequest, getOwnerStats, parseDurationToSeconds } from '@/lib/ownerAuth';

export async function GET(req) {
  try {
    const isOwner = isMasterOwnerRequest(req);
    if (!isOwner) {
      return NextResponse.json({ error: 'Unauthorized master owner access.' }, { status: 401 });
    }

    const stats = await getOwnerStats();
    const expirySeconds = parseDurationToSeconds(process.env.OWNER_SESSION_EXPIRY || '7d');

    return NextResponse.json({
      ...stats,
      sessionExpirySeconds: expirySeconds,
      sessionExpiryFormatted: process.env.OWNER_SESSION_EXPIRY || '7d',
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

