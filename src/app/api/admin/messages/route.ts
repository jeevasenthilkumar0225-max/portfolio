import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getMessages, saveMessages, ContactMessage } from '@/lib/messages';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;

    if (!token || token !== 'js-portfolio-authenticated-admin-session') {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const messages = await getMessages();
    return NextResponse.json({ success: true, messages });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;

    if (!token || token !== 'js-portfolio-authenticated-admin-session') {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const body = await request.json();
    const { action, id } = body || {};

    let messages = await getMessages();

    if (action === 'delete') {
      messages = messages.filter((m: ContactMessage) => m.id !== id);
    } else if (action === 'toggleRead') {
      messages = messages.map((m: ContactMessage) =>
        m.id === id ? { ...m, isRead: !m.isRead, read: !m.isRead } : m
      );
    } else if (action === 'markAllRead') {
      messages = messages.map((m: ContactMessage) => ({ ...m, isRead: true, read: true }));
    }

    await saveMessages(messages);
    return NextResponse.json({ success: true, messages });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update messages' }, { status: 500 });
  }
}
