import { MongoClient } from 'mongodb';

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient> | null = null;
let lastConnectionError: string | null = null;

export function getLastMongoConnectionError(): string | null {
  return lastConnectionError;
}

export async function getDatabase(dbName = 'portfolio') {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    lastConnectionError = 'MONGODB_URI environment variable is not defined';
    return null;
  }

  if (!clientPromise) {
    try {
      if (process.env.NODE_ENV === 'development') {
        if (!global._mongoClientPromise) {
          const client = new MongoClient(uri, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
          });
          global._mongoClientPromise = client.connect();
        }
        clientPromise = global._mongoClientPromise;
      } else {
        const client = new MongoClient(uri, {
          maxPoolSize: 10,
          serverSelectionTimeoutMS: 5000,
        });
        clientPromise = client.connect();
      }
    } catch (err: any) {
      console.error('[mongodb.ts] Initialization error:', err);
      clientPromise = null;
      lastConnectionError = err?.message || 'Client initialization failed';
      throw err;
    }
  }

  try {
    const client = await clientPromise;
    lastConnectionError = null;
    return client.db(dbName);
  } catch (error: any) {
    console.error('[mongodb.ts] Connection error:', error);
    clientPromise = null; // Reset so subsequent requests retry
    lastConnectionError = error?.message || 'Connection failed';
    throw error;
  }
}

export default clientPromise;
