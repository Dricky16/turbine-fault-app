import { createClient } from '@supabase/supabase-js';


export const config = {
  maxDuration: 60, // Set max execution time to 60 seconds (Hobby tier limit)
};

export default async function handler(request, response) {
  // Check if it's a cron request or local dev testing
  if (
    request.headers.authorization !== `Bearer ${process.env.CRON_SECRET}` &&
    process.env.NODE_ENV !== 'development'
  ) {
    return response.status(401).end('Unauthorized');
  }

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (!process.env.RESEND_API_KEY) { console.error('Missing RESEND_API_KEY'); return response.status(500).json({ error: 'Missing API key' }); }

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
      return response.status(500).json({ error: "Failed to fetch favorites" });
    }
    
    let emailsSent = 0;
    
    for (const fav of favorites) {
      const perfume = fav.perfumes;
      if (!perfume.price) continue;
      
      // Mock scraping logic for testing: Assume it went on a massive sale
      const livePrice = Math.floor(perfume.price * 0.70); // 30% off
      const discountThreshold = perfume.price * 0.85; 
      
      if (livePrice <= discountThreshold) {
        
        const { data: userData } = await supabase.auth.admin.getUserById(fav.user_id);
        const userEmail = userData?.user?.email;
        
        if (userEmail) {
          
          try {
            const res = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
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
                    
                    <a href="${perfume.affiliate_link || '#'}" style="display: inline-block; background-color: #0f172a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                      Buy Now
                    </a>
                  </div>
                `
              })
            });
            const emailError = !res.ok;
            
            if (!emailError) emailsSent++;
          } catch (e) {
            console.error("Failed to send email:", e);
          }
        }
      }
    }
    
    return response.status(200).json({ success: true, emailsSent });
  } catch (err) {
    console.error(err);
    return response.status(500).json({ error: err.message });
  }
}
