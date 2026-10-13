import { NextResponse } from 'next/server';
import { NotificationService } from '@/lib/notification-service';
import { getMessages, saveMessages, ContactMessage } from '@/lib/messages';

// In-memory rate-limiter map tracking IP/timestamp
const rateLimitMap = new Map<string, number>();

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
    const body = await request.json();
    const { name, email, subject, message, honeypot } = body || {};

    // 1. Honeypot spam bot check
    if (honeypot) {
      return NextResponse.json({ success: false, error: 'Spam detected' }, { status: 400 });
    }

    // 2. Missing required fields check
    if (!name || !email || !message) {
      return NextResponse.json({ success: false, error: 'Missing required contact fields' }, { status: 400 });
    }

    // 3. Rate-limiting Check on valid submissions (prevents spam flooding)
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    const now = Date.now();
    const cooldownMs = process.env.NODE_ENV === 'production' ? 10000 : 500;

    if (rateLimitMap.has(ip)) {
      const lastSubmission = rateLimitMap.get(ip)!;
      if (now - lastSubmission < cooldownMs) {
        return NextResponse.json(
          { success: false, error: 'Too many requests. Please wait a few moments before sending another message.' },
          { status: 429 }
        );
      }
    }
    rateLimitMap.set(ip, now);

    // 4. Sanitize and validate inputs
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
      date: createdAtString,
      timestamp: now,
      isRead: false,
      read: false,
      notificationSent: false,
    };

    // 5. Save message first so we NEVER lose user messages
    const currentMessages = await getMessages();
    currentMessages.unshift(newMessage);
    await saveMessages(currentMessages);

    const pendingCount = currentMessages.filter((m) => !m.isRead && !m.read).length;

    // 6. Dispatch Email Notification Alert
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

    // 7. Update notificationSent flag if sent successfully
    if (emailSent) {
      const allMsgs = await getMessages();
      const messagesWithSentFlag = allMsgs.map((m: ContactMessage) =>
        m.id === messageId ? { ...m, notificationSent: true } : m
      );
      await saveMessages(messagesWithSentFlag);
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
