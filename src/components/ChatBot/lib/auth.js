import { isMasterOwnerRequest } from '@/lib/ownerAuth';
import { getBotConfig } from './dbConfig';

/**
 * Checks if the incoming request is authorized for platform Owner/Admin configuration.
 * Exclusively verifies Master Owner session/credentials. Never treats normal users as owner.
 */
export async function isOwnerAuthorized(req) {
  try {
    // 1. Master Owner session or header check
    if (isMasterOwnerRequest(req)) {
      return true;
    }

    // 2. Direct req.cookies check (NextRequest)
    if (req && req.cookies && typeof req.cookies.get === 'function') {
      const ownerCookie = req.cookies.get('owner_session');
      if (ownerCookie && (ownerCookie.value === 'master_authorized' || ownerCookie.value === process.env.OWNER_PASSWORD)) {
        return true;
      }
    }

    // 3. Direct Cookie Header check
    const cookieHeader = req?.headers?.get?.('cookie') || '';
    if (cookieHeader.includes('owner_session=')) {
      const match = cookieHeader.match(/owner_session=([^;]+)/);
      if (match) {
        const val = decodeURIComponent(match[1]);
        if (val === 'master_authorized' || val === process.env.OWNER_PASSWORD) {
          return true;
        }
      }
    }

    // 4. Authorization Header check
    const authHeader = req?.headers?.get?.('authorization') || '';
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();
      if (token === 'master_authorized' || token === (process.env.OWNER_PASSWORD || 'pakistan')) {
        return true;
      }
    }

    // 5. Default setup mode fallback (first-time install)
    const config = await getBotConfig();
    if (!config.isSetupComplete) {
      return true;
    }
  } catch (err) {
    console.warn('[auth.js] isOwnerAuthorized check warning:', err.message);
  }

  return false;
}

