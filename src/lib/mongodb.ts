import { MongoClient } from 'mongodb';

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient> | null = null;

export async function getDatabase(dbName = 'portfolio') {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
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
    } catch (err) {
      console.error('[mongodb.ts] Initialization error:', err);
      clientPromise = null;
      return null;
    }
  }

  try {
    const client = await clientPromise;
    return client.db(dbName);
  } catch (error) {
    console.error('[mongodb.ts] Connection error:', error);
    clientPromise = null; // Allow retry on subsequent requests
    return null;
  }
}

export default clientPromise;
