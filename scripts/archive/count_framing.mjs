import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load from tracenews-api/.env
dotenv.config({ path: '/Users/emekaabraham/Downloads/tracenews-api/.env' });

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;

if (!url || !key) {
  console.error("Missing credentials");
  process.exit(1);
}

const supabase = createClient(url, key);

async function run() {
  const { count, error } = await supabase
    .from('clusters')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', '2026-07-09T00:00:00Z')
    .not('framing_cache', 'is', null);
    
  if (error) {
    console.error(error);
  } else {
    console.log(`Count of framed clusters since July 9: ${count}`);
  }
}
run();
