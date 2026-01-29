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

    // Upsert visitor (update last_seen if exists, insert if not)
    const { error } = await supabase
      .from('visitors')
      .upsert(
        {
          ip_hash: hash,
          last_seen: new Date().toISOString(),
        },
        {
          onConflict: 'ip_hash',
        }
      );

    if (error) {
      console.error('Error upserting visitor:', error);
      return NextResponse.json({ error: 'Failed to track visitor' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
