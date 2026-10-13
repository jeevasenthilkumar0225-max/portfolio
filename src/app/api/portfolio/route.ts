import { NextResponse } from 'next/server';
import { getPortfolioData } from '@/lib/data';

export async function GET() {
  try {
    const data = await getPortfolioData();
    const response = NextResponse.json(data);
    response.headers.set('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch portfolio data' },
      { status: 500 }
    );
  }
}
