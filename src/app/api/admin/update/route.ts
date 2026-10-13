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

    const saved = await savePortfolioData(body);
    if (!saved) {
      return NextResponse.json({ success: false, error: 'Failed to write data to storage' }, { status: 500 });
    }

    const status = getStorageStatus();

    let userMessage = 'Portfolio updated and saved successfully';
    if (status.mongoConnected) {
      userMessage = 'Portfolio updated and saved permanently to MongoDB Atlas!';
    } else if (status.readOnly) {
      if (!status.hasMongoUri) {
        userMessage = 'Saved in temporary cache: MONGODB_URI is not set in Vercel Environment Variables. Please add it in Vercel Settings to persist permanently.';
      } else if (status.mongoError) {
        userMessage = `Saved in temporary cache: MongoDB connection failed (${status.mongoError}).`;
      } else {
        userMessage = 'Portfolio updated in runtime memory & temporary cache (Serverless environment detected)';
      }
    }

    return NextResponse.json({
      success: true,
      message: userMessage,
      storageStatus: status,
      data: body,
    });
  } catch (error) {
    console.error('[POST /api/admin/update] Error:', error);
    return NextResponse.json({ success: false, error: 'Server error saving data' }, { status: 500 });
  }
}
