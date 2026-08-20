/**
 * Parses human-readable duration strings (e.g., '7d', '1d', '12h', '4h', '15m', '2m', '30s') into seconds.
 */
export function parseDurationToSeconds(input) {
  if (!input) return 7 * 24 * 60 * 60; // default 7 days (604,800s)

  const str = String(input).trim().toLowerCase();

  // If pure number string, treat as seconds
  if (/^\d+$/.test(str)) {
    return Math.max(10, parseInt(str, 10));
  }

  const match = str.match(/^(\d+(?:\.\d+)?)\s*([smhdw])$/);
  if (!match) {
    return 7 * 24 * 60 * 60; // fallback 7 days
  }

  const value = parseFloat(match[1]);
  const unit = match[2];

  switch (unit) {
    case 's': // seconds
      return Math.max(10, Math.round(value));
    case 'm': // minutes
      return Math.round(value * 60);
    case 'h': // hours
      return Math.round(value * 60 * 60);
    case 'd': // days
      return Math.round(value * 24 * 60 * 60);
    case 'w': // weeks
      return Math.round(value * 7 * 24 * 60 * 60);
    default:
      return 7 * 24 * 60 * 60;
  }
}

export function isMasterOwnerRequest(req) {
  const masterPassword = process.env.OWNER_PASSWORD || 'pakistan';


  // 1. Check req.cookies (NextRequest)
  if (req && req.cookies && typeof req.cookies.get === 'function') {
    const ownerCookie = req.cookies.get('owner_session');
    if (ownerCookie && (ownerCookie.value === 'master_authorized' || ownerCookie.value === masterPassword)) {
      return true;
    }
  }

  // 2. Check Cookie Header
  const cookieHeader = req?.headers?.get?.('cookie') || '';
  const match = cookieHeader.match(/owner_session=([^;]+)/);
  if (match) {
    const sessionVal = decodeURIComponent(match[1]);
    if (sessionVal === 'master_authorized' || sessionVal === masterPassword) {
      return true;
    }
  }

  // 3. Check Authorization Header
  const authHeader = req?.headers?.get?.('authorization') || '';
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '').trim();
    if (token === masterPassword || token === 'master_authorized') {
      return true;
    }
  }

  return false;
}


export async function getOwnerStats() {
  try {
    const dbConnect = (await import('@/lib/dbConnect')).default;
    const { User, UserConfig, UserKnowledge } = await import('@/models');
    await dbConnect();

    const userConfigs = await UserConfig.find({}).sort({ createdAt: -1 }).lean();
    const totalKnowledgeBases = await UserKnowledge.countDocuments();
    let legacyUsers = [];
    try {
      legacyUsers = await User.find({}).lean();
    } catch {
      legacyUsers = [];
    }

    const userList = userConfigs.map((bot) => {
      const legacy = legacyUsers.find((u) => u._id === bot.userId || u.appId === bot.appId);
      return {
        id: bot.userId || bot._id,
        email: legacy?.email || `user_${bot.userId.slice(-6)}`,
        name: legacy?.name || bot.botName || 'Chatio User',
        createdAt: bot.createdAt,
        botName: bot.botName || 'My AI Assistant',
        appId: bot.appId || 'N/A',
        isSetupComplete: Boolean(bot.isSetupComplete),
        provider: bot.provider || 'gemini',
      };
    });

    return {
      totalUsers: userConfigs.length,
      totalBots: userConfigs.length,
      totalKnowledgeBases,
      users: userList,
    };
  } catch (err) {
    console.error('[ownerAuth] getOwnerStats error:', err.message);
    return {
      totalUsers: 0,
      totalBots: 0,
      totalKnowledgeBases: 0,
      users: [],
    };
  }
}

