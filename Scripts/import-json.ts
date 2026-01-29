/**
 * Script to import phrases JSON into Supabase
 * Run with: npx tsx scripts/import-json.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

interface PhraseJson {
  hawaiian_phrase: string;
  english_phrase?: string;
  meaning_phrase?: string;
  headword_link?: string;
  source_link?: string;
  phrase_numbers: number;
  hawaiian_letter?: string;
  headword_label?: string;
  tags?: string[];
}

async function importPhrases() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Check if phrases table exists
  console.log('Checking if phrases table exists...');
  const { error: tableCheckError } = await supabase.from('phrases').select('phrase_numbers').limit(1);
  
  if (tableCheckError) {
    if (tableCheckError.code === '42P01' || tableCheckError.message.includes('does not exist')) {
      console.error('\n❌ ERROR: The phrases table does not exist!');
      console.error('You need to run the database migration first.\n');
      console.log('Steps to fix:');
      console.log('1. Open your Supabase project → SQL Editor');
      console.log('2. Run the contents of: supabase/migrations/001_initial_schema.sql');
      console.log('3. Then run: npm run import\n');
      process.exit(1);
    } else {
      console.error('❌ Error checking table:', tableCheckError.message);
      process.exit(1);
    }
  }

  // Read JSON file
  const jsonPath = path.join(process.cwd(), 'data', 'phrases-with-meta-tags.json');
  
  if (!fs.existsSync(jsonPath)) {
    console.error(`JSON file not found at: ${jsonPath}`);
    process.exit(1);
  }
  
  const jsonData = fs.readFileSync(jsonPath, 'utf-8');
  const phrases: PhraseJson[] = JSON.parse(jsonData);

  console.log(`✅ Found ${phrases.length} phrases to import`);

  // Clear existing phrases (optional - comment out if you want to keep existing data)
  console.log('Clearing existing phrases...');
  const { error: deleteError, count } = await supabase.from('phrases').delete().neq('phrase_numbers', 0).select('*', { count: 'exact', head: true });
  if (deleteError) {
    console.error('Error clearing phrases:', deleteError);
  } else {
    console.log('✅ Cleared existing phrases');
  }

  // Insert in batches of 100
  const batchSize = 100;
  let imported = 0;

  for (let i = 0; i < phrases.length; i += batchSize) {
    const batch = phrases.slice(i, i + batchSize);
    
    const formattedBatch = batch.map(p => ({
      phrase_numbers: p.phrase_numbers,
      hawaiian_phrase: p.hawaiian_phrase,
      english_phrase: p.english_phrase || null,
      meaning_phrase: p.meaning_phrase || null,
      headword_link: p.headword_link || null,
      source_link: p.source_link || null,
      hawaiian_letter: p.hawaiian_letter || null,
      headword_label: p.headword_label || null,
      tags: p.tags || [],
    }));

    const { error, data } = await supabase.from('phrases').insert(formattedBatch).select();

    if (error) {
      console.error(`\n❌ Error importing batch ${Math.floor(i / batchSize) + 1}:`, error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      console.error(`Failed at phrase_numbers: ${batch[0]?.phrase_numbers} - ${batch[batch.length - 1]?.phrase_numbers}`);
      process.exit(1);
    } else {
      imported += batch.length;
      const percentage = ((imported / phrases.length) * 100).toFixed(1);
      console.log(`✅ Imported ${imported}/${phrases.length} phrases (${percentage}%)...`);
    }
  }

  console.log(`\nImport complete! Imported ${imported} phrases.`);
}

importPhrases().catch(console.error);
