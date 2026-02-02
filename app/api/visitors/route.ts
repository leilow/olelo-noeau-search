import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const salt = process.env.IP_HASH_SALT;
    if (!salt) {
      console.error('IP_HASH_SALT not configured');
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
    }

    // Get IP address
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 
               request.headers.get('x-real-ip') || 
               'unknown';

    // Hash the IP with salt (privacy-aware)
    const hash = crypto
      .createHash('sha256')
      .update(ip + salt)
      .digest('hex');

    const supabase = createServiceClient();
    if (!supabase) return NextResponse.json({ success: true });

    // Upsert visitor (unique count + first_seen/last_seen)
    const { error: visitorError } = await supabase
      .from('visitors')
      .upsert(
        {
          ip_hash: hash,
          last_seen: new Date().toISOString(),
        },
        { onConflict: 'ip_hash' }
      );

    if (visitorError) {
      console.error('Error upserting visitor:', visitorError);
      return NextResponse.json({ error: 'Failed to track visitor' }, { status: 500 });
    }

    // Log this visit (every page load). Path from body (client ping) or header (server).
    let path = request.headers.get('x-visited-path') ?? '';
    if (!path) {
      try {
        const body = await request.json();
        if (body && typeof body.path === 'string') path = body.path;
      } catch {
        // no body or not JSON
      }
    }
    const pathStr = (path ?? '').slice(0, 500);
    const { error: visitError } = await supabase.from('visits').insert({
      ip_hash: hash,
      path: pathStr,
    });

    if (visitError) {
      console.error('Error logging visit:', visitError.message, visitError.details);
      // Don't fail the request; visitor was already recorded
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
