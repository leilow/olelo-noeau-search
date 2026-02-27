import { NextResponse } from 'next/server';
import { phrases } from '@/lib/phrases/data';

export async function GET() {
  return NextResponse.json(phrases);
}
