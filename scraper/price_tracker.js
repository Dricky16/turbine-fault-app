import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
// MUST use Service Role Key for background cron jobs to bypass RLS and read emails
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Starting nightly price tracker...");
  
  // 1. Fetch all active alerts
  const { data: alerts, error } = await supabase
    .from('price_alerts')
    .select(`
      id, 
      user_email, 
      target_price,
      perfume_id,
      perfumes (name, brand, affiliate_link)
    `)
    .eq('is_active', true);
    
  if (error) {
    console.error("Failed to fetch alerts:", error);
    return;
  }
  
  console.log(`Found ${alerts.length} active price alerts.`);
  
  // 2. Loop through alerts (in reality, we would group by perfume_id to save requests)
  for (const alert of alerts) {
    const perfume = alert.perfumes;
    console.log(`Checking price for ${perfume.brand} ${perfume.name}...`);
    
    // --> ATTACH SCRAPER LOGIC HERE <--
    // Scrape Brown Thomas or Notino to get current live price
    const livePrice = 250; // Mock current price
    
    if (livePrice <= alert.target_price) {
      console.log(`PRICE DROP DETECTED! ${livePrice} is <= ${alert.target_price}`);
      
      // --> TRIGGER EMAIL HERE <--
      // Use Resend, SendGrid, or Web3Forms API to email alert.user_email
      
      // 3. Deactivate the alert so we don't spam them every night
      await supabase
        .from('price_alerts')
        .update({ is_active: false })
        .eq('id', alert.id);
        
      console.log(`Emailed ${alert.user_email} and deactivated alert.`);
    } else {
      console.log(`No drop. Target: ${alert.target_price}. Live: ${livePrice}`);
    }
  }
  
  console.log("Price tracker finished.");
}

run();
