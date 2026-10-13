import fs from 'fs';
import path from 'path';
import os from 'os';
import { getDatabase } from './mongodb';

const messagesFilePath = path.join(process.cwd(), 'data', 'messages.json');

function getMessagesFallbackPath(): string {
  try {
    return path.join(os.tmpdir(), 'messages.json');
  } catch {
    return messagesFilePath;
  }
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  date?: string;
  timestamp: number;
  isRead: boolean;
  read?: boolean;
  notificationSent: boolean;
}

let cachedMessages: ContactMessage[] | null = null;
let lastMtime: number = 0;

function getActiveFilePath(): string {
  const fallbackPath = getMessagesFallbackPath();
  if (fs.existsSync(fallbackPath)) {
    try {
      const fallbackStat = fs.statSync(fallbackPath);
      if (fs.existsSync(messagesFilePath)) {
        const primaryStat = fs.statSync(messagesFilePath);
        return fallbackStat.mtimeMs > primaryStat.mtimeMs ? fallbackPath : messagesFilePath;
      }
      return fallbackPath;
    } catch {
      return messagesFilePath;
    }
  }
  return messagesFilePath;
}

export async function getMessages(): Promise<ContactMessage[]> {
  // 1. Try MongoDB if configured
  try {
    const db = await getDatabase();
    if (db) {
      const docs = await db.collection('contact_messages').find().sort({ timestamp: -1 }).toArray();
      if (docs && docs.length > 0) {
        cachedMessages = docs.map((doc) => {
          const { _id, ...rest } = doc;
          return rest as ContactMessage;
        });
        return cachedMessages;
      }
    }
  } catch (mongoErr) {
    console.warn('[messages.ts] MongoDB read failed, falling back to local files:', mongoErr);
  }

  // 2. Fallback to local files
  try {
    const activePath = getActiveFilePath();

    if (fs.existsSync(activePath)) {
      const stat = fs.statSync(activePath);
      if (cachedMessages !== null && lastMtime === stat.mtimeMs) {
        return cachedMessages;
      }
      const content = fs.readFileSync(activePath, 'utf8');
      cachedMessages = JSON.parse(content);
      lastMtime = stat.mtimeMs;
      return cachedMessages || [];
    }

    if (cachedMessages !== null) {
      return cachedMessages;
    }

    return [];
  } catch {
    return cachedMessages || [];
  }
}

export async function saveMessages(messages: ContactMessage[]): Promise<boolean> {
  cachedMessages = messages;
  lastMtime = Date.now();

  let mongoSaved = false;

  // 1. Try MongoDB
  try {
    const db = await getDatabase();
    if (db) {
      // Clear and bulk insert or sync
      const col = db.collection('contact_messages');
      await col.deleteMany({});
      if (messages.length > 0) {
        await col.insertMany(messages);
      }
      mongoSaved = true;
    }
  } catch (mongoErr) {
    console.warn('[messages.ts] MongoDB write failed:', mongoErr);
  }

  // 2. Local filesystem / fallback tmp
  try {
    const dir = path.dirname(messagesFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(messagesFilePath, JSON.stringify(messages, null, 2), 'utf8');
    lastMtime = fs.statSync(messagesFilePath).mtimeMs;
    return true;
  } catch {
    try {
      const fallbackPath = getMessagesFallbackPath();
      const dir = path.dirname(fallbackPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(fallbackPath, JSON.stringify(messages, null, 2), 'utf8');
      lastMtime = fs.statSync(fallbackPath).mtimeMs;
      return true;
    } catch {
      return mongoSaved || true;
    }
  }
}
