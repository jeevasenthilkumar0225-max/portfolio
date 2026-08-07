import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const messagesFilePath = path.join(process.cwd(), 'data', 'messages.json');

export async function GET() {
  try {
    if (!fs.existsSync(messagesFilePath)) {
      return NextResponse.json({ success: true, messages: [] });
    }
    const fileContents = fs.readFileSync(messagesFilePath, 'utf8');
    const messages = JSON.parse(fileContents);
    return NextResponse.json({ success: true, messages });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, id } = body;

    if (!fs.existsSync(messagesFilePath)) {
      return NextResponse.json({ success: true, messages: [] });
    }

    const fileContents = fs.readFileSync(messagesFilePath, 'utf8');
    let messages = JSON.parse(fileContents);

    if (action === 'delete') {
      messages = messages.filter((m: { id: string }) => m.id !== id);
    } else if (action === 'toggleRead') {
      messages = messages.map((m: { id: string; isRead: boolean; read: boolean }) =>
        m.id === id ? { ...m, isRead: !m.isRead, read: !m.isRead } : m
      );
    } else if (action === 'markAllRead') {
      messages = messages.map((m: { isRead: boolean; read: boolean }) => ({ ...m, isRead: true, read: true }));
    }

    fs.writeFileSync(messagesFilePath, JSON.stringify(messages, null, 2), 'utf8');
    return NextResponse.json({ success: true, messages });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update messages' }, { status: 500 });
  }
}
