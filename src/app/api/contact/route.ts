import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { NotificationService } from '@/lib/notification-service';

const messagesFilePath = path.join(process.cwd(), 'data', 'messages.json');

// Simple in-memory rate-limiter map tracking IP/timestamp
const rateLimitMap = new Map<string, number>();

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  timestamp: number;
  isRead: boolean;
  notificationSent: boolean;
}

function getMessages(): ContactMessage[] {
  try {
    if (!fs.existsSync(messagesFilePath)) {
      fs.writeFileSync(messagesFilePath, '[]', 'utf8');
      return [];
    }
    const fileContents = fs.readFileSync(messagesFilePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Error reading messages database:', error);
    return [];
  }
}

function saveMessages(messages: ContactMessage[]): boolean {
  try {
    const dir = path.dirname(messagesFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(messagesFilePath, JSON.stringify(messages, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error saving messages database:', error);
    return false;
  }
}

// Simple input sanitization helper
function sanitize(input: string): string {
  if (!input) return '';
  return input
    .trim()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

export async function POST(request: Request) {
  try {
    // 1. Spam Honeypot & Rate-limiting Check
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    const now = Date.now();
    
    if (rateLimitMap.has(ip)) {
      const lastSubmission = rateLimitMap.get(ip)!;
      if (now - lastSubmission < 10000) { // 10-second cool down to prevent spam attacks
        return NextResponse.json(
          { success: false, error: 'Too many requests. Please wait 10 seconds before sending another message.' },
          { status: 429 }
        );
      }
    }
    rateLimitMap.set(ip, now);

    const body = await request.json();
    const { name, email, subject, message, honeypot } = body;

    // Honeypot spam bot check
    if (honeypot) {
      return NextResponse.json({ success: false, error: 'Spam detected' }, { status: 400 });
    }

    if (!name || !email || !message) {
      return NextResponse.json({ success: false, error: 'Missing required contact fields' }, { status: 400 });
    }

    // 2. Sanitize and validate inputs
    const cleanName = sanitize(name);
    const cleanEmail = sanitize(email);
    const cleanSubject = sanitize(subject || 'No Subject');
    const cleanMessage = sanitize(message);

    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const createdAtString = new Date().toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const newMessage: ContactMessage = {
      id: messageId,
      name: cleanName,
      email: cleanEmail,
      subject: cleanSubject,
      message: cleanMessage,
      createdAt: createdAtString,
      timestamp: now,
      isRead: false,
      notificationSent: false,
    };

    // 3. Save message first so we NEVER lose user messages
    const currentMessages = getMessages();
    currentMessages.unshift(newMessage);
    saveMessages(currentMessages);

    const pendingCount = currentMessages.filter((m) => !m.isRead).length;

    // 4. Dispatch Email Notification Alert
    let emailSent = false;
    try {
      emailSent = await NotificationService.sendAllAlerts({
        id: messageId,
        name: cleanName,
        email: cleanEmail,
        subject: cleanSubject,
        message: cleanMessage,
        timestamp: createdAtString,
        pendingCount,
        adminDashboardURL: 'http://localhost:3000/admin',
      });
    } catch (sendErr) {
      console.error('[POST /api/contact] Error during notification dispatch:', sendErr);
    }

    // 5. Update notificationSent flag if sent successfully
    if (emailSent) {
      const messagesWithSentFlag = getMessages().map((m) =>
        m.id === messageId ? { ...m, notificationSent: true } : m
      );
      saveMessages(messagesWithSentFlag);
    }

    return NextResponse.json({
      success: true,
      message: 'Message saved and alert notification processed.',
    });
  } catch (error) {
    console.error('[POST /api/contact] Server Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
