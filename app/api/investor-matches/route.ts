import { NextResponse } from 'next/server';
import { findInvestorMatches } from '@/lib/matching';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sector = searchParams.get('sector') || '';
  const stage = searchParams.get('stage') || '';
  const geography = searchParams.get('geography') || '';

  if (!sector && !stage && !geography) {
    return NextResponse.json({ matches: [], message: 'No criteria provided' });
  }

  try {
    const matches = await findInvestorMatches(sector, stage, geography);
    return NextResponse.json({ matches });
  } catch (err) {
    console.error('Investor matching error:', err);
    return NextResponse.json({ matches: [], error: 'Matching failed' }, { status: 500 });
  }
}
