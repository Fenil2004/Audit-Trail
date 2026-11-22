
import { MongoClient, type Db } from "mongodb";
import { title } from "process";

let client: MongoClient | null = null;
let database: Db | null = null;

export async function connectDB(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is not defined");
  }

  const newClient = new MongoClient(mongoUri, {
    serverSelectionTimeoutMS: 5000,
  });

  try {
    await newClient.connect();

    const newDatabase = newClient.db(
      process.env.MONGODB_DB || "audit_trail"
    );

    await newDatabase.command({ ping: 1 });

    client = newClient;
    database = newDatabase;

    console.log("MongoDB connected successfully");
  } catch (error) {
    await newClient.close().catch(() => {});
    throw error;
  }
}

export function isDBConnected(): boolean {
  return database !== null;
}

export function getDB(): Db {
  if (!database) {
    throw new Error("Database is not connected");
  }

  return database;
}