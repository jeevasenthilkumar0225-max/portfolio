import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { savePortfolioData, getStorageStatus } from '@/lib/data';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;

    // Check auth cookie
    if (!token || token !== 'js-portfolio-authenticated-admin-session') {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const body = await request.json();
    if (!body || !body.profile || !body.skills || !body.projects || !body.experience) {
      return NextResponse.json({ success: false, error: 'Invalid portfolio data payload' }, { status: 400 });
    }

    const saved = savePortfolioData(body);
    if (!saved) {
      return NextResponse.json({ success: false, error: 'Failed to write data to storage' }, { status: 500 });
    }

    const status = getStorageStatus();

    return NextResponse.json({
      success: true,
      message: status.readOnly
        ? 'Portfolio updated in runtime memory & temporary cache (Serverless environment detected)'
        : 'Portfolio updated and saved successfully',
      storageStatus: status,
      data: body,
    });
  } catch (error) {
    console.error('[POST /api/admin/update] Error:', error);
    return NextResponse.json({ success: false, error: 'Server error saving data' }, { status: 500 });
  }
}
