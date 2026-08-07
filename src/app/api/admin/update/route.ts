import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { savePortfolioData } from '@/lib/data';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;

    // Check auth cookie
    if (!token || token !== 'js-portfolio-authenticated-admin-session') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    if (!body || !body.profile || !body.skills || !body.projects || !body.experience) {
      return NextResponse.json({ success: false, error: 'Invalid portfolio data payload' }, { status: 400 });
    }

    const saved = savePortfolioData(body);
    if (!saved) {
      return NextResponse.json({ success: false, error: 'Failed to write data to disk' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Portfolio updated successfully', data: body });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error saving data' }, { status: 500 });
  }
}

