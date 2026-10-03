import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { error } = await supabase.rpc('exec_sql', {
    query: `
      CREATE TABLE IF NOT EXISTS suggestions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        scent_name TEXT NOT NULL,
        brand TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );
    `
  });
  if (error) {
    console.log("RPC exec_sql failed, falling back to REST insert if table exists, or we might need to create it manually in SQL Editor.", error.message);
  } else {
    console.log("Table created.");
  }
}
run();
