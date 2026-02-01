import { NextResponse } from 'next/server';
import { fetchAllPhrases } from '@/lib/phrases/fetchPhrases';

export async function GET() {
  try {
    const allPhrases = await fetchAllPhrases();
    return NextResponse.json(allPhrases);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
