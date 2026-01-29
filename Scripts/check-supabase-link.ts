/**
 * Verify Supabase connection and that app env matches the linked project.
 * Does not run migrations or modify anything.
 *
 * Run: npm run supabase:check
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

async function main() {
  const cwd = process.cwd();

  // Load .env.local
  const envPath = resolve(cwd, '.env.local');
  if (!existsSync(envPath)) {
    console.error('Missing .env.local');
    process.exit(1);
  }
  try {
    const { config } = await import('dotenv');
    config({ path: envPath });
  } catch {
    // dotenv optional
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const refFromUrl = supabaseUrl?.match(/https:\/\/([a-z0-9]+)\.supabase\.co/)?.[1] ?? null;

  // Linked project ref (from supabase link)
  const projectRefPath = resolve(cwd, 'supabase/.temp/project-ref');
  let linkedRef: string | null = null;
  if (existsSync(projectRefPath)) {
    linkedRef = readFileSync(projectRefPath, 'utf-8').trim();
  }

  console.log('Supabase link check\n');
  console.log('  App env (NEXT_PUBLIC_SUPABASE_URL):', supabaseUrl ?? '(not set)');
  console.log('  Project ref from URL:              ', refFromUrl ?? '(could not parse)');
  console.log('  Linked project ref (CLI):          ', linkedRef ?? '(not linked or no .temp/project-ref)');
  console.log('');

  if (!refFromUrl) {
    console.error('Could not parse project ref from NEXT_PUBLIC_SUPABASE_URL.');
    process.exit(1);
  }

  if (linkedRef !== null && linkedRef !== refFromUrl) {
    console.error('Mismatch: app URL points to ref', refFromUrl, 'but CLI is linked to', linkedRef);
    process.exit(1);
  }

  if (linkedRef === null) {
    console.log('CLI link state not found. Run: npm run supabase:link');
    console.log('(App ref is', refFromUrl + '.)');
  } else {
    console.log('OK: App and CLI both use project ref', refFromUrl);
  }

  // Optional: ping project to confirm we can reach it
  if (supabaseUrl && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'HEAD',
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
      });
      if (res.ok || res.status === 404) {
        console.log('OK: Project is reachable (REST responded).');
      } else {
        console.log('Note: REST returned', res.status, '- check keys if something fails.');
      }
    } catch (e) {
      console.log('Note: Could not reach project (network or CORS):', (e as Error).message);
    }
  }
}

main();
