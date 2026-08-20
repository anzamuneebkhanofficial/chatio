import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { auth } from '@clerk/nextjs/server';

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { uri } = await req.json().catch(() => ({}));
    if (!uri || typeof uri !== 'string' || !uri.trim()) {
      return NextResponse.json({ error: 'Please enter a valid MongoDB connection string.' }, { status: 400 });
    }

    const cleanUri = uri.trim();
    if (!cleanUri.startsWith('mongodb://') && !cleanUri.startsWith('mongodb+srv://')) {
      return NextResponse.json({ error: 'Connection string must begin with mongodb:// or mongodb+srv://' }, { status: 400 });
    }

    // Attempt test connection with a 4-second timeout
    const testConn = await mongoose.createConnection(cleanUri, {
      serverSelectionTimeoutMS: 4000,
      connectTimeoutMS: 4000,
    }).asPromise();

    const dbName = testConn.name || 'custom_db';
    
    // Close the transient test connection immediately
    try {
      await testConn.close();
    } catch (e) {}

    return NextResponse.json({
      success: true,
      dbName,
      message: `Successfully reached MongoDB database "${dbName}"!`,
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: `Could not connect: ${err.message}`,
    }, { status: 400 });
  }
}
