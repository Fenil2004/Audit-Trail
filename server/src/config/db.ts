import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer: MongoMemoryServer | null = null;

export async function connectDatabase(): Promise<string> {
  const envUri = process.env.MONGODB_URI;

  if (envUri) {
    try {
      console.log(`[DB] Attempting connection to configured MongoDB: ${envUri}`);
      await mongoose.connect(envUri, { serverSelectionTimeoutMS: 3000 });
      console.log('[DB] Connected successfully to configured MongoDB.');
      return envUri;
    } catch (err: any) {
      console.warn(`[DB] External MongoDB unreachable (${err.message}). Falling back to embedded MongoMemoryServer...`);
    }
  }

  // Fallback to in-memory embedded MongoDB
  console.log('[DB] Initializing embedded MongoMemoryServer for standalone zero-dependency execution...');
  mongoMemoryServer = await MongoMemoryServer.create({
    instance: {
      dbName: 'audit_trail_ledger',
    },
  });

  const uri = mongoMemoryServer.getUri();
  await mongoose.connect(uri);
  console.log(`[DB] Connected to embedded MongoMemoryServer at: ${uri}`);
  return uri;
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
}
