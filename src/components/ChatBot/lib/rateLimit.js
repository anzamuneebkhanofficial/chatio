import { RateLimiterMemory } from 'rate-limiter-flexible';

/**
 * High-performance In-Memory Rate Limiter powered by rate-limiter-flexible
 * Protects against DDoS attacks, API flooding, and token depletion.
 */

// 1. Chat requests limiter: 30 requests per 60 seconds per IP
const chatRateLimiter = new RateLimiterMemory({
  points: 30, // 30 requests
  duration: 60, // per 60 seconds
  blockDuration: 60, // Block for 60s if consumed
});

// 2. Auth attempts limiter: 10 login attempts per 60 seconds per IP (Anti Brute-Force)
const authRateLimiter = new RateLimiterMemory({
  points: 10,
  duration: 60,
  blockDuration: 120, // Block for 2 minutes if 10 consecutive failed attempts
});

/**
 * Check rate limit for chat requests
 * @param {string} ip - Client IP address
 * @returns {Promise<{ limited: boolean, remainingPoints: number, retryAfter: number }>}
 */
export async function checkRateLimit(ip = '127.0.0.1') {
  try {
    const res = await chatRateLimiter.consume(ip);
    return {
      limited: false,
      remainingPoints: res.remainingPoints,
      retryAfter: 0,
    };
  } catch (rejRes) {
    if (rejRes instanceof Error) {
      console.warn('[RateLimiter] Error:', rejRes.message);
      return { limited: false, remainingPoints: 1, retryAfter: 0 };
    }
    // Rejection means points consumed (Rate limit exceeded)
    const retrySecs = Math.round((rejRes.msBeforeNext || 60000) / 1000);
    return {
      limited: true,
      remainingPoints: 0,
      retryAfter: retrySecs,
    };
  }
}

/**
 * Check rate limit for authentication routes
 * @param {string} ip - Client IP address
 * @returns {Promise<{ limited: boolean, retryAfter: number }>}
 */
export async function checkAuthRateLimit(ip = '127.0.0.1') {
  try {
    await authRateLimiter.consume(ip);
    return { limited: false, retryAfter: 0 };
  } catch (rejRes) {
    const retrySecs = Math.round((rejRes.msBeforeNext || 120000) / 1000);
    return { limited: true, retryAfter: retrySecs };
  }
}
