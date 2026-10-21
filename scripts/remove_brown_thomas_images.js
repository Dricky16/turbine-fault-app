import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

async function removeBTImages() {
  console.log('--- Step 1: Check how many items have Brown Thomas images ---');
  const { count: pCount } = await supabase
    .from('perfumes')
    .select('*', { count: 'exact', head: true })
    .ilike('image_url', '%brownthomas%');

  const { count: dCount } = await supabase
    .from('dupes')
    .select('*', { count: 'exact', head: true })
    .ilike('image_url', '%brownthomas%');

  console.log(`Found ${pCount} perfumes and ${dCount} dupes with Brown Thomas images.`);

  console.log('--- Step 2: Clearing Brown Thomas image URLs from perfumes ---');
  const { error: pErr } = await supabase
    .from('perfumes')
    .update({ image_url: null })
    .ilike('image_url', '%brownthomas%');

  if (pErr) {
    console.error('Error updating perfumes:', pErr);
  } else {
    console.log('Successfully cleared all Brown Thomas image URLs from perfumes table!');
  }

  if (dCount > 0) {
    console.log('--- Step 3: Clearing Brown Thomas image URLs from dupes ---');
    const { error: dErr } = await supabase
      .from('dupes')
      .update({ image_url: null })
      .ilike('image_url', '%brownthomas%');

    if (dErr) console.error('Error updating dupes:', dErr);
    else console.log('Successfully cleared Brown Thomas image URLs from dupes table!');
  }

  // Verification
  const { count: remainingP } = await supabase
    .from('perfumes')
    .select('*', { count: 'exact', head: true })
    .ilike('image_url', '%brownthomas%');

  const { count: remainingD } = await supabase
    .from('dupes')
    .select('*', { count: 'exact', head: true })
    .ilike('image_url', '%brownthomas%');

  console.log(`\nVerification:`);
  console.log(`Remaining perfumes with brownthomas images: ${remainingP}`);
  console.log(`Remaining dupes with brownthomas images: ${remainingD}`);
}

removeBTImages().catch(console.error);
