import clientPromise from './mongodb';

export async function checkRateLimit(ip) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('rate_limits');

    const now = new Date();
    const resetAt = new Date(now.getTime() + 60000); // 1 minute from now

    // Increment count by 1, or set initial if it doesn't exist
    const result = await collection.findOneAndUpdate(
      { ip: ip },
      {
        $inc: { count: 1 },
        $setOnInsert: { resetAt: resetAt }
      },
      { upsert: true, returnDocument: 'after' }
    );

    const doc = result?.value || result;
    
    if (!doc) {
      return { limited: false, count: 1 };
    }

    const isLimited = doc.count > 20;

    // Manual cleanup in case TTL index hasn't run yet, but the time has passed
    if (doc.resetAt < now) {
      await collection.updateOne(
        { ip: ip },
        { $set: { count: 1, resetAt: resetAt } }
      );
      return { limited: false, count: 1 };
    }

    return { limited: isLimited, count: doc.count };
  } catch (error) {
    console.error('Rate limit error:', error);
    // Fail open if db is down
    return { limited: false, count: 0 };
  }
}
