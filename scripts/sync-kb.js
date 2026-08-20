import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/bot';

async function sync() {
  const filePath = path.join(process.cwd(), 'knowledge', 'website-data.md');
  const content = fs.readFileSync(filePath, 'utf8').trim();

  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  await db.collection('admin_knowledge').updateOne(
    { type: 'global' },
    { $set: { content: content, updatedAt: new Date() } },
    { upsert: true }
  );

  await db.collection('admin_config').updateOne(
    { _id: 'singleton' },
    {
      $set: {
        botName: 'Chatio AI Assistant',
        widgetTitle: 'Chatio by Anza',
        widgetDescription: 'Online · Powered by RAG',
        provider: 'groq',
        updatedAt: new Date(),
      }
    },
    { upsert: true }
  );

  console.log('✅ Successfully synced official Chatio platform knowledge base to MongoDB via Mongoose!');
  await mongoose.disconnect();
  process.exit(0);
}

sync().catch((err) => {
  console.error('❌ Sync failed:', err);
  process.exit(1);
});
