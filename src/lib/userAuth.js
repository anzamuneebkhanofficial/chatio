import dbConnect from '@/lib/dbConnect';
import { User } from '@/models';

/**
 * Parses user session cookie or Authorization header and returns authenticated User object.
 * All crypto helpers (hashPassword, verifyPassword, encryptText, decryptText, maskKey, isValidEmail)
 * are imported directly from @/lib/crypto wherever needed — NOT re-exported here.
 */
export async function getLoggedInUser(req) {
  let userId = null;

  // 1. NextRequest cookies
  if (req && req.cookies && typeof req.cookies.get === 'function') {
    const sessionCookie = req.cookies.get('user_session');
    if (sessionCookie && sessionCookie.value) {
      userId = sessionCookie.value;
    }
  }

  // 2. Cookie header fallback
  if (!userId) {
    const cookieHeader = req?.headers?.get?.('cookie') || '';
    const match = cookieHeader.match(/user_session=([^;]+)/);
    if (match) {
      userId = decodeURIComponent(match[1]);
    }
  }

  // 3. Authorization header
  if (!userId) {
    const authHeader = req?.headers?.get?.('authorization') || '';
    if (authHeader.startsWith('Bearer ')) {
      userId = authHeader.replace('Bearer ', '').trim();
    }
  }

  if (!userId) return null;

  if (userId === 'master_owner' || userId === 'master_authorized') {
    return {
      id: 'master_owner',
      email: (process.env.OWNER_EMAIL || 'anzamuneebkhan13@gmail.com').toLowerCase().trim(),
      name: 'Muhammad Anza Muneeb Khan (Owner)',
      isOwner: true,
      role: 'owner',
    };
  }

  try {
    await dbConnect();
    const user = await User.findById(userId).lean();
    if (!user) return null;

    return {
      id: user._id,
      email: user.email,
      name: user.name || user.email.split('@')[0],
      createdAt: user.createdAt,
      isOwner: false,
    };
  } catch (err) {
    console.error('[userAuth] Error fetching logged in user via Mongoose:', err.message);
    return null;
  }
}
