import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const turnstileToken = body['cf-turnstile-response'];

    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (secret) {
      if (!turnstileToken) {
        return NextResponse.json({ error: 'Verification required' }, { status: 400 });
      }
      const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret, response: turnstileToken }),
      });
      const verify = (await verifyRes.json()) as { success?: boolean };
      if (!verify.success) {
        return NextResponse.json({ error: 'Verification failed' }, { status: 400 });
      }
    }

    // Form sends: hawaiian_or_pidgin_phrase, english_meaning, kaona_deeper_meaning, email, can_share_publicly
    const hawaiian_phrase =
      body.hawaiian_phrase ?? body.hawaiian_or_pidgin_phrase ?? '';
    const english_phrase =
      body.english_phrase ?? body.english_meaning ?? null;
    const meaning_phrase =
      body.meaning_phrase ?? body.kaona_deeper_meaning ?? null;
    const submitted_by = body.email ?? null;

    if (!hawaiian_phrase || String(hawaiian_phrase).trim().length === 0) {
      return NextResponse.json({ error: 'Hawaiian phrase is required' }, { status: 400 });
    }

    const supabase = await createClient();
    if (!supabase) return NextResponse.json({ error: 'Submissions unavailable' }, { status: 503 });
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('submissions')
      .insert({
        hawaiian_phrase: String(hawaiian_phrase).trim(),
        english_phrase: english_phrase ? String(english_phrase).trim() : null,
        meaning_phrase: meaning_phrase ? String(meaning_phrase).trim() : null,
        submitted_by: submitted_by?.trim() || user?.email || null,
        status: 'pending',
      });

    if (error) {
      console.error('Error inserting submission:', error);
      return NextResponse.json({ error: 'Failed to submit phrase' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
