import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

/**
 * GET /api/visitors/count
 * Returns total unique visitors.
 * Optional ?since=YYYY-MM-DD returns count of visitors whose first_seen >= that date (UTC).
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    if (!supabase) return NextResponse.json({ count: 0 });
    const sinceParam = request.nextUrl.searchParams.get('since');
    let query = supabase.from('visitors').select('*', { count: 'exact', head: true });
    if (sinceParam) {
      const sinceDate = new Date(sinceParam);
      if (!isNaN(sinceDate.getTime())) {
        query = query.gte('first_seen', sinceDate.toISOString());
      }
    }
    const { count, error } = await query;
    if (error) {
      console.error('Error fetching visitor count:', error);
      return NextResponse.json({ count: 0 });
    }
    return NextResponse.json({ count: count ?? 0 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ count: 0 });
  }
}
