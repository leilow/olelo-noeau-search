import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 503 });

    // Fetch all phrases - Supabase has a default max-rows limit, so we fetch in batches
    const allPhrases: any[] = [];
    const batchSize = 1000;
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from('phrases')
        .select('*')
        .order('phrase_numbers', { ascending: true })
        .range(offset, offset + batchSize - 1);

      if (error) {
        console.error('Error fetching phrases:', error);
        return NextResponse.json({ error: 'Failed to fetch phrases' }, { status: 500 });
      }

      if (data && data.length > 0) {
        allPhrases.push(...data);
        offset += batchSize;
        hasMore = data.length === batchSize; // If we got a full batch, there might be more
      } else {
        hasMore = false;
      }
    }

    return NextResponse.json(allPhrases);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
