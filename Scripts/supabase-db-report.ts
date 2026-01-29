/**
 * Report: remote Supabase database vs local project (migrations + schema).
 *
 * 1. Runs `supabase migration list` (uses link; no DATABASE_URL needed) for migration status.
 * 2. If DATABASE_URL is set in .env.local: queries remote for tables, columns, and functions.
 *
 * Run: npm run supabase:db-report
 */

import { execSync, spawnSync } from 'child_process';
import { readdirSync, readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

async function main() {
  const cwd = process.cwd();
  const envPath = resolve(cwd, '.env.local');
  if (existsSync(envPath)) {
    try {
      const { config } = await import('dotenv');
      config({ path: envPath });
    } catch {
      // dotenv optional
    }
  }

  console.log('Supabase DB report: remote vs local project\n');
  console.log('--- 1. Migration status (CLI, linked project) ---\n');

  const hasSupabase = spawnSync('npx', ['supabase', '--version'], {
    encoding: 'utf8',
    cwd,
  }).status === 0;
  if (!hasSupabase) {
    console.log('Supabase CLI not found. Install: npx supabase --version');
  } else {
    try {
      const out = execSync('npx supabase migration list', {
        encoding: 'utf8',
        cwd,
      });
      console.log(out);
    } catch (e: unknown) {
      const err = e as { stdout?: string; stderr?: string };
      console.log(err.stdout ?? '');
      if (err.stderr) console.error(err.stderr);
      console.log('(Run npm run supabase:link if not linked.)\n');
    }
  }

  console.log('--- 2. Local migration files ---\n');
  const migrationsDir = resolve(cwd, 'supabase/migrations');
  const localFiles = existsSync(migrationsDir)
    ? readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort()
    : [];
  localFiles.forEach((f) => console.log('  ', f));
  console.log('');

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.log('--- 3. Remote schema (skipped) ---\n');
    console.log('Set DATABASE_URL in .env.local to include remote tables/columns/functions in this report.');
    console.log('Include password: postgresql://postgres.[ref]:YOUR_PASSWORD@db.[PROJECT-REF].supabase.co:5432/postgres');
    console.log('(Supabase → Settings → Database → Connection string → URI)\n');
    return;
  }

  console.log('--- 3. Remote schema (from DATABASE_URL) ---\n');
  try {
    const { default: pg } = await import('pg');
    const client = new pg.Client({ connectionString: databaseUrl });
    await client.connect();

    const tablesRes = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    const tables = (tablesRes.rows as { table_name: string }[]).map((r) => r.table_name);

    console.log('Tables (public):', tables.length);
    for (const t of tables) {
      const colsRes = await client.query(
        `SELECT column_name, data_type FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = $1 ORDER BY ordinal_position`,
        [t]
      );
      const cols = (colsRes.rows as { column_name: string; data_type: string }[])
        .map((r) => `${r.column_name} (${r.data_type})`)
        .join(', ');
      console.log('  ', t, ':', cols);
    }

    const funcsRes = await client.query(`
      SELECT routine_name
      FROM information_schema.routines
      WHERE routine_schema = 'public' AND routine_type = 'FUNCTION'
      ORDER BY routine_name
    `);
    const funcs = (funcsRes.rows as { routine_name: string }[]).map((r) => r.routine_name);
    console.log('\nFunctions (public):', funcs.length);
    funcs.forEach((f) => console.log('  ', f));

    // Applied migrations (Supabase stores these when using CLI)
    try {
      const migRes = await client.query(`
        SELECT version, name FROM supabase_migrations.schema_migrations ORDER BY version
      `);
      const applied = (migRes.rows as { version: string; name: string }[]).map(
        (r) => `${r.version}_${r.name}`
      );
      console.log('\nApplied migrations (remote):', applied.length);
      applied.forEach((m) => console.log('  ', m));
    } catch {
      console.log('\nApplied migrations: (table supabase_migrations.schema_migrations not found or not used)');
    }

    await client.end();
  } catch (err) {
    console.error('Could not connect or query remote:', err);
  }
  console.log('');
}

main();
