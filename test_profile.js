import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: users, error: authError } = await supabase.auth.admin?.listUsers() || { data: { users: [] } };
  console.log("Users:", users);
  const { data, error } = await supabase.from('profiles').select('*');
  console.log("Profiles:", data, "Error:", error);
}
run();
