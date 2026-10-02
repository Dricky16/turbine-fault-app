import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
// MUST use Service Role Key to bypass RLS and access user emails
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Starting nightly price tracker for User Favorites...");
  
  // 1. Fetch all favorites
  const { data: favorites, error } = await supabase
    .from('favorites')
    .select(`
      id, 
      user_id,
      perfume_id,
      perfumes (name, brand, price, affiliate_link)
    `);
    
  if (error) {
    console.error("Failed to fetch favorites:", error);
    return;
  }
  
  console.log(`Found ${favorites.length} saved favorites.`);
  
  for (const fav of favorites) {
    const perfume = fav.perfumes;
    console.log(`Checking price for ${perfume.brand} ${perfume.name}...`);
    
    // --> ATTACH SCRAPER LOGIC HERE <--
    // Scrape Brown Thomas or Notino to get current live price
    const livePrice = 250; // Mock current price
    
    // If live price is at least 15% cheaper than the retail price in our DB
    const discountThreshold = perfume.price * 0.85; 
    
    if (livePrice <= discountThreshold) {
      console.log(`SALE DETECTED! ${perfume.name} dropped to ${livePrice}`);
      
      // Fetch user's email using Admin API
      const { data: userData } = await supabase.auth.admin.getUserById(fav.user_id);
      const userEmail = userData?.user?.email;
      
      if (userEmail) {
        // --> TRIGGER EMAIL HERE <--
        // Send email telling them a perfume on their Favorites list is on sale!
        console.log(`Emailed ${userEmail} about the sale.`);
      }
    }
  }
  
  console.log("Price tracker finished.");
}

run();
