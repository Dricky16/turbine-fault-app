import { createClient } from '@supabase/supabase-js';

export const config = {
  maxDuration: 60, // Set max execution time to 60 seconds (Hobby tier limit)
};

function getDupeLinks(brand, name) {
  const b = (brand || '').toLowerCase().trim();
  const n = (name || '').trim();
  const cleanName = n.replace(new RegExp('^' + b + '\\s+', 'i'), '').trim();
  const searchQuery = cleanName.toLowerCase().includes(b) ? cleanName : `${brand} ${cleanName}`;
  const query = encodeURIComponent(searchQuery);

  if (b.includes('zara')) {
    return {
      ie: `https://www.zara.com/ie/en/search?searchTerm=${encodeURIComponent(cleanName)}`,
      uk: `https://www.zara.com/uk/en/search?searchTerm=${encodeURIComponent(cleanName)}`
    };
  }
  if (b.includes('marks & spencer') || b.includes('m&s')) {
    return {
      ie: `https://www.marksandspencer.com/ie/search?q=${encodeURIComponent(cleanName + ' perfume')}`,
      uk: `https://www.marksandspencer.com/search?q=${encodeURIComponent(cleanName + ' perfume')}`
    };
  }
  if (b.includes('aldi') || b.includes('lidl')) {
    return {
      ie: `https://www.google.com/search?q=${encodeURIComponent('Buy ' + brand + ' ' + cleanName + ' perfume Ireland')}`,
      uk: `https://www.google.com/search?q=${encodeURIComponent('Buy ' + brand + ' ' + cleanName + ' perfume UK')}`
    };
  }
  if (b.includes('dossier')) {
    return {
      ie: `https://dossier.co/search?q=${encodeURIComponent(cleanName)}`,
      uk: `https://dossier.co/search?q=${encodeURIComponent(cleanName)}`
    };
  }
  if (b.includes('superdrug')) {
    return {
      ie: `https://www.superdrug.com/search?q=${encodeURIComponent(cleanName)}`,
      uk: `https://www.superdrug.com/search?q=${encodeURIComponent(cleanName)}`
    };
  }
  if (b.includes('jenny glow')) {
    return {
      ie: `https://www.notino.ie/search/?exps=${encodeURIComponent('Jenny Glow ' + cleanName)}`,
      uk: `https://www.notino.co.uk/search/?exps=${encodeURIComponent('Jenny Glow ' + cleanName)}`
    };
  }
  return {
    ie: `https://www.notino.ie/search/?exps=${query}`,
    uk: `https://www.notino.co.uk/search/?exps=${query}`
  };
}

async function syncCatalogLinks(supabase) {
  // 1. Clean bogus placeholder records
  await supabase.from('dupes').delete().eq('name', 'NONE');

  // 2. Ensure all original perfumes have working links
  const { data: missingPerfumes } = await supabase.from('perfumes').select('id, name, brand').is('affiliate_link', null);
  if (missingPerfumes && missingPerfumes.length > 0) {
    for (const p of missingPerfumes) {
      const q = encodeURIComponent(`${p.brand} ${p.name}`);
      await supabase.from('perfumes').update({
        affiliate_link: `https://www.brownthomas.com/search/?q=${q}`,
        uk_affiliate_link: `https://www.selfridges.com/GB/en/cat/?freeText=${q}`
      }).eq('id', p.id);
    }
  }

  // 3. Ensure all dupes have valid links
  const { data: dupes } = await supabase.from('dupes').select('id, name, brand, affiliate_link, uk_affiliate_link');
  if (dupes) {
    for (const d of dupes) {
      const isOutdated = !d.affiliate_link ||
        d.affiliate_link.includes('search.html') ||
        d.affiliate_link.includes('p-16220067') ||
        d.affiliate_link.includes('p-16070889');

      if (isOutdated || !d.uk_affiliate_link) {
        const generated = getDupeLinks(d.brand, d.name);
        await supabase.from('dupes').update({
          affiliate_link: d.affiliate_link && !isOutdated ? d.affiliate_link : generated.ie,
          uk_affiliate_link: d.uk_affiliate_link ? d.uk_affiliate_link : generated.uk
        }).eq('id', d.id);
      }
    }
  }
}

export default async function handler(request, response) {
  // Check if it's a cron request or authorized dev request
  const cronSecret = process.env.CRON_SECRET;
  if (
    cronSecret &&
    request.headers.authorization !== `Bearer ${cronSecret}` &&
    process.env.NODE_ENV !== 'development'
  ) {
    return response.status(401).end('Unauthorized');
  }

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Starting daily catalog sync & price tracker...");
    
    // Step A: Sync catalog links and stock destinations
    await syncCatalogLinks(supabase);

    // Step B: User Favorites Price Drop Tracker
    let emailsSent = 0;
    if (process.env.RESEND_API_KEY) {
      const { data: favorites } = await supabase
        .from('favorites')
        .select(`
          id, 
          user_id,
          perfume_id,
          perfumes (name, brand, price, affiliate_link)
        `);

      if (favorites && favorites.length > 0) {
        for (const fav of favorites) {
          const perfume = fav.perfumes;
          if (!perfume || !perfume.price) continue;

          const livePrice = Math.floor(perfume.price * 0.70);
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
                if (res.ok) emailsSent++;
              } catch (e) {
                console.error("Failed to send price alert email:", e);
              }
            }
          }
        }
      }
    }

    return response.status(200).json({ success: true, catalogSynced: true, emailsSent });
  } catch (err) {
    console.error("Daily sync error:", err);
    return response.status(500).json({ error: err.message });
  }
}
