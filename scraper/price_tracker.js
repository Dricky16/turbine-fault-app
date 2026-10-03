import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
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

// Initialize Resend with API Key from environment (or hardcoded for testing)
const resend = new Resend(process.env.RESEND_API_KEY);

async function run() {
  console.log("Starting nightly price tracker for User Favorites...");
  
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
    // Mock scraping logic for testing: Assume it went on a massive sale
    const livePrice = Math.floor(perfume.price * 0.70); // 30% off
    
    const discountThreshold = perfume.price * 0.85; 
    
    if (livePrice <= discountThreshold) {
      console.log(`SALE DETECTED! ${perfume.name} dropped to €${livePrice}`);
      
      const { data: userData } = await supabase.auth.admin.getUserById(fav.user_id);
      const userEmail = userData?.user?.email;
      
      if (userEmail) {
        console.log(`Sending email alert to ${userEmail}...`);
        
        try {
          const { data: emailResponse, error: emailError } = await resend.emails.send({
            from: 'Scents For Cents <onboarding@resend.dev>',
            to: userEmail,
            subject: `SALE ALERT: ${perfume.brand} ${perfume.name} is on sale!`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; text-align: center;">
                <h1 style="color: #0f172a;">Great news!</h1>
                <p style="font-size: 16px; color: #475569;">
                  A perfume on your <strong>Scents for Cents</strong> favorites list is on sale!
                </p>
                <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; margin: 30px 0;">
                  <h2 style="margin: 0; color: #1e293b;">${perfume.name}</h2>
                  <p style="color: #64748b; margin-top: 5px;">by ${perfume.brand}</p>
                  
                  <div style="margin-top: 20px; font-size: 24px; font-weight: bold; color: #0f172a;">
                    <span style="text-decoration: line-through; color: #94a3b8; font-size: 18px;">€${perfume.price.toFixed(2)}</span>
                    <span style="color: #10b981; margin-left: 10px;">€${livePrice.toFixed(2)}</span>
                  </div>
                </div>
                
                <a href="${perfume.affiliate_link}" style="display: inline-block; background-color: #0f172a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  Buy Now
                </a>
              </div>
            `
          });
          
          if (emailError) {
            console.error("Resend Error:", emailError);
          } else {
            console.log(`Successfully emailed ${userEmail}! ID: ${emailResponse.id}`);
          }
        } catch (e) {
          console.error("Failed to send email:", e);
        }
      }
    }
  }
  
  console.log("Price tracker finished.");
}

run();
