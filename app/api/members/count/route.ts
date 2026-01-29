import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function GET() {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase.auth.admin.listUsers();
    const count = data?.users?.length || 0;

    if (error) {
      console.error('Error fetching members count:', error);
      return NextResponse.json({ count: 0 });
    }

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ count: 0 });
  }
}
