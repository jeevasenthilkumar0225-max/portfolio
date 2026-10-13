import fs from 'fs';
import path from 'path';
import os from 'os';

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

export function getMessages(): ContactMessage[] {
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
  } catch (error) {
    if (cachedMessages !== null) {
      return cachedMessages;
    }
    return [];
  }
}

export function saveMessages(messages: ContactMessage[]): boolean {
  cachedMessages = messages;
  lastMtime = Date.now();

  // Try primary location
  try {
    const dir = path.dirname(messagesFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(messagesFilePath, JSON.stringify(messages, null, 2), 'utf8');
    lastMtime = fs.statSync(messagesFilePath).mtimeMs;
    return true;
  } catch {
    // Fallback to /tmp in read-only serverless environment
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
      return true; // Memory cache updated
    }
  }
}
